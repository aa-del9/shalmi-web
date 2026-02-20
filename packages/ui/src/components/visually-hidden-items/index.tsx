import { type FC } from 'react';

import {
  type VisuallyHiddenItemsProps,
  VisuallyHiddenItemVariant,
} from './visually-hidden-items.types';
import { VisuallyHidden } from '../visually-hidden';
import { DialogDescription, DialogTitle } from '../dialog';
import { SheetDescription, SheetTitle } from '../sheet';

export const VisuallyHiddenItems: FC<VisuallyHiddenItemsProps> = ({
  title,
  description,
  variant,
}) => {
  switch (variant) {
    case VisuallyHiddenItemVariant.Dialog:
      return (
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </VisuallyHidden>
      );
    case VisuallyHiddenItemVariant.Sheet:
      return (
        <VisuallyHidden>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </VisuallyHidden>
      );
    default:
      return null;
  }
};
