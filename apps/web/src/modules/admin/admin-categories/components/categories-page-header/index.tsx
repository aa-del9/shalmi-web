import { Button } from '@repo/ui/components/button';

type CategoriesPageHeaderProps = {
  onAddClick: () => void;
};

export function CategoriesPageHeader({ onAddClick }: CategoriesPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-foreground text-heading-lg font-semibold tracking-tight">
          Categories
        </h1>
        <p className="text-muted-foreground text-body-md">
          Manage product categories. Assign categories when adding or editing
          products.
        </p>
      </div>
      <Button type="button" onClick={onAddClick}>
        Add Category
      </Button>
    </div>
  );
}
