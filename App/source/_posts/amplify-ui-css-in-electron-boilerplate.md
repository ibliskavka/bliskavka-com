---
title: Missing Amplify UI Styles in Electron App
date: 2021-09-15 14:37:38
categories:
  - Troubleshooting
tags:
  - AWS Amplify
  - Electron
  - React
---

I recently discovered the [Electron React Boilerplate](https://electron-react-boilerplate.js.org/) project and wanted to use the [AWS Amplify Authenticator](https://docs.amplify.aws/ui/auth/authenticator/q/framework/react/). Lo and Behold: its ugly...

<!-- more -->

![Missing Amplify Styles](missing-amplify-styles.png)

I had used the typical `index.tsx` import and I could see the CSS output, but for some reason it did not work.

```tsx
// index.tsx
import '@aws-amplify/ui/dist/style.css';
```

After much Googling, it turns out that Electron React Boiler plate does some webpack-ing magic under the hood.

The correct way to add the css is to import it in `App.global.css`:

```css
/* App.global.css */
@import '~@aws-amplify/ui/dist/style.css';
```

![Working Amplify Styles](working-amplify-styles.png)
