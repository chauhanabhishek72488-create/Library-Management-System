import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Icon from '../../components/ui/Icon';
import { Book, Member, Transaction } from '../../types';

interface QRIssuePageProps {
  books: Book[];
  setBooks: (bs: Book[]) => void;
  members: Member[];
  txns: Transaction[];
  setTxns: (t: Transaction[]) => void;
  addToast: (type: string, msg: string) => void;
}

/** Parse a Member ID (e.g. LIB-2024-001) from a scanned QR text payload */
function extractMemberId(raw: string): string | null {
  const match = raw.match(/Member ID\s*:\s*([\w-]+)/i);
  if (match) return match[1].trim();
  // Fallback: if the entire string looks like a member id
  if (/^LIB-/i.test(raw.trim())) return raw.trim().split('\n')[0].trim();
  return null;
}

/** Parse a Book Accession No (e.g. ACC-2026-001) from a scanned QR text payload */
function extractAccessionNo(raw: string): string | null {
  const match = raw.match(/Accession No\s*:\s*([\w-]+)/i);
  if (match) return match[1].trim();
  // Fallback: if the entire string looks like an accession no
  if (/^ACC-/i.test(raw.trim())) return raw.trim().split('\n')[0].trim();
  return null;
}

/** Inline single-purpose scanner component – one per card */
function InlineScanner({ elementId, onResult, label }: { elementId: string; onResult: (text: string) => void; label: string }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const startScan = useCallback(() => {
    setError('');
    const qr = new Html5Qrcode(elementId);
    scannerRef.current = qr;
    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 200, height: 200 } },
      (decoded) => {
        onResult(decoded);
        qr.stop().catch(() => {});
        setScanning(false);
      },
      () => {}
    )
      .then(() => setScanning(true))
      .catch(() => setError('Camera access required. Please allow camera permission.'));
  }, [elementId, onResult]);

  const stopScan = useCallback(() => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    setScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { stopScan(); }, [stopScan]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        id={elementId}
        style={{
          width: '100%',
          maxWidth: 280,
          minHeight: scanning ? 220 : 0,
          borderRadius: 12,
          overflow: 'hidden',
          border: '2px solid var(--accent)',
          background: '#000',
        }}
      />
      {error && <div className="aerr" style={{ fontSize: 12, padding: '6px 10px' }}>⚠️ {error}</div>}
      {!scanning && (
        <button className="btn bp bsm" onClick={startScan} style={{ width: '100%', maxWidth: 280 }}>
          <Icon n="qr" s={14} /> Open Camera – Scan {label}
        </button>
      )}
      {scanning && (
        <button className="btn bd bsm" onClick={stopScan} style={{ width: '100%', maxWidth: 280, fontSize: 12 }}>
          <Icon n="x" s={12} /> Stop Camera
        </button>
      )}
    </div>
  );
}

/**
 * QR Issue Page
 * Admin page with two camera scan areas – one for Member QR and one for Book QR.
 * After both are scanned, hitting "Issue Book" creates a transaction and updates state.
 */
export default function QRIssuePage({ books, setBooks, members, txns, setTxns, addToast }: QRIssuePageProps) {
  // ---- scanned raw payloads ----
  const [memberRaw, setMemberRaw] = useState<string | null>(null);
  const [bookRaw, setBookRaw] = useState<string | null>(null);

  // ---- resolved entities ----
  const memberId = memberRaw ? extractMemberId(memberRaw) : null;
  const accNo = bookRaw ? extractAccessionNo(bookRaw) : null;

  const resolvedMember = memberId ? members.find(m => m.memberId.toLowerCase() === memberId.toLowerCase()) : null;
  const resolvedBook = accNo ? books.find(b => b.accessionNo.toLowerCase() === accNo.toLowerCase()) : null;

  // ---- issue handler ----
  const handleIssue = () => {
    if (!resolvedMember) return addToast('error', 'Member not found. Please re-scan a valid Member QR code.');
    if (!resolvedBook) return addToast('error', 'Book not found. Please re-scan a valid Book QR code.');
    if (resolvedMember.status !== 'Active') return addToast('error', `Member "${resolvedMember.name}" is ${resolvedMember.status}. Cannot issue.`);
    if (resolvedBook.available < 1) return addToast('error', `"${resolvedBook.title}" is out of stock.`);

    const activeTxns = txns.filter(t => t.member === resolvedMember.name && t.status !== 'Returned');
    if (activeTxns.length >= 3) return addToast('warning', `${resolvedMember.name} has already borrowed 3 books (limit).`);

    const dd = new Date();
    dd.setDate(dd.getDate() + 14);
    const issueDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dueDate = dd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const newTxn: Transaction = {
      id: 't' + Date.now(),
      bookId: resolvedBook.id,
      book: resolvedBook.title,
      memberId: resolvedMember.id,
      member: resolvedMember.name,
      issueDate,
      dueDate,
      returnDate: null,
      status: 'Issued',
      fine: 0,
      renewed: false,
    };

    setTxns([newTxn, ...txns]);
    setBooks(books.map(b => (b.id === resolvedBook.id ? { ...b, available: b.available - 1 } : b)));
    addToast('success', `✅ Issued "${resolvedBook.title}" to ${resolvedMember.name} — Due ${dueDate}`);

    // Reset for next scan
    setMemberRaw(null);
    setBookRaw(null);
  };

  const resetAll = () => { setMemberRaw(null); setBookRaw(null); };

  // ---- UI ----
  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">📱 QR Scan Issue Desk</div>
          <div className="ss">Scan member & book QR codes with your phone camera to instantly issue books</div>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { n: 1, label: 'Scan Member QR', done: !!resolvedMember },
          { n: 2, label: 'Scan Book QR', done: !!resolvedBook },
          { n: 3, label: 'Issue Book', done: false },
        ].map((s) => (
          <div
            key={s.n}
            style={{
              flex: '1 1 140px',
              padding: '10px 14px',
              borderRadius: 10,
              background: s.done ? 'rgba(69,201,160,.12)' : 'var(--surface2)',
              border: `1px solid ${s.done ? 'rgba(69,201,160,.35)' : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: s.done ? 'var(--a3)' : 'var(--surface)',
                color: s.done ? '#fff' : 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {s.done ? '✓' : s.n}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, color: s.done ? 'var(--a3)' : 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="g g2" style={{ alignItems: 'flex-start' }}>
        {/* ---- MEMBER SCANNER CARD ---- */}
        <div className="card">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>🪪</span> Step 1 – Scan Member QR
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
            Point your phone camera at the Member's Virtual ID Card QR code.
          </div>

          {resolvedMember ? (
            <div style={{ background: 'rgba(69,201,160,.08)', border: '1px solid rgba(69,201,160,.3)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a3)', textTransform: 'uppercase', marginBottom: 8 }}>✅ Member Identified</div>
              <div className="uchip" style={{ marginBottom: 8 }}>
                <div className="av" style={{ background: 'linear-gradient(135deg,var(--accent),#9a7438)' }}>{resolvedMember.avatar || resolvedMember.initials}</div>
                <div>
                  <div className="uname">{resolvedMember.name}</div>
                  <div className="urole">{resolvedMember.email}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
                <div><strong>Member ID:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{resolvedMember.memberId}</span></div>
                <div><strong>Type:</strong> {resolvedMember.memberType || resolvedMember.type}</div>
                <div><strong>Status:</strong> <span className={`badge ${resolvedMember.status === 'Active' ? 'bg' : 'br'}`} style={{ fontSize: 10, padding: '2px 6px' }}>{resolvedMember.status}</span></div>
                <div><strong>Phone:</strong> {resolvedMember.phone || 'N/A'}</div>
              </div>
              <button className="btn bs bsm" onClick={() => setMemberRaw(null)} style={{ marginTop: 10, width: '100%' }}>
                <Icon n="refresh" s={12} /> Re-Scan Member
              </button>
            </div>
          ) : (
            <InlineScanner
              elementId="qr-member-scan"
              label="Member QR"
              onResult={(text) => setMemberRaw(text)}
            />
          )}

          {memberRaw && !resolvedMember && (
            <div className="aerr" style={{ marginTop: 10 }}>
              ⚠️ Could not identify member from scanned QR. Make sure it's a valid LibraryOS Member QR code.
              <button className="btn bs bsm" onClick={() => setMemberRaw(null)} style={{ marginTop: 6, width: '100%' }}>Try Again</button>
            </div>
          )}
        </div>

        {/* ---- BOOK SCANNER CARD ---- */}
        <div className="card">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>📚</span> Step 2 – Scan Book QR
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
            Point your phone camera at the Book's accession QR tag.
          </div>

          {resolvedBook ? (
            <div style={{ background: 'rgba(79,126,247,.08)', border: '1px solid rgba(79,126,247,.3)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a2)', textTransform: 'uppercase', marginBottom: 8 }}>✅ Book Identified</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 36 }}>{resolvedBook.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{resolvedBook.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{resolvedBook.author}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
                <div><strong>Accession:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{resolvedBook.accessionNo}</span></div>
                <div><strong>Category:</strong> {resolvedBook.category}</div>
                <div><strong>Shelf:</strong> {resolvedBook.shelf}</div>
                <div>
                  <strong>Stock:</strong>{' '}
                  <span className={`badge ${resolvedBook.available > 0 ? 'bg' : 'br'}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                    {resolvedBook.available}/{resolvedBook.copies}
                  </span>
                </div>
              </div>
              <button className="btn bs bsm" onClick={() => setBookRaw(null)} style={{ marginTop: 10, width: '100%' }}>
                <Icon n="refresh" s={12} /> Re-Scan Book
              </button>
            </div>
          ) : (
            <InlineScanner
              elementId="qr-book-scan"
              label="Book QR"
              onResult={(text) => setBookRaw(text)}
            />
          )}

          {bookRaw && !resolvedBook && (
            <div className="aerr" style={{ marginTop: 10 }}>
              ⚠️ Could not identify book from scanned QR. Make sure it's a valid LibraryOS Book QR code.
              <button className="btn bs bsm" onClick={() => setBookRaw(null)} style={{ marginTop: 6, width: '100%' }}>Try Again</button>
            </div>
          )}
        </div>
      </div>

      {/* ---- ISSUE CONFIRMATION PANEL ---- */}
      <div className="card" style={{ marginTop: 18, padding: 20 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          Step 3 – Confirm & Issue Book
        </div>

        {resolvedMember && resolvedBook ? (
          <div>
            <div style={{ background: 'rgba(69,201,160,.06)', border: '1px solid rgba(69,201,160,.2)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="av" style={{ background: 'linear-gradient(135deg,var(--accent),#9a7438)', width: 36, height: 36, fontSize: 14 }}>{resolvedMember.avatar || resolvedMember.initials}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{resolvedMember.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{resolvedMember.memberId}</div>
                  </div>
                </div>
                <div style={{ fontSize: 20 }}>→</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{resolvedBook.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{resolvedBook.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{resolvedBook.accessionNo}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--a3)', marginBottom: 12 }}>
              <Icon n="check" s={12} /> Loan period: 14 days &nbsp;|&nbsp; Late fine: ₹10/day
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn bp" style={{ flex: 1, padding: '14px 20px', fontSize: 15 }} onClick={handleIssue}>
                <Icon n="repeat" s={16} /> Issue Book Now
              </button>
              <button className="btn bs" onClick={resetAll} style={{ padding: '14px 20px' }}>
                <Icon n="refresh" s={14} /> Reset
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)' }}>
            <Icon n="qr" s={40} style={{ opacity: 0.3, marginBottom: 10 }} />
            <div style={{ fontSize: 13 }}>
              {!resolvedMember && !resolvedBook
                ? 'Scan both Member and Book QR codes above to proceed.'
                : !resolvedMember
                  ? '✅ Book scanned. Now scan the Member QR code.'
                  : '✅ Member scanned. Now scan the Book QR code.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
