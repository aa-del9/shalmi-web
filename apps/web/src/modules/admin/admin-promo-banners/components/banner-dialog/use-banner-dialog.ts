import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBannerSchema, type CreateBannerInput } from '../../schemas';
import { useCreateBannerMutation } from '../../hooks/use-create-banner-mutation';
import { createBannerDefaultValues } from '../../constants';
import { useCallback, useMemo } from 'react';

export const useBannerDialog = ({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) => {
  const createMutation = useCreateBannerMutation();

  const form = useForm<CreateBannerInput>({
    resolver: zodResolver(createBannerSchema),
    defaultValues: createBannerDefaultValues,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const imageUrl =
      data.imageUrl && data.imageUrl !== '' ? data.imageUrl : undefined;
    if (!imageUrl) {
      form.setError('imageUrl', { message: 'Image is required' });
      return;
    }
    await createMutation.mutateAsync({
      title: data.title,
      imageUrl,
      targetUrl:
        data.targetUrl && data.targetUrl !== '' ? data.targetUrl : undefined,
    });
    form.reset(createBannerDefaultValues);
    onOpenChange(false);
  });

  const isPending = useMemo(
    () => createMutation.isPending,
    [createMutation.isPending]
  );
  const imageUrl = useMemo(
    () => form.watch('imageUrl'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.watch('imageUrl')]
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) form.reset(createBannerDefaultValues);
      onOpenChange(next);
    },
    [form, onOpenChange]
  );

  return {
    form,
    onSubmit,
    isPending,
    imageUrl,
    handleOpenChange,
  };
};
