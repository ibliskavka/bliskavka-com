---
title: Having My Cake and Eating It Too, Roku Edition
date: 2026-09-07 10:00:00
categories:
  - HowTo
tags:
  - Roku
  - BrightScript
  - Screen Saver Gallery
---

Roku changed a policy that meant updating my screensaver app would mean tearing out its monetization and losing existing subscribers. I could have just left the old version running.

<!-- more -->

Screen Saver Gallery started with interactive mode enabled. Users got five galleries free, and could subscribe from inside the screensaver for the full set. Roku later banned interactive mode in screensaver apps entirely. The old app was grandfathered in and still earning, so leaving it alone and living with one app was a real option. I wanted both: keep the old app's revenue and ship something that worked under the new rules. So I built a second app, Screen Saver Gallery Premium, same API, flat fee instead of a subscription, no interactive store.

Losing the store was expected. What I didn't expect was that the app would also break in a way Roku never documented.

## The Hang

I had my old async data-loading code sitting in the new app: a `Task` node that fetched the gallery config and image lists in the background. Sideloaded builds would hang on Settings or Preview. Not crash, just freeze.

Nothing in Roku's screensaver docs mentions `Task` nodes. The prohibited components list only calls out `roAudioPlayer`, `roChannelStore`, and `roVideoPlayer`. I burned a lot of time assuming the problem was somewhere else.

Eventually I isolated it: any `Task`-extending component in the package breaks sideloaded Settings/Preview launches for a screensaver. Not just running one. Having it in the app at all.

## The Fix

Pull the `Task` node, but the app still needs to fetch data somehow. Two things turned out to still work:

- Images load fine through the CDN, no `Task` required.
- API calls work as a plain blocking `roUrlTransfer` call, but only from `main.brs`'s own thread, before the scene exists.

I learned that distinction the hard way. Same blocking call, made instead from inside a SceneGraph component's field-change callback, froze the whole screen: gray, unresponsive to the remote, no error. `main.brs` runs on its own thread with its own message loop before any scene is created, so blocking there just delays the splash screen. A SceneGraph component has no thread of its own; its callbacks run on the shared render thread that also handles input and animation. Block there and the whole UI stalls.

So the fetch moved to `RunScreenSaver()` in `main.brs`, ahead of `screen.createScene()`. The SceneGraph component that used to trigger the async fetch now just reads a local cache file. Synchronous, fast, safe to call from a render-thread callback.

## Where It Landed

Screen Saver Gallery Premium is still in development: no store, no `Task` nodes, a data fetch that happens before the scene ever renders. Same galleries, same API, different thread.

Once it's live, I'll delist the old app so existing subscribers don't hit a service interruption, and point new traffic at the new one.

**Update:** it's live. [Screen Saver Gallery Premium Is Live](/2026/09/18/screen-saver-gallery-premium-is-live/).
