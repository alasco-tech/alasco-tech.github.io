---
author: lysanderkiesel
date: 2020-11-30
layout: post
title: Driving continuous improvement in our development process & practices
subtitle: Sneak peek into how our development processes and collaboration evolved in the last year
thumb: continuous_improvement.jpg
teaseralt: Upwards arrows - Photo By Jungwoo Hong (https://unsplash.com/@hjwinunsplsh)
description: How do we drive continuous improvements in our development processes and collaboration at Alasco? This article gives you a sneak peek into our practices.
---

One of the basic principles of scrum teams is continuous improvement and learning. Thus, many of the improvements to our development process and practices were derived as action items from our regular retrospectives, but also from other initiatives in the Product & Engineering (P&E) team.

This blog post provides you with some insights in what we tried out to improve our development process and practices to make it more effective and enjoyable for all members of the P&E team in the last year. This time frame was chosen due to me being part of the engineering team at Alasco for 1 year now.

There are two perspectives to the later discussed experiments and actions:

**1. Things we changed due to a growing team size:** So some of the adaptations and actions directly derived as a result of an engineering team split which took place in August, 2020, and other external factors.

**2. Things we as the P&E team tried out deliberately to aim for growth in terms of efficiency and process improvements.**

---

# Things we changed due to a growing team

To give you some background info: As our Product and Engineering team is growing constantly, we split into two engineering teams focusing on certain product areas in our app. Both teams currently consist of 5 engineers plus one product manager.
This organizational change also led to some improvements in our organization and communication as a team and thus to a higher speed.  Some of the challenges we tried to overcome with the following actions are: Team growth, multiple engineering teams, maintaining technical excellence with more people and features, tackling upcoming architectural changes with multiple teams.

## Engineering bi-weekly:
After splitting into two autonomous engineering teams, we needed one dedicated event where we could discuss upcoming issues and to offer a space where every team member can bring up topics which affect both engineering teams in their development process and practices at Alasco. For this reason, our “Engineering bi-weekly” event was born. It's a facilitated, time-boxed event (60 min) where we first do a check-in on past actions to evaluate learning from the “trial” period (mostly the previous sprint) and decide if the actions had a “positive” contribution to our team. If yes, and after a quick “cost-benefit analysis” we go ahead with integrating this action part into our Sprint routine. If not, we skip the experiment again and might try out something different.

After evaluating the past actions, we discuss the prepared topic which every engineer is “welcome” to add to the meeting slides in advance. During this part, every topic is discussed and potential solutions are evaluated as actions items. Finally we decide on an action as an experiment for the next sprint.

## Backend and Frontend forum:
Having the same goals as the **_Engineering bi-weekly_** (promote knowledge exchange between independent and autonomous teams) on a more general, we implemented “Forums” aka Guilds or Communities of practice as a format to discuss ideas problems and solutions in the area of backend and frontend developing.
After the frontend developers being the frontrunner and starting a weekly 30’ **_FE forum_** event, we also started the **_BE forum_**.

Both events follow the same pattern as the **_Engineering bi-weekly_**: First evaluating past actions, then discussing topics prepared by any team member. Among the topics we discuss there are continuous improvements of our Frontend/Backend guidelines, tooling improvements and other initiatives. To keep these meetings efficient, it also only takes place if there were topics added to the slides beforehand. So far our **_BE & FE forums_** work great and led to many improvements. In the future there might be even more groups possible like DevOps, UX etc.

# Things we deliberately changed to achieve process and efficiency improvements

## Tech Planning Two:
An example of an outcome of our **_Engineering bi-weekly_** was the introduction of a dedicated “Tech Planning” event taking place directly after each sprint planning. In scrum, this event is often referred to as [**_Sprint Planning Two_**](https://less.works/less/framework/sprint-planning-two). Before having this event, the tech planning of stories at Alasco were mostly done in smaller groups of developers whenever we started to tackle it. As a consequence, important design and architecture decisions were sometimes taken by a pair or even a single developer. Another issue was that these design decisions were often not documented properly.

So we addressed this issue by integrating an one-hour **_Sprint Planning Two_** event where we plan & discuss each story in the sprint to “enough detail”. This event is organized and held by the engineering team, however the product manager and other experts are free to join if needed. In regards to knowledge exchange, these meetings work quite well in my opinion. Additionally to this meeting and depending on the story, we sometimes do another, more dedicated tech planning the first days of the sprint if we face that there is a high uncertainty/complexity for a story. In regards to documenting design/architecture decisions, we are currently starting to use _Notion_ heavily at Alasco. As this just started, we still need to see if Notion works well for us in that regard.

## Kaizen time:
Another thing we faced earlier this year was that we engineers struggled to find the time for internal improvements during the “normal sprint” work. And we realized without continuous improvements, things deteriorate. So as a retrospective outcome we decided to try allocating a fixed amount of time per sprint to work on smaller improvements. This is how we introduced **_Kaizen_** at Alasco. **_Kaizen_** originates from a Japanese word encapsulating the concept of “continuous improvement”. If you want to read more about the history of **_Kaizen_**, check this [**article**](https://www.kanbanchi.com/what-is-kaizen).

During this **_Kaizen time_** every engineer can basically work on any small improvement they think is worth spending an afternoon on and pays into the continuous improvement of our Product & Engineering team (e.g. improved tooling, learning outcome etc.). After negotiating and convincing our product team, we blocked the afternoon of the last day of our 2-weeks sprint for **_Kaizen_**.

Another positive side effect of having this **_Kaizen time_** on Tuesday afternoon is that it enables an appreciated cool down time between the product review and retrospective held on Tuesday morning, and the start of the next sprint on Wednesday morning.
And if someone currently has no idea what to spend the **_Kaizen time_** on, we also created a **_Kaizen Backlog_** as a catalog of small improvements you can get some inspiration from or just pick as a ticket. One example of outcomes of our **_Kaizen time_** was spending an afternoon improving the duration of our build/deploy pipeline.

# Skip the actions if they do not provide value anymore

## Late check-in:
Toward the end of last year, we faced an issue that we had some inefficiency in our development work, due to having only one “Daily Standup” as the check-in for the sprint work progress. This sometimes led to having some “uncertainty” reduced or blockers removed just with the next standup. As a retrospective outcome, we decided to set up a **_Late Check-in_** at 15 pm in addition to the “daily standup” at 10 am.

In the **_Late Check-in_**  every engineer briefly answered two questions: What did I achieve so far and is there anything blocking me from having the best possible contribution to the sprint. And there was a clear focus on the latter.
Especially at the end of the sprint or when finalizing a story, the **_Late Check-in_**  worked out quite well for us as it enabled us to have a high focus in actually shipping the stories and creating the increment. So to phrase it differently, we used the **_Late Check-in_**  to improve our “flow management” skills and to have two daily events to remove impediments quickly.

However, my engineering team just recently decided to ditch the **_Late Check-in_**  as we faced the issue of having too little focus time for us engineers, especially in the afternoon, where it turned out we are the most effective in coding. So we got rid of the **_Late Check-in_**  as we saw that with a smaller team size it did not provide the “value” it did for us in a bigger team when we introduced it.

After having a sprint without the **_Late Check-in_**  weeks later, the team actually missed the this event as in times of working remote, this was another chance to see and talk to your fellow colleagues. Out of this experience, we came up with an improvement and set up a “voluntary” coffee check-in around 15:00 where you can opt-in to have a cup of coffee and chat with your colleagues. However, if they feel to be focused and rather focus on coding everyone is free to also not show up.

---

Hope you got a bit of an insight into how we work at Alasco and how we continuously try to make our development processes and practices more efficient, but also more enjoyable. And maybe you even can try out some of the mentioned actions in your team if you face some of the same challenges.