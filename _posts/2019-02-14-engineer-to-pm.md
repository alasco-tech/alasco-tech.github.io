---
author: schuon
date: 2019-02-14
layout: post
title: When an engineer becomes product manager
subtitle: ...how to build a development pipeline that makes it super convenient to check out new features
---
In this post, I would like to talk about our infrastructure and how we deploy. I, Sebastian, had been coding the initial version of Alasco. As time went on and the team grew, I moved into the product manager role. Today I am responsible for the product, but more from a strategic point and less from a technical point. My transition was gradual, at first I stopped writing features and the last thing I worked on was infrastructure - both because I enjoy it for the empowerment it gives and because it’s quite decoupled from the daily product development work.

An issue I often have as product manager is “can you give feedback / approve this feature?”. Obviously if I do it on an engineers computer, the engineer is blocked. Therefore I had a build environment checkout on my computer but as stuff got more complex I was often stuck for hours to catch up with my setup so the latest features would work. As I want to block my engineering team as little as possible, we needed a better solution! Here’s the story how each branch today gets its own infrastructure and can readily be accessed by https://some-nice-url.alasco.de. Super-easy to test!

## Our initial CI pipeline
Alasco is built in the backend with a python / django application and react in the frontend. We already had a quite good CI pipeline in place before we ventured on this quest. In a nutshell, whenever changes get pushed to GitHub, a CircleCI build is triggered. Our CI pipeline builds a docker container that contains both backend and frontend code and run tests on it. Once good, it’s pushed into a docker registry. We host our application on AWS ElasticBeanstalk, where we deploy it as a docker container. Beanstalk gives us good additional tooling (like rolling updates, monitoring, logging…) and we feel with using a docker container we are independent enough to switch later to more sophisticated setups. In the end, the process from committing code to having it live is quite straightforward. We take pride that new team members commit and deploy to production on their first day in the team! I still remember copying php files to ftp servers ten years ago, what a dramatic change!

## An idea is born: never checkout a branch again to demo it
Being a young startup, we did not provision our infrastructure using code in the first days. As we now have a significant customer base on our platform, we wanted to change this for enhanced reliability and reproducibility. Here the idea was born: why don’t we spin up a dedicated setup for each branch pushed? Obviously this would be something that should be easily doable once all our infrastructure was in code. Here’s how we did that:

As we host on AWS, we looked at different options to describe our infrastructure: [CloudFormation](https://aws.amazon.com/cloudformation/), [Terraform](https://www.terraform.io/) or [troposhere](https://github.com/cloudtools/troposphere). We ended up using troposhere, as pure CloudFormation json files seemed tedious to maintain, terraform had a complex syntax and we didn’t need multi-cloud support. Troposhere didn’t require us writing pure json files and had the benefit of being in python too (thus could well integrate into our existing infrastructure).

## AWS Beanstalk as the nucleus of a deployment
ElasticBeanstalk has the concept of an application and an environment. Think of an application as a group of environments. Between those you can, for example, share deployed versions of your software. We decided to have two dedicated applications, one for production and one for staging. This is an additional safe-guard that separates production from staging. Then all the feature-branches get deployed as an environment in the staging app. This looks like this:

![Elastic Beanstalk Environment Overview]({{ site.url }}/assets/img/engineer_to_po_1.png "Elastic Beanstalk Environment Overview")

From a technical standpoint we decided to have two separate CloudFormation templates: one that spins up the application (that’s rarely executed) and one to spin up an environment within an application. We started our work based on Caktus’s [AWS Webstack](https://github.com/caktus/aws-web-stacks) but soon deviated so heavily from it that it was not forkable anymore. For example we reworked it to have most parameters not being CloudFormation Parameters in the template but that we set them at template generation time in code. This gave us a better feeling of control as well as reducing complexity at stack creation time. Also we could then create inheritance of settings and selectively overwriting parameters. This ensures environments are as similar as possible and differences are clearly visible.

## CicleCI to drive deploys
![CircleCI Workflow]({{ site.url }}/assets/img/engineer_to_po_2.png "CircleCI Workflow")

We tweaked the deploy step in CircleCI to generate the CloudFormation templates, afterwards the template is executed and this brings up the stack. The stack provisions not only our application on Beanstalks, but also the RDS databases, S3 buckets and alike. We also create a DNS entry so the application can be reached by the branch’s name (that’s what all the work has been for!):

![URL Output]({{ site.url }}/assets/img/engineer_to_po_3.png "URL Output")

## Saving some $$$
Over time we upgraded out setup to install test data on newly created stack as to make testing even easier. We also applied some tweaks to save costs. First, we modified the branch deploys to use cheaper hardware (think smaller instances) as well as reduced redundancy (e.g. only one instance behind a load balancer). The latter also speed up our deployment times, as we didn’t needed rolling updates on multiple instances. The next improvement was to introduce skipped provisioning on branches that ended on -no-infra. Some things just don’t need an infrastructure to demo (like a modified source code formatter).

The final step was to introduce a cleanup script, that removes infrastructure once it’s not needed anymore. We decided to remove infrastructure once the respective branch is deleted. We therefore delete branches once we merged the pull requests.

For this we created a script, that loops over the existing branches and compares them to the provisioned infrastructure (we tag the stacks with the corresponding branch). Upon deleting, it’s important to not only delete the stack itself but also handle S3 buckets. Unfortunately S3 buckets which are non-empty cannot be deleted. Therefore our script empties buckets before triggering the stack delete. Here’s our script for your convenience:

{% highlight python linenos %}
import os
import traceback

import boto3
from github import Github


_PROTECTED_STACKS = (
    "alasco-app-staging",
    "alasco-app-production",
)  # add stacks that shall not be deleted here...
_REGION = "eu-central-1"


cf_client = boto3.client("cloudformation", region_name=_REGION)

def branch_tagged_stacks(client):
    """ Collect only stacks which are tagged with a branch """
    stacks_aws = dict()
    res_describe_stacks = client.describe_stacks()

    for stack in res_describe_stacks["Stacks"]:
        for tag in stack["Tags"]:
            if tag["Key"] == "branch":
                stacks_aws[tag["Value"]] = stack["StackName"]

    return stack_aws


print(f"Found {len(stacks_aws)} stacks tagged with a branch on AWS")

def open_branches():
    """ Retrieve open branches from Github """
    github_token = os.environ.get("GITHUB_TOKEN")
    git_client = Github(github_token)
    repo = git_client.get_repo("alasco-tech/alasco-app")
    return repo.get_branches()

def branchless_stacks(client)
    """ Return all Stacks that have no existing branch anymoer """
    stacks_aws = branch_tagged_stacks(client)
    for branch in open_branches(client):
        if branch.name in stacks_aws.keys():
            stacks_aws.pop(branch.name)

    return stacks_aws

# Trigger delete for stack, where no branch is open on Github
s3_client = boto3.client("s3")
failed_branches = []
for branch, stack_name in branchless_stacks(cf_client).items():
    if stack_name in _PROTECTED_STACKS:
        continue
    try:
        print(f"Deleting stack {stack_name} for branch {branch}")

        # Empty S3 buckets, else deletes fail
        stack_desc = cf_client.describe_stacks(StackName=stack_name)["Stacks"][0][
            "Outputs"
        ]
        stack_outputs = {item["OutputKey"]: item["OutputValue"] for item in stack_desc}
        s3_bucket_name = stack_outputs["PrivateAssetsBucketDomainName"].replace(
            ".s3.amazonaws.com", ""
        )

        paginator = s3_client.get_paginator("list_object_versions")
        response_iterator = paginator.paginate(Bucket=s3_bucket_name)
        try:
            for response in response_iterator:
                versions = response.get("Versions", [])
                versions.extend(response.get("DeleteMarkers", []))
                for x in versions:
                    s3_client.delete_object(
                        Bucket=s3_bucket_name, Key=x["Key"], VersionId=x["VersionId"]
                    )
        except s3_client.exceptions.NoSuchBucket:
            print(f"Bucket '{s3_bucket_name}' not found, continuing to stack delete.")

        cf_client.delete_stack(StackName=stack_name)
    except Exception:  # pylint: disable=broad-except
        print(f"Failed to delete stack for branch '{stack_name}':")
        traceback.print_exc()
        failed_branches.append(stack_name)

if failed_branches:
    print("Failed branches:")
    print("\n".join(failed_branches))
    exit(99)
{% endhighlight %}

As this script needs both Github access as well as AWS credentials, we decided to execute it as a scheduled build on CircleCI (currently on a hourly schedule). So we can provide credentials via environment variables in a secure way. This then looks like this in the CircleCI config:

{% highlight yaml linenos %}
clean_up:
  triggers:
  - schedule:
      cron: "0 * * * *"
      filters:
        branches:
          only:
          - staging
  jobs:
  - checkout_code
  - clean_up_cf:
      requires:
      - checkout_code
{% endhighlight %}

## Today, PO demos are easy as pie
While taking some days to get it running, this setup has greatly reduced the time to checkout and discuss new features. It’s also a major force in user testing, as new features are available with minimum delay to our UX researcher to validate them with our users.

Interested in having this setup too? Reach out to us if you have any questions or do join us: we’re looking for great team members, check out our open positions at [https://www.alasco.de/en/](https://www.alasco.de/en/)!
