// src/utils/qrHelper.ts

import { Member, User, Book } from '../types';

/**
 * Formats full structured member details into a readable QR code payload.
 * When scanned by a camera or QR code app, it displays complete member information.
 */
export function formatMemberQR(member: Partial<Member> | Partial<User>): string {
  if (!member) return "LIBRARY MEMBER";
  const memberId = member.memberId || member.id || "N/A";
  const name = member.name || "Library Member";
  const email = member.email || "N/A";
  const phone = (member as any).phone && (member as any).phone !== "N/A" ? (member as any).phone : undefined;
  const type = (member as any).memberType || (member as any).type || (member.role === 'admin' ? 'Administrator' : 'Student');
  const status = (member as any).status || "Active";
  const idType = (member as any).idType;
  const idNumber = (member as any).idNumber;
  const expiry = (member as any).expiry || "2025-12-31";

  const lines = [
    `🪪 CENTRAL LIBRARY MEMBER CARD`,
    `--------------------------------`,
    `Member ID : ${memberId}`,
    `Name      : ${name}`,
    `Email     : ${email}`,
  ];

  if (phone) lines.push(`Phone     : ${phone}`);
  lines.push(`Category  : ${type}`);
  lines.push(`Status    : ${status}`);
  if (idType && idNumber) lines.push(`ID Proof  : ${idType} (${idNumber})`);
  lines.push(`Valid Thru: ${expiry}`);
  lines.push(`--------------------------------`);
  lines.push(`System: LibraryOS Central`);

  return lines.join('\n');
}

/**
 * Formats full book information into a readable QR code payload.
 * When scanned, it presents complete bibliographic details, accession no, and shelf location.
 */
export function formatBookQR(book: Partial<Book>): string {
  if (!book) return "LIBRARY BOOK";
  const accNo = book.accessionNo || "N/A";
  const title = book.title || "Library Book";
  const author = book.author || (book.authors ? book.authors.join(", ") : "N/A");
  const category = book.category || "General";
  const shelf = book.shelf || "N/A";
  const classNo = book.classificationNo || "800.00";
  const isbn = book.isbn || "N/A";
  const publisher = book.publisher;
  const edition = book.edition;
  const stock = book.available !== undefined && book.copies !== undefined 
    ? `${book.available}/${book.copies} available` 
    : undefined;

  const lines = [
    `📚 CENTRAL LIBRARY BOOK RECORD`,
    `--------------------------------`,
    `Accession No: ${accNo}`,
    `Title       : ${title}`,
    `Author(s)   : ${author}`,
    `Category    : ${category}`,
    `Class No.   : ${classNo}`,
    `Shelf Rack  : ${shelf}`,
  ];

  if (isbn && isbn !== "N/A") lines.push(`ISBN        : ${isbn}`);
  if (publisher) lines.push(`Publisher   : ${publisher}`);
  if (edition) lines.push(`Edition     : ${edition}`);
  if (stock) lines.push(`Stock       : ${stock}`);
  lines.push(`--------------------------------`);
  lines.push(`System: LibraryOS Central`);

  return lines.join('\n');
}

/**
 * Universal formatter for any library item (Book, Newspaper, Magazine, Article, or Print Slip).
 * Automatically detects item type and formats appropriate payload.
 */
export function formatItemQR(item: any): string {
  if (!item) return "LIBRARY ITEM";

  // Check if it's a member record
  if (item.memberId || (item.email && !item.accessionNo)) {
    return formatMemberQR(item);
  }

  // Check if it's a book record
  if (item.isbn || item.category || item.authors) {
    return formatBookQR(item);
  }

  const accNo = item.accessionNo || "N/A";
  const title = item.title || item.name || "Library Item";
  const itemType = item.type || item.itemType || "LIBRARY RECORD";

  const lines = [
    `📑 CENTRAL LIBRARY - ${itemType.toUpperCase()}`,
    `--------------------------------`,
    `Accession No: ${accNo}`,
    `Title/Name  : ${title}`,
  ];

  if (item.publisher) lines.push(`Publisher   : ${item.publisher}`);
  if (item.classificationNo) lines.push(`Class No.   : ${item.classificationNo}`);
  if (item.shelf) lines.push(`Shelf Rack  : ${item.shelf}`);
  if (item.issn) lines.push(`ISSN        : ${item.issn}`);
  if (item.doi) lines.push(`DOI         : ${item.doi}`);
  if (item.issueNo) lines.push(`Issue       : ${item.issueNo}`);
  if (item.date) lines.push(`Date        : ${item.date}`);
  lines.push(`--------------------------------`);
  lines.push(`System: LibraryOS Central`);

  return lines.join('\n');
}
