const BOT_UA = /\b(googlebot|bingbot|yandex(bot|images)|duckduckbot|baiduspider|slurp|mail\.ru_bot|applebot|facebookexternalhit|twitterbot|discordbot|telegrambot)\b/i;
const MOBILE_UA = /\b(android|iphone|ipod|windows phone|opera mini|opera mobi|blackberry|bb10|silk\/|kindle|webos|iemobile)\b/i;

export default {
  async fetch(request, env) {
    if (env.DISABLE_RU_MOBILE_REDIRECT === 'true') {
      return fetch(request);
    }

    const url = new URL(request.url);
    if (url.searchParams.has('_ruredir')) {
      return fetch(request);
    }

    const country = (request.cf?.country || '').toUpperCase();
    if (country !== 'RU') return passthrough(request);

    const ua = request.headers.get('User-Agent') || '';
    if (BOT_UA.test(ua)) return passthrough(request);

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
    if (!r.searchParams.has('_ruredir')) r.searchParams.set('_ruredir', '1');

    return new Response('Redirect\n', {
      status: 302,
      headers: {
        Location: r.toString(),
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Edge-Redirect': 'ru-mobile',
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
