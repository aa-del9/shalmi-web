import { Stamp } from '@repo/ui/components/stamp';
import { computeInitials } from '../../utils/initials';

interface UserCardProps {
  name: string;
  phoneNumber: string | null | undefined;
  businessName: string | null | undefined;
  isPhoneVerified: boolean;
  memberSince: string | null;
}

/**
 * Pencil `Vsvp4` (desktop) / `VKF6c` (mobile) — paper-2 fill card with
 * 56² ink avatar (initials), VERIFIED stamp, and 3-cell stat grid with
 * vertical hairlines.
 *
 * Stats are STUBBED per gap-analysis Q2/Q11 — render "—" until the
 * `GET /api/user/profile-stats` endpoint ships post-v1.
 */
export function UserCard({
  name,
  phoneNumber,
  businessName,
  isPhoneVerified,
  memberSince,
}: UserCardProps) {
  const initials = computeInitials(name);

  return (
    <div className="border-rule bg-paper-2 border-b px-6 py-5">
      <div className="flex items-center gap-3.5">
        <div
          aria-hidden
          className="bg-ink flex size-14 shrink-0 items-center justify-center rounded-full font-bold text-white"
          style={{ fontSize: 18 }}
        >
          {initials || '·'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-ink truncate text-[17px] leading-tight font-bold tracking-[-0.01em]">
            {name}
          </p>
          {phoneNumber ? (
            <p className="text-ink-3 truncate font-mono text-[13px]">
              {phoneNumber}
            </p>
          ) : null}
          {businessName ? (
            <p className="text-ink-3 truncate text-[13px]">{businessName}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        {isPhoneVerified ? <Stamp variant="success">VERIFIED</Stamp> : null}
        {memberSince ? (
          <span className="text-ink-3 text-[12px]">
            Member since {memberSince}
          </span>
        ) : null}
      </div>

      {/* TODO(post-v1): wire to `GET /api/user/profile-stats` (gap-analysis Q2/Q11 STUBBED). */}
      {/* <div className="mt-3.5 grid grid-cols-3 border-t border-rule pt-3.5">
        <StatCell label="ORDERS" value="—" />
        <StatCell label="SPENT" value="—" hairline />
        <StatCell label="SAVED" value="—" hairline tone="green" />
      </div> */}
    </div>
  );
}

interface StatCellProps {
  label: string;
  value: string;
  hairline?: boolean;
  tone?: 'ink' | 'green';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StatCell({
  label,
  value,
  hairline = false,
  tone = 'ink',
}: StatCellProps) {
  return (
    <div
      className={
        hairline ? 'border-rule border-l pl-3 text-center' : 'pr-3 text-center'
      }
    >
      <p
        className={
          tone === 'green'
            ? 'font-mono text-[18px] font-bold text-green-700'
            : 'text-ink font-mono text-[18px] font-bold'
        }
      >
        {value}
      </p>
      <p
        className={
          tone === 'green'
            ? 'font-mono text-[10px] font-semibold tracking-[0.12em] text-green-700'
            : 'text-ink-3 font-mono text-[10px] font-semibold tracking-[0.12em]'
        }
      >
        {label}
      </p>
    </div>
  );
}
