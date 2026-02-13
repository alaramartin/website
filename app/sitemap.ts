import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://alaramartin.com',
    },
    {
      url: 'https://alaramartin.com/projects',
    },
    {
      url: 'https://alaramartin.com/contact',
    },
  ]
}