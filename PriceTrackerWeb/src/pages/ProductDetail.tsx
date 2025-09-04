import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProducts, deleteProduct, updateAlarm } from "../api/productApi";
import type { IProduct } from "../types/Product";
import AlarmUpdate from "../components/products/AlarmUpdate";
import DeleteButton from "../components/common/DeleteButton";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const chip = (text: string) => (
  <span
    style={{
      display: "inline-block",
      padding: "4px 10px",
      fontSize: 12,
      borderRadius: 999,
      background: "#f3f4f6",
      border: "1px solid #e5e7eb",
      color: "#374151",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </span>
);

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const allProducts = await getProducts();
      const found = allProducts.find((p) => p._id === id) || null;
      setProduct(found);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const chartData = useMemo(
    () =>
      (product?.priceHistory ?? []).map((ph) => ({
        price: ph.price,
        date: new Date(ph.date).toLocaleDateString(),
      })),
    [product]
  );

  const handleDelete = async () => {
    if (!product) return;
    await deleteProduct(product._id);
    navigate("/");
  };

  const handleAlarmSave = async (newPrice: number) => {
    if (!product) return;
    await updateAlarm(product._id, newPrice);
    setShowAlarmModal(false);
    fetchProduct();
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        {chip("Yükleniyor…")}
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              border: "1px solid #e5e7eb",
              background: "#fff",
              borderRadius: 8,
              padding: "8px 12px",
              color: "#111827",
              fontWeight: 600,
            }}
          >
            ← Ana Sayfa
          </Link>
        </div>

        <div
          style={{
            padding: 20,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          Ürün bulunamadı.
        </div>
      </div>
    );
  }

  const alarmHit =
    typeof product.alarmPrice === "number" &&
    !Number.isNaN(product.alarmPrice) &&
    product.currentPrice <= product.alarmPrice;

  return (
    <div style={{ padding: 20 }}>
      {/* Üst gezinme / etiketler */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            border: "1px solid #e5e7eb",
            background: "#fff",
            borderRadius: 8,
            padding: "8px 12px",
            color: "#111827",
            fontWeight: 600,
          }}
        >
          ← Ana Sayfa
        </Link>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {chip(`ID: ${product._id.slice(0, 6)}…`)}
          {chip(new URL(product.url).hostname.replace(/^www\./, ""))}
          {alarmHit && chip("Alarm vurdu")}
        </div>
      </div>

      {/* Tam genişlik grid: sol görsel / sağ bilgiler */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 420px) 1fr",
          gap: 20,
          width: "100%",
        }}
      >
        {/* SOL: görsel kartı */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
            padding: 16,
          }}
        >
          <div
            style={{
              border: "1px solid #e5e7eb",
              background: "linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)",
              borderRadius: 12,
              height: 360,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            ) : (
              <div style={{ color: "#9ca3af", fontSize: 13 }}>🖼️ Görsel bulunamadı</div>
            )}
          </div>

          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 12,
              textDecoration: "none",
              background: "#3b82f6",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Ürünü Amazon’da Gör ↗
          </a>
        </div>

        {/* SAĞ: detay kartı */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: "100%",
          }}
        >
          <h1
            style={{
              fontSize: "1.25rem",
              margin: 0,
              lineHeight: 1.3,
              color: "#111827",
            }}
            title={product.title}
          >
            {product.title}
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span
              style={{
                background: "#eef2ff",
                color: "#3730a3",
                border: "1px solid #e0e7ff",
                borderRadius: 999,
                padding: "6px 12px",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {product.currentPrice.toLocaleString("tr-TR")} TL
            </span>
            <span
              style={{
                background: "#f3f4f6",
                color: "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 13,
              }}
            >
              Alarm:{" "}
              {Number.isFinite(product.alarmPrice)
                ? `${product.alarmPrice.toLocaleString("tr-TR")} TL`
                : "—"}
            </span>
            {alarmHit && (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  border: "1px solid #bbf7d0",
                  borderRadius: 999,
                  padding: "6px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Alarm Fiyatının Altında ✅
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowAlarmModal(true)}
              style={{
                background: "#115e59",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Alarmı Güncelle
            </button>

            <DeleteButton onConfirm={handleDelete} />

            <button
              onClick={fetchProduct}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Yenile
            </button>
          </div>

          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Son güncellemeler grafik bölümünden takip edilebilir.
          </div>
        </div>
      </div>

      {/* Tam genişlik grafik kartı */}
      <div
        style={{
          marginTop: 20,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff",
          padding: 16,
          width: "100%",
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 10, fontSize: 16, color: "#111827" }}>
          Fiyat Geçmişi
        </h3>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: 13,
            }}
          >
            Fiyat geçmişi bulunamadı.
          </div>
        )}
      </div>

      {showAlarmModal && (
        <AlarmUpdate
          currentAlarm={product.alarmPrice}
          onSave={handleAlarmSave}
          onCancel={() => setShowAlarmModal(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
