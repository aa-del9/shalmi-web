'use client';

import { useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { Sheet, SheetContent } from '@repo/ui/components/sheet';
import { Button } from '@repo/ui/components/button';
import {
  Package,
  RefreshCw,
  MapPin,
  Settings,
  LifeBuoy,
  FileText,
  X,
} from 'lucide-react';
import { useSession, signOut } from '@/modules/auth/client/auth-client';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { useAccountDrawerStore } from './store';
import { UserCard } from './components/user-card';
import { NavCard, NavSectionLabel } from './components/nav-card';
import { NavRow } from './components/nav-row';
import { Foot } from './components/foot';

interface SessionUser {
  id: string;
  name: string;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean;
  businessName?: string | null;
  createdAt?: string | Date;
}

/**
 * Pencil §3.10 — buyer account drawer.
 *
 * Right-side Sheet (480w on desktop, full-screen on mobile per
 * gap-analysis Q6 & §4.8) that replaces the legacy header DropdownMenu.
 *
 * Stats are STUBBED post-v1: the user card stat grid renders "—" and
 * nav-row subtitles fall back to static copy (per Q2/Q11).
 *
 * Trigger surfaces:
 *   - Header avatar button (`AccountDrawerTrigger`).
 *   - `/profile` page (deep-link redirect that flips this drawer open).
 */
export function AccountDrawer() {
  const isOpen = useAccountDrawerStore((s) => s.isOpen);
  const setOpen = useAccountDrawerStore((s) => s.setOpen);
  const close = useAccountDrawerStore((s) => s.close);
  const { data: session } = useSession();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const user = (session?.user ?? null) as SessionUser | null;
  const memberSince = useMemo(() => {
    if (!user?.createdAt) return null;
    return dayjs(user.createdAt).format('MMM YYYY');
  }, [user?.createdAt]);

  // Per Q16: when unauthed the drawer trigger is hidden and replaced by
  // a Sign In button — so this component never renders an unauthed
  // state. Defensive guard so a transient unauth state during signOut
  // doesn't crash render.
  if (!user) {
    return (
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="!w-full p-0 sm:!max-w-[480px]"
        />
      </Sheet>
    );
  }

  const handleLogout = () => {
    close();
    startTransition(async () => {
      await signOut();
      router.push(ABSOLUTE_ROUTES.ROOT);
      router.refresh();
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!w-full overflow-y-auto p-0 sm:!max-w-[480px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule px-6 py-5">
          <h2 className="text-[20px] font-extrabold tracking-[-0.01em] text-ink">
            Account
          </h2>
          <Button
            variant="outline"
            size="icon"
            aria-label="Close"
            onClick={close}
            className="size-9 rounded-md border-rule-2 bg-transparent p-0"
          >
            <X className="size-[18px] text-ink" />
          </Button>
        </div>

        {/* User card */}
        <UserCard
          name={user.name}
          phoneNumber={user.phoneNumber}
          businessName={user.businessName}
          isPhoneVerified={Boolean(user.phoneNumberVerified)}
          memberSince={memberSince}
        />

        {/* Nav */}
        <div className="flex flex-col gap-3 px-4 py-4">
          <NavSectionLabel>YOUR ACCOUNT</NavSectionLabel>
          <NavCard>
            <NavRow
              icon={Package}
              label="Orders"
              subtitle="View your orders"
              href={ABSOLUTE_ROUTES.PROFILE_ORDERS}
              onNavigate={close}
            />
            <NavRow
              icon={RefreshCw}
              label="Quick reorder"
              subtitle="Replenish from a past order"
              href={ABSOLUTE_ROUTES.PROFILE_ORDERS}
              onNavigate={close}
            />
            <NavRow
              icon={MapPin}
              label="Saved addresses"
              subtitle="Manage your delivery addresses"
              href={ABSOLUTE_ROUTES.PROFILE_ADDRESSES}
              onNavigate={close}
            />
            {/* TODO(post-v1): Payment methods row — DEFERRED per gap-analysis Q4. */}
            {/* TODO(post-v1): Saved items row — STUBBED per gap-analysis Q15. */}
            <NavRow
              icon={Settings}
              label="Settings"
              subtitle="Profile · notifications · privacy"
              href={ABSOLUTE_ROUTES.PROFILE_SETTINGS}
              onNavigate={close}
              hairline={false}
            />
          </NavCard>

          <div className="pt-1">
            <NavSectionLabel>HELP &amp; SUPPORT</NavSectionLabel>
          </div>
          <NavCard>
            {/* TODO(post-v1): Track-order row — hidden until active-order
                lookup ships (gap-analysis Q10). */}
            <NavRow
              icon={LifeBuoy}
              label="Help center"
              subtitle="FAQ · returns · contact us"
              href="#"
              onNavigate={close}
            />
            <NavRow
              icon={FileText}
              label="Terms & privacy"
              href="#"
              onNavigate={close}
              hairline={false}
            />
          </NavCard>
        </div>

        <Foot onLogout={handleLogout} />
      </SheetContent>
    </Sheet>
  );
}
