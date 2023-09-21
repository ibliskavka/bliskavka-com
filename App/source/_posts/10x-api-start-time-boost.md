---
title: 10x API Cold Start Boost
date: 2023-09-20 20:03:19
tags:
  - AWS
  - Lambda
categories:
  - HowTo
---

I while ago I optimized my [Screen Saver Gallery](https://bliskavka.com/Screen-Saver-Gallery) API by loading a flat data file into lambda memory. A nightly job selects a random subset of the database and stores it in S3, and the API uses that file for the next 24 hours.

This simplified my code, reduced costs, and improved performance.

The average API calls took 50-100ms! ...but the start-up time was **5 seconds**!!!

I was using a lambda warmer, so most clients didn't hit the 5 seconds latency, but I wondered if I could reduce it.

**TL;DR;** Store an uncompressed JSON file in a Lambda Layer and rebuild it periodically

## Before

1. A nightly process reads data from Dynamo DB and generates a zip file that looks like this:

   - cache.zip
     - tableA.json
     - tableB.json

2. The zip file is stored in S3
3. When the lambda starts, it loads the zip file from S3, and loads it into memory (Duration: 4-5 seconds)

   ```typescript
   let cache: Record<string, ITable>;
   ```

4. All future requests are served from the in-memory cache (50-100ms)

## Attempt 1

Instead of loading from S3, store the zip file in a lambda layer, and rebuild the layer every night.

Result: This reduced the start-up by 1 second.

## Attempt 2

The layer improved the load time, so it was good start, but I felt like it should be faster.

I added some basic timers to my warmup function and discovered that almost 3 seconds was spent on parsing the individual table files from the zip file. There are about 217 file in total.

I updated the code to parse the table files in parallel, which shaved off only about 500ms

## Attempt 3

Armed with the timing information, I understood that my load issue was computationally constrained - decompressing zip files requires CPU cycles.

I refactored my lambda layer cache to be a single `cache.json` file that looks like this

```json
{
  "tableA": [],
  "tableB": []
}
```

The lambda can load the data using `readFileSync('/opt/cache.json')` and immediately parse it with no need to decompress.

Presto: cold-start load time is 500ms, subsequent API calls are 50-100ms

## Conclusion

If your data is relatively static you can cache as a flat file in a Lambda layer to reduce app complexity, costs, and startup times. Use a Lambda to periodically query a new data set and publish a new Lambda Layer Version.

When using layers, your maximum package size is 250MB. By compressing your data files you can cache A LOT of data, but you will experience decompression latency.
