import React, { useState, useEffect } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  data: string;
  size?: number;
  color?: string;
  bg?: string;
}

/**
 * Universal Scannable QR Code Component
 * Generates an actual, standard-compliant QR code image asynchronously using the `qrcode` library.
 * The generated QR code is fully scannable by mobile phones and readers.
 */
export default function QRCode({ data, size = 80, color = "#000", bg = "#fff" }: QRCodeProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    QRCodeLib.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: color,
        light: bg
      }
    })
      .then(url => setQrUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
  }, [data, size, color, bg]);

  if (!qrUrl) {
    return <div style={{ width: size, height: size, background: bg, borderRadius: 4 }} />;
  }

  return (
    <img 
      src={qrUrl} 
      alt="QR Code" 
      width={size} 
      height={size} 
      style={{ borderRadius: 4, display: 'block' }} 
    />
  );
}
