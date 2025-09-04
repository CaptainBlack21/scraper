import React from "react";
import type { IProduct } from "../../types/Product";
import { Link } from "react-router-dom";

interface Props {
  product: IProduct;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const hasAlarm =
    typeof product.alarmPrice === "number" &&
    !Number.isNaN(product.alarmPrice as number);
  const alarmHit =
    hasAlarm && product.currentPrice <= (product.alarmPrice as number);

  const formatTL = (n?: number | null) =>
    typeof n === "number" && !Number.isNaN(n)
      ? `${n.toLocaleString("tr-TR")} TL`
      : "—";

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        width: "100%",
        minHeight: 120,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        outline: alarmHit ? "2px solid #28a745" : undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
    >
      {/* Alarm rozeti */}
      {alarmHit && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#28a745",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Alarm!
        </span>
      )}

      {/* ✅ Küçük kare resim kutusu */}
      <div
        style={{
          width: 80,
          height: 80,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          background: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>🖼️</span>
        )}
      </div>

      {/* Sağ taraf: ürün bilgileri */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 style={{ fontSize: "1rem", margin: 0, color: "#007bff" }}>
          <Link
            to={`/product/${product._id}`}
            style={{ textDecoration: "none", color: "#007bff" }}
            title={product.title}
          >
            {product.title}
          </Link>
        </h3>

        <p style={{ margin: 0, fontWeight: "bold", color: "#555" }}>
          Fiyat: {formatTL(product.currentPrice)}
        </p>

        <p style={{ margin: 0, color: "#777" }}>
          Alarm Fiyatı: {formatTL(product.alarmPrice as number | null)}
        </p>

        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#007bff",
            fontSize: "0.85rem",
            textDecoration: "underline",
            wordBreak: "break-word",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          Ürünü Gör
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
