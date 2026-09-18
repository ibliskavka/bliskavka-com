---
title: Screen Saver Gallery Premium Is Live
date: 2026-09-18 10:00:00
tags:
  - Roku
  - Screen Saver Gallery
---

Screen Saver Gallery Premium is live on the Roku Channel Store. [Grab it here](https://channelstore.roku.com/en-ca/details/9d0daa2324b1368fcae7884e38b64654:7870afd502be5113eb8d1a3a6ee08e58/screen-saver-gallery-premium).

<!-- more -->

I wrote about why this app exists [last week](/2026/09/07/having-my-cake-roku-edition/): Roku banned interactive mode in screensavers, so the old subscription model couldn't survive an update. Rather than gut the original app and risk existing subscribers, I built a second one from scratch under the new rules.

No subscription this time. Roku doesn't allow in-app purchases in a screensaver at all anymore, active or in the settings screen. So Premium is a flat $12.99, one time, and that unlocks every gallery. No ads, no upsells, nothing else to buy.

The bigger change is under the hood. The old app fetched images live and used `Task` nodes for background loading, which I eventually traced to a hang bug. Premium pre-fetches and caches everything, so galleries load fast and the picker doesn't stutter switching between them.

The old app is still up and still earning, and I'm leaving it alone for now. Once Premium has some traction, I'll point new users toward it and eventually retire the subscription flow on the original.
