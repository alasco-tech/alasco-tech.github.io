# Readme

This is the tech blog of the Alasco engineering squad.

## Run jekyll pages on local machine
Some simple steps to get you going, tested with Mac OS, should work fine on
other \*nix systems too! [Readme from github](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/)

1. Install bundler & jekyll

```bash
sudo gem install bundler
bundle install --path vendor/bundle
```

After this you're actually up and running!
1. Run jekyll
```bash
bundle exec jekyll serve
```

After some time having the repo on your local machine you might want to update
your dependencies:
```bash
bundle update
```
