import { AddVendorDialog } from '../add-vendor-dialog';

export function VendorsPageHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-foreground text-heading-lg font-semibold tracking-tight">
          Vendors
        </h1>
        <p className="text-muted-foreground text-body-md">
          Manage vendors and their catalog.
        </p>
      </div>
      <AddVendorDialog />
    </div>
  );
}
