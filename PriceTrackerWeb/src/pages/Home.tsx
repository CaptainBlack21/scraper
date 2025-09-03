import React, { useState } from "react";
import ProductActions from "../components/products/ProductActions";
import ProductList from "../components/products/ProductList";
import ProductSearch from "../components/products/ProductSearch";
import ProcessedList from "../components/products/ProcessedList";

const Home: React.FC = () => {
  const [refresh, setRefresh] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div
      style={{
        width: "100%",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Ürün ekleme ve arama barları */}
      <ProductActions onRefresh={() => setRefresh((prev) => prev + 1)} />
      <ProductSearch onSearch={setSearchQuery} />

      {/* İçerik alanı: Sol ürün listesi + sağ işlenen ürünler */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px", // ✅ sol taraf esnek, sağ sabit 300px
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        {/* Sol taraf: ürün listesi */}
        <ProductList key={refresh} searchQuery={searchQuery} />

        {/* Sağ taraf: işlenen ürünler */}
        <ProcessedList />
      </div>
    </div>
  );
};

export default Home;
