---
title: Letting Go to Lead
date: 2026-02-08 10:00:00
categories:
  - Career
tags:
  - Leadership
---

I've been Director of Engineering at CXBuilder for a few months now. Time for some honest reflection.

<!-- more -->

I still love the technical work — debugging gnarly issues, designing systems, writing code. But leading a team of exceptional developers on cutting-edge projects is just as challenging, if not more. Like any hard technical problem, I'm approaching it with study and practice.

These lessons apply at every level of leadership — a senior mentoring a junior, a team lead guiding senior devs. But as a director, getting them right is vital. The more I free up my own time, the more I have for the meetings, one-on-ones, interviews, and the work that only I can do.

## Let People Get Bruised

The hardest part is letting others stumble. Use the Socratic method — prompt people to discover solutions rather than handing them the answer. Let them learn to solve their own problems.

As an individual contributor, this was a challenge. In this role, it's mandatory.

## Stop Being the Hero

I often spot something I could "just fix myself" in 15 minutes. Using tools like Claude Code, it may even be fun! Resist.

We work with serverless applications that contain infrastructure, backend, frontend, and testing code. A simple change can surface deployment issues, runtime bugs, rendering problems, or test failures. Your "15 minute fix" quietly becomes 3 hours.

A better approach: spend those 15 minutes with Claude Code in the target repo drafting a user story. Iterate until it's clear, then put it on the backlog for a developer to pick up. Your job is to multiply the team, not be a bottleneck.

## Vibe Code Your Specs

I tend to write short user stories. A few sentences is enough for me to come back in a few weeks and know exactly what it means. Other developers don't have the project and industry context sitting in my head. A short doc means a meeting for context transfer. A detailed doc is time consuming to write.

So I started using Claude Code to draft design documents from the target repo or source materials. The output is more detailed and accurate than what I'd normally produce on my own. I iterate until it says what I need and nothing else — AI tools love to drop in extra fluff like future enhancements, troubleshooting, and scaling sections. If it's not relevant, cut it. Reading docs takes brain power too.

This ties into a broader trend. Spec Driven Development is gaining traction with tools like Kiro, OpenSpec, and the BMAD method. A good spec pays off twice — once for the human developer reading it, and again as input for an agentic coding tool that someone else monitors. The spec becomes the handoff, not a meeting.
