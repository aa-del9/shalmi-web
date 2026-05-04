export type AddProductFormProps = {
  productId?: string | null;
  /** When true, the form ships the inline (single-page) variant: footer
   * with Cancel / Save as draft / Save product, and `onSaved` fires
   * instead of navigating away. */
  inline?: boolean;
  onCancel?: () => void;
  onSaved?: () => void;
};

export type UseAddProductFormProps = {
  productId?: string | null;
};
