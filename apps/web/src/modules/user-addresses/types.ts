export type Address = {
  id: string;
  userId: string;
  title: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  postalCode: string | null;
  province: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
