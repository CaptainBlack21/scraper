import React, { useState } from "react";
import { addProduct } from "../../api/productApi";

interface Props {
  onRefresh: () => void; // eskiden onAdd idi, şimdi hem ekleme hem yenileme için kullanacağız
}

const ProductActions: React.FC<Props> = ({ onRefresh }) => {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    try {
      await addProduct(url);
      setUrl("");
      onRefresh(); // ürün eklendikten sonra sayfa yenilensin
    } catch (err: any) {
      alert(err.response?.data?.error || "Ürün eklenirken hata oluştu");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 20px 0" }}>
      {/* Ürün ekleme formu */}
      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Amazon ürün URL'si"
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Ekle
        </button>
      </form>

      {/* Yenile butonu */}
      <button
        onClick={onRefresh} // tıklayınca direkt sayfa yenileniyor
        style={{
          padding: "8px 16px",
          borderRadius: 6,
          border: "none",
          backgroundColor: "#28a745",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Yenile
      </button>
    </div>
  );
};

export default ProductActions;
