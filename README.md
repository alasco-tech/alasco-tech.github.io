# Readme

This is the tech blog of the Alasco engineering squad.


## Adding posts
It's as simple as adding a markdown (or html) file to the [_posts](./_posts) folder! Just make sure to follow the naming schema of `YYYY-MM-DD-title-of-post.[md/html]` - if you use different naming jekyll won't find your posts!

### Add yourself as an author
In the [_data](./_data) folder is a the [authors.yml](./_data/authors.yml) file, please add yourself to that list. The format is currently the following:

```yaml
$nickname:
  name: $fullname
  twitter: $twitterhandle  # optional
  image: $avatar.[png,jpg]  # image needs to be in ./assets/img/
```

### Create your first post
Just put a file in the mentioned format (`YYYY-MM-DD-title-of-post.[md/html]`) in the [_posts](./_posts) folder, the important thing to remember is to create the correct [front matter](https://jekyllrb.com/docs/front-matter/). The front matter basically represents post meta-data and we use and support the following flags:

```yaml
---
author: $nickname   # required, has to be in the authors file!
date: 2019-02-14  # date of the post, in format `YYYY-MM-DD` 
layout: post  # fixed string, tells jekyll what template (layout) to use
title: $title  #required, shows up as page-title, headline, ...
subtitle: $subtitle  # optional, displayed under the title
---
```

Make sure to have the three `-` as start and end signal for the front matter or jekyll won't work with these files!

After the closing `---` your actual post starts, feel free to write in simple markdown or html. Just make sure to name your file accordingly (`.md` or `.html`).

## Run jekyll pages on local machine
Some simple steps to get you going, tested with Mac OS, should work fine on
other \*nix systems too! [Readme from github](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/)

### Install bundler & jekyll

```bash
sudo gem install bundler
bundle install --path vendor/bundle
```


After this you're actually up and running!
### Run jekyll
```bash
bundle exec jekyll serve
```

After some time having the repo on your local machine you might want to update
your dependencies:
```bash
bundle update
```
