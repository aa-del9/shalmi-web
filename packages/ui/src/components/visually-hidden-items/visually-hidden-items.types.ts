export enum VisuallyHiddenItemVariant {
  Dialog = 'dialog',
  Sheet = 'sheet',
}

export interface VisuallyHiddenItemsProps {
  title: string;
  description: string;
  variant: VisuallyHiddenItemVariant;
}
