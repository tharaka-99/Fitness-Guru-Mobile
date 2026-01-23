/**
 * Capitalizes the first letter of each word in a string.
 * @param str - The input string.
 * @returns The input string with the first letter of each word capitalized.
 */
export const capitalizeString = (str: string): string => {
  const words = str?.split(" ");
  const capitalizedWords = words?.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capitalizedWords?.join(" ");
};

/**
 * Checks if user has premium access (either through subscription or trial)
 * @param user - The user object
 * @returns True if user has premium access, false otherwise
 */
export const hasPremiumAccess = (user: any): boolean => {
  return user?.subscription?.status === true || user?.isTrialActive === true;
};
