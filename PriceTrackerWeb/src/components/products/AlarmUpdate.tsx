import React, { useEffect, useRef, useState } from "react";

interface Props {
  currentAlarm: number;
  onSave: (newPrice: number) => void;
  onCancel: () => void;
}

const AlarmUpdate: React.FC<Props> = ({ currentAlarm, onSave, onCancel }) => {
  // string state → NaN/boş durumda input kırılmasın
  const [value, setValue] = useState(
    Number.isFinite(currentAlarm) ? String(currentAlarm) : ""
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Açılınca input’a fokusla
    inputRef.current?.focus();

    // ESC ile kapat
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") handleSave();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel(); // backdrop’a tıklanırsa kapat
  };

  const handleSave = () => {
    const n = parseFloat(value.replace(",", "."));
    if (!Number.isFinite(n) || n < 0) {
      // basit validation
      inputRef.current?.focus();
      return;
    }
    onSave(n);
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999, // temalardan bağımsız görünürlük
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        style={{
          // Tema-bağımsız net kontrast
          backgroundColor: "#ffffff",
          color: "#111827",
          padding: 20,
          borderRadius: 12,
          width: "min(420px, 100%)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          border: "1px solid #e5e7eb",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 12,
            fontSize: 18,
            lineHeight: 1.3,
            fontWeight: 700,
            color: "#111827", // zıt renk
          }}
        >
          Alarm Fiyatını Güncelle
        </h3>

        <label
          htmlFor="alarm-price"
          style={{
            display: "block",
            marginBottom: 6,
            fontSize: 13,
            color: "#374151",
          }}
        >
          Alarm fiyatı (TL)
        </label>

        <input
          id="alarm-price"
          ref={inputRef}
          type="number"
          inputMode="decimal"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            marginBottom: 14,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            outline: "none",
            color: "#111827",
            backgroundColor: "#ffffff",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              backgroundColor: "#f3f4f6",
              color: "#111827",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Kaydet
          </button>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
          İpucu: <b>Enter</b> ile kaydedebilir, <b>Esc</b> ile kapatabilirsin.
        </div>
      </div>
    </div>
  );
};

export default AlarmUpdate;
