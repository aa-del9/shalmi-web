import * as VisuallyHiddenComponent from '@radix-ui/react-visually-hidden';
import { type FC, type PropsWithChildren } from 'react';

/**
 * A component that visually hides its children while keeping them accessible to screen readers.
 *
 * This component is a wrapper around the Radix UI VisuallyHidden component.
 * For more information, visit: {@link https://www.radix-ui.com/primitives/docs/utilities/visually-hidden}
 *
 * @returns A React component that renders its children in a visually hidden manner.
 */
export const VisuallyHidden: FC<PropsWithChildren> = ({ children }) => (
  <VisuallyHiddenComponent.Root>{children}</VisuallyHiddenComponent.Root>
);
