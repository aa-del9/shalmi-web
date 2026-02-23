/** Vendor list item: profile + phone from joined user */
export type VendorListItem = {
  id: string;
  phoneNumber: string | null;
  shopName: string;
  city: string;
  marketHub: string;
  isActive: boolean;
};

/** Full vendor detail for edit form (list item + bank details) */
export type VendorDetail = VendorListItem & {
  bankDetails: {
    bankName: string;
    accountTitle: string;
    iban: string;
  };
};
