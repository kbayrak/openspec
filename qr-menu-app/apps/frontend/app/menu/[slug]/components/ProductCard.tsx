import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  imageUrl?: string | null;
};

function formatPrice(price: string | number) {
  const amount = typeof price === 'string' ? Number(price) : price;

  if (Number.isNaN(amount)) {
    return price;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

const placeholderImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="24" fill="#e2e8f0"/>
      <path d="M52 106h56l-12-18-14 12-10-14-20 20z" fill="#94a3b8"/>
      <circle cx="100" cy="64" r="10" fill="#94a3b8"/>
    </svg>`
  );

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <span className="text-sm font-semibold text-slate-700">{formatPrice(product.price)}</span>
        </div>
        {product.description ? (
          <p className="mt-2 text-sm text-slate-600">{product.description}</p>
        ) : null}
      </div>
      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={product.imageUrl || placeholderImage}
          alt={product.name}
          fill
          sizes="80px"
          className="object-cover"
          unoptimized
        />
      </div>
    </article>
  );
}
