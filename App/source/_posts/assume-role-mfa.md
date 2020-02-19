---
title: Assume Role with MFA
date: 2020-02-19 12:41:58
categories:
- HowTo
tags:
- AWS
- DevOps
- HowTo
- Security
---


## CLI Assume Role with MFA (assume-role-mfa.sh)

This script will assume a cross-account role using your MFA device and output the credentials into a named profile.

```bash
#!/bin/bash
ROLE_ARN=$1
OUTPUT_PROFILE=$2
MFA_SERIAL=$3
MFA_TOKEN=$4

echo "Assuming role $ROLE_ARN"
sts=$(aws sts assume-role \
  --role-arn "$ROLE_ARN" \
  --role-session-name "$OUTPUT_PROFILE" \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text \
  --serial-number $MFA_SERIAL \
  --token-code "$MFA_TOKEN")

echo "Converting sts to array"
sts=($sts)

echo "AWS_ACCESS_KEY_ID is ${sts[0]}"
aws configure set aws_access_key_id ${sts[0]} --profile $OUTPUT_PROFILE
aws configure set aws_secret_access_key ${sts[1]} --profile $OUTPUT_PROFILE
aws configure set aws_session_token ${sts[2]} ${@:2} --profile $OUTPUT_PROFILE
echo "credentials stored in the profile named $OUTPUT_PROFILE"
```

## Usage Example

```bash
./assume-role-mfa.sh $CLIENT_ROLE_ARN client arn:aws:iam::{YOUR_ACCOUNT}:mfa/ivan {MFA_CODE}
aws s3 ls --profile client --region us-east-1
```

## Conclusion

I hopes this saves you a few searches!
