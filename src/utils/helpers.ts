// src/utils/helpers.ts

/**
 * Calculate fines based on a book's due date. 
 * The system charges ₹10 for every day the date goes over the expected due date.
 * 
 * @param dueDate The date the book was originally supposed to be returned
 * @param returnDate The actual day the book was returned (or null if it is still out)
 * @returns Fine amount in rupees (₹). If not overdue, it returns 0.
 */
export const calcFine = (dueDate: string, returnDate: string | null = null): number => {
  const finePerDay = 10;
  
  // Set the original due date to midnight (00:00:00) so we only calculate whole days
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  // If no returnDate provided, use today's current date as a reference
  const ref = returnDate ? new Date(returnDate) : new Date();
  ref.setHours(0, 0, 0, 0);
  
  // Subtract due date from reference date to find time difference in milliseconds.
  // We divide by 86,400,000 (ms in a day) to get the number of days difference.
  // Math.max(0, ...) ensures we don't return negative fines if the book is checked in early.
  return Math.max(0, Math.floor((ref.getTime() - due.getTime()) / 86400000)) * finePerDay;
};

/**
 * Determines current status string of a checked-out book.
 * It returns 'Returned' if hand-off is completed, 'Overdue' if the due date has passed, or 'Issued' if all is okay.
 * 
 * @param {dueDate: string, returnDate: string|null} t transaction object
 * @returns The string status reflecting the book's availability.
 */
export const liveStatus = (t: { dueDate: string; returnDate: string | null }): 'Returned' | 'Overdue' | 'Issued' => {
  if (t.returnDate) return 'Returned'; // Easiest check, if it's returned already.
  
  const due = new Date(t.dueDate);
  due.setHours(0, 0, 0, 0);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return now > due ? 'Overdue' : 'Issued'; // If today's date is greater than the due date, it's overdue.
};

/**
 * Generates an avatar's 2-letter alphabetic initial from the full name.
 * Often used in the UI to display placeholder profile pictures.
 * 
 * Example: 'Priya Sharma' -> 'PS'
 * 
 * @param name Full name string
 * @returns Up to 2 characters string, capitalized.
 */
export const getInitials = (name: string): string =>
  name
    .split(" ") // Split full name by whitespaces into multiple words
    .map((w) => w[0]) // Map array to grab the first letter of each word
    .join("") // Form one single string with all the letters
    .toUpperCase() // Force them uppercase
    .slice(0, 2); // Cut strictly the first 2 initials if the name had >2 words

/**
 * Generates a new random Member ID using the current year and a random suffix.
 * Example of an outcome: LIB-2024-541
 */
export const generateMemberId = (): string => 
  `LIB-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
