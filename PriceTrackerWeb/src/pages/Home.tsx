import React, { useState } from "react";
import ProductActions from "../components/products/ProductActions";
import ProductList from "../components/products/ProductList";

const Home: React.FC = () => {
  const [refresh, setRefresh] = useState(0);

  return (
    <div style={{ padding: 20 }}>
      {/* Form her zaman üstte */}
      <ProductActions onRefresh={() => setRefresh((prev) => prev + 1)} />

      {/* Ürün listesi */}
      <ProductList key={refresh} />
    </div>
  );
};

export default Home;
