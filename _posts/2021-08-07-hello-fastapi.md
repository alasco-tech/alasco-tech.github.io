---
author: chrisittner
date: 2021-08-07
layout: post
title: Hello FastAPI
subtitle: Towards an improved backend code structure
thumb: fastapi-logo.png
teaseralt: FastAPI Logo
description: We recently added a FastAPI-based setup alongside our main Django app.
---

Over a year ago, we reorganised our engineering team into two separate Scrum teams. We drew an invisible line through the product and both teams started working in our still undivided code base. It was an experiment at the time and we were prepared to introduce more visible code boundaries, separate deployment pipelines, micro-services,.. whatever would be necessary to counter the merge conflicts, ownership issues and confusion that the two teams would bring. However, as time passed none of the anticipated problems appeared and we saw no need to sharpen the code boundaries of our backend.

By today, we are working in three teams and are growing quickly and there is still no telling from our code where one team ends and the other team starts. In order to be prepared for the point where this causes friction, we recently set aside some time to investigate how a more modularised next generation of our application backend could look like. The result is that we will be implementing new feature areas using a FastAPI-based stack, rather than adding them to our Django application.

## Goodbye Django?

Django is a reasonable starting point for a web application backend, even in 2021. It is very stable, has great documentation and a large amount and variety of available extensions. Being very guiding and integrated, the framework makes it easy to churn out CRUD views and apis. However, with growing business logic, we adopted an increasingly heavy service layer that sits in-between the models/ORM and the rest of Django. Much of the efficiency and lightness of Django derives from the integration of its ORM with the views, the apis, the serializers, the forms, the admin, ... — almost every Django ingredient works directly on active record model instances and QuerySets. Over time, Django gets somewhat in the way, with many unused features and decent but not stellar support for our core requirements.

An additional motivation for exploring other setups was that we were looking for more isolation between components than the Django module system provides. Stricter than Django apps, we wanted a modular component system with independent databases per component and a restricted public interface that minimises and visualises cross-component interactions. Ideally, when working on one part of the codebase, you barely have to look at code pertaining to other components.

For the first motivation, FastAPI — an api-only framework based on the fast-growing starlette/pydantic ecosystem — is a perfect fit, along with the SQLAlchemy ORM. On top of that, we defined our own module structure with rather independent, layered components that still get deployed as a single app. We have set up our new backend stack to run alongside our current Django application. Both frameworks being Python-based, we deploy them alongside as two different wsgi-entrypoints of a webserver in a single container.

## A new component structure

For our new components we'll try out the following code structure. At the core of each component is `domain/`, the folder containing model classes for all the business entities that the component is about, plus their basic behaviour. These are defined as pure python classes (or dataclasses or pydantic classes) and do not contain any persistence logic. Additionally, there is a `db/` folder that contains all persistence code related to loading and storing domain model instances. `db/` may import `domain/` but not vice versa. The persistence layer defines one repository per domain aggregate that services may use to load and update data.

Next, `service/` contains all complex behavior that deals with multiple domain entities and their interactions. Services define domain-oriented queries and actions that make use of `domain/` and `db/` code to implement any functionality that the component provides to the outside. Finally, there are two interfaces to the outside: `api/` defines FastAPI endpoints to expose services to the frontend. `public/` exposes services to other components. Different components should only import each others `public/` interfaces. This structure is enforced by `import-linter`. While there are now more restrictions and layers as compared to our Django setup, they can be quite small and may be skipped if the component does not need them.

In summary, for our first FastAPI-based component we roughly used the internal structure that is suggested in the [Clean Architecture](https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/) and [Architecture Patterns with Python](https://www.cosmicpython.com/) books. The setup now coexists with our (much larger) Django app and may be used for new functionality as convenient.