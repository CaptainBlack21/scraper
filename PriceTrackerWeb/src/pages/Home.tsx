import React, { useState } from "react";
import AddProductForm from "../components/products/ProductActions";
import ProductList from "../components/products/ProductList";

const Home: React.FC = () => {
  const [refresh, setRefresh] = useState(0);

  return (
    <div style={{ padding: "20px" }}>
      {/* Form her zaman üstte */}
      <div style={{ marginBottom: 20 }}>
        <AddProductForm onRefresh={() => setRefresh((prev) => prev + 1)} />
      </div>

      {/* Ürün listesi */}
      <ProductList key={refresh} />
    </div>
  );
};

export default Home;
