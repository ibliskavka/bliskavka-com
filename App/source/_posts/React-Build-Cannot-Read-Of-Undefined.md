---
title: "Amplify + React Build: Uncaught TypeError"
date: 2021-01-22 18:18:12
categories:
- Troubleshooting
tags:
- React
- AWS
- AWS Amplify
---

My AWS Amplify + React app throws an `Uncaught TypeError` when running the production build, but works just fine with `react-scripts start`.

<!-- more -->

### Error in Chrome:

> `Uncaught TypeError: Cannot read property 'call' of undefined`

### Error in FireFox:

> `Uncaught TypeError: e[t] is undefined`

After TOO much troubleshooting, I finally found the error. For some reason calling the main configure function would blow up in production but not dev - I assume some component got trimmed out by webpack. I am only using the the `Auth` module of the Amplify SDK, so this solution works for me.

```javascript
// This throws error in production
Amplify.configure(options);

// This does not throw an error
Auth.configure(options);
```

## Conclusion

Somehow I managed to bump into this error twice a few months apart, and could not recall what I did to solve it the first time. Hopefully this saves you (and me) some troubleshooting time in the future.