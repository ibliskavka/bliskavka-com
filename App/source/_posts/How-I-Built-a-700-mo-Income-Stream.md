---
title: How I Built a $700/mo Income Stream
date: 2018-09-24 08:29:15
categories:
- Entrepreneurship
tags:
- AWS
- Screen Saver Gallery
- Entrepreneurship
- Career
---

First and foremost – there are few things more awesome than getting a direct deposit every month for work you did years ago. What was once modest beer money at $50 a month is now almost serious alcoholic money at $700 a month!

How did I do it? Well, hard work for one. You must account for the fact that I have 10 years of software development experience and was able to put together the bulk of the app over a weekend. Don’t let that scare you off, these tips are not technical and apply to anything from an app to a blog.

<!-- more -->

## Optimize for Organic Keyword Traffic

I wanted to build a screen saver for the Windows 10 store but there was one problem – there was no method for auto-starting a store app after the computer has been idle.

Screensaver is a very common keyword though and I really wanted to get that organic traffic. People love to see pretty pictures and will search for it. Additionally, less experienced users refer to desktop backgrounds as screensavers – so the word has some flux. I also wanted to indicate that the app uses photos so I named my app: Screen Saver Gallery.

Then name felt awkward at first – but after some time it kind of rolls of the tongue (at least for me).

The app is currently being downloaded over 6,000 a month organically and I attribute that primarily to the name.

## Ask for Reviews

I use social trust daily. If other people think a product is great – I am much more likely to consider it.

Ask your users for reviews – but only after they have had a chance to use the app. If you prompt them immediately they will give you 1-3 stars and say something like “Geez, let me use it first”. 

I set my prompt to 7 days. I assume that if they use the app for 7 days they are more likely to give me a good review. Don’t nag – I allow users to snooze the review reminder for 30 days or forever.

Of course you will always get people that dislike your app and post a bad review without being prompted. There is not much you can do about that except:

1.	Fix any reported issues and respond to their review
2.	If they are complaining about a missing feature that you never implemented or advertised you may point that out so that the next user can see your response.
3.	Try to be honest in your app description – you don’t want to mislead someone into thinking you are providing something you are not. (__Screen Saver__ Gallery falls into this a bit but I am honest in my description)
4.	Don’t sweat the trolls.

## Don’t Be A Leaky Bucket

Take crash reports & hangs seriously. Implement remote metrics and instrumentation like Application Insights, HockeyApp or Google Analytics. Monitor and fix bugs. Make sure your app is near 100% reliable or fails gracefully.

For a while, I had a leaky bucket. I would acquire users but my total engagement hours would stay the same. I spent a few weeks rewriting my app to use AWS S3 with CloudFront & Lambda to improve my latency and availability. My crash rate came down 75% and my usage started to grow consistently.

Within the app itself I added error checks for user inputs and error handlers with meaningful messages. If the app cannot download photos – its just about useless. Write code to try and determine the source of the problem, log it, and indicate to the user what is going on in a friendly, meaningful way.

## Look for Recurring Revenues

I am a big fan of paying for software once; I would prefer that for my app. Initially I had a non-expiring add-on that removed advertising. I quickly realized though that I had monthly time & money costs to provide quality content. I have hosting costs and I monitor image sources daily for poor quality or inappropriate content.

With that in mind I created 2 add-ons that remove the advertising: 6 months and 12 months. I have plans to add an auto-renewing subscription that people can opt into.

## Optimize Your Costs

I reduced my server costs from $40/mo to about $4/mo this summer. My costs for running Web API on Azure was about $40/month on a single server. This means that I was incurring latency costs for global users and if there was a problem with the server my app wouldn't work.

After studying AWS I saw some excellent cost optimization opportunities that also improved API performance. Most of my content is static so I created a public S3 bucket with a CloudFront distribution. I have a Lambda function that runs throughout the day to refresh each content source once ever 24 hours. CloudFront caches my content at edge locations throughout the world so I get much better latency. Additional dynamic APIs are handled using Lambda and API Gateway.

## Conclusion

Based on my experience with my modestly successful app, the above is what I consider important. My app does not change lives or cure cancer but it provides enough value to people for them to leave excellent reviews. It works quite well on XBox and I like to leave it running along with Pandora or an audio book.

Check out [Screen Saver Gallery](https://www.microsoft.com/en-us/store/apps/screen-saver-gallery/9nblggh5j8tx "Screen Saver Gallery Store Link") in the Windows Store.