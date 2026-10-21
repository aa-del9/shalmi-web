/** Vendor list item: profile + phone from joined user */
export type VendorListItem = {
  id: string;
  displayId: string;
  fullName: string | null;
  shopName: string;
  phoneNumber: string | null;
  city: string;
  address: string | null;
  marketHub: string;
  logoUrl: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
};

/** Full vendor detail for edit form (list item + bank details) */
export type VendorDetail = VendorListItem & {
  bankDetails: {
    bankName: string;
    accountTitle: string;
    iban: string;
  };
};

export type VendorListMeta = {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  totals: {
    all: number;
    active: number;
    inactive: number;
  };
};
