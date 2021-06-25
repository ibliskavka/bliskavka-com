---
title: AWS Dynamo DB Batch Write Retry
date: 2021-06-25 18:48:29
tags:
---

BatchWrite is a great way to speed up data loads and updates but it has some caveats that you **MUST** know about.

__Partial success will not throw an error. You must check the unprocessed items and retry the operation__

I ran into this due to API throttling. I was using `PAY_PER_REQUEST`, so I expected the provisioning to scale automatically. DDB does scale automatically, but the process is not immediate, so I was losing records.

I created a wrapper function to check for and retry the operation. I was running multiple loads in parallel so I added some randomness to the retry wait time.

```typescript
async function batchWrite(
  table: string,
  request: WriteRequests
): Promise<void> {
  const params: BatchWriteItemInput = {
    RequestItems: {
      [table]: request,
    },
  };

  let attempts = 0;
  do {
    const response = await this.ddb.batchWrite(params).promise();

    if (
      response.UnprocessedItems &&
      response.UnprocessedItems[table] &&
      response.UnprocessedItems[table].length > 0
    ) {
      params.RequestItems = response.UnprocessedItems;
      attempts++;

      const waitSeconds = Util.getRandomInt(attempts * 5);
      console.debug(
        `Batch write was throttled, waiting ${waitSeconds} seconds to retry`
      );
      await Util.wait(waitSeconds);
    } else {
      params.RequestItems = null;
    }
  } while (params.RequestItems);
}
```

Also, don't forget to batch your requests by 25. I usually use [lodash chunk](https://lodash.com/docs/#chunk).
