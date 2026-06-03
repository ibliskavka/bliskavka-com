---
title: Who Touched My Flow!?
date: 2026-06-03 10:00:00
categories:
  - HowTo
tags:
  - AWS
  - Amazon Connect
  - CloudTrail
  - Audit
---

A client called me out — users were overwriting each other's contact flows, and the pipeline got blamed.

<!-- more -->

The pipeline hadn't run in days, but that didn't matter. My job was to figure out who actually made the change.

Here's what I think happened:

- Sally is building a new feature in dev — not ready for production
- John needs to test a hotfix, so he exports the prod flow and imports it into dev
- John validates in dev, replicates the fix in prod, moves on
- Sally comes back and finds all her work gone

Sally *can* restore from the flow's version history. But who caused the overwrite?

## The Easy Way (I Should Have Known This)

Right there on the Contact Flow List page is a link: **"View Historical Changes"**. You can filter by date and time and see exactly who made each change.

And on the flow details page, if you select an older version and switch to the **Details** tab, it shows you the user who saved that version.

I went straight to CloudTrail. The answer was sitting in the UI the whole time. I've spent way too much time in code and not enough in the Connect console.

## The CloudTrail Way

If you need an API-based approach — or if you're already in CloudTrail for other reasons — here's how to read the events.

### Changes Made via API or CLI

```json
{
    "userIdentity": {
        "type": "AssumedRole",
        "arn": "arn:aws:sts::999999999999:assumed-role/developer-sso-role/user@example.com"
    }
}
```

The email is embedded in the role ARN as the **Role Session Name**. Easy.

### Changes Made via the Connect Console

```json
{
    "userIdentity": {
        "type": "AssumedRole",
        "arn": "arn:aws:sts::999999999999:assumed-role/AWSServiceRoleForAmazonConnect_DwT0YgEuWX9uaWsPKbOu/78adbca8-17ff-47dd-b354-2405d9371018"
    }
}
```

The Role Session Name here is an internal Connect user ID, not an email. To resolve it:

```bash
aws connect describe-user --user-id 78adbca8-17ff-47dd-b354-2405d9371018 --instance-id <your-instance-id>
```

### Emergency Access

If `describe-user` returns nothing, the user logged in with Emergency Access. You can't identify them directly from the flow change event, but you can search CloudTrail for who used the feature:

```json
{
    "userIdentity": {
        "type": "AssumedRole",
        "principalId": "AROA3LF2EZF67TQBAWQ23:user@example.com"
    },
    "eventSource": "connect.amazonaws.com",
    "eventName": "AdminGetEmergencyAccessToken"
}
```

The `principalId` contains the email of whoever requested emergency access.
