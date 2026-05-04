'use client';

import { Clock, RefreshCw, Signal, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';

interface OtpHelpDialogProps {
  trigger: React.ReactNode;
}

/**
 * Static FAQ for "Get help". Per buyer-otp gap-analysis Q6(c) — bounded
 * scope, no new route, no support inbox plumbing.
 */
export function OtpHelpDialog({ trigger }: OtpHelpDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Didn&apos;t get the code?</DialogTitle>
          <DialogDescription>
            A few things to try before contacting support.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 pt-2 text-sm text-ink-2">
          <HelpRow
            icon={<Clock className="size-4 text-ink-3" aria-hidden />}
            title="Wait for the timer"
            body="SMS delivery in Pakistan can take up to a minute. Tap Resend once the countdown ends."
          />
          <HelpRow
            icon={<Signal className="size-4 text-ink-3" aria-hidden />}
            title="Check signal"
            body="Make sure your SIM has cellular service. OTPs are sent over SMS — no internet needed."
          />
          <HelpRow
            icon={<RefreshCw className="size-4 text-ink-3" aria-hidden />}
            title="Try Change number"
            body="If you typed the wrong number, use Change number to start again with the correct one."
          />
          <HelpRow
            icon={<MessageSquare className="size-4 text-ink-3" aria-hidden />}
            title="Still stuck?"
            body="Contact support@shalmi.pk and we'll verify your number manually."
          />
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function HelpRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-[13px] font-bold text-ink">{title}</p>
        <p className="text-[12px] text-ink-3">{body}</p>
      </div>
    </li>
  );
}
