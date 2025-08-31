/** @type {import('next-sitemap').IConfig} */
module.exports = {
  exclude: ['/treasure/*'],
  siteUrl: process.env.SITE_URL || 'https://playgamesinteractive.com',
  generateRobotsTxt: true,
  autoLastmod: false,
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/treasure/*'],
      },
    ],
  },
  sitemapSize: 7000,
};
