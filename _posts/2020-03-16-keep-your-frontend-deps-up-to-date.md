---
author: sebastianmark
date: 2020-03-16
layout: post
title: Keep your frontend dependencies up-to-date
subtitle: How we tackle the problem to update our frontend deps on a regular basis
thumb: frontenddeps_1.jpg
tag: featured
teaseralt: Code on a computer screen
description: How we tackle the problem to update our frontend deps on a regular basis at Alasco, using npm-check-updates.
---

At Alasco we are developing various Frontend components every day in order to achieve that our customers have the best user experience possible to fulfill their daily tasks. This leads to not only developing everything by ourselves but also using third-party packages from the development community.

One big advantage is that we don’t need to build and maintain specific or recurring functionalities by ourselves which improves the development speed a lot and helps us to focus more on building the right logic for our customer needs.

We can speed up things and don’t need to worry about some functionalities, right? But what about the following questions:

- Is the package actively maintained by a person or community?
- When is a new package available and what are the changes?
- Is there a regular update to the package in order to face e. g. security issues?
- Which peer-dependencies does the package contain and are they updated on a regular basis (e. g. updated React versions)?
- Could the package lead to a tech problem in our app (e. g. when security updates are missing)?

We were thinking about that challenge and how we can solve it in a fast and efficient way. Updating manually would lead to a huge overhead as you need to have an overview over all your used packages and their changes. Further the knowledge sharing isn’t good at all as there is no transparency about any available updates. So this was not the solution.

It was pretty clear that we want to have it automated in some way. As we are using CircleCI for our build pipeline we had a look at their feature to create automated jobs. Wouldn’t it be possible to run a weekly job, which checks our dependencies and opens a PR when there are new dependencies available? We already use this kind of [setup for our backend dependencies](https://alasco-tech.github.io/2019/09/24/dependency-updates.html) so we didn’t have to start from scratch.

After some research we found a package called [npm-check-updates](https://github.com/tjunnone/npm-check-updates) which offers a tool to check the `package.json` for version updates. Further it offers to ignore new versions if we don’t want to upgrade specific packages. The output of the package is pretty straightforward:

```
Upgrading /home/circleci/project/frontend/package.json

use-debounce ^3.3.0 → ^3.4.0
@types/jest ^25.1.3 → ^25.1.4
eslint-plugin-jest ^23.8.1 → ^23.8.2

Run npm install to install new versions.
```

Basically the package offers everything we need for our challenge, so we decided to take a shot here. In order to have the tool executed on a regular basis we created an automated job in our build setup and added the configuration for running the command. To check if there is an version update in our codebase we copy the old `package.json` and compare it with the new one which was created by the `ncu`.

```
echo "### Install ncu"
npm install npm-check-updates

echo "### Check deps"
cp package.json old_package.json
HAS_NEW_DEPS="(cmp --silent old_package.json package.json; echo $?)"
```

We want to promote transparency within the frontend team about dependency updates, so we’re saving the output of `ncu` in a variable in order to use it later for the description of the PR:

```
DEPENDENCY_CHECK_RESULT="$(npm run check-for-updates)"
```

We are now ready to open the PR when updates have been made during the build:

{% highlight bash linenos %}
if [ "HAS_NEW_DEPS" == "1" ]; then
  echo "### Create branch"
  git checkout -b "frontend-update-${CIRCLE_SHA1}"
  echo "### Cleanup ncu"
  npm uninstall npm-check-updates

  echo "### Commit changes"
  git add --all
  git commit -m "update frontend dependencies to ${CIRCLE_SHA1}"

  echo "### Push"
  git push

  echo "### Write update result to file"
  printf "$DEPENDENCY_CHECK_RESULT" > pr_description.txt

  echo "### Update PR description"
  pip install --user PyGithub python ../.circleci/pull_request.py -t "Update Frontend deps" -b "frontend-update-${CIRCLE_SHA1}" -d pr_description.txt
else
  echo "No dependency updates available"
fi
{% endhighlight %}

The updates and PR are ready now but we still need to make sure that those changes are not breaking anything in our app. We handle this with tests written with `react-testing-library` and `enzyme`. Our automated test suite and selective manual tests are executed. As the description of the PR contains a list of changes it’s very transparent and not a big effort at all.

After implementing it and running it for a couple of months now I see many advantages with this approach:

- Our dependencies are updated regularly
- The manual effort for deps updates was reduced significantly
- Having a good test coverage in place helps us to ensure that the app is running as expected
- We don’t have huge leaps between versions
- We can identify if packages are using peer dependencies which lead to problems pretty fast
- We can react to breaking changes way faster than updating them all at once