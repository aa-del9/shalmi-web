import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

export const AdminVendors = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-heading-lg font-semibold tracking-tight">
          Vendors
        </h1>
        <p className="text-muted-foreground text-body-md">
          Manage vendors and their catalog.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
          <CardDescription>
            Vendor list and actions will go here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-body-md">
            Placeholder for vendor management UI.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
