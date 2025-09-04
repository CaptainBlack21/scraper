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
  d === "down" ? "#16a34a" : d === "up" ? "#dc2626" : "#6b7280";

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16, color: "#111827" }}>
          Son Değişen Fiyatlar
        </h2>

        <button
          onClick={pull}
          title="Yenile"
          style={{
            border: "none",
            background: "#3b82f6",
            color: "#ffffff",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🔄 Yenile
        </button>
      </div>

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
                  gridTemplateColumns: "auto 1fr auto",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                {/* ✅ Resim ya da boş kutu */}
                <div
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 6,
                    background: p.image ? "transparent" : "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 10, color: "#9ca3af" }}>—</span>
                  )}
                </div>

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
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color:
                          p.direction === "down"
                            ? "#16a34a"
                            : p.direction === "up"
                            ? "#dc2626"
                            : "#111827",
                      }}
                    >
                      {formatTL(p.newPrice)}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      (Önce: {formatTL(p.prevPrice)})
                    </span>
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 11,
                        color: "#ffffff",
                        background: badgeBg,
                        padding: "3px 10px",
                        borderRadius: 999,
                      }}
                      title={pctText}
                    >
                      {arrow(p.direction)} {pctText}
                    </span>
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

                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                      background: "#10b981",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Gör
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
