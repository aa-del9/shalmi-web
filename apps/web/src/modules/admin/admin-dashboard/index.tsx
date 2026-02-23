import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-lg font-bold">Dashboard</h1>
        <p className="text-body-md text-muted-foreground">
          Overview of your admin portal.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Admin</CardTitle>
          <CardDescription>
            Use the sidebar to navigate between Dashboard and Vendors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-md text-muted-foreground">
            This is the main dashboard. Add widgets and stats here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
