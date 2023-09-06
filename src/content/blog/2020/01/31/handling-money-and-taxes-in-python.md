---
authors:
  - chrisittner
date: 2020-01-31
title: Handling Money and Taxes in Python
subtitle: How we deal with VAT and rounding in the backend
thumbnail: ./images/money_and_taxes_in_python.jpg
teaseralt: Stacks of coins on white background
description: How we deal with VAT and rounding in the backend at Alasco. Whats the difference between discrete money and exact money? Find out here!
---

Much of our code at Alasco deals with storing, computing and presenting monetary values along with taxes. Handling money — similar to time and date — involves a number of details and edge cases that are best left to a dedicated library or data type.
Python has with `datetime` a standard library for common issues of time and date: parsing dates, date arithmetic & comparison, time zones and localization.
Unfortunately, there is no similar built-in for dealing with money and its peculiarities: currencies, quantization/rounding of cents, taxes, parsing/localization, etc.

So while it would be absurd for a project like ours to reimplement basic date/time handling, we found ourselves having to write our own `money` datatype. There are a couple of Python money libraries, in particular [py-moneyed](https://github.com/limist/py-moneyed) or [python-money](https://github.com/carlospalol/money), that solve issues regarding currencies and quantization. However, none deal with taxation or the handling of both precise and quantized (rounded) money, topics very relevant to us.

I will skip some basics about representing money, e.g. that [you shouldn't use floats](https://stackoverflow.com/questions/3730019/why-not-use-double-or-float-to-represent-currency/3730040#3730040) to represent amounts, or that _every_ amount comes with a currency attached. Proper localization is also handled well by libraries like `py-moneyed`. Instead I would like to show how we handle two more delicate issues when dealing with money: 1. rounding and 2. taxes.

## 1. Two Types of Money

There are two types of libraries for storing monetary value:

- **Discrete**: store the sub-units of the currency as an integer, e.g. `1000` to represent 10 EUR. (See [RubyMoney](https://github.com/RubyMoney/money) or [Dinero.js](https://github.com/sarahdayan/dinero.js)).

- **Exact**: keep track of partial cents (e.g. as `Decimals`), possibly to a very high precision. (See [py-moneyed](https://github.com/limist/py-moneyed) or [python-money](https://github.com/carlospalol/money))

### Discrete Money

Monetary amounts come in discrete units, so it seems natural to store the sub-units of the currency as an integer/fixed-point value, e.g. `1000` for 10 Euro. This is exactly [what Martin Fowler proposes in his P-EAP](https://www.martinfowler.com/eaaCatalog/money.html).
Since one can't pay `0.3` cents, why track them at all?

Such a "coarse-grained" money object will have rounding to full cents on each scalar multiplication/division: `1 cent * 1.3` is still `1 cent` and a third of `10 cents` is `3 cents`. As a result, if you split `10 cents` into three thirds and add them together you'll just have `3 * 3 = 9` cents left, missing one. To avoid this, Fowler proposes that all splitting and scaling of money values should instead be done via an _allocation_ function: Suppose you want to split `10 cents` into `3` pots as equally as possible, then `allocate` will assign `3 cents` to two of the pots and `4 cents` to one pot. This ensures that no cents are lost or introduced during computation and reflects the fact that you cannot actually split a cent.

This approach is very consistent (except for the slightly odd `allocate` method), until you need to do a lot of monetary computation. If you evaluate longer calculations, the data type enforces rounding on every multiplicative step and you'll quickly end up a few cents higher or lower than you'd expect.

A typical invoice running through Alasco receives several successively applied discounts: E.g. a 3% negotiated discount, followed by a 0.3% deduction for site power consumption, 0.5% deduction for insurance, a 5% security retainage, plus 19% VAT. Lastly a 2% early payment discount. Depending on how you allocate your cents you might end up 1-3 cents above or below the expected value.

### Exact Money

To avoid the faulty rounding/"allocations" on chained calculations, we store monetary values as `Decimal`s, using `py-moneyed`.
All backend operations deal with exact money. Rounding only occurs explicitly or when values are outputted to the user. This requires you to think about rounding more explicitly, but it is required to follow the calculations of our users without spurious or missing cents along the way.

There are a few things to watch out for when working with a precise money datatype which is nonetheless displayed in a rounded way:

- Implicit rounding, through user input fields. At some point in the process of reviewing invoices, our user is displayed a computed amount and has the option to manually override this amount. Suppose the computed value is `12.004` — displayed as `12,00 EUR` — and the user re-enters `12,00 EUR`. The value is now rounded and may be off by one cent after adding 19% VAT. Dealing with exact amounts requires awareness of precision in all contexts.

- Equality. Two amounts may be equal up to cents, yet differ by a sub-cent remainder (e.g. `1.2345 EUR` and `1.2346 EUR`). While this might seem obvious, it implies that you actively have to choose between exact equality and equality up to cents on every comparison: Exact equality is required to, for example, check whether an amount has changed at all, while equality up to cents is required to check if some computed amount matches a users input.
  A more explicit approach to this issue would be to use both a datatype for exact and one for discrete amounts and to actively convert between them before making any comparison.

- Actual rounding errors. Even when storing many decimal places, rounding occurs after each operation on the last digit. `py-moneyed` is not _exact_ in the sense of having arbitrary precision. `1 EUR - (1 EUR/3)*3` = `0.0..01 cents`. Dividing `1` by this result will get you a `DecimalException`, depending on your `DecimalContext`.

## 2. Taxation

In our domain, virtually every monetary value can be split into a net and a VAT amount. We started out storing net and VAT amounts separately or, in some cases, the VAT rate (usually 0%, 7%, or 19% in Germany) rather than the amount. By now, we have a single object `MoneyWithVAT` to represent both. Our users can choose within our app to either see the net or the gross version of the values. This adds some complexity, as you can no longer compare e.g. the net amounts of two quantities to see which one is bigger, because it could be the other way around when considering gross amounts (due to different tax rates; one quantity might be exempt).

Our current `MoneyWithVAT` object consists of a stored `Decimal` for `net` and `vat` and the computed properties `gross` and `tax_rate`. It implements `__neg__`, `__add__`, `__sub__`, (scalar) `__mul__`, `__truediv__`, `__eq__` and `__bool__`. However, `MoneyWithVAT` objects are not comparable and one has to explicitly compare their `net`, `gross`, or `vat` parts, as the orders may differ. They do not implement `__round__`, because rounding has non-obvious behaviour: Rounding would take place on the stored amounts `net` and `vat`, with `gross = net + vat`. As a result `round(val.gross, 2) != round(val, 2).gross` (for example when rounding `net=4.444` and `tax=2.222`).

All in all this way of integrating taxes is fairly well-behaved. One caveat is that the precise tax rate is not always preserved, since we do not explicitly store it on the money object. After (explicit or implicit) rounding, the resulting computed tax rate may turn to something like `18.92%` rather than `19%`. This hasn't been an much of an issue for us as the actual tax rate is usually known from the context.
