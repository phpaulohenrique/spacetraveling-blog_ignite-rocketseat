import * as prismic from '@prismicio/client';

export function getPrismicClient(): prismic.Client {
  const client = prismic.createClient(process.env.PRISMIC_API_ENDPOINT);

  return client;
}
