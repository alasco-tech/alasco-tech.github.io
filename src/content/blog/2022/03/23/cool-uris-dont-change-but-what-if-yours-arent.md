---
authors:
  - lorinkoz
  - chrisittner
date: 2022-03-23
title: Cool URIs don’t change — but what if yours aren’t?
subtitle: How we painlessly restructured our app URLs in Django
thumbnail: ./images/doors.jpg
teaseralt: A rendering of many doors
tag: featured
description: How we painlessly restructured our app URLs in Django
---

URLs are for web applications what doors are for buildings. As long as they take you to the right place, you _shouldn't_ care much about how they look. Yet, you can tell a lot about the whole building by just looking at how well taken-care-of are its doors. We have recently renovated all the URL “doors” at the Alasco web app, and we would like to tell you how we did it in this blog post.

## Our domain is moving

Over the last three years, the Alasco application has grown from a small cost controlling tool into a widely used SaaS construction finance management suite. Along with this growth, the domain that we are covering has evolved at high pace: With each passing quarter the product is growing into new areas, shifting away from less successful ones and undergoing significant refinement — our very understanding of _what it is that we are building_ changes.

The app was once structured in categories such as `Estimating`, `Contracting` and `Invoice processing` — by now our product areas are instead `Costs`, `Incomes`, `KPIs`, etc. We continue to adjust both the user-facing product and our internal codebase to keep up with the improving model of our domain.

We moved slower, however, in refactoring URLs of existing pages, because, well, [cool URIs don’t change](https://www.w3.org/Provider/Style/URI). We recently decided to do it anyways, because with years of accumulated changes in the product, our URLs were far from being “cool” anymore. We saw significant user value in doing so: most users still see URLs on the top of their browser window and we wanted to support them by keeping URLs readable, concise, and a helpful guide of where in the application they are and of what they are doing.

## Helpful URLs: predictable, consistent, and clean

Django has its own set of [design philosophies for URLs](https://docs.djangoproject.com/en/4.0/misc/design-philosophies/#url-design), and we have our own criteria too! We have three desiderata for helpful URLs.

Firstly, they should be _predictable_. Basically, users should be able to guess URLs, because they reflect what the user sees rather than internal code divisions. A page that is accessible via Menu A > Menu B should be accessible through an URL like `/menu-a/menu-b/`. Even more, by looking at a URL `/menu-a/menu-b/` you should be able to infer the existence of `/menu-a/menu-c/`.

Secondly, URLs should be _consistent_, following a hierarchical pattern. Parameters, too, should have a consistent place within the hierarchy, like `/page/project/<id>/subpage/`. The order of similar parameters should be stable across all URLs.

Finally, URLs should be _clean_: Minimal, yet self-explanatory. No redundancies, so e.g. no `/settings/something-settings/`. Always kebap-cased. Always with trailing slashes.

## Migrating URLs in Django

As usual, the Django ecosystem offers a variety of packages to migrate or redirect old URLs to new ones — most notably the `redirects` app included in Django itself. `redirects` was not an option for us, as it stores exact URLs to be redirected, instead of handling URL parameters, path converters, and GET variables dynamically.

After reviewing our requirements we took our own approach. What we wanted was to migrate a path like:

```python
/estimating/project/<id>/cost_element_budget/revision/<id>/
```

to an equivalent one that’s in line with our current navigation structure:

```python
/costs/project/<id>/budget/versions/<id>/
```

We identified a few hundred 😅 desirable path migrations of this kind. To migrate these paths, we designed and embarked on the following steps:

### Step 1: Parallel URL structures

We added the new URL structure while keeping the old one intact. To do that, we copied all to-be-migrated paths into a `deprecated` [namespace](https://docs.djangoproject.com/en/4.0/topics/http/urls/#url-namespaces). We then made all URL adjustments for the new structure, discussed and reviewed them. After this step, reversing a path name would generate a new format URL, so all app-internal links started to use the new format.

When deploying this, we had to be careful to update all URLs shared with third parties, i.e. URLs permitted to be used as redirect/callback query parameters after completing a sign-in with an integrated third party. We had about four or five of those.

### Step 2: Automatic redirection

A few days later we added a small Django middleware to permanently redirect (`301`) any access to URLs in the `deprecated` namespace to the corresponding new ones. The middleware used the [names](https://docs.djangoproject.com/en/4.0/topics/http/urls/#naming-url-patterns-1) of the URL patterns to match deprecated and new paths and preserved all parameters and GET query variables through the redirection.

When deploying this, we also had to adjust and move external tests and health checks that relied on HTTP status codes to the new URLs.

### Step 3: Clean up the leftovers

This is the step we're currently in. We added tracking of the usage of old URLs and are reviewing why are these still being used, while fixing the cases that are our responsibility. Yes, we had some hardcoded URLs.

### Step 4: Sunset old URLs

The final step would be several months from now. When there is near-zero traffic to old URLs, we will remove the old URL structure altogether and remain with the new only. Depending on the levels of traffic we continue to receive at that point, we might decide to keep some popular old URLs present with their permanent redirections.

## Conclusions

Being currently at step 3, we're quite happy with the process and the results so far. Now for some of the learnings up to this point:

First, this initiative happened as part of our 20% tech debt rule. That is, we use up to 20% of the sprint time for tech debt repayment, including cleanups and optimisations. This rule has proven valuable to get through improvements of all sizes in our codebase without affecting the core goals of the sprint.

Second, now that we went with an ultra-wide rework of our URLs, how do we know that we got it all right? Even though we discussed and reviewed the whole new URL structure, we may have left some areas still up for improvements. For those cases we won't need to do all the heavy lifting again, as we can decide on a case by case basis how we want to adjust and move on.

Third, the future. As our domain continues to evolve and we continue to ship new features and areas, will we need to make a major overhaul of the URL structure in the future? To put it in another way: will our currently cool URLs stop being cool at some point in the future? Honestly, we can't know for sure. But in any case, we do know how to do it now, and where to look for common hiccups. So we remain optimistic and fearless.
