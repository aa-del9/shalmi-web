import type { LucideIcon } from 'lucide-react';
import {
  AppleIcon,
  BeefIcon,
  BoxIcon,
  BrushIcon,
  CarrotIcon,
  CherryIcon,
  CoffeeIcon,
  CookieIcon,
  CroissantIcon,
  DropletIcon,
  EggIcon,
  FishIcon,
  FlameIcon,
  GlassWaterIcon,
  HeartIcon,
  IceCreamIcon,
  LeafIcon,
  MilkIcon,
  PackageIcon,
  PlugIcon,
  ShirtIcon,
  ShoppingBasketIcon,
  SnowflakeIcon,
  SoupIcon,
  SparklesIcon,
  SprayCanIcon,
  WheatIcon,
} from 'lucide-react';

/**
 * Curated lucide icon set for category iconKey. Order matches the
 * 10 glyphs visible in the Pencil row list, then catalog-typical
 * extras. Stored value is the kebab-case lucide name.
 */
export const CATEGORY_ICON_SET: ReadonlyArray<{
  key: string;
  label: string;
  Icon: LucideIcon;
}> = [
  { key: 'glass-water', label: 'Drinks', Icon: GlassWaterIcon },
  { key: 'cookie', label: 'Snacks', Icon: CookieIcon },
  { key: 'droplet', label: 'Cooking oil', Icon: DropletIcon },
  { key: 'coffee', label: 'Tea & coffee', Icon: CoffeeIcon },
  { key: 'wheat', label: 'Grains', Icon: WheatIcon },
  { key: 'milk', label: 'Dairy', Icon: MilkIcon },
  { key: 'sparkles', label: 'Personal care', Icon: SparklesIcon },
  { key: 'plug', label: 'Electronics', Icon: PlugIcon },
  { key: 'croissant', label: 'Bakery', Icon: CroissantIcon },
  { key: 'snowflake', label: 'Frozen', Icon: SnowflakeIcon },
  { key: 'apple', label: 'Fruits', Icon: AppleIcon },
  { key: 'carrot', label: 'Vegetables', Icon: CarrotIcon },
  { key: 'beef', label: 'Meat', Icon: BeefIcon },
  { key: 'fish', label: 'Seafood', Icon: FishIcon },
  { key: 'egg', label: 'Eggs', Icon: EggIcon },
  { key: 'cherry', label: 'Fresh', Icon: CherryIcon },
  { key: 'soup', label: 'Soups', Icon: SoupIcon },
  { key: 'ice-cream', label: 'Desserts', Icon: IceCreamIcon },
  { key: 'flame', label: 'Spices', Icon: FlameIcon },
  { key: 'leaf', label: 'Organic', Icon: LeafIcon },
  { key: 'spray-can', label: 'Cleaning', Icon: SprayCanIcon },
  { key: 'brush', label: 'Beauty', Icon: BrushIcon },
  { key: 'shirt', label: 'Apparel', Icon: ShirtIcon },
  { key: 'heart', label: 'Wellness', Icon: HeartIcon },
  { key: 'box', label: 'Household', Icon: BoxIcon },
  { key: 'package', label: 'Other', Icon: PackageIcon },
  { key: 'shopping-basket', label: 'Mixed', Icon: ShoppingBasketIcon },
];

const ICON_BY_KEY = new Map(
  CATEGORY_ICON_SET.map((entry) => [entry.key, entry.Icon] as const)
);

export function resolveCategoryIcon(iconKey: string | null): LucideIcon | null {
  if (!iconKey) return null;
  return ICON_BY_KEY.get(iconKey) ?? null;
}
