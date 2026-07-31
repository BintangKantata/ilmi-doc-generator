// Aplikasi ini murni client-side: auth & data lewat Firebase SDK di browser.
// SSR dimatikan supaya adapter-static bisa build sebagai SPA biasa,
// dan routing dinamis (misal /project/[id]) tetap jalan lewat fallback.
export const ssr = false;
export const prerender = false;
