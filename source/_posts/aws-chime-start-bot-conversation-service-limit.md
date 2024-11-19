---
title: AWS Chime StartBotConversation Service Limit
date: 2024-11-19 08:53:07
categories:
  - HowTo
  - Troubleshooting
tags:
  - AWS
  - HowTo
  - Chime
  - Lex
---

I am working on a Amazon Chime application that provides natural language and GenAI features to a legacy phone system. After deploying the app into a new account, I got the following error in my SMA Lambda Handler when trying to invoke the Amazon Lex bot:

<!-- more -->

```json
{
  "SchemaVersion": "1.0",
  "Sequence": 2,
  "InvocationEventType": "INVALID_LAMBDA_RESPONSE",
  "CallDetails": { ... },
  "ErrorType": "ActionExecutionThrottled",
  "ErrorMessage": "This account has exceeded the number of bot references allowed by the PSTN Audio service"
}
```

This error was a surprise because I have deployed similar apps in older accounts, without being throttled.

## The Service Quota

After doing some searching, I found [this documentation](https://docs.aws.amazon.com/general/latest/gr/chime-sdk.html#chm-sdk-pstn-quotas) about a new service quota

- Name: Amazon Chime SDK SIP trunking and voice - `StartBotConversation` Amazon Lex bots
- **Default**: 0
- Adjustable: Yes
- Description: The maximum number of Amazon Lex bots you can use with the PSTN Audio StartBotConversation action in the current AWS Region.

I assume this quota is pretty new, because I could not find it in the Service Quota console, or list it using the CLI.

I do not know yet if the quota will limit how many distinct bots I can use, or how many bot sessions. Ping me if you know the answer!

## Timeline

I submitted a support case to get the limit increased. I will keep this timeline updated until the issue is resolved.

- 2024-11-15: Submitted case titled: Need to increase service quote. Option is documented but not available in AWS Console.
- 2024-11-18: Response from support requesting use case description and what region I expect to use
- 2024-11-19: Response from support: The request has been forwarded to the service team, expect a response in 7-10 days
