---
author: wearebasti
date: 2019-11-12
layout: post
title: Memory Monitoring on AWS Elastic Beanstalk
subtitle: A way to close a blind spots in infrastructure monitoring
thumb: aws_monitoring.jpg
teaseralt: Memory monitoring graphs on a screen
description: Using AWS Elastic Beanstalk for memory monitoring at Alasco. How we report main memory usage of our instances and easily track them in Cloudwatch.
---

There’s a lot of automated and helpful metrics collected via Amazon’s Cloudwatch when you run your system on the AWS Cloud. By deploying your applications via the AWS Elastic Beanstalk you even get a predefined dashboard with a lot of helpful metrics: CPU utilization, network traffic and more!

Elastic Beanstalk is an easy way to deploy web application to Amazon’s AWS Cloud without investing a lot of time & resources in infrastructure setup. It supports many different languages and levels of application maturity. You can deploy your code directly into a preconfigured server application (like Django) or manually run a multi-docker environment. You can learn more in the official [AWS Documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html).

### Discovering the Blind Spot
At [Alasco](https://www.alasco.de/en/) we’re using Elastic Beanstalk to deploy our application as well as our feature branches for internal & external testing (To learn more about our development process read our posts about the [Alasco Development Process](https://alasco-tech.github.io/2019/09/27/alasco-dev-process.html) and what happens [When an Engineer becomes Product Manager](https://alasco-tech.github.io/2019/02/14/engineer-to-pm.html)) This works pretty smooth and we can spend the free resources on actually improving our application!

At some point we realized that one of our feature branches died and after investigation we found out that it had run out of memory! Fortunately we use rather small instances with little computing power for our feature branches, so we saw it here way earlier than it would happen on our production systems. Nevertheless we realized one thing: **We have a blind spot!**

### Covering the Blind Spot
We decided to put monitoring on our application’s main memory to make sure to not run into this problem again. Our first approach was to “just add the metric from Cloudwatch to our dashboard”. This turned out to be quite difficult! Probably for technical reasons, Amazon does not provide memory usage metrics for EC2 instances.

There’re open discussions from [2012](https://forums.aws.amazon.com/thread.jspa?messageID=338138&#338138), [2013](https://forums.aws.amazon.com/thread.jspa?messageID=421861&#421861) (and many more) on the AWS Developer Forums. Those old forum posts have often solutions linked, but those are often outdated by now and not necessarily directly applicable to Elastic Beanstalk.

#### Rolling our own Solution
After accepting the harsh reality that there’s nothing “out of the box”, we started searching for solutions to monitor the memory usage of our systems. We were of course especially interested in everything related to Elastic Beanstalk. We ended up implementing our own solution based on the [AWS Cloudwatch Agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html) - at this point a big thank you to all the blog and forum posts online that made this possible!

**Goal: Report main memory usage of our instances so we can easily track them in Cloudwatch.**

To make this goal reality we only needed two parts implemented, IAM Policies and the cloudwatch agent installed on our EC2 instances.

#### IAM Policies
We put the necessary Policies in our cloudformation template (via [troposphere](https://github.com/cloudtools/troposphere)), but you can attach those however you prefer. Fortunately there is plenty of [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create-iam-roles-for-cloudwatch-agent.html) how to attach the policies and which are needed.


#### Cloudwatch Agent
The installation of the Cloudwatch Agent was a bit trickier as we wanted it to be as automatic as possible. We decided to use an “ebextension”, which are little config files in a “.ebextensions” folder which configure and customize your Elastic Beanstalk environment.

Our cloudwatch agent extension needed to ensure the agent is installed and running with the correct configuration.

*Install the Cloudwatch Agent (on Amazon Linux!)*
{% highlight yaml linenos %}
packages:
  rpm:
    amazon-cloudwatch-agent: https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
{% endhighlight %}

*Ensure the Cloudwatch Agent is running*
{% highlight yaml linenos %}
container_commands:
  run_agent:
    command: amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/AmazonCloudWatch-config.json -s
{% endhighlight %}

*Provide the configuration file for the Cloudwatch Agent*
{% highlight yaml linenos %}
files:
  "/AmazonCloudWatch-config.json":
     mode: "000755"
     owner: root
     group: root
     content: |
        {
          "agent": {
            "metrics_collection_interval": 300
          },
          "metrics": {
            "append_dimensions": {
              "InstanceId": "${aws:InstanceId}"
            },
            "metrics_collected": {
              "mem": {
                "measurement": [
                  "Mem_used_percent"
                ],
                "append_dimensions": {
                  "AWSEBEnvironmentName": "`{"Fn::GetOptionSetting": {"Namespace": "aws:elasticbeanstalk:application:environment", "OptionName": "AWS_EB_ENV_NAME"}}`"
                }
              }
            }
          }
        }
{% endhighlight %}

The `append_dimensions` in this example adds the AWS Elastic Beanstalk environment name to the reported metric, this is very helpful for monitoring and alerting: It provides a fixed key to filter on!


### Conclusion
Amazon provides a wide variety of tools and metrics that help to ensure a reliable system, but not everything works out of the box. In my opinion, it's very important to cover as much as possible with automatic monitoring and be aware of any blind spots (and cover them!).

I hope this helps somebody with a similar problem in the future! And don't
forget to stay tuned for other upcoming stories of our tech-life at [Alasco](https://alasco-tech.github.io/)!
