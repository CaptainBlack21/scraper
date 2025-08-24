import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import AddProduct from "./pages/AddProduct";
import Header from "./components/common/Header";

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <div style={{ padding: "20px", paddingTop: "50px" }}>
        {/* paddingTop header yüksekliği + ekstra boşluk */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/add-product" element={<AddProduct />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
