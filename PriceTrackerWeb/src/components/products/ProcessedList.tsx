import React, { useEffect, useState } from "react";
import { getProcessed } from "../../api/processedApi";
import type { IProcessed } from "../../types/Processed";

// ---- Güvenli yardımcılar ----
const safeNumber = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const formatTL = (v: unknown) => {
  const n = safeNumber(v);
  return n === null ? "—" : `${n.toLocaleString("tr-TR")} TL`;
};

const sign = (n: number | null) =>
  n === null ? "" : n > 0 ? "+" : n < 0 ? "−" : "±";

const arrow = (d: IProcessed["direction"] | undefined) =>
  d === "down" ? "↓" : d === "up" ? "↑" : "→";

const colorFor = (d: IProcessed["direction"] | undefined) =>
  d === "down" ? "#16a34a" : d === "up" ? "#dc2626" : "#6b7280"; // yeşil/kırmızı/gri

const timeAgo = (iso: string) => {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diffMs = Date.now() - t;
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (hr >= 24) return new Date(iso).toLocaleString();
  if (hr > 0) return `${hr} sa önce`;
  if (min > 0) return `${min} dk önce`;
  return `${sec} sn önce`;
};

// Eski kayıtlarla geriye uyum için normalize edelim
const normalize = (p: any) => {
  const fallbackNew = safeNumber(p.newPrice) ?? safeNumber(p.price) ?? null;
  const fallbackPrev =
    safeNumber(p.prevPrice) ??
    (safeNumber(p.diff) !== null && fallbackNew !== null
      ? fallbackNew - (safeNumber(p.diff) as number)
      : null);

  const diff =
    safeNumber(p.diff) ??
    (fallbackNew !== null && fallbackPrev !== null
      ? fallbackNew - fallbackPrev
      : null);

  const diffPct =
    safeNumber(p.diffPct) ??
    (fallbackNew !== null && fallbackPrev && fallbackPrev !== 0
      ? ((fallbackNew - fallbackPrev) / fallbackPrev) * 100
      : null);

  let direction: IProcessed["direction"] | undefined = p.direction;
  if (!direction && diff !== null) direction = diff > 0 ? "up" : diff < 0 ? "down" : "same";
  if (!direction) direction = "same";

  return {
    ...p,
    newPrice: fallbackNew,
    prevPrice: fallbackPrev,
    diff,
    diffPct,
    direction,
  } as IProcessed & {
    newPrice: number | null;
    prevPrice: number | null;
    diff: number | null;
    diffPct: number | null;
  };
};

const EmptyState = () => (
  <div
    style={{
      background: "#f9fafb",
      border: "1px dashed #d1d5db",
      borderRadius: 12,
      padding: 16,
      color: "#6b7280",
      textAlign: "center",
      fontSize: 14,
    }}
  >
    Son değişiklik yok.
  </div>
);

const ProcessedList: React.FC = () => {
  const [items, setItems] = useState<IProcessed[]>([]);
  const [loading, setLoading] = useState(true);

  const pull = async () => {
    try {
      setLoading(true);
      const data = await getProcessed();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    pull();
    // İstersen otomatik yenile:
    // const t = setInterval(pull, 60_000);
    // return () => clearInterval(t);
  }, []);

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        position: "sticky",
        top: 12,
      }}
    >
      {/* Başlık + Yenile */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16, color: "#111827" }}>Son Değişen Fiyatlar</h2>

        {/* Daha kuvvetli stiller (reset'lere dayanıklı) */}
        <button
          onClick={pull}
          title="Yenile"
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            border: "none",
            outline: "none",
            background: "#3b82f6", // mavi
            color: "#ffffff",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(59,130,246,0.35)",
            transition: "transform .1s ease, filter .1s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.95)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          🔄 Yenile
        </button>
      </div>

      {/* Liste */}
      <div
        style={{
          maxHeight: 420,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {loading ? (
          <div style={{ color: "#6b7280", fontSize: 14 }}>Yükleniyor…</div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          items.map((raw) => {
            const p = normalize(raw);
            const badgeBg = colorFor(p.direction);
            const pctText =
              p.diff !== null && p.diffPct !== null
                ? `${sign(p.diff)}${Math.abs(p.diff).toLocaleString("tr-TR")} TL  (${sign(
                    p.diffPct
                  )}${Math.abs(p.diffPct).toFixed(2)}%)`
                : "—";

            return (
              <div
                key={p._id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 12,
                  background: "#ffffff",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "center",
                  transition: "box-shadow .15s, transform .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    title={p.title}
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.title}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 6,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Yeni fiyat */}
                    <span style={{ fontSize: 12, color: "#111827", fontWeight: 700 }}>
                      {formatTL(p.newPrice)}
                    </span>

                    {/* Önceki fiyat */}
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      (Önce: {formatTL(p.prevPrice)})
                    </span>

                    {/* Renkli rozet */}
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 11,
                        color: "#ffffff",
                        background: badgeBg, // kırmızı/yeşil/gri
                        padding: "3px 10px",
                        borderRadius: 999,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                      title={pctText}
                    >
                      <span style={{ fontWeight: 800 }}>{arrow(p.direction)}</span>
                      {pctText}
                    </span>

                    {/* Zaman */}
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 11,
                        color: "#374151",
                        background: "#f3f4f6",
                        border: "1px solid #e5e7eb",
                        padding: "3px 10px",
                        borderRadius: 999,
                      }}
                      title={p.processedAt ? new Date(p.processedAt).toLocaleString() : ""}
                    >
                      {p.processedAt ? timeAgo(p.processedAt) : "—"}
                    </span>
                  </div>
                </div>

                {/* Link */}
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      textDecoration: "none",
                      border: "none",
                      outline: "none",
                      background: "#10b981", // yeşil
                      color: "#ffffff",
                      borderRadius: 8,
                      padding: "8px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      boxShadow: "0 2px 6px rgba(16,185,129,0.35)",
                      transition: "transform .1s ease, filter .1s ease",
                      display: "inline-block",
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.95)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                  >
                    Ürünü gör ↗
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ProcessedList;
