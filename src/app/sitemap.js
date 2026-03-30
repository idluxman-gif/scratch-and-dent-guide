import { stores, stateNames, getStateSlug, getCitySlug, getStoreSlug } from '@/data/stores';
import { blogArticles } from './blog/blogData';
import { siteConfig } from '@/config/site';

export default function sitemap() {
  const baseUrl = siteConfig.domain;

  // Homepage
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  // Blog listing page
  routes.push({
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  // Blog article pages
  for (const article of blogArticles) {
    routes.push({
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: new Date(article.publishDate),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // Legal / trust pages
  for (const page of ['about', 'contact', 'privacy-policy', 'terms']) {
    routes.push({
      url: `${baseUrl}/${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    });
  }

  // State pages
  const states = [...new Set(stores.map(s => s.s))];
  for (const stateCode of states) {
    routes.push({
      url: `${baseUrl}/stores/${getStateSlug(stateCode)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // City pages — only include cities with 3+ stores (thin pages are noindexed)
  const cityCounts = {};
  for (const store of stores) {
    const key = `${store.s}-${store.c}`;
    cityCounts[key] = (cityCounts[key] || 0) + 1;
  }
  const cityCombos = new Set();
  for (const store of stores) {
    const key = `${store.s}-${store.c}`;
    if (!cityCombos.has(key) && cityCounts[key] >= 3) {
      cityCombos.add(key);
      routes.push({
        url: `${baseUrl}/stores/${getStateSlug(store.s)}/${getCitySlug(store.c)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Individual store pages
  for (const store of stores) {
    routes.push({
      url: `${baseUrl}/stores/${getStateSlug(store.s)}/${getCitySlug(store.c)}/${getStoreSlug(store)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return routes;
}
