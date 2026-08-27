import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const s = raw.trim();
  // Try "Member ID : LIB-XXX" format
  const match = s.match(/Member\s+ID\s*[:\s]+([A-Z0-9a-z_-]{4,})/i);
  if (match) return match[1].trim();
  // Try raw "LIB-XXXXX"
  const direct = s.match(/\bLIB-[A-Z0-9_-]+/i);
  if (direct) return direct[0].trim();
  return null;
}

/** Parse email from scanned QR payload */
function extractEmail(raw: string): string | null {
  const match = raw.match(/Email\s*[:\s]+([^\s\n]+@[^\s\n]+)/i);
  return match ? match[1].trim() : null;
}

/** Parse a Book Accession No (e.g. ACC-2026-001) from a scanned QR text payload */
function extractAccessionNo(raw: string): string | null {
  const s = raw.trim();
  const match = s.match(/Accession\s+No[.:]*\s*([A-Z0-9a-z_-]{4,})/i);
  if (match) return match[1].trim();
  const direct = s.match(/\bACC-[A-Z0-9_-]+/i);
  if (direct) return direct[0].trim();
  return null;
}

/** Resolve a member from QR text */
function resolveMember(raw: string, members: Member[]): Member | null {
  const memberId = extractMemberId(raw);
  const email = extractEmail(raw);
  return (
    (memberId ? members.find(m => m.memberId && m.memberId.toLowerCase() === memberId.toLowerCase()) : null) ||
    (email ? members.find(m => m.email && m.email.toLowerCase() === email.toLowerCase()) : null) ||
    null
  );
}

/** Resolve a book from QR text */
function resolveBook(raw: string, books: Book[]): Book | null {
  const accNo = extractAccessionNo(raw);
  return accNo ? books.find(b => b.accessionNo && b.accessionNo.toLowerCase() === accNo.toLowerCase()) || null : null;
}

// ── Scan Complete Overlay ──────────────────────────────────────────────
function ScanSuccess({ label }: { label: string }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(69,201,160,0.9)',
      borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 8, zIndex: 10, animation: 'fdin .2s ease',
    }}>
      <div style={{ fontSize: 40 }}>✅</div>
      <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Scan Complete!</div>
      <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 13 }}>{label} detected</div>
    </div>
  );
}

// ── Inline Scanner Component ───────────────────────────────────────────
function InlineScanner({
  elementId,
  onResult,
  label,
}: {
  elementId: string;
  onResult: (text: string) => void;
  label: string;
}) {
  const scannerRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleResult = useCallback((decoded: string) => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onResult(decoded);
    }, 1200);
  }, [onResult]);

  const startScan = useCallback(() => {
    setError('');
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      const qr = new Html5Qrcode(elementId);
      scannerRef.current = qr;
      qr.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 240, height: 240 } },
        (decoded: string) => {
          qr.stop().catch(() => {});
          setScanning(false);
          handleResult(decoded);
        },
        () => {}
      )
        .then(() => setScanning(true))
        .catch(() => setError('Camera access required. Please allow camera permission, or type the ID below.'));
    });
  }, [elementId, handleResult]);

  const stopScan = useCallback(() => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    setScanning(false);
  }, []);

  useEffect(() => () => { stopScan(); }, [stopScan]);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onResult(manualInput.trim());
        setManualInput('');
      }, 800);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Camera viewfinder */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
        <div
          id={elementId}
          style={{
            width: '100%',
            minHeight: scanning ? 240 : 0,
            background: '#000',
            borderRadius: 12,
          }}
        />
        {showSuccess && <ScanSuccess label={label} />}
        {scanning && !showSuccess && (
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,.7)', color: '#fff', fontSize: 11, borderRadius: 20,
            padding: '4px 12px', whiteSpace: 'nowrap',
          }}>
            📷 Point at {label} QR code…
          </div>
        )}
      </div>

      {error && <div className="aerr" style={{ fontSize: 12 }}>⚠️ {error}</div>}

      {!scanning && (
        <button className="btn bp bsm" onClick={startScan} style={{ width: '100%' }}>
          📷 Open Camera — Scan {label}
        </button>
      )}
      {scanning && !showSuccess && (
        <button className="btn bd bsm" onClick={stopScan} style={{ width: '100%', fontSize: 12 }}>
          <Icon n="x" s={12} /> Stop Camera
        </button>
      )}

      {/* Manual entry fallback */}
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5, textAlign: 'center' }}>
          — or type ID manually —
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            className="fi fi-bare"
            style={{ flex: 1, fontSize: 12, padding: '8px 11px' }}
            placeholder={label === 'Member QR' ? 'LIB-XXXXX' : 'ACC-XXXXX'}
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
          />
          <button className="btn bp bsm" onClick={handleManualSubmit} style={{ flexShrink: 0 }}>
            ✓ Use
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main QRIssuePage ──────────────────────────────────────────────────
export default function QRIssuePage({ books, setBooks, members, txns, setTxns, addToast }: QRIssuePageProps) {
  const [memberRaw, setMemberRaw] = useState<string | null>(null);
  const [bookRaw, setBookRaw] = useState<string | null>(null);
  const [issueDone, setIssueDone] = useState(false);

  const resolvedMember = memberRaw ? resolveMember(memberRaw, members) : null;
  const resolvedBook = bookRaw ? resolveBook(bookRaw, books) : null;

  const handleIssue = () => {
    if (!resolvedMember) return addToast('error', 'Member not found. Re-scan or type the correct Member ID.');
    if (!resolvedBook) return addToast('error', 'Book not found. Re-scan or type the correct Accession No.');
    if (resolvedMember.status !== 'Active') return addToast('error', `Member "${resolvedMember.name}" is ${resolvedMember.status}. Cannot issue.`);
    if (resolvedBook.available < 1) return addToast('error', `"${resolvedBook.title}" is out of stock.`);

    const activeTxns = txns.filter(t => t.member === resolvedMember.name && t.status !== 'Returned');
    if (activeTxns.length >= 3) return addToast('warning', `${resolvedMember.name} already has 3 books issued (limit reached).`);

    const dd = new Date();
    dd.setDate(dd.getDate() + 14);
    const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const dueDate = dd.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

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
    setBooks(books.map(b => b.id === resolvedBook.id ? { ...b, available: b.available - 1 } : b));
    addToast('success', `✅ Issued "${resolvedBook.title}" to ${resolvedMember.name} — Due ${dueDate}`);

    setIssueDone(true);
    setTimeout(() => {
      setMemberRaw(null);
      setBookRaw(null);
      setIssueDone(false);
    }, 2500);
  };

  const resetAll = () => { setMemberRaw(null); setBookRaw(null); setIssueDone(false); };

  // Step indicator colours
  const steps = [
    { n: 1, label: 'Scan Member QR', done: !!resolvedMember },
    { n: 2, label: 'Scan Book QR', done: !!resolvedBook },
    { n: 3, label: 'Issue Book', done: issueDone },
  ];

  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">📱 QR Scan Issue Desk</div>
          <div className="ss">Scan member & book QR codes to instantly issue books</div>
        </div>
        <button className="btn bs bsm" onClick={resetAll}>
          <Icon n="refresh" s={12} /> Reset All
        </button>
      </div>

      {/* Step Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {steps.map(s => (
          <div key={s.n} style={{
            flex: '1 1 130px', padding: '9px 13px', borderRadius: 10,
            background: s.done ? 'rgba(69,201,160,.12)' : 'var(--surface2)',
            border: `1.5px solid ${s.done ? 'rgba(69,201,160,.4)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', gap: 9, transition: 'all .3s',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: s.done ? 'var(--a3)' : 'var(--surface)',
              color: s.done ? '#fff' : 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 12, border: `1.5px solid ${s.done ? 'var(--a3)' : 'var(--border)'}`,
            }}>
              {s.done ? '✓' : s.n}
            </div>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: s.done ? 'var(--a3)' : 'var(--muted)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Success Banner */}
      {issueDone && (
        <div style={{
          background: 'rgba(69,201,160,.12)', border: '1px solid rgba(69,201,160,.4)',
          borderRadius: 12, padding: '18px 22px', marginBottom: 18, textAlign: 'center',
          animation: 'aslide .3s ease',
        }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--a3)' }}>Book Issued Successfully!</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Resetting for next transaction…
          </div>
        </div>
      )}

      <div className="g g2" style={{ alignItems: 'flex-start' }}>
        {/* MEMBER SCANNER */}
        <div className="card">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🪪</span> Step 1 — Member QR
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
            Scan the Member's Virtual ID Card QR, or type their Member ID.
          </div>

          {resolvedMember ? (
            <div style={{ background: 'rgba(69,201,160,.08)', border: '1px solid rgba(69,201,160,.3)', borderRadius: 10, padding: 14, animation: 'fdin .25s ease' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--a3)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✅</span> Member Identified
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div className="av" style={{ background: 'linear-gradient(135deg,var(--accent),#9a7438)', width: 40, height: 40, fontSize: 16 }}>
                  {resolvedMember.avatar || resolvedMember.initials || resolvedMember.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{resolvedMember.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{resolvedMember.email}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, fontSize: 12, marginBottom: 10 }}>
                <div><strong>ID:</strong> <code style={{ color: 'var(--accent)', fontSize: 11 }}>{resolvedMember.memberId}</code></div>
                <div><strong>Type:</strong> {resolvedMember.memberType || resolvedMember.type}</div>
                <div><strong>Status:</strong> <span className={`badge ${resolvedMember.status === 'Active' ? 'bg' : 'br'}`} style={{ fontSize: 10, padding: '1px 6px' }}>{resolvedMember.status}</span></div>
                <div><strong>Phone:</strong> {resolvedMember.phone || 'N/A'}</div>
              </div>
              <button className="btn bs bsm" onClick={() => setMemberRaw(null)} style={{ width: '100%' }}>
                <Icon n="refresh" s={11} /> Re-Scan Member
              </button>
            </div>
          ) : (
            <InlineScanner elementId="qr-member-scan" label="Member QR" onResult={text => setMemberRaw(text)} />
          )}

          {memberRaw && !resolvedMember && (
            <div className="aerr" style={{ marginTop: 10, fontSize: 12 }}>
              ⚠️ Member not found for the scanned ID. Try typing the Member ID manually above.
              <button className="btn bs bsm" onClick={() => setMemberRaw(null)} style={{ marginTop: 6, width: '100%' }}>
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* BOOK SCANNER */}
        <div className="card">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📚</span> Step 2 — Book QR
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
            Scan the Book's accession QR tag, or type the Accession No.
          </div>

          {resolvedBook ? (
            <div style={{ background: 'rgba(79,126,247,.08)', border: '1px solid rgba(79,126,247,.3)', borderRadius: 10, padding: 14, animation: 'fdin .25s ease' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--a2)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✅</span> Book Identified
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 38 }}>{resolvedBook.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{resolvedBook.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{resolvedBook.author}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, fontSize: 12, marginBottom: 10 }}>
                <div><strong>Accession:</strong> <code style={{ color: 'var(--accent)', fontSize: 11 }}>{resolvedBook.accessionNo}</code></div>
                <div><strong>Category:</strong> {resolvedBook.category}</div>
                <div><strong>Shelf:</strong> {resolvedBook.shelf}</div>
                <div>
                  <strong>Stock:</strong>{' '}
                  <span className={`badge ${resolvedBook.available > 0 ? 'bg' : 'br'}`} style={{ fontSize: 10, padding: '1px 6px' }}>
                    {resolvedBook.available}/{resolvedBook.copies}
                  </span>
                </div>
              </div>
              <button className="btn bs bsm" onClick={() => setBookRaw(null)} style={{ width: '100%' }}>
                <Icon n="refresh" s={11} /> Re-Scan Book
              </button>
            </div>
          ) : (
            <InlineScanner elementId="qr-book-scan" label="Book QR" onResult={text => setBookRaw(text)} />
          )}

          {bookRaw && !resolvedBook && (
            <div className="aerr" style={{ marginTop: 10, fontSize: 12 }}>
              ⚠️ Book not found for the scanned accession. Try typing the Accession No manually above.
              <button className="btn bs bsm" onClick={() => setBookRaw(null)} style={{ marginTop: 6, width: '100%' }}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ISSUE CONFIRMATION PANEL */}
      {!issueDone && (
        <div className="card" style={{ marginTop: 18 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
            Step 3 — Confirm & Issue
          </div>

          {resolvedMember && resolvedBook ? (
            <div>
              <div style={{ background: 'rgba(69,201,160,.06)', border: '1px solid rgba(69,201,160,.2)', borderRadius: 10, padding: 14, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="av" style={{ background: 'linear-gradient(135deg,var(--accent),#9a7438)', width: 38, height: 38, fontSize: 14 }}>
                    {resolvedMember.avatar || resolvedMember.initials || resolvedMember.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{resolvedMember.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{resolvedMember.memberId}</div>
                  </div>
                </div>
                <div style={{ fontSize: 22, color: 'var(--accent)' }}>→</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 32 }}>{resolvedBook.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{resolvedBook.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{resolvedBook.accessionNo}</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--a3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon n="check" s={12} /> Loan period: 14 days &nbsp;|&nbsp; Late fine: ₹10/day
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn bp" style={{ flex: 1, padding: '13px 20px', fontSize: 15, fontWeight: 700 }} onClick={handleIssue}>
                  ✅ Issue Book Now
                </button>
                <button className="btn bs" onClick={resetAll} style={{ padding: '13px 18px' }}>
                  <Icon n="refresh" s={14} /> Reset
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📷</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                {!resolvedMember && !resolvedBook
                  ? 'Scan both Member QR and Book QR above to proceed.'
                  : !resolvedMember
                    ? '✅ Book scanned. Now scan the Member QR.'
                    : '✅ Member scanned. Now scan the Book QR.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
