import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Icon from './Icon';

interface QRScannerModalProps {
  onClose: () => void;
  onScanResult?: (result: string) => void;
}

/**
 * QRScannerModal Component
 * Opens the device camera (webcam / mobile camera) using html5-qrcode
 * to scan any physical or digital library QR Code directly inside the app.
 */
export default function QRScannerModal({ onClose, onScanResult }: QRScannerModalProps) {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const elementId = "qr-reader-video";
    const html5Qrcode = new Html5Qrcode(elementId);
    scannerRef.current = html5Qrcode;

    html5Qrcode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        setScannedData(decodedText);
        if (onScanResult) onScanResult(decodedText);
        html5Qrcode.stop().catch((e) => console.warn("Scanner stop error:", e));
        setIsScanning(false);
      },
      () => {
        // Ignored per-frame scan attempts
      }
    ).then(() => {
      setIsScanning(true);
    }).catch(err => {
      console.warn("Camera start error:", err);
      setErrorMsg("Camera access required. Please allow camera permissions in your browser bar.");
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((e) => console.warn("Cleanup stop error:", e));
      }
    };
  }, [onScanResult]);

  const handleScanAgain = () => {
    setScannedData(null);
    setErrorMsg('');
    const elementId = "qr-reader-video";
    const html5Qrcode = new Html5Qrcode(elementId);
    scannerRef.current = html5Qrcode;

    html5Qrcode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        setScannedData(decodedText);
        if (onScanResult) onScanResult(decodedText);
        html5Qrcode.stop().catch(console.warn);
      },
      () => {}
    ).catch(err => {
      console.warn("Camera restart error:", err);
      setErrorMsg("Camera access required.");
    });
  };

  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mbox" style={{ maxWidth: 460 }}>
        <div className="mh">
          <div className="mt" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon n="qr" s={18} /> In-App Camera QR Code Scanner
          </div>
          <button className="ibtn" onClick={onClose}><Icon n="x" /></button>
        </div>

        <div className="mb" style={{ textAlign: "center" }}>
          {!scannedData ? (
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
                Point your mobile or computer camera at any Member ID Card or Book Tag QR code.
              </div>
              
              {errorMsg && (
                <div className="aerr" style={{ marginBottom: 14 }}>⚠️ {errorMsg}</div>
              )}

              <div 
                id="qr-reader-video" 
                style={{ 
                  width: "100%", 
                  maxWidth: 320, 
                  margin: "0 auto", 
                  borderRadius: 12, 
                  overflow: "hidden",
                  border: "2px solid var(--accent)",
                  background: "#000",
                  minHeight: 220
                }} 
              />
            </div>
          ) : (
            <div style={{ background: "rgba(69,201,160,.08)", border: "1px solid rgba(69,201,160,.3)", borderRadius: 12, padding: 18, textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--a3)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                ✅ QR Code Scanned Successfully!
              </div>
              <pre style={{ 
                fontFamily: "monospace", 
                fontSize: 12, 
                whiteSpace: "pre-wrap", 
                wordBreak: "break-word", 
                background: "rgba(0,0,0,0.3)", 
                padding: 12, 
                borderRadius: 8, 
                color: "var(--text)", 
                maxHeight: 240, 
                overflowY: "auto" 
              }}>
                {scannedData}
              </pre>
              <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
                <button className="btn bs bsm" onClick={handleScanAgain}>Scan Another</button>
                <button className="btn bp bsm" onClick={onClose}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
