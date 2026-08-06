// src/types/index.ts

/**
 * Basic user interface for authenticated user/admin sessions.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'librarian' | 'admin';
  memberId?: string;
  adminId?: string;
  avatar?: string;
  memberType?: string;
  designation?: string;
}

/**
 * Interface representing a library book detail.
 */
export interface Book {
  id: string;
  accessionNo: string;
  isbn: string;
  title: string;
  author: string; // Formatted summary string or primary author
  author1?: string;
  author2?: string;
  author3?: string;
  authors?: string[];
  category: string;
  shelf: string;
  copies: number;
  available: number;
  emoji: string;
  avgRating: number;
  publisher?: string;
  year?: number;
  edition?: string;
  classificationNo?: string;
  itemType?: 'Book' | 'Newspaper' | 'Magazine' | 'Article';
}

/**
 * Interface representing a Newspaper periodical record.
 */
export interface Newspaper {
  id: string;
  accessionNo: string;
  name: string;
  publisher: string;
  language: string;
  edition: 'Morning' | 'Evening' | 'Special' | 'Weekly';
  frequency: 'Daily' | 'Weekly' | 'Bi-Weekly';
  date: string;
  shelf: string;
  copies: number;
  available: number;
  classificationNo?: string;
  sectionCount?: number;
  emoji: string;
}

/**
 * Interface representing a Magazine periodical record.
 */
export interface Magazine {
  id: string;
  accessionNo: string;
  title: string;
  publisher: string;
  issueNo: string;
  volumeNo?: string;
  monthYear: string;
  category: string;
  issn?: string;
  shelf: string;
  copies: number;
  available: number;
  classificationNo?: string;
  emoji: string;
}

/**
 * Interface representing a Research/Journal Article record.
 */
export interface Article {
  id: string;
  accessionNo: string;
  title: string;
  author1: string;
  author2?: string;
  author3?: string;
  authors: string[];
  journalName: string;
  volumeNo?: string;
  issueNo?: string;
  pages?: string;
  doi?: string;
  publicationDate: string;
  subject: string;
  shelf?: string;
  classificationNo?: string;
  emoji: string;
}

/**
 * Interface representing a transaction record for issued books.
 */
export interface Transaction {
  id: string;
  bookId: string;
  book: string;
  memberId: string;
  member: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'Issued' | 'Overdue' | 'Returned';
  fine: number;
  renewed?: boolean;
}

/**
 * Extends basic member detail with analytics.
 */
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  memberId: string;
  expiry: string;
  booksIssued: number;
  initials: string;
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Suspended';
  idType: string;
  idNumber: string;
  registrationDate: string;
  avatar?: string;
  memberType?: string;
}

/**
 * Interface representing a reservation request when a book is currently unavailable.
 * It tracks who reserved it and when the reservation expires.
 */
export interface Reservation {
  id: string; // Unique ID for the reservation
  bookId: string; // Link to the reserved book
  bookTitle: string; // Title for easy display purposes
  memberName: string; // The person reserving it
  date: string; // Date the reservation was requested
  expiresDate: string; // Date when the reservation expires if unfulfilled
  status: string; // Status (e.g. 'Active', 'Fulfilled', 'Cancelled')
}

/**
 * Interface representing a user feedback/rating left for a specific book.
 */
export interface Review {
  id: string; // Unique ID for the review
  user: string; // Name of the user who left the review
  rating: number; // Rating out of 5
  comment: string; // Provided feedback text
  date: string; // Check-in date or creation date of the review
}
