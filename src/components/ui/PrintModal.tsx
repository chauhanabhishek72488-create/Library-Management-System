import React from 'react';
import Icon from './Icon';
import QRCode from './QRCode';

interface PrintItemData {
  title?: string;
  name?: string;
  accessionNo: string;
  classificationNo?: string;
  authors?: string[];
  author?: string;
  author1?: string;
  author2?: string;
  author3?: string;
  publisher?: string;
  edition?: string;
  category?: string;
  shelf?: string;
  isbn?: string;
  issn?: string;
  doi?: string;
  issueNo?: string;
  date?: string;
  type?: string;
}

interface PrintModalProps {
  item: PrintItemData | null;
  onClose: () => void;
}

export default function PrintModal({ item, onClose }: PrintModalProps) {
  if (!item) return null;

  const itemTitle = item.title || item.name || "Library Item";
  
  // Format author list
  let authorsList: string[] = [];
  if (item.authors && item.authors.length > 0) {
    authorsList = item.authors;
  } else {
    if (item.author1) authorsList.push(item.author1);
    if (item.author2) authorsList.push(item.author2);
    if (item.author3) authorsList.push(item.author3);
    if (authorsList.length === 0 && item.author) {
      authorsList.push(item.author);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mbox" style={{ maxWidth: 500 }}>
        <div className="mh no-print">
          <div className="mt" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon n="printer" s={18} /> Print Library Slip
          </div>
          <button className="ibtn" onClick={onClose}><Icon n="x" /></button>
        </div>
        
        <div className="mb">
          <div className="no-print" style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            Preview of printable Accession Slip & Tag. Click <strong>Print Slip</strong> to launch your browser printer.
          </div>

          {/* Printable Container */}
          <div id="printable-slip" className="printable-tag" style={{
            background: "#ffffff",
            color: "#111827",
            padding: "24px",
            borderRadius: "12px",
            border: "2px solid #1f2937",
            fontFamily: "'Outfit', sans-serif"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #e5e7eb", paddingBottom: "12px", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827", textTransform: "uppercase", letterSpacing: "1px" }}>
                  CENTRAL LIBRARY SYSTEM
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>OFFICIAL ACCESSION & CLASSIFICATION SLIP</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, background: "#f3f4f6", padding: "4px 8px", borderRadius: "4px", border: "1px solid #d1d5db" }}>
                  {item.type || "ITEM TAG"}
                </div>
              </div>
            </div>

            {/* Content Layout */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "4px", lineHeight: "1.2" }}>
                  {itemTitle}
                </div>

                {/* Multi-author listing */}
                {authorsList.length > 0 && (
                  <div style={{ fontSize: "13px", color: "#374151", marginBottom: "8px", fontWeight: 500 }}>
                    <strong>Author(s):</strong> {authorsList.join(" • ")}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", fontSize: "12px", color: "#4b5563", marginTop: "10px" }}>
                  {item.publisher && <div><strong>Publisher:</strong> {item.publisher}</div>}
                  {item.edition && <div><strong>Edition:</strong> {item.edition}</div>}
                  {item.category && <div><strong>Category:</strong> {item.category}</div>}
                  {item.shelf && <div><strong>Shelf/Rack:</strong> {item.shelf}</div>}
                  {item.isbn && <div><strong>ISBN:</strong> {item.isbn}</div>}
                  {item.issn && <div><strong>ISSN:</strong> {item.issn}</div>}
                  {item.doi && <div><strong>DOI:</strong> {item.doi}</div>}
                  {item.issueNo && <div><strong>Issue:</strong> {item.issueNo}</div>}
                  {item.date && <div><strong>Date:</strong> {item.date}</div>}
                </div>
              </div>

              {/* QR Code and Tag Box */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: "1px dashed #d1d5db", paddingLeft: "14px" }}>
                <QRCode data={item.accessionNo} size={88} color="#000" bg="#fff" />
                <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "4px" }}>SCAN FOR DETAILS</div>
              </div>
            </div>

            {/* Bottom Barcode / Classification */}
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Classification No. (Call No.)</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#1d4ed8", fontFamily: "monospace" }}>
                  {item.classificationNo || "800.00"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Accession No.</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#047857", fontFamily: "monospace" }}>
                  {item.accessionNo}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }} className="no-print">
            <button className="btn bs" onClick={onClose}>Cancel</button>
            <button className="btn bp" onClick={handlePrint}>
              <Icon n="printer" s={14} /> Print Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
