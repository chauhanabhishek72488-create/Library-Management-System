import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { BOOKS_DATA, MEMBERS_DATA, TXNS_DATA, RESERVATIONS_DATA } from "../data/mockData";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBIAbdKaZKZjjBVE1_4dISlxRbwvZZsXHw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "library-management--syst-c17b6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "library-management--syst-c17b6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "library-management--syst-c17b6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "384664677908",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:384664677908:web:8eefe79d584d3604064101",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8DEVZE340B",
};

import { getApps, getApp } from "firebase/app";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("Firebase auth persistence could not be enabled:", error);
});

/**
 * Seeds the initial mock data into Firestore if the books collection is empty.
 */
export async function seedInitialDataIfEmpty() {
  try {
    const booksSnapshot = await getDocs(collection(db, "books"));
    if (booksSnapshot.empty) {
      console.log("Firestore database is empty. Seeding initial mock data...");
      const batch = writeBatch(db);

      // Seed books
      BOOKS_DATA.forEach((book) => {
        const bookRef = doc(db, "books", book.id);
        batch.set(bookRef, book);
      });

      // Seed members
      MEMBERS_DATA.forEach((member) => {
        const memberRef = doc(db, "members", member.memberId);
        batch.set(memberRef, member);
      });

      // Seed transactions
      TXNS_DATA.forEach((txn) => {
        const txnRef = doc(db, "transactions", txn.id);
        batch.set(txnRef, txn);
      });

      // Seed reservations
      RESERVATIONS_DATA.forEach((res) => {
        const resRef = doc(db, "reservations", res.id);
        batch.set(resRef, res);
      });

      // Seed initial reviews
      const reviewRef = doc(db, "reviews", "rev1");
      batch.set(reviewRef, {
        id: "rev1",
        bookId: "b1",
        user: "Priya Sharma",
        rating: 5,
        comment: "Masterpiece!",
        date: "Mar 10"
      });

      await batch.commit();
      console.log("Firestore successfully seeded with initial mock data!");
    }
  } catch (error) {
    console.warn("Auto-seeding was skipped or failed (check your firebase connection/rules):", error);
  }
}
