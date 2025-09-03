import React, { useEffect, useState } from "react";
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

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [showAlarmModal, setShowAlarmModal] = useState(false);

  const fetchProduct = async () => {
    const allProducts = await getProducts();
    const found = allProducts.find((p) => p._id === id) || null;
    setProduct(found);
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (!product) return <p>Yükleniyor veya ürün bulunamadı...</p>;

  const chartData = product.priceHistory.map((ph) => ({
    price: ph.price,
    date: new Date(ph.date).toLocaleDateString()
  }));

  const handleDelete = async () => {
    await deleteProduct(product._id);
    navigate("/");
  };

  const handleAlarmSave = async (newPrice: number) => {
    await updateAlarm(product._id, newPrice);
    setShowAlarmModal(false);
    fetchProduct();
  };

  return (
    <div style={{ padding: 20 }}>
      <Link to="/" style={{ marginBottom: 10, display: "inline-block" }}>
        ← Ana Sayfa
      </Link>

      <h1 style={{ fontSize: "1.5rem", marginBottom: 10 }}>{product.title}</h1>
      <p>Mevcut Fiyat: {product.currentPrice} TL</p>
      <p>Alarm Fiyatı: {product.alarmPrice} TL</p>

      <DeleteButton onConfirm={handleDelete} style={{ marginRight: 10 }} />
      <button
        style={{ backgroundColor: "#115f0eff", color: "#fff", marginRight: 10 }}
        onClick={() => setShowAlarmModal(true)}
      >
        Alarmı Güncelle
      </button>

      {/* 👇 Ürünü Gör linki eklendi */}
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: 10,
          color: "#007bff",
          fontSize: "0.95rem",
          textDecoration: "underline",
        }}
      >
        Ürünü Gör
      </a>

      <h3 style={{ marginTop: 20 }}>Fiyat Geçmişi</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

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
