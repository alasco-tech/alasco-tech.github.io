---
authors:
  - lorinkoz
date: 2024-04-05
title: Django friends with Postgres Row-level Security
subtitle: How we leveraged Django abstractions to seamlessly integrate Postgres Row-level Security
thumbnail: ./images/Love-locks-Pont-des-Arts-014.jpg
teaseralt: Love locks in the Pont-des-Arts bridge in Paris
description: How we leveraged Django abstractions to seamlessly integrate Postgres Row-level Security
---

Enter the Software-as-a-service world and the term "database multi-tenancy" becomes an everyday matter. Housing the data of multiple customers in a few number of databases implies that one must be able to tell which data belongs to which customer, and let every user interact only with the data that is in the scope of the accounts they belong to.

Architecting database multi-tenancy is a [topic on its own](https://learn.microsoft.com/en-us/azure/azure-sql/database/saas-tenancy-app-design-patterns). At Alasco we store data for different accounts on the same tables and identify them either directly or indirectly through foreign keys.

For a few years until now we had been using database joins on every query to filter the rows of each table that were in scope for the user making a request. But Postgres comes with [Row-level security](https://www.postgresql.org/docs/15/ddl-rowsecurity.html) and we surely wanted to try that.

After successfully implementing Row-level security in the parts of our codebase that use the FastAPI + SQLAlchemy stack, we wanted to take the next step and do the same for the Django stack. And we did it!

Now we can proudly tell that our Django is friends with Postgres Row-level security. Here's how we made it happen.

## Row-level security in a nutshell

In Postgres it is possible to add one or many row security policies to a table.

A policy is a rule that will apply to all rows involved in a given operation (e.g. SELECT, INSERT, UPDATE, DELETE). Policies must be also enabled on the table before they start taking effect. Table owners are normally excluded from the policies, but it's possible to include them with an option to enforce the policy.

A policy definition can look like this:

```SQL
CREATE POLICY user_policy ON costs_invoice
USING (user_name = current_user);
```

This policy would make Postgres apply any operation only to the rows where the column `user_name` matches the Postgres user doing the query. There is also the option of not taking the database user into account and using a [Postgres configuration settings](https://www.postgresql.org/docs/15/functions-admin.html#FUNCTIONS-ADMIN-SET-TABLE) like this:

```SQL
CREATE POLICY account_policy ON costs_invoice
USING (account_id = current_setting('app.account_id')::int);
```

This policy would make Postgres apply any operation to the rows where the column `account_id` matches whatever was set in the setting `app.account_id`. This could have been previously done with a query like this:

```SQL
SET app.account_id = '100';
```

Such policies must be enabled and enforced, so that they apply even to the user owning the table:

```SQL
ALTER TABLE costs_invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs_invoice FORCE ROW LEVEL SECURITY;
```

## Enter Django

In order to truly say that Django became friends with Row-level security (RLS from now on), we wanted to make it work seamlessly with Django models. We also wanted the process of adding RLS to any Django model as idiomatic as possible.

Think in terms of:

```python
class Invoice(RowLevelSecurityProtectedModel):
    # invoice specific fields here
    ...
```

So that we could in turn do something like this and get automatic scoping to the proper account:

```python
set_current_account(account)

Invoice.objects.all()

Invoice.objects.create(
    # invoice specific fields here
)
```

This was not extraordinary, because [many other Django packages for database multi-tenancy](https://djangopackages.org/grids/g/multi-tenancy/) have the same notion of a globally defined tenant context that is then applied to all ORM operations.

But before getting too deep with the code, let's first resolve a couple of important edge cases that are needed here:

1. What to do if there is no current account set and an ORM operation is attempted?
2. How to "break" RLS to perform an ORM operation across tenant boundaries?

For question 1 we decided that security should come first. We should never do an ORM operation without previously setting a current account, but if for some reason that were to happen, no row should be returned and we should get a loud error telling us where to look and fix.

For question 2, we definitely needed a way to do that, because it's a very common use case. Without it, we would have not been able to do system-wide queries or data migration operations from within Django.

So let's now get deep with the code.

### Active account in a global state

We had three possible states to represent: no account set, a specific account set, or ALL accounts set (the latter for doing cross-tenant operations).

For storing those values in a global state, we went with [Python contextvars](https://docs.python.org/3.11/library/contextvars.html) in tandem with an enum:

```python
from contextvars import ContextVar
from enum import Enum

class RlsWildcard(Enum):
    ALL = "SPECIAL_CASE_ALL"
    NONE = "SPECIAL_CASE_NONE"

rls_current_account: ContextVar[int | RlsWildcard]
rls_current_account = ContextVar("rls_current_account", default=RlsWildcard.NONE)
```

This way we could do `rls_current_account.set(100)` or `rls_current_account.set(RlsWildcard.ALL)` in order to set the current account scope.

### RLS policy

On the Postgres side we were also going to have a global state in the settings configuration (i.e. `current_setting('app.account_id')`), so we also needed an RLS policy that would capture all the possible values for that global state.

We went with something like this:

```SQL
CREATE POLICY %(policy_name)s ON %(table_name)s USING (
    CASE
        WHEN current_setting('app.account_id', True) IS NULL THEN FALSE
        WHEN current_setting('app.account_id') = 'SPECIAL_CASE_NONE' THEN FALSE
        WHEN current_setting('app.account_id') = 'SPECIAL_CASE_ALL' THEN TRUE
        ELSE %(field_column)s = current_setting('app.account_id')::int
    END
);
```

Notice the three placeholders, which would make the policy applicable to any table we wanted:

- `policy_name` is the name of the policy, which must be unique per table.
- `table_name` is the name of the table,
- `field_column` is the name of the column that contains the foreign key to the account, most of the time it was going to be `account_id` but we wanted to stay flexible.

Notice also the special case of `current_setting('app.account_id', True) IS NULL`, which was meant as a last line of defense, again, in case that, for some reason, no global state had been set on the Postgres side.

### Taking advantage of Django constraints

In order to treat RLS as something we could add to or remove from our models, we had to make it part of Django's migration mechanism. Django allows for [custom migration operations](https://docs.djangoproject.com/en/5.0/ref/migration-operations/#writing-your-own) which are useful to add and remove the RLS policy, but we wanted to take it one step further. Why, you may ask? We really wanted to make the process a bliss, and adding custom migration operations meant we had to do it ourselves every time.

We found out that Django comes with [abstractions for database constraints](https://docs.djangoproject.com/en/5.0/ref/models/constraints/), so we thought: if we can think of the RLS policy as a constraint and treat it as such, then converting a model into RLS should be as easy as adding a new constraint to the model's `Meta`.

So we did it like this:

```python
from django.db.models import BaseConstraint
from django.db.backends.ddl_references import Statement, Table

CREATE_SQL = """
    CREATE POLICY %(policy_name)s ON %(table_name)s USING (
        CASE
            WHEN current_setting('app.account_id', True) IS NULL THEN FALSE
            WHEN current_setting('app.account_id') = 'SPECIAL_CASE_NONE' THEN FALSE
            WHEN current_setting('app.account_id') = 'SPECIAL_CASE_ALL' THEN TRUE
            ELSE %(field_column)s = current_setting('app.account_id')::int
        END
    );
    ALTER TABLE %(table_name)s ENABLE ROW LEVEL SECURITY;
    ALTER TABLE %(table_name)s FORCE ROW LEVEL SECURITY
"""

DROP_SQL = """
    ALTER TABLE %(table_name)s NO FORCE ROW LEVEL SECURITY;
    ALTER TABLE %(table_name)s DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS %(policy_name)s on %(table_name)s
"""

class RowLevelSecurityConstraint(BaseConstraint):
    def __init__(self, field: str, name: str) -> None:
        super().__init__(name=name)
        self.target_field: str = field

    def constraint_sql(self, model: Any, schema_editor: Any) -> str:
        return ""

    def create_sql(self, model: Any, schema_editor: Any) -> Any:
        return Statement(
            SQL_CREATE,
            policy_name=policy_name,
            table_name=Table(model._meta.db_table, self.quote_name),
            field_column=field_column,
        )

    def remove_sql(self, model: Any, schema_editor: Any) -> Any:
        return Statement(
            SQL_DROP,
            policy_name=policy_name,
            table_name=Table(model._meta.db_table, self.quote_name),
            field_column=field_column,
        )

    def validate(
        self,
        model: Any,
        instance: Any,
        exclude: Any = None,
        using: Any = _dj_utils.DEFAULT_DB_ALIAS,
    ) -> None:
        pass

    def __eq__(self, other: object) -> bool:
        if isinstance(other, RowLevelSecurityConstraint):
            return self.name == other.name and self.target_field == other.target_field
        return super().__eq__(other)

    def deconstruct(self) -> tuple[str, tuple, dict]:
        path, _, kwargs = super().deconstruct()
        return (path, (self.target_field,), kwargs)
```

Notice how `create_sql` and `remove_sql` are the methods used to install and remove the RLS policy.

With this approach, the migrations mechanism would pick the changes automatically by doing something like this at the model level:

```python
from django.db import models

class Invoice(models.Model):
    account = models.ForeignKey("Account", ...)

    # invoice specific fields here

    class Meta:
        constraints = [
            RowLevelSecurityConstraint(
                field="account_id",
                name="rls_on_account"
            )
        ]

```

### Global state management

With things taking shape in the Django side, we also had to solve the global state management in Postgres.

Because the RLS policy relied on the current account being set in the database settings configuration, we needed some part of our Django codebase to take care of running the SQL query `SET app.account_id = '{rls_current_account}'`.

Taking inspiration in other open source libraries that deal with the same problem, we decided to define a custom Postgres backend to do the heavy lifting. In this blog post we will spare you the gory details of the how, but because we don't want to leave you hanging, dear reader, feel free to use [this vague reference](https://github.com/django-tenants/django-tenants/blob/master/django_tenants/postgresql_backend/base.py) to how `django-tenants` does it as further reading material.

In short, the idea is that the custom database backend sets the current account on the database level every time a cursor is created.

### Custom querysets

With the custom database backend taking care of the state management in the Postgres side, we guaranteed that all queries would return filtered results using the RLS policy. However, because the policy was restrictive by default, we still wanted the Django code to alert us if we had forgotten to set a value other than `RlsWildcard.NONE` in the Django side.

For this we went on and created a custom queryset that, in the absence of a current account set, would raise an error and make it obvious:

```python
from django.db import models

class NoRLSAccountException(Exception):
    pass

class AccountQueryset(models.QuerySet):

    def _no_account_active(self) -> bool:
        return rls_current_account.get() is RlsWildcard.NONE

    ### Queryset overrides

    def _fetch_all(self) -> None:
        if self._no_account_active():
            raise NoRLSAccountException

        super()._fetch_all()

    def count(self) -> int:
        if self._no_account_active():
            raise NoRLSAccountException

        return super().count()

    def iterator(self, chunk_size: int | None = None) -> Iterator:
        if self._no_account_active():
            raise NoRLSAccountException

        return super().iterator(chunk_size)

    def exists(self) -> bool:
        if self._no_account_active():
            raise NoRLSAccountException

        return super().exists()

    ### and so on...
```

And yes, we also did a custom model manager:

```python
AccountManager = models.Manager.from_queryset(AccountQueryset)
```

## Bypassing RLS

The final piece of the puzzle was providing a way for actually bypassing RLS and letting us do ORM operations across tenant boundaries.

We also wanted to communicate the idea in the code that an RLS bypass was meant as very contextual and specific operation: a temporary escape hatch, if you will.

So we used a [Python context manager](https://docs.python.org/3/library/contextlib.html#contextlib.contextmanager) for that:

```python
from abc import Iterator
from contextlib import contextmanager

@contextmanager
def rls_bypass() -> Iterator[None]:
    token = rls_current_account.set(RlsWildcard.ALL)

    yield

    rls_current_account.reset(token)
```

To be used like this:

```python
with rls_bypass():
    # this would return ALL invoices regardless of account
    Invoice.objects.all()
```

As an extra convenience, we also did another type of queryset and manager:

```python
from django.db import models

class AccountBypassQueryset(models.QuerySet):

    ### Queryset overrides

    def _fetch_all(self) -> None:
        with rls_bypass():
            super()._fetch_all()

    def count(self) -> int:
        with rls_bypass():
            return super().count()

    def iterator(self, chunk_size: int | None = None) -> Iterator:
        with rls_bypass():
            yield from super().iterator(chunk_size)

    def exists(self) -> bool:
        with rls_bypass():
            return super().exists()

    ### and so on...


AccountBypassManager = models.Manager.from_queryset(AccountBypassQueryset)
```

### Final abstraction

Taking all the existing ingredients, our final Django model abstraction looked like this:

```python
from django.db import models

def get_current_account() -> int | None:
    current_account = rls_current_account.get()

    if isinstance(current_account, RlsWildcard):
        return None

    return current_account

class RowLevelSecurityProtectedModel(models.Model):

    account = models.ForeignKey("Account", default=get_current_account_id, ...)

    objects = AccountManager()
    unsafe_bypass_objects = AccountBypassManager()

    class Meta:
        abstract = True
        constraints = [
            RowLevelSecurityConstraint(
                field="account_id",
                name="rls_on_account"
            )
        ]
```

Notice the use of two different managers, one for RLS bound operations, another for doing the bypass. Notice also how we conveniently used the current account as default value for the model field.

### Final final abstraction

Okay, we wanted to take it a bit further, because we do use more constraints sometimes, and that would have meant more manual RLS activation for those models where the inherited `Meta` constraints were not enough.

So we did a metaclass that automagically added the constraint if it was not present, but that might be a topic for another time.

## Closing remarks

The solution is working good and feels very idiomatic.

It was not free of issues, though. In order to consider the transition path into RLS feasible we had to do a number of "side quests". Here's a few of those:

- The default admin user of RDS has embedded magic that makes it bypass RLS, so we had to tweak platform to use a different user.
- Because the active account was now in a global state, our extensive test battery required careful changes on where and how to activate a test account, in order to ensure tests wouldn't give false positives or negatives.
- Also, because there were now foreign keys to the account on every model, we had to make sure they didn't show up in the UI (e.g. Django admin)

All in all, we think it was well worth it and continue to iterate in our abstractions.
