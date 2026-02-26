export type BannerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BulkUpdateBannerPayload = {
  id: string;
  isActive: boolean;
  displayOrder: number;
};
