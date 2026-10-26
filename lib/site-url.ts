export const siteURL = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-gading.vercel.app';
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) throw Error('Invalid site URL');
    if (process.env.NODE_ENV === 'production' && /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(url.hostname)) return 'https://portfolio-gading.vercel.app';
    return url.origin;
  } catch { return 'https://portfolio-gading.vercel.app'; }
};
