// src/utils/qrHelper.ts

import { Member, User, Book } from '../types';

/**
 * Formats structured member details into a clean QR payload.
 */
export function formatMemberQR(member: Partial<Member> | Partial<User>): string {
  if (!member) return "LIBRARY-MEMBER";
  const memberId = member.memberId || member.id || "N/A";
  const email = member.email || "N/A";
  return `Member ID: ${memberId}\nEmail: ${email}`;
}

/**
 * Formats book information into a clean QR payload.
 */
export function formatBookQR(book: Partial<Book>): string {
  if (!book) return "LIBRARY-BOOK";
  const accNo = book.accessionNo || "N/A";
  return `Accession No: ${accNo}`;
}

/**
 * Universal formatter for any library item.
 */
export function formatItemQR(item: any): string {
  if (!item) return "LIBRARY-ITEM";

  if (item.memberId || (item.email && !item.accessionNo)) {
    return formatMemberQR(item);
  }

  if (item.isbn || item.category || item.authors) {
    return formatBookQR(item);
  }

  const accNo = item.accessionNo || "N/A";
  return `Accession No: ${accNo}`;
}
