import { notFound } from 'next/navigation';
import MenuContent from './components/MenuContent';
import MenuLayout from './components/MenuLayout';
import LanguageProvider from './components/LanguageProvider';

type Business = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  defaultLanguage: string;
};

type Category = {
  id: string;
  name: string;
  order: number;
  translations?: Record<string, { name?: string }>;
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  category: {
    id: string;
    name: string;
  };
  image?: {
    id: string;
    mimeType: string;
    size: number;
    filename: string;
  } | null;
  imageUrl?: string | null;
  translations?: Record<string, { name?: string; description?: string }>;
};

const revalidateSeconds = 60;

export const revalidate = revalidateSeconds;

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function generateStaticParams() {
  // No public endpoint for slugs yet; pages will be generated on-demand with ISR.
  return [];
}

export default async function MenuPage({ params }: { params: { slug: string } }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBase) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const business = await fetchJson<Business>(`${apiBase}/business/${params.slug}`, {
    next: { revalidate: revalidateSeconds },
  });

  const [categories, products] = await Promise.all([
    fetchJson<Category[]>(`${apiBase}/categories?businessId=${business.id}`, {
      next: { revalidate: revalidateSeconds },
    }),
    fetchJson<Product[]>(`${apiBase}/products?businessId=${business.id}`, {
      next: { revalidate: revalidateSeconds },
    }),
  ]);

  const availableLanguages = Array.from(
    new Set([
      business.defaultLanguage?.toLowerCase() ?? 'en',
      ...categories.flatMap((category) => Object.keys(category.translations ?? {})),
      ...products.flatMap((product) => Object.keys(product.translations ?? {})),
    ])
  ).filter(Boolean);

  return (
    <MenuLayout business={business}>
      <LanguageProvider
        defaultLanguage={business.defaultLanguage ?? 'en'}
        availableLanguages={availableLanguages}
      >
        <MenuContent categories={categories} products={products} />
      </LanguageProvider>
    </MenuLayout>
  );
}
