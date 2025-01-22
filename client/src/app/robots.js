export default function robots() {
    const baseURL = "https://www.cardpro.co.in/";
    return {
      rules: {
        userAgent: '*',
        allow: ['/'],
        disallow: [],
      },
      sitemap: `${baseURL}sitemap.xml`,
    }
  }