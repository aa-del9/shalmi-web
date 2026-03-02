import Image from 'next/image';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface CategorySectionProps {
  title: string;
  categories: Category[];
}

export function CategorySection({ title, categories }: CategorySectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
          >
            <div className="bg-muted relative aspect-square">
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-muted-foreground text-3xl font-bold">
                    {cat.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="p-2 text-center">
              <span className="text-sm font-medium">{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
