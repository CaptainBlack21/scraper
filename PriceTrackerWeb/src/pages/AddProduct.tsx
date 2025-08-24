import React from "react";
import AddProductForm from "../components/products/ProductActions";

const AddProduct: React.FC = () => {
  return (
    <div style={{ padding: 20 }}>
      <h1>Yeni Ürün Ekle</h1>
      <AddProductForm onAdd={() => {}} />
    </div>
  );
};

export default AddProduct;
