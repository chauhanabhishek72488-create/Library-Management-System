import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { Book, Member, Transaction, Reservation, Review } from "../types";
import {
  BOOKS_DATA,
  MEMBERS_DATA,
  TXNS_DATA,
  RESERVATIONS_DATA,
  REVIEWS_INIT
} from "../data/mockData";

/**
 * ============================================================================
 * FIRESTORE REAL-TIME SYNCHRONIZATION SERVICE
 * ============================================================================
 * Provides cloud database write operations ensuring all connected devices
 * (mobile phones, laptops, desktops) receive real-time updates through
 * Firestore snapshot listeners.
 */

// ----------------------------------------------------------------------------
// TRANSACTIONS (Issue, Return, Renew)
// ----------------------------------------------------------------------------

/**
 * Record a new book issue transaction and update the book's available copy count.
 */
export async function syncIssueBook(txn: Transaction, bookId: string, newAvailable: number): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Save transaction
    const txnRef = doc(db, "transactions", txn.id);
    batch.set(txnRef, txn);

    // Update book availability
    const bookRef = doc(db, "books", bookId);
    batch.update(bookRef, { available: Math.max(0, newAvailable) });

    await batch.commit();
    console.log(`[Sync] Issued book ${bookId} to ${txn.member} (${txn.id})`);
  } catch (error) {
    console.error("[Sync] Error issuing book in Firestore:", error);
  }
}

/**
 * Mark a transaction as returned and increment the book's available copy count.
 */
export async function syncReturnBook(
  txnId: string,
  bookId: string | null | undefined,
  newAvailable: number,
  returnDate: string
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Update transaction status
    const txnRef = doc(db, "transactions", txnId);
    batch.update(txnRef, {
      status: "Returned",
      returnDate: returnDate
    });

    // If a matching book ID was found, increment its availability
    if (bookId) {
      const bookRef = doc(db, "books", bookId);
      batch.update(bookRef, { available: newAvailable });
    }

    await batch.commit();
    console.log(`[Sync] Returned transaction ${txnId} for book ${bookId}`);
  } catch (error) {
    console.error("[Sync] Error returning book in Firestore:", error);
  }
}

/**
 * Renew an active transaction by extending the due date.
 */
export async function syncRenewBook(txnId: string, newDueDate: string): Promise<void> {
  try {
    const txnRef = doc(db, "transactions", txnId);
    await updateDoc(txnRef, {
      dueDate: newDueDate,
      renewed: true
    });
    console.log(`[Sync] Renewed transaction ${txnId} until ${newDueDate}`);
  } catch (error) {
    console.error("[Sync] Error renewing transaction in Firestore:", error);
  }
}

// ----------------------------------------------------------------------------
// BOOKS (Catalog Management)
// ----------------------------------------------------------------------------

/**
 * Add one or multiple books (e.g. copies) to the Firestore catalog.
 */
export async function syncAddBooks(books: Book[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    books.forEach(b => {
      const bRef = doc(db, "books", b.id);
      batch.set(bRef, b);
    });
    await batch.commit();
    console.log(`[Sync] Added ${books.length} book copies to Firestore`);
  } catch (error) {
    console.error("[Sync] Error adding books in Firestore:", error);
  }
}

/**
 * Delete a book copy from Firestore by its ID.
 */
export async function syncDeleteBook(bookId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "books", bookId));
    console.log(`[Sync] Deleted book ${bookId} from Firestore`);
  } catch (error) {
    console.error("[Sync] Error deleting book in Firestore:", error);
  }
}

/**
 * Update attributes of a book in Firestore.
 */
export async function syncUpdateBook(bookId: string, updates: Partial<Book>): Promise<void> {
  try {
    await updateDoc(doc(db, "books", bookId), updates);
    console.log(`[Sync] Updated book ${bookId} in Firestore`);
  } catch (error) {
    console.error("[Sync] Error updating book in Firestore:", error);
  }
}

// ----------------------------------------------------------------------------
// MEMBERS (Membership Directory)
// ----------------------------------------------------------------------------

/**
 * Save or update a member in Firestore.
 */
export async function syncSaveMember(member: Member): Promise<void> {
  try {
    const docId = member.memberId || member.id;
    await setDoc(doc(db, "members", docId), member, { merge: true });
    console.log(`[Sync] Saved member ${member.name} (${docId}) in Firestore`);
  } catch (error) {
    console.error("[Sync] Error saving member in Firestore:", error);
  }
}

/**
 * Update member account status (Active, Suspended, Expired).
 */
export async function syncUpdateMemberStatus(
  memberId: string,
  status: "Active" | "Suspended" | "Expired"
): Promise<void> {
  try {
    await updateDoc(doc(db, "members", memberId), { status });
    console.log(`[Sync] Updated status of member ${memberId} to ${status}`);
  } catch (error) {
    console.error("[Sync] Error updating member status in Firestore:", error);
  }
}

/**
 * Delete a member from Firestore.
 */
export async function syncDeleteMember(memberId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "members", memberId));
    console.log(`[Sync] Deleted member ${memberId} from Firestore`);
  } catch (error) {
    console.error("[Sync] Error deleting member in Firestore:", error);
  }
}

// ----------------------------------------------------------------------------
// RESERVATIONS & REVIEWS
// ----------------------------------------------------------------------------

/**
 * Save a new book reservation in Firestore.
 */
export async function syncAddReservation(res: Reservation): Promise<void> {
  try {
    await setDoc(doc(db, "reservations", res.id), res);
    console.log(`[Sync] Added reservation ${res.id} in Firestore`);
  } catch (error) {
    console.error("[Sync] Error adding reservation in Firestore:", error);
  }
}

/**
 * Update reservation status (Active, Fulfilled, Cancelled).
 */
export async function syncUpdateReservationStatus(
  resId: string,
  status: "Active" | "Fulfilled" | "Cancelled"
): Promise<void> {
  try {
    await updateDoc(doc(db, "reservations", resId), { status });
    console.log(`[Sync] Updated reservation ${resId} status to ${status}`);
  } catch (error) {
    console.error("[Sync] Error updating reservation in Firestore:", error);
  }
}

/**
 * Save a new book review in Firestore.
 */
export async function syncAddReview(bookId: string, review: Review): Promise<void> {
  try {
    await setDoc(doc(db, "reviews", review.id), {
      ...review,
      bookId
    });
    console.log(`[Sync] Added review ${review.id} for book ${bookId} in Firestore`);
  } catch (error) {
    console.error("[Sync] Error adding review in Firestore:", error);
  }
}

// ----------------------------------------------------------------------------
// INITIAL DATABASE SEEDING
// ----------------------------------------------------------------------------

/**
 * Ensures Firestore is populated with the base catalog, members, and transactions
 * if the database is currently empty.
 */
export async function ensureFirestoreSeeded(): Promise<boolean> {
  try {
    const booksSnapshot = await getDocs(collection(db, "books"));
    if (!booksSnapshot.empty) {
      console.log(`[Sync] Firestore already contains ${booksSnapshot.size} books.`);
      return false;
    }

    console.log("[Sync] Firestore is empty. Seeding initial library catalog & data...");
    const batch = writeBatch(db);

    // Seed Books
    BOOKS_DATA.forEach(book => {
      batch.set(doc(db, "books", book.id), book);
    });

    // Seed Members
    MEMBERS_DATA.forEach(member => {
      const mId = member.memberId || member.id;
      batch.set(doc(db, "members", mId), member);
    });

    // Seed Transactions
    TXNS_DATA.forEach(txn => {
      batch.set(doc(db, "transactions", txn.id), txn);
    });

    // Seed Reservations
    RESERVATIONS_DATA.forEach(res => {
      batch.set(doc(db, "reservations", res.id), res);
    });

    // Seed Reviews
    Object.entries(REVIEWS_INIT).forEach(([bookId, revs]) => {
      revs.forEach(r => {
        batch.set(doc(db, "reviews", r.id), {
          ...r,
          bookId
        });
      });
    });

    await batch.commit();
    console.log("[Sync] Firestore successfully initialized and seeded!");
    return true;
  } catch (error) {
    console.warn("[Sync] Firestore auto-seeding could not complete:", error);
    return false;
  }
}
