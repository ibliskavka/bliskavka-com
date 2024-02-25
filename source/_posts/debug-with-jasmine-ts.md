---
title: Debug Typescript with VS Code Jasmine-TS Extension
date: 2020-01-06 11:59:36
categories:
  - HowTo
tags:
  - VS Code
  - Typescript
  - NodeJS
  - Lambda
---

At work, we develop a lot of AWS Lambda code and occasionally I see a junior developer deploy a Lambda EACH time they test, and they test manually in the Lambda UI!

<!-- more -->

This is extremely inefficient. You should run your code locally and here is a short video describing the process

<iframe width="560" height="315" src="https://www.youtube.com/embed/YQW_NNFvMh8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Caveats

- If you develop on Windows, there may be some edge cases where the code executes fine locally but has issues in the Lambda (Linux) runtime.
  - This is usually caused by line endings, forward vs back slashes, and exec/spawn commands.
  - Solution: Use [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install) for Lambda development

## Update 2023-06-29

I switched to `ts-jest` and the [Jest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner) VS Code extension. It does the same thing as the above example but is a little simpler to set up.
