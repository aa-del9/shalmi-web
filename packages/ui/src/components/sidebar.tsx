'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { PanelLeftIcon } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import { Sheet, SheetContent } from '@repo/ui/components/sheet';
import { cn } from '@repo/ui/lib/utils';

const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContext = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  width: string;
  widthMobile: string;
  collapsible: 'offcanvas' | 'icon' | 'none';
  side: 'left' | 'right';
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

function SidebarProvider({
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  style,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (onOpenChange) onOpenChange(value);
      else setUncontrolledOpen(value);
    },
    [onOpenChange]
  );

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((o) => !o);
    else setOpen(!open);
  }, [isMobile, open, setOpen]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleSidebar]);

  const styleWithVars = style as React.CSSProperties & {
    width?: string;
    '--sidebar-width-mobile'?: string;
  };
  const width = styleWithVars?.width ?? SIDEBAR_WIDTH;
  const widthMobile =
    styleWithVars?.['--sidebar-width-mobile'] ?? SIDEBAR_WIDTH_MOBILE;

  const value: SidebarContext = {
    state: open ? 'expanded' : 'collapsed',
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
    width,
    widthMobile,
    collapsible: 'offcanvas',
    side: 'left',
  };

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-provider"
        className="flex min-h-svh w-full"
        style={
          {
            ...style,
            '--sidebar-width': width,
            '--sidebar-width-mobile': widthMobile,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = 'left',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}) {
  const { open, openMobile, setOpenMobile, isMobile } = useSidebar();

  const sidebarContent = (
    <div
      data-slot="sidebar"
      data-side={side}
      data-collapsible={collapsible}
      className={cn(
        'bg-sidebar text-sidebar-foreground border-sidebar-border flex h-svh flex-col border-r',
        'w-(--sidebar-width)',
        'transition-[width] duration-200 ease-linear',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          showCloseButton={true}
          data-sidebar="sidebar"
          data-mobile="true"
          className="border-sidebar-border bg-sidebar w-(--sidebar-width-mobile) max-w-[85vw] p-0"
        >
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      data-slot="sidebar-container"
      data-side={side}
      className={cn(
        'fixed inset-y-0 z-10 hidden h-svh flex-col md:flex',
        'transition-[left,right] duration-200 ease-linear',
        side === 'left' &&
          (open ? 'left-0' : 'left-[calc(var(--sidebar-width)*-1)]'),
        side === 'right' &&
          (open ? 'right-0' : 'right-[calc(var(--sidebar-width)*-1)]')
      )}
      style={{ width: 'var(--sidebar-width)' }}
    >
      {sidebarContent}
    </div>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn('flex-1 overflow-auto py-2', className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn('relative flex w-full flex-col p-2', className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        'text-sidebar-foreground px-2 py-2 text-xs font-semibold',
        className
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn('relative w-full', className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn('flex w-full flex-col gap-1', className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn('group/menu-item list-none', className)}
      {...props}
    />
  );
}

function SidebarMenuButton({
  className,
  asChild = false,
  isActive,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(
        // Pencil §3.7 sidebar nav row: radius 6, padding [10,12], gap 12.
        // Active row gets paper-2 fill.
        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0',
        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
        className
      )}
      {...props}
    />
  );
}

function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={cn('[&_svg]:size-5', className)}
      {...props}
    >
      <PanelLeftIcon className="rtl:rotate-180" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  const { open, isMobile } = useSidebar();
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'relative flex min-h-svh flex-1 flex-col',
        !isMobile && open && 'md:pl-(--sidebar-width)',
        className
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
