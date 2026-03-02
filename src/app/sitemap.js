import { stores, stateNames, getStateSlug, getCitySlug, getStoreSlug } from '@/data/stores';

export default function sitemap() {
  const baseUrl = 'https://www.scratchanddentguide.com';

  // Homepage
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

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

  // City pages
  const cityCombos = new Set();
  for (const store of stores) {
    const key = `${store.s}-${store.c}`;
    if (!cityCombos.has(key)) {
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
