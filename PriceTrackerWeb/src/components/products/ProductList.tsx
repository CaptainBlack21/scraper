import React, { useEffect } from "react";
import ProductCard from "./ProductCard";
import { useFetchProducts } from "../../hooks/useFetchProducts";

const ProductList: React.FC = () => {
  const { products, loading, fetchProducts } = useFetchProducts();

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Yükleniyor...</p>;
  if (!products.length) return <p>Ürün bulunamadı.</p>;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      {[...products].reverse().map((p) => (
        <div
          key={p._id}
          style={{
            flex: "1 1 200px", // minimum 200px, gerekirse büyüyebilir
            maxWidth: "100%",
          }}
        >
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
};

export default ProductList;
