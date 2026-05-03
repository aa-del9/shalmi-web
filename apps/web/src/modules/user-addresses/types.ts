export type Address = {
  id: string;
  userId: string;
  title: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  // postalCode + province are awaiting migration 0012 — schema fields
  // and DB persistence are temporarily disabled. Type kept optional so
  // the address card / form code paths still compile.
  postalCode?: string | null;
  province?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
