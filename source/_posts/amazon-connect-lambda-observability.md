---
title: Stop Returning Status Codes from Your Amazon Connect Lambdas
date: 2026-05-18 00:00:00
categories:
  - HowTo
tags:
  - AWS
  - Amazon Connect
  - Lambda
  - Observability
  - CloudWatch
---

I keep seeing the same pattern in Amazon Connect implementations: Lambda functions that return HTTP-style status codes — 200 for success, 400 for validation errors, 404 for not found, 500 for unhandled exceptions.

<!-- more -->

It feels familiar, but it's the wrong tool for this job.

## The Problem

When your Lambda returns a response object — any response object — Amazon Connect sees a successful invocation. There's no Lambda error. No CloudWatch alarm fires. No metric spikes. From the platform's perspective, everything is fine.

Now your contact flow has to do the detective work. You add a "Check Contact Attributes" block, branch on `$.External.statusCode`, wire up paths for 200, 400, 404, 500... and suddenly a flow that should be simple is a maze.

And let's be honest — how often does the IVR actually handle all those codes differently? Usually there's a "happy path" for 200 and everything else hits a generic error message. You've added complexity without adding value, and you've buried your errors where no one can see them.

## What to Do Instead

Let the Lambda throw.

If there's an unhandled exception or a validation error, don't swallow it. You can still use a global try/catch to log structured details before you give up:

```typescript
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'customer-lookup' });

export const handler = async (event: ConnectContactFlowEvent) => {
  try {
    // your logic here
    return await lookupCustomer(event);
  } catch (err) {
    logger.error('Unhandled error', { err });
    throw err; // let it propagate
  }
};
```

The Lambda fails. CloudWatch logs the structured error. Your Lambda error metrics reflect reality. CloudWatch Insights lets you query across invocations to see exactly what's going wrong and how often.

Your contact flow stays clean: there's a success branch and an error branch. The error branch handles the situation gracefully — a fallback message, a queue transfer, whatever makes sense — and you move on.

## The One Legitimate Exception

Sometimes you genuinely need to branch on whether a record exists, and that's not an error — it's a valid business case. A caller might or might not have an account. That's fine.

Return a boolean:

```typescript
return { found: true, ...customerData };
// or
return { found: false };
```

Check `$.External.found` in your flow and take the appropriate branch. That's a business decision, not an error condition, and it shouldn't be modeled as one.

## A Convention in the Wrong Place

Status codes are an API Gateway convention. They exist so HTTP clients can interpret responses without reading the body. Amazon Connect isn't an HTTP client — it doesn't need that layer of indirection, and adding it just obscures what your system is actually doing.

Throw on errors. Return meaningful data on success. Your flows will be simpler and your CloudWatch logs will actually tell you when something is broken.
