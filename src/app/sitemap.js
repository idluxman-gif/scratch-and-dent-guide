export default function sitemap() {
  const baseUrl = 'https://scratchanddentguide.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]
}
