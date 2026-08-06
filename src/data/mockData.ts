import { User, Book, Transaction, Member } from '../types';

/**
 * MOCK_USERS represents a temporary, hardcoded list of normal users in the system.
 * This is used for testing and UI development without needing a real database.
 */
export const MOCK_USERS: User[] = [
  { id: "u1", name: "Priya Sharma", email: "priya@lib.com", role: "user", memberId: "LIB-2024-001", avatar: "PS", memberType: "Student" },
  { id: "u2", name: "Rahul Gupta", email: "rahul@lib.com", role: "user", memberId: "LIB-2024-004", avatar: "RG", memberType: "Student" },
];

/**
 * MOCK_ADMINS represents a temporary list of administrative users (librarians, chief librarians).
 * Admins have extra privileges like managing books and users.
 */
export const MOCK_ADMINS: User[] = [
  { id: "a1", name: "Dr. Suresh Kumar", email: "admin@lib.com", role: "admin", adminId: "ADM-001", avatar: "SK", designation: "Chief Librarian" },
  { id: "a2", name: "Meena Iyer", email: "meena@lib.com", role: "librarian", adminId: "ADM-002", avatar: "MI", designation: "Senior Librarian" },
];

/**
 * BOOKS_DATA serves as our temporary database table for all books available in the library.
 * Each book object defines basic details like ISBN, Title, Author, Shelf location, and stock (copies/available).
 */
export const BOOKS_DATA: Book[] = [
  { id: "b1", accessionNo: "ACC-2026-001", isbn: "978-3-16-148410-0", title: "The Great Gatsby", author: "F. Scott Fitzgerald", author1: "F. Scott Fitzgerald", category: "Fiction", shelf: "A-12", copies: 5, available: 3, emoji: "📗", avgRating: 4.8, publisher: "Scribner", year: 1925, edition: "1st Edition", classificationNo: "813.52", itemType: "Book" },
  { id: "b2", accessionNo: "ACC-2026-002", isbn: "978-0-06-112008-4", title: "To Kill a Mockingbird", author: "Harper Lee", author1: "Harper Lee", category: "Classic", shelf: "A-03", copies: 4, available: 0, emoji: "📘", avgRating: 4.9, publisher: "J.B. Lippincott & Co.", year: 1960, edition: "Anniversary Ed.", classificationNo: "813.54", itemType: "Book" },
  { id: "b3", accessionNo: "ACC-2026-003", isbn: "978-0-7432-7356-5", title: "1984", author: "George Orwell, Erich Fromm", author1: "George Orwell", author2: "Erich Fromm (Foreword)", category: "Dystopia", shelf: "B-07", copies: 6, available: 2, emoji: "📕", avgRating: 4.7, publisher: "Secker & Warburg", year: 1949, edition: "Commemorative Ed.", classificationNo: "823.912", itemType: "Book" },
  { id: "b4", accessionNo: "ACC-2026-004", isbn: "978-0-316-76948-0", title: "The Catcher in the Rye", author: "J.D. Salinger", author1: "J.D. Salinger", category: "Fiction", shelf: "A-19", copies: 3, available: 3, emoji: "📙", avgRating: 4.2, publisher: "Little, Brown", year: 1951, edition: "2nd Edition", classificationNo: "813.54", itemType: "Book" },
  { id: "b5", accessionNo: "ACC-2026-005", isbn: "978-0-14-028329-7", title: "Brave New World", author: "Aldous Huxley", author1: "Aldous Huxley", category: "Dystopia", shelf: "B-09", copies: 4, available: 1, emoji: "📗", avgRating: 4.5, publisher: "Chatto & Windus", year: 1932, edition: "Revised Ed.", classificationNo: "823.912", itemType: "Book" },
  { id: "b6", accessionNo: "ACC-2026-006", isbn: "978-0-7432-7357-2", title: "The Hobbit", author: "J.R.R. Tolkien, Christopher Tolkien", author1: "J.R.R. Tolkien", author2: "Christopher Tolkien (Editor)", category: "Fantasy", shelf: "C-02", copies: 7, available: 5, emoji: "📘", avgRating: 4.9, publisher: "George Allen & Unwin", year: 1937, edition: "Illustrated Ed.", classificationNo: "823.914", itemType: "Book" },
];

/**
 * NEWSPAPERS_DATA holds daily/weekly newspaper archives.
 */
export const NEWSPAPERS_DATA = [
  { id: "n1", accessionNo: "NP-2026-001", name: "The Times of India", publisher: "Bennett, Coleman & Co.", language: "English", edition: "Morning" as const, frequency: "Daily" as const, date: "2026-08-05", shelf: "NP-Rack-1", copies: 3, available: 3, classificationNo: "070.172", sectionCount: 24, emoji: "📰" },
  { id: "n2", accessionNo: "NP-2026-002", name: "The Hindu", publisher: "Kasturi & Sons Ltd.", language: "English", edition: "Morning" as const, frequency: "Daily" as const, date: "2026-08-05", shelf: "NP-Rack-1", copies: 3, available: 2, classificationNo: "070.172", sectionCount: 20, emoji: "🗞️" },
  { id: "n3", accessionNo: "NP-2026-003", name: "The Wall Street Journal", publisher: "Dow Jones & Company", language: "English", edition: "Special" as const, frequency: "Daily" as const, date: "2026-08-04", shelf: "NP-Rack-2", copies: 2, available: 1, classificationNo: "070.175", sectionCount: 32, emoji: "📈" },
  { id: "n4", accessionNo: "NP-2026-004", name: "Dainik Jagran", publisher: "Jagran Prakashan Ltd.", language: "Hindi", edition: "Morning" as const, frequency: "Daily" as const, date: "2026-08-05", shelf: "NP-Rack-3", copies: 4, available: 4, classificationNo: "070.171", sectionCount: 16, emoji: "🗞️" }
];

/**
 * MAGAZINES_DATA holds weekly/monthly magazine issues.
 */
export const MAGAZINES_DATA = [
  { id: "m1", accessionNo: "MAG-2026-001", title: "National Geographic", publisher: "National Geographic Partners", issueNo: "Vol. 245 No. 8", volumeNo: "245", monthYear: "August 2026", category: "Science & Nature", issn: "0027-9358", shelf: "MAG-Shelf-A", copies: 5, available: 4, classificationNo: "910.5", emoji: "🌏" },
  { id: "m2", accessionNo: "MAG-2026-002", title: "Time Magazine", publisher: "TIME USA LLC", issueNo: "Issue #32", volumeNo: "208", monthYear: "July 2026", category: "News & Politics", issn: "0040-781X", shelf: "MAG-Shelf-B", copies: 4, available: 2, classificationNo: "051.1", emoji: "⏱️" },
  { id: "m3", accessionNo: "MAG-2026-003", title: "Scientific American", publisher: "Springer Nature", issueNo: "Vol. 331 No. 2", volumeNo: "331", monthYear: "August 2026", category: "Technology", issn: "0036-8733", shelf: "MAG-Shelf-A", copies: 3, available: 3, classificationNo: "505", emoji: "🔬" },
  { id: "m4", accessionNo: "MAG-2026-004", title: "Forbes Magazine", publisher: "Whale Media", issueNo: "Vol. 207 No. 4", volumeNo: "207", monthYear: "Summer 2026", category: "Business", issn: "0015-6914", shelf: "MAG-Shelf-C", copies: 3, available: 1, classificationNo: "330.5", emoji: "💼" }
];

/**
 * ARTICLES_DATA holds academic, research, and technical papers.
 */
export const ARTICLES_DATA = [
  { id: "art1", accessionNo: "ART-2026-001", title: "Quantum Neural Networks for Large Language Model Acceleration", author1: "Dr. A. Sharma", author2: "Prof. R. Vance", author3: "Dr. K. Patel", authors: ["Dr. A. Sharma", "Prof. R. Vance", "Dr. K. Patel"], journalName: "IEEE Transactions on Quantum Engineering", volumeNo: "14", issueNo: "3", pages: "112-128", doi: "10.1109/TQE.2026.312940", publicationDate: "2026-05-12", subject: "Quantum Computing & AI", shelf: "ART-Archive-1", classificationNo: "006.31", emoji: "📄" },
  { id: "art2", accessionNo: "ART-2026-002", title: "Advances in Gene Editing and CRISPR Cas13 Precision Therapeutics", author1: "Dr. Eleanor Vance", author2: "Dr. Marcus Brody", authors: ["Dr. Eleanor Vance", "Dr. Marcus Brody"], journalName: "Nature Biotechnology Journal", volumeNo: "42", issueNo: "7", pages: "845-860", doi: "10.1038/s41587-026-0189-x", publicationDate: "2026-06-20", subject: "Biotechnology", shelf: "ART-Archive-2", classificationNo: "660.65", emoji: "🧬" },
  { id: "art3", accessionNo: "ART-2026-003", title: "Global Climate Resilience and Renewable Microgrid Architecture", author1: "Prof. Sanjay Rao", author2: "Dr. Lisa Wong", author3: "Eng. Omar Al-Mansoor", authors: ["Prof. Sanjay Rao", "Dr. Lisa Wong", "Eng. Omar Al-Mansoor"], journalName: "Journal of Clean Energy & Environment", volumeNo: "29", issueNo: "1", pages: "45-62", doi: "10.1016/j.jclepro.2026.1042", publicationDate: "2026-07-02", subject: "Environmental Engineering", shelf: "ART-Archive-3", classificationNo: "621.312", emoji: "⚡" }
];

/**
 * MEMBERS_DATA tracks people who hold a membership card in the library.
 * Unlike users (which are login credentials), a Member refers to a physical entity issuing books.
 */
export const MEMBERS_DATA: Member[] = [
  { id: "m1", name: "Priya Sharma", email: "priya@lib.com", phone: "9876543210", type: "Student", memberId: "LIB-2024-001", expiry: "2025-12-31", booksIssued: 2, initials: "PS", status: "Active", idType: "College ID", idNumber: "CS2024001", registrationDate: "2024-01-15" },
  { id: "m2", name: "Arjun Mehta", email: "arjun@lib.com", phone: "9876543211", type: "Staff", memberId: "LIB-2024-002", expiry: "2025-06-15", booksIssued: 1, initials: "AM", status: "Active", idType: "Staff ID", idNumber: "STF-2024-042", registrationDate: "2024-02-10" },
  { id: "m3", name: "Kavita Nair", email: "kavita@lib.com", phone: "9876543212", type: "Public", memberId: "LIB-2024-003", expiry: "2024-11-30", booksIssued: 0, initials: "KN", status: "Expired", idType: "Aadhaar", idNumber: "9876-5432-1098", registrationDate: "2024-03-22" },
  { id: "m4", name: "Rahul Gupta", email: "rahul@lib.com", phone: "9876543213", type: "Student", memberId: "LIB-2024-004", expiry: "2025-12-31", booksIssued: 3, initials: "RG", status: "Active", idType: "College ID", idNumber: "CS2024004", registrationDate: "2024-01-18" },
];

/**
 * TXNS_DATA (Transactions Data) acts as a ledger for checking out and returning books.
 * It links a specific book to a specific member along with issue and due dates.
 */
export const TXNS_DATA: Transaction[] = [
  { id: "t1", bookId: "b2", book: "To Kill a Mockingbird", memberId: "m1", member: "Priya Sharma", issueDate: "2026-03-01", dueDate: "2026-03-15", returnDate: null, status: "Overdue", fine: 0 },
  { id: "t2", bookId: "b3", book: "1984", memberId: "m4", member: "Rahul Gupta", issueDate: "2026-03-20", dueDate: "2026-04-03", returnDate: null, status: "Issued", fine: 0 },
  { id: "t3", bookId: "b1", book: "The Great Gatsby", memberId: "m2", member: "Arjun Mehta", issueDate: "2026-03-05", dueDate: "2026-03-19", returnDate: "2026-03-18", status: "Returned", fine: 0 },
];

/** List of available book categories/genres. */
export const CATS = ["Fiction", "Classic", "Dystopia", "Fantasy", "Science", "History", "Biography", "Self-Help"];

/** List of identification documents accepted for membership. */
export const ID_TYPES = ["Aadhaar Card", "College ID", "Staff ID", "PAN Card", "Driving Licence", "Passport"];

/** Simple counter to keep track of generated Accession Numbers (unique book IDs). */
export let accN = 6;

/** Generates the next sequential Accession Number, formatted with the current year (e.g. ACC-2024-007). */
export const getNextAccN = () => { accN++; return `ACC-${new Date().getFullYear()}-${String(accN).padStart(3, "0")}`; };

import { Reservation, Review } from '../types';

/**
 * RESERVATIONS_DATA holds the waiting list for books.
 * When a book isn't available, members can reserve it to pick it up later.
 */
export const RESERVATIONS_DATA: Reservation[] = [
  { id: "r1", bookId: "b2", bookTitle: "To Kill a Mockingbird", memberName: "Priya Sharma", date: "Mar 20", expiresDate: "Mar 27", status: "Active" },
];

/**
 * NOTIFICATIONS_LOG is a list of system alerts for the user, like overdue reminders.
 */
export const NOTIFICATIONS_LOG = [
  { id: "n1", title: "Overdue Reminder", time: "2 hrs ago", type: "warning", read: false },
  { id: "n2", title: "System Update", time: "1 day ago", type: "info", read: true },
];

/**
 * REVIEWS_INIT holds sample book reviews. 
 * The object uses the book's ID (e.g. "b1") as the key to look up an array of reviews.
 */
export const REVIEWS_INIT: Record<string, Review[]> = {
  "b1": [
    { id: "rev1", user: "Priya Sharma", rating: 5, comment: "Masterpiece!", date: "Mar 10" }
  ]
};
