import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { getCachedCategories } from '@/modules/storefront/utils/get-cached-categories';

export async function StorefrontFooter() {
  const categories = await getCachedCategories();

  return (
    <footer className="bg-primary text-neutral-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
            Categories
          </h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-sm text-neutral-200 transition-colors hover:text-white"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
            About Shalmi Mart
          </h3>
          <p className="text-sm leading-relaxed text-neutral-200">
            Shalmi Mart is a B2B wholesale marketplace connecting retailers with
            vendors across Pakistan. Get the best bulk prices on thousands of
            products delivered to your doorstep.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
            Follow Us
          </h3>
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-200 transition-colors hover:text-white"
            >
              <Facebook className="size-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-200 transition-colors hover:text-white"
            >
              <Instagram className="size-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-200 transition-colors hover:text-white"
            >
              <Twitter className="size-5" />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-primary-50 border-t">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <p className="text-center text-xs text-neutral-200">
            &copy; {new Date().getFullYear()} Shalmi Mart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
