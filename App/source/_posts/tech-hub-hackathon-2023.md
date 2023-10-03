---
title: TechHub Hackathon 2023
date: 2023-10-02 10:27:04
categories:
  - Career
tags:
  - hackathon
  - TechHub
  - aws
---

We pulled together a team on Friday night, built an app on Saturday, and presented on Sunday. Not a win, but what a great experience!

<!-- more -->

## The Team

![Juliana, Divyesh, Pavan, Ivan, Daniel](store-front.jpg)

## Project Description

Habitat for Humanity, a renowned non-profit organization dedicated to building homes and better communities, faces several operational challenges that your hackathon team can help address:

**Targeting New Audiences/Real-Time Inventory Management**: Implement a solution that updates the online inventory in real-time, ensuring that customers are aware of available items and reducing discrepancies.

## Background

Before starting any design work, our team decided to take a field trip to the Broward Restore, which was 30 minutes away.

The store manager Mark, was very gracious and spent 30 minutes talking about the store, the mission, the volunteers, and the amazing items that pass through his store.

![Selfie with Mark, the Store Manager](store-manager.jpg)

### Some interesting points

- Each store operates like a franchise and typically manages their own outreach, website, etc.
- Mark just came back from a conference with other ReStores where they shared ideas and approaches.
- Some stores (Los Angeles) have an excellent social media presence including viral videos on TikTok.
- Independent stores can have their own website, but there is not a central platform for posting or managing inventory.
- The Broward store does not have a website, but they have a facebook page.
- They move a lot of furniture, and the entire sales floor is typically replaced in a couple of weeks. Because each item is unique, maintaining a website inventory is a lot of overhead.

### Donation Receiving

Mark said that 54% of donations are corporate. Typically the item is scratched, dented, or discontinued.

He typically uses Google Lens to scan the item to get a feel for what the item sells for. From this price, he discounts about 50%.

## Proposal

- A SaaS like platform that is owned and managed by the Habitat for Humanity "Corporate"
- Each store is a "tenant" on the platform and can manage their own inventory.
- The inventory is streamlined using a web app, on a mobile phone
  - Receiving takes a photo and adds a quality rating.
  - App uploads photo to the cloud and uses an image recognition to identify the product.
  - If product is IDed, meta-data and trending price is returned to the app.
    - Price is automatically discounted based on quality rating: 3-50%, 2-60%, 1-70%
  - If the item is not IDed, the app prompts for metadata and price.
  - Idea: If current user is not the manager, the item will need to be approved by the manager.
    - Once approved, the item automatically shows up on the website and in the Point of Sale system.
  - A QR Code sticker is printed and attached to the item. (Bluetooth printer)
  - When the item is sold, the sticker scanned, and it is automatically removed from the website.
- The SaaS platform dynamically builds a storefront for each tenant
  - Adds the ability to search all stores in the vicinity.
  - Customers can buy online and pick up in the store.
    - Orders not picked up within X days are a donation.
    - Online customer contact data can be imported into Outreach programs.

### Technical Architecture

With 900 stores across the country and hundreds of thousands of customers, we need to consider scalability. We chose to build using managed services in the cloud for resilience, durability, and scalability.

![Architecture](architecture.png)

## Result

<iframe width="560" height="315" src="https://www.youtube.com/embed/u8ERNvwUoOA?si=S43T59aDLuo4ddoD" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

Unfortunately we didn't win. Here are some presentation take-aways for future reference.

- ~~Going first was a disadvantage. We didnt know what to expect, and probably the judges didn't either.~~
  - ~~Even if our presentation was a 10/10, there is no way a judge would assign that to the first presentation without seeing all the other stuff. And there is no way they remembered ours after 16 presentations.~~
  - [Correction 10/3/23]: Going first was a challenge, we were up for it, and we did great!
- We should have figured out how to screen share a iPhone. Seeing it on a phone would be more impressive.
- Personally, I was more focused on the practically of the idea and our ability to execute (in 8-12) hours
  - Since only 2 of the judges were asking technical questions, I assume the others were more business minded. They weren't really judging on "can these people do it", they were judging on "as described, will this idea impact a lot of people?"
  - Go for the big idea - not on the technical feasibility.
- Reverse Image Search is using an AI model, we should have thrown in that extra jargon.

## Links

- [Demo Site](https://d8ftny2i4nqz0.cloudfront.net/capture)
- [App Recording](ScreenRecording.mp4)
- [Code Repo](https://github.com/PradatiusD/habitat-restore)
