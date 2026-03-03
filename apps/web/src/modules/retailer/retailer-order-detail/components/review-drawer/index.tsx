'use client';

import { useState, useCallback } from 'react';
import { Star, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { Button } from '@repo/ui/components/button';
import { toast } from 'sonner';
import { useSubmitReviewMutation } from '../../hooks/use-submit-review-mutation';
import type { OrderDetailItem } from '../../types';
import Image from 'next/image';

type ReviewDrawerProps = {
  item: OrderDetailItem | null;
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function triggerReviewFeedback() {
  try {
    navigator.vibrate?.([50, 50]);
  } catch {
    // ignore
  }

  try {
    const audio = new Audio('/success-ding.wav');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

export function ReviewDrawer({
  item,
  orderId,
  open,
  onOpenChange,
}: ReviewDrawerProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');

  const mutation = useSubmitReviewMutation(orderId);

  const handleStarClick = useCallback((star: number) => {
    setRating(star);
    triggerReviewFeedback();
  }, []);

  const handleSubmit = useCallback(() => {
    if (!item || rating === 0) return;

    mutation.mutate(
      {
        productId: item.productId,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Review submit ho gaya!');
          onOpenChange(false);
          setRating(0);
          setComment('');
        },
        onError: (err) => {
          toast.error(err.message || 'Review submit nahi ho saka');
        },
      }
    );
  }, [item, rating, comment, mutation, onOpenChange]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setRating(0);
        setHoveredStar(0);
        setComment('');
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const activeStar = hoveredStar || rating;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-3xl px-6 pt-4 pb-8"
      >
        <SheetHeader className="px-0">
          <SheetTitle className="text-center text-base">
            Rate this item
          </SheetTitle>
        </SheetHeader>

        {item && (
          <div className="mt-4 flex flex-col items-center gap-4">
            {/* Product info */}
            <div className="flex items-center gap-3">
              {item.product.imageUrl && (
                <div className="relative size-14 overflow-hidden rounded-full border-2 border-neutral-200 dark:border-neutral-700">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="object-cover"
                    fill
                  />
                </div>
              )}
              <span className="max-w-[200px] truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {item.product.name}
              </span>
            </div>

            {/* 5 massive stars */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => handleStarClick(star)}
                  className="rounded-lg p-1 transition-transform active:scale-110"
                >
                  <Star
                    className={`size-12 transition-colors ${
                      star <= activeStar
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-none text-neutral-300 dark:text-neutral-600'
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            {/* Optional comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Apna experience batayein (optional)"
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-amber-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            />

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || mutation.isPending}
              className="w-full rounded-xl py-6 text-base font-bold"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                '🌟 Submit Review'
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
