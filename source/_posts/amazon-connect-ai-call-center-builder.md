---
title: Amazon Connect AI Call Center Builder
date: 2026-06-11 10:00:00
categories:
  - HowTo
tags:
  - AWS
  - Amazon Connect
  - AI
  - Claude
  - CloudFormation
---

There's a workshop floating around that generates Amazon Connect contact flows and CloudFormation from a conversational UI powered by Claude Opus.

<!-- more -->

The [workshop](https://sukwonie.gitbook.io/amazon-connect-aicc-builder-agent-workshop/gWzCDnQYz8mQUQ0GtYa4/en) defaults to Korean, but there's a language toggle in the top bar. It's built on GitBook, so you can actually ask the LLM questions and it'll surface answers from the workshop docs.

The [source code](https://github.com/aws-samples/sample-aicc-builder-for-amazon-connect-ai-agent) deploys a web app that walks you through questions about your call center design (menus, intents, tools) and generates the contact flows and backing infrastructure.

I built a retirement fund sample: callers can check their balance, ask about the next payment date, order a 1099, or request special forms. The tool scaffolded the Bedrock agent, wired up the tools, and generated the Lambda stubs. Not bad for a few minutes of clicking through a form.

## Where it broke

The generated CloudFormation had the wrong Lambda handler entry point — `index.handler` instead of `index.lambda_handler`. Easy fix once you know what you're looking for, but it took a debugging pass to find it.

If you're starting fresh, paste the error and the CloudFormation into an LLM and it'll find it in seconds.

## Why look at it

Even if you never deploy it, read the prompts. The way it structures the agent definition and maps intents to tools is a concrete example of how a production Connect + Bedrock setup actually gets wired together. Good working examples of that are hard to come by.

For POCs and small call centers, it's a solid starting point. For a long-running production project, you'd outgrow the scaffolding fast. But for standing up a demo or validating an architecture, it does the job.
