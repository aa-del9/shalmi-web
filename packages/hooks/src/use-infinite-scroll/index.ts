import { useEffect, useCallback } from "react";

interface UseInfiniteScrollParams {
  /** ID of the scrollable container element */
  containerId: string;
  /** Threshold (0-1) at which to trigger fetching. Default: 0.75 */
  threshold?: number;
  /** Whether there are more pages to fetch */
  hasNextPage: boolean;
  /** Whether currently fetching the next page */
  isFetchingNextPage: boolean;
  /** Function to fetch the next page */
  fetchNextPage: () => void;
  /** Current length of loaded content (for dependency tracking) */
  contentLength: number;
  /** Whether infinite scroll is enabled. Default: true */
  enabled?: boolean;
}

/**
 * Hook for handling infinite scroll with React Query integration.
 * Automatically fetches next page when user scrolls past threshold.
 */
export const useInfiniteScroll = ({
  containerId,
  threshold = 0.75,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  contentLength,
  enabled = true,
}: UseInfiniteScrollParams) => {
  const handleScroll = useCallback(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (
      scrollPercentage > threshold &&
      hasNextPage &&
      !isFetchingNextPage &&
      enabled
    ) {
      fetchNextPage();
    }
  }, [
    containerId,
    threshold,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    enabled,
  ]);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || !enabled) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerId, handleScroll, enabled, contentLength]);
};
