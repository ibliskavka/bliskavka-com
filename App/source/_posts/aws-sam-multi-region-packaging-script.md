---
title: AWS SAM Multi-Region Packaging Script
date: 2023-07-20 11:19:24
categories:
  - HowTo
tags:
  - AWS
  - HowTo
  - AWS SAM CLI
---

I use this bash loop to package an AWS SAM template to multiple regions.

This script stages the CloudFormation template and assets in a regional bucket. You can share the bucket with other accounts via Bucket Policy.

```bash
# Pass stage as command line parameter
STAGE=$1

# Load package version
VERSION=$(jq -r .version package.json)

# Listing all regions that support Amazon Connect
declare -a regions=("us-east-1" "us-west-2" "ap-southeast-1" "ap-southeast-2" "ap-northeast-1" "ca-central-1" "eu-central-1" "eu-west-2")

for REGION in "${regions[@]}"
do

   if [ $STAGE == "dev" ] && [ $REGION != "us-east-1" ]; then

    # Only deploy to us-east-1 in dev
    echo "$STAGE: Skipping $REGION"

   else

    BUCKET="my-app-${STAGE}-${REGION}"
    echo "$STAGE: Publishing $BUCKET"

    sam package -t template.yaml --s3-bucket $BUCKET --s3-prefix $VERSION --output-template-file .aws-sam/packaged.yaml --region $REGION
    aws s3 cp .aws-sam/packaged.yaml s3://$BUCKET/$VERSION/template.yaml --region $REGION

   fi
done
```

That it! Now you can deploy your Serverless application in any region, using only the CloudFormation console.
