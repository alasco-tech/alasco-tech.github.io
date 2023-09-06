# Readme

This is the tech blog of the Alasco engineering squad, we write about everything
we find interesting in our daily work --> <www.alasco.tech>

We use [Astro framework](https://astro.build/).

## Adding posts

It's as simple as adding a markdown (or mdx) file to the
[/src/content/blog/](/src/content/blog/) folder! Just make sure to follow the
naming schema of `/YYYY/MM/DD/title-of-post.[md/mdx]`! Check
[/src/content/config.ts](/src/content/config.ts) for collection schemas.

### Add yourself as an author

Please add yourself to the [/src/content/autor/](/src/content/author/) file.
The format is currently the following:

```yaml
name: $fullname
title: $title # optional
image: $avatar # image needs to be in ./avatars/
twitter: $twitterhandle # optional
linkedin: $linkedin-handle # optional
```

### Create your first post

Just put a file in the mentioned format (`/YYYY/MM/DD/title-of-post.[md/mdx]`)
in the [/src/content/blog/](/src/content/blog/) folder, the important thing to
remember is to create the meta-data and we use and support the following flags:

```yaml
---
authors:
  - $nickname # required, has to be in the author folder (can be multiple)
date: 2019-02-14 # date of the post, in format `YYYY-MM-DD`
title: $title #required, shows up as page-title, headline, ...
subtitle: $subtitle # optional, displayed under the title
description: $longer_description # will be used for seo meta links
thumbnail: $thumbnail # image, needs to be in ./images/
tag: $tag # optional, "featured" tag is used (to display in "Recommended posts")
teaseralt: $tag # optional, used for short description on the card
---
```

Make sure to have the three `-` as start and end signal for the front matter!

After the closing `---` your actual post starts, feel free to write in simple
markdown or mdx. Just make sure to name your file accordingly (`.md` or `.mdx`).

## Run blog on a local machine

```bash
npm install
npm run dev
```
