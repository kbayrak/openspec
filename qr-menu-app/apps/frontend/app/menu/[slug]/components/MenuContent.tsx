'use client';

import { useMemo, useState } from 'react';
import CategoryList from './CategoryList';
import ProductCard from './ProductCard';
import { useLanguage } from './LanguageProvider';
import LanguageSwitcher from './LanguageSwitcher';

type Category = {
  id: string;
  name: string;
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
  imageUrl?: string | null;
  translations?: Record<string, { name?: string; description?: string }>;
};

type MenuContentProps = {
  categories: Category[];
  products: Product[];
};

export default function MenuContent({ categories, products }: MenuContentProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const { language, defaultLanguage } = useLanguage();

  const groupedProducts = useMemo(() => {
    return products.reduce<Record<string, Product[]>>((acc, product) => {
      const categoryId = product.category?.id ?? 'uncategorized';
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(product);
      return acc;
    }, {});
  }, [products]);

  const visibleCategories = activeCategoryId
    ? categories.filter((category) => category.id === activeCategoryId)
    : categories;

  const getCategoryLabel = (category: Category) => {
    const translation = category.translations?.[language]?.name;
    const fallback = category.translations?.[defaultLanguage]?.name;
    return translation || fallback || category.name;
  };

  const getProductFields = (product: Product) => {
    const translation = product.translations?.[language];
    const fallback = product.translations?.[defaultLanguage];

    return {
      name: translation?.name || fallback?.name || product.name,
      description: translation?.description || fallback?.description || product.description,
    };
  };

  const displayCategories = categories.map((category) => ({
    ...category,
    name: getCategoryLabel(category),
  }));

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CategoryList
          categories={displayCategories}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />
        <LanguageSwitcher />
      </div>
      <section className="space-y-10">
        {visibleCategories.map((category) => (
          <div key={category.id} id={`category-${category.id}`} className="space-y-4">
            <h2 className="text-xl font-semibold">{getCategoryLabel(category)}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(groupedProducts[category.id] ?? []).map((product) => {
                const translated = getProductFields(product);
                return (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      name: translated.name,
                      description: translated.description,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
