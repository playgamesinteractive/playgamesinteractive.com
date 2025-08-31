import { NextSeoProps } from 'next-seo';

const SEO: NextSeoProps = {
  title: 'Play Games Interactive',
  description:
    'Play Games Interactive builds secure, scalable technology for online platforms and digital communities—empowering seamless, real-time digital engagement.',
  openGraph: {
    type: 'website',
    url: 'https://www.playgamesinteractive.com/',
    site_name: 'Play Games Interactive',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.playgamesinteractive.com/icon.png',
        width: 256,
        height: 256,
        alt: 'Play Games Interactive Icon',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    handle: '@playgam_es',
    site: '@playgamesinteractivecom',
    cardType: 'summary',
  },
};

export default SEO;
