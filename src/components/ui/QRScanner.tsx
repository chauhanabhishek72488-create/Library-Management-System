import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Icon from './Icon';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Create element dynamic configuration
    const scanner = new Html5QrcodeScanner(
      "qr-reader-element",
      { 
        fps: 10, 
        qrbox: { width: 220, height: 220 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // 0 is Html5QrcodeScanType.SCAN_TYPE_CAMERA
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // Parse absolute URL if present
        let parsedText = decodedText;
        try {
          if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
            const url = new URL(decodedText);
            const bookId = url.searchParams.get('bookId');
            if (bookId) {
              parsedText = bookId;
            }
          }
        } catch (e) {
          console.warn("Failed to parse scanned text as URL:", e);
        }

        // Parse formatted QR payload like "Accession No: ACC-2026-001"
        const accMatch = parsedText.match(/Accession\s*No\s*[:=]\s*(.+)/i);
        if (accMatch) {
          parsedText = accMatch[1].trim();
        }

        // Parse formatted member QR payload like "Member ID: LIB-2024-001"
        const memMatch = parsedText.match(/Member\s*ID\s*[:=]\s*(.+)/i);
        if (memMatch) {
          parsedText = memMatch[1].trim();
        }

        // Success callback
        onScanSuccess(parsedText);
        try {
          scanner.clear().catch(err => console.warn("Error clearing scanner on success:", err));
        } catch (e) {
          console.warn("Exception cleaning scanner:", e);
        }
      },
      (errorMessage) => {
        // We can ignore verbose camera parse error logs to avoid console clutter
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.warn("Cleanup scanner clear failed:", err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1000 }}>
      <div className="mbox" style={{ maxWidth: 450, padding: 20 }}>
        <div className="mh" style={{ marginBottom: 15 }}>
          <div className="mt" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon n="scan" s={18} /> Scan Book QR Code
          </div>
          <button className="ibtn" onClick={onClose}><Icon n="x" /></button>
        </div>
        <div className="mb" style={{ background: '#07090f', borderRadius: 8, padding: 10, overflow: 'hidden' }}>
          <div id="qr-reader-element" style={{ width: '100%' }}></div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>
          Align the book details QR Code inside the scanner box.
        </div>
      </div>
    </div>
  );
}
