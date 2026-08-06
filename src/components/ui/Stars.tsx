import React, { useState } from 'react';

interface StarsProps {
  value: number;
  max?: number;
  onChange?: (val: number) => void;
  size?: number;
}

/**
 * Interactive Star Rating component.
 * Allows the user to hover over 5 stars to preview their rating, and click to confirm and set it.
 */
export default function Stars({ value, max = 5, onChange, size = 18 }: StarsProps) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((s) => (
        <span
          key={s}
          style={{
            fontSize: size,
            cursor: onChange ? "pointer" : "default",
            color: s <= (hover || value) ? "#f5a623" : "var(--border)",
            transition: "color .1s"
          }}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(s)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
