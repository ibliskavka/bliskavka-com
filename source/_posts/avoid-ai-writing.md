---
title: Avoid AI Writing
date: 2026-06-11 10:00:00
categories:
  - HowTo
tags:
  - Claude
  - Claude Code
  - Writing
---

A colleague pointed me at a Claude Code skill that strips AI-isms out of generated text. I needed it.

<!-- more -->

My blog workflow: I have a vague idea, I run `/post` in my blog repo, and Claude drafts something. Then I proofread it. The problem is the output is loaded with AI tells — too many transition phrases, filler words, and inflated sentence structures that aren't how I talk or write.

"It's worth noting that...", "This is particularly useful when...", "Let's dive in." None of that is me.

The [avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing/blob/main/README.md) skill audits generated text and rewrites it to remove those patterns. You can run it in detect-only mode to see what's wrong, or have it edit in place. There's also a voice profile option if you want to tune the output toward casual, professional, blunt, etc.

I set it to run on my drafts after `/post` generates them. The diff is usually significant.
