---
authors:
  - dmprav
date: 2023-09-06
title: "Back to the Future: Our Tech Blog's Transition from Jekyll to Astro"
subtitle: A Journey Sparked by Curiosity
thumbnail: ./images/astronaut.png
description: We've embarked on a cosmic journey, transitioning from Jekyll to the sleek Astro framework, all while channeling the spirit of innovation.
---

Greetings, tech enthusiasts! Today, we're sharing the fascinating story of
Alasco's tech blog evolution. We've embarked on a cosmic journey, transitioning
from Jekyll to the sleek Astro framework, all while channeling the spirit of
innovation. So, fasten your seatbelts as we take you on this adventure
and explore how this leap has reshaped our blogging universe, delivering speed,
simplicity, and a touch of magic along the way!

## A Journey Sparked by Curiosity

Our tech blog has been an integral part of our company's tech culture. It's the
place where Alascians--that’s what we call ourselves--share invaluable insights,
recount their experiences, and offer intriguing glimpses into the dynamic world
of product and technology at our company. Originally, we chose Jekyll because it
was well-suited for blogs and easily deployable to GitHub Pages.

So, why did we venture into the cosmos and choose Astro over our old
(now stable) friend Jekyll? Well, curiosity got the best of us. Astro's appeal
was undeniable, tempting us to explore its potential.

Astro is tailored for content-rich websites, emphasising peak performance. It
seamlessly aligns with our tech blog's needs, offering adaptability and
effortless integrations that could enhance our capabilities. We're also
impressed by the continuous improvements, like the recent release of
[Astro 3.0](https://astro.build/blog/astro-3/).

Astro holds the potential to surpass our expectations, ensuring not only an
exceptional user experience but also an enhanced developer experience for our
tech blog.

## Chronicles of Our Astro Migration

In this section, we delve into the notes we've penned down during our cosmic
journey with Astro.

![Migration PR title](./images/pr-title.png)

### Navigating Blog Features in Astro

While Jekyll boasts a richer set of built-in blogging features, we seamlessly
bridged the gap in Astro by adopting a straightforward
[blog template](https://astro.build/themes/details/blog/) from Astro’s
collection. This allowed us to enjoy a smooth transition without
encountering any noticeable difficulties.

To transfer our content, we followed these steps:

1. We defined
   [collections schemas](https://docs.astro.build/en/guides/content-collections/#defining-multiple-collections)
   for authors and posts.
2. We moved content collections from `_posts` and `_data`, to `src/content/`.
   To preserve existing URLs, we renamed post files from `YYYY-MM-DD-title.md` to
   `YYYY/MM/DD/title.md`.
3. We [queried collections](https://docs.astro.build/en/guides/content-collections/#querying-collections)
   within our components front matters.

### Embracing the Comfort of JSX Templates

Our component transformation extended beyond front matters. While Jekyll relies
on Liquid templates, Astro employs a JSX-like template language. Here's a
side-by-side comparison of listing items in both languages:

<table>
<tr>
<td>

```liquid
<ul>
 {% for item in items %}
  {% if item.displayed %}
     {{ item.description }}
   {% endif %}
 {% endfor %}
</ul>
```

</td>
<td>

```jsx
<ul>
  {items
    .filter((item) => item.displayed)
    .map((item) => (
      <li>{item.description}</li>
    ))}
</ul>
```

</td>
</tr>
<tr>
    <td>Liquid</td>
    <td>Astro</td>
</tr>
</table>

As you can imagine, the changes were quite straightforward and didn’t take a
lot of time to implement.

In the early stages, the Alasco application heavily relied on Django templates.
However, as time progressed, we invested more in our React-based frontend
tooling. The transition to Astro brought us closer to what we are familiar with
enhancing our development experience.

### Simplifying Image Handling

Astro's [image handling](https://docs.astro.build/en/guides/images/) truly
worked like magic. It allowed us to specify image quality, ensuring our blog
loaded faster while maintaining impeccable image quality. Gone are the days of
manual image tweaking for our authors--Astro took on the heavy lifting.

### Streamlining and Enhancing with Astro

Astro's [wide array of integrations](https://astro.build/integrations/) offers
versatile solutions for various purposes.

[Tailwind integration](https://docs.astro.build/en/guides/integrations-guide/tailwind/),
in particular, allowed us to dramatically reduce our CSS code. We removed
around 3000 lines of redundant styles that had accumulated over the years,
much of it unused. Moreover, integrating the
[Typography](https://tailwindcss.com/docs/typography-plugin) plugin improved
the visual presentation of our Markdown content with minimal extra styling.

Embracing Astro presented us with an opportunity to declutter our codebase and
address long-standing issues, including the removal of unnecessary dependencies
to reduce data usage for our readers.

## The Exciting Possibilities Ahead

Our transition from Jekyll to Astro has transformed our tech blog, bringing
speed and simplicity to our content creation process. With Astro as our
foundation, we'll continue to share captivating tech stories and insights.
Join us as we explore the evolving world of tech at Alasco! 🚀🌌✨
