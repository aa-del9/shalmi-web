import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@repo/ui/components/sidebar';
import { VendorSidebar } from './vendor-sidebar';

export function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <VendorSidebar />
      <SidebarInset>
        <header className="border-border bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-foreground text-lg font-semibold">Vendor</span>
        </header>
        <div className="bg-background flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
