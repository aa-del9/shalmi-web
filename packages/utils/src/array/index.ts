/**
 * Array manipulation utilities
 */

/**
 * Groups array items into chunks of size n, padding with null if needed
 */
export const groupIntoNGroups = <T>(
  array: T[],
  n: number
): Array<(T | null)[]> => {
  const result: Array<(T | null)[]> = [];
  for (let i = 0; i < array.length; i += n) {
    const group: (T | null)[] = array.slice(i, i + n);
    while (group.length < n) {
      group.push(null);
    }
    result.push(group);
  }
  return result;
};

/**
 * Shuffles array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [
      shuffledArray[j]!,
      shuffledArray[i]!,
    ];
  }
  return shuffledArray;
};

/**
 * Remove duplicates from array based on a key function
 */
export const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Chunk array into smaller arrays of specified size
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};
