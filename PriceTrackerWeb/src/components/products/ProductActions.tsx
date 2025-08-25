import React, { useState } from "react";
import { addProduct } from "../../api/productApi";

interface Props {
  onRefresh: () => void;
}

const ProductActions: React.FC<Props> = ({ onRefresh }) => {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    try {
      await addProduct(url);
      setUrl("");
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || "Ürün eklenirken hata oluştu");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",      // dar ekranda alt satıra geçsin
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
        width: "100%",
      }}
    >
      {/* Form + Ekle */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flex: "1 1 auto",    // kalan alanı al
          gap: 10,
          minWidth: 200,
        }}
      >
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Amazon ürün URL'si"
          style={{
            flex: 1,           // input kalan alanın tamamını kaplar
            minWidth: 150,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
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
            whiteSpace: "nowrap",
          }}
        >
          Ekle
        </button>
      </form>

      {/* Yenile butonu */}
      <button
        onClick={onRefresh}
        style={{
          padding: "8px 16px",
          borderRadius: 6,
          border: "none",
          backgroundColor: "#28a745",
          color: "#fff",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Yenile
      </button>
    </div>
  );
};

export default ProductActions;
