---
title: 'Assume Cross Account AWS Role'
date: 2019-08-14 14:15:51
categories:
- HowTo
tags:
- AWS
- DevOps
- HowTo
- Security
---

> Unlike an embarrassing Facebook post, developers can't simply say _"That wasn't me, I got hacked"_ and expect it all to go away...

Sarcasm aside, security without passwords is not only convenient, it keeps the password from landing in the wrong hands.

<!-- more -->

## Scenario

We (the vendor) like to ship our work to a client's account with our Code Pipeline using a CodeBuild project. Rather than sharing access keys, we prefer to assume a cross-account role. This allows the client to control what permissions the role has access to, and we control who can access the role.

TL;DR; Scroll to the bottom if you simply want the `assume-role.sh` script!

## The Process

1. We create a role on our vendor AWS account.
2. Client creates a role on their AWS account and allows the vendor role to assume their role.
3. The vendor role assumes the client role when we have to perform cross-account operations.
    - We are using a role here because the process executes from CodeBuild. This works with IAM users also.
    - This article is about cross-account roles, but you can use this script to assume any role you have access to.

## Vendor Role

This CloudFormation snippet is usually part of a larger pipeline template. I scaled it down to just the role

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: >
  Creates a role that will be used to assume client account role
Parameters:
  ClientRoleArn:
    Type: String
    Default: ''
    Description: >
      Will be blank initially.
      Update with client's role arn after it has been created.
Conditions:
  IsClientRoleArnSet: !Not [ !Equals [!Ref ClientRoleArn, '']]
Resources:
  VendorRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: 2012-10-17
        Statement:
          - Effect: Allow
            Principal:
              Service: codebuild.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: assume-client-role
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              # Add any additional permissions that you might need
              - Resource: "*"
                Effect: Allow
                Action:
                  - logs:*
              # Will create this rule only once the ClientRoleArn is set
              - !If
                - IsClientRoleArnSet
                - Resource: !Ref ClientRoleArn
                  Effect: Allow
                  Action:
                    - sts:AssumeRole
                - !Ref AWS::NoValue
Outputs:
  VendorRoleArn:
    Description: Pass this to the client's role template.
    Value: !GetAtt [VendorRole, Arn]
```

## Client's Role

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: >
  Creates a role that the vendor can assume
Parameters:
  VendorRoleArn:
    Description: Should be set to the VendorRoleArn from the previous stack.
    Type: String
Resources:
  ClientRole:
    Type: AWS::IAM::Role
    Properties:
      Path: /
      AssumeRolePolicyDocument:
        Version: 2012-10-17
        Statement:
          - Effect: Allow
            Principal:
              AWS: !Ref VendorRoleArn
            Action: sts:AssumeRole
      Policies:
        # Add any additional policies to the role here
        - PolicyName: code-commit-access
          PolicyDocument:
            Version: 2012-10-17
            Statement:
              - Resource: '*'
                Effect: Allow
                Action:
                  - codecommit:GitPull
                  - codecommit:GitPush
Outputs:
  ClientRoleArn:
    Description: Put this ARN back into the VendorRole template
    Value: !GetAtt [ClientRole, Arn]
```

NOTE: Don't forget to put the ClientRoleArn into the vendor stack and redeploy!

## Assume the role (assume-role.sh)

This script uses Simple Token Service to create a temporary credential that is stored in the `client` profile.

NOTE: This script uses jq, make sure it is installed on your system

```bash
#!/bin/bash
ROLE_ARN=$1
OUTPUT_PROFILE=$2

echo "Assuming role $ROLE_ARN"
sts=$(aws sts assume-role \
  --role-arn "$ROLE_ARN" \
  --role-session-name "$OUTPUT_PROFILE" \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text)
echo "Converting sts to array"
sts=($sts)
echo "AWS_ACCESS_KEY_ID is ${sts[0]}"
aws configure set aws_access_key_id ${sts[0]} --profile $OUTPUT_PROFILE
aws configure set aws_secret_access_key ${sts[1]} --profile $OUTPUT_PROFILE
aws configure set aws_session_token ${sts[2]} ${@:2} --profile $OUTPUT_PROFILE
echo "credentials stored in the profile named $OUTPUT_PROFILE"
```

Based on work from: [rizvir.com](https://rizvir.com/articles/AWS-cli-tips)

## Usage Example

```bash
./assume-role.sh $CLIENT_ROLE_ARN client
aws s3 ls --profile client --region us-east-1
```

## Tips

- If you are using CodeBuild, assume-role.sh must be a separate file and not integrated into the `buildspec.yml`. This is because buildspec executes under SH rather than BASH so it does not support arrays.

## Conclusion

This has been a huge help for me when deploying between AWS accounts - either our own or clients. I hope this helps you on your DevOps journey!
