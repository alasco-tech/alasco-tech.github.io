---
author: reloadedhead
date: 2023-01-13
layout: post
title: Accessible labels and where to find them
subtitle: A meetup, a blog post, and a way of making your app more accessible.
teaseralt: Accessible entry by Daniel Ali (https://unsplash.com/@untodesign_)
thumb: accessibility.jpg
description: Accssibility matters!
---

Accessibility matters!

Fortunately, I had a chance to speak about it at the Munich React meetup that was hosted at Alasco. My name is Tomás García Gobet, come with me and let's figure out where can we find those accessible labels.

![Munich React meetup](/assets/images/accessibility-meetup.png "Tomás giving a talk about accessibility.")

- [Introduction](#introduction)
  - [What means an accessible web?](#what-means-an-accessible-web)
  - [Status quo](#status-quo)
    - [Who is DRI here?](#who-is-dri-here)
    - [How can software assist?](#how-can-software-assist)
    - [Some interesting stats](#some-interesting-stats)
    - [Are screen readers a silver bullet?](#are-screen-readers-a-silver-bullet)
- [Use case: measurements](#use-case-measurements)
  - [The problem](#the-problem)
  - [Thinking of a solution](#thinking-of-a-solution)
    - [Simple as HTML](#simple-as-html)
    - [Let’s add some React to it](#lets-add-some-react-to-it)
- [Conclusion](#conclusion)
- [References](#references)

# Introduction

## What means an accessible web?

The Web is fundamentally designed to work for all people, whatever their hardware, software, language, location, or ability. When the Web meets this goal, it is accessible to people with a diverse range of hearing, movement, sight, and cognitive ability.

Web accessibility, in all its means, can be an extensive topic that would require more than a 15 minute talk. Therefore, from now on until the end of this document, I will focus on vision assistance through screen readers.

Accessibility is essential for developers and organizations that want to create high-quality websites and web tools, and not exclude people from using their products and services. One can not only encompass those who directly require assistance, but also people without disabilities.

## Status quo

### Who is DRI here?

Even though we are all responsible on making the web accessible to everyone, the [Web Accessibility Initiative](https://www.w3.org/WAI/about/participating/) provides an international forum for collaboration between industry, disability organisations, accessibility researchers, government, and others interested in web accessibility. Anyone can contribute and there are several Community Groups that are actively looking for contributors.

### How can software assist?

Screen readers are software programs that allow blind or visually impaired users to read the text that is displayed on the computer screen with a speech synthesizer or braille display. A screen reader is the interface between the computer's operating system, its applications, and the user. Usual suspects for system-wide accessibility include Eye-Pal, iMax for Mac, JAWS, Voice Over, and many more.

When it comes to browsers, mayor vendors come with screen readers built-in. If we are talking about Safari, you get VoiceOver for free from the OS (macOS, iOS). Google Chrome does offer [Screen Reader](https://chrome.google.com/webstore/detail/screen-reader/kgejglhpjiefppelpmljglcjbhoiplfn), a browser extension, but they recommend using a fully fledged software such as ChromeVox (ChromeOS only), VoiceOver on the Mac and JAWS, NVDA or Narrator in Windows. Microsoft Edge comes with a built-in screen reader, available in both Windows and macOS. As of the time of writing, both Google Chrome and Microsoft Edge ship with a screen reader. Firefox on the other hand, does not ship with a screen reader by default. However, it provides basic support for VoiceOver on Apple platforms and does link to several add-ons users can install on any platform.

### Some interesting stats

I came across the [screen reader survey #8 by Web AIM (Accessibility in mind)](https://webaim.org/projects/screenreadersurvey8/), which provides a nice overview on some topics from a screen reader user perspective. It's worth a read, and you can even compare how these results have evolved over time. What I believe it's important to take from these results, is the reasons the interviewees believe accessibility in the web is lagging behind. Lack of awareness is the most voted reason, which is something that we can fix overtime. It's important to note how critical can be having a good level of accessibility for a human being, either if it's for work or for browsing Reddit at 3:00 in the morning.

### Are screen readers a silver bullet?

Any piece of software is made by humans. Therefore, no software is bullet proof. One can navigate through WebKit’s BugZilla, filtering by `VoiceOver` or going to Chromium’s site and doing the same. The result? Plenty of bugs!

I encourage you, if you unfortunately find any bug (within any topic, not just screen readers!), **do report it!** Help the maintainers of these open source projects to improve their product by reporting unexpected errors and how to reproduce them.

# Use case: measurements

## The problem

At some point in your career as a web engineer, you probably displayed some kind of number with a context behind it. After all, it would be quite weird to show the number `42` without any explication. What is 42? 

We can be speaking about 10 double quarter pounders, 75% annual inflation or 1 banana. Instead of keep throwing numbers and their units of measurements, I raise you a more common, day to day example: € 6,50. If you are reading this, your mind probably parsed that as **six euros and fifty cents.** By the way, that’s what my favourite chicken kebab costs 🌯. That is pretty easy, right? You might wonder how screen readers perform?  Well, pretty neat! Voice over will read that just like your brain. That’s awesome!

However, not everything in life is nicely-priced kebabs. Imagine you are using a web application to measure your CO₂ emissions. Something that has been gaining track as of late. How would you read the following `1.500,78 Kg CO₂` (aside: that’s how you measure, generally, CO₂ emissions). You probably went **one thousand five hundred and seventy-eight kilograms of carbon dioxide.** A quick run in VoiceOver, throws **one thousand five hundred seventy-eight key ge ce o two**.

That’s not a rap verse, VoiceOver, that's a valid unit of measurement!

## Thinking of a solution

Wouldn’t it be nice to have a library to build user interfaces via reusable components? Oh wait, we have React. *Side-note: you can achieve the very same result with other libraries or frameworks. I will just use React.* We already know where are we standing, that mouthful of speech, and we know where we want to go. So let’s start.

### Simple as HTML

Beginning with the obvious, a simple `span` tag to render a number.

```html
<span>1500.50 Kg CO₂</span>
```

We can improve this situation by adding some context. Units of measurement are, generally speaking, abbreviations. Luckily, there is an HTML tag for that! The `abbr` tag represents an abbreviation or acronym, and can provide an expansion via the `title` attribute.

```html
<div>
  <span>1500.50</span>
  <abbr title="Kilograms of carbon dioxide">Kg CO₂</abbr>
</div>
```

And **voliá!** We have reached to our destination. That’s all folks. Right?

### Let’s add some React to it

What if you want to reuse this little thing we have just built? What if you have multiple units of measurements? We need to enhance this. We can, and we will.

Firstly, we can create a React component out of our little markup.

```tsx
const Amount = () => (
  <div>
    <span>1500.50</span>
    <abbr title="Kilograms of carbon dioxide">Kg CO₂</abbr>
  </div>
);
```

We can also start talking some API decisions. For now, let’s make `Amount` a functional component, and represent the numerical amount the sole child.

```tsx
const Amount: FC = ({ children }) => (
  <div>
    <span>{children}</span>
    <abbr title="Kilograms of carbon dioxide">Kg CO₂</abbr>
  </div>
);

/** Usage */

const App = () => (
  <div>
    <Amount>
      1500.5
    </Amount>
  </div>
);
```

Now, lets focus on the unit of measurement. It would be nice to just tell the `Amount` component that we want to render a KgCO₂ amount in this particular case. Here is when you will have to start thinking on your own context.

In addition, our component will require some sort of unit object, that will store our symbol (Kg CO₂) and the corresponding definition. We can think this object like so:

```tsx
type Unit = {
  /** Symbol of the unit of measurement, e.g. CO₂. */
  symbol: string;
  /**
   * Definition of the unit of measurement.
   * Can be a function that takes the amount and defines accordingly
   **/
  definition: string | ((value: number) => string);
  /**
   * Optional function that will format the amount.
   */
  formatter?: (value: number) => string;
};
```
**Bonus track:** include an optional formatter function that will take care the number formatting!

Our `Amount` component will look like this:

```tsx
type Props = {
  /** Unit to define this amount. */
  unit: Unit;
};

/**
 * A simple component that will make units of measurement more accessible.
 */
export default function Amount({ children, unit }: PropsWithChildren<Props>) {
  const title =
    typeof unit.definition === "function"
      ? unit.definition(Number(children))
      : unit.definition;

  const amount = unit.formatter ? unit.formatter(Number(children)) : children;

  return (
    <div>
      <span>{amount}</span>{" "}
      <abbr className="no-underline" title={title}>
        {unit.symbol}
      </abbr>
    </div>
  );
}

```

💡 It is worth noting that the generation of this `Unit` is completely implementation agnostic. You can use your favourite i18n library, Intl’s built in databases and so on.

# Conclusion
Before signing off, I would like to go back to the very title of this post: accessible labels and **where to find them?** Well: 🥁🥁🥁 in you! Yeah, that's right. You know how to build reusable components, and have just seen how easy it is to make your app a bit friendlier. Take the initiative and start adding those labels!


# References

Introduction to Web Accessibility ⬥ [W3C](https://www.w3.org/WAI/fundamentals/accessibility-intro/)

Screen readers ⬥  [American Foundation for the Blind](https://www.afb.org/blindness-and-low-vision/using-technology/assistive-technology-products/screen-readers)

Compatibility With Assistive Technologies ⬥ [Mozilla](https://support.mozilla.org/en-US/kb/accessibility-features-firefox?redirectslug=accessibility-features-firefox-make-firefox-and-we&redirectlocale=en-US#w_screen-reader)

Accessibility features in Microsoft Edge ⬥ [Microsoft](https://support.microsoft.com/en-us/microsoft-edge/accessibility-features-in-microsoft-edge-4c696192-338e-9465-b2cd-bd9b698ad19a)

Screen reader survey #8 ⬥ [Web AIM](https://webaim.org/projects/screenreadersurvey8/)