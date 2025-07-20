# RU Mobile Redirect Worker

This repository provides a small utility for Cloudflare Workers that redirects
mobile visitors from Russia to a fallback URL.

## Usage

Install as an npm dependency or copy `worker.js` into your Worker project.

```bash
npm install <path-to-this-repo>
```

Import the handler and use it in your Cloudflare Worker:

```javascript
import { redirectRuMobile } from 'ru-mobile-redirect/worker';

export default {
  fetch: redirectRuMobile
};
```

The redirect destination is defined through the `FALLBACK_URL` environment
variable.

