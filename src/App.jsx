// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Store from "./pages/Store";
import Products from "./pages/Products";      // si la usás
import AdminProducts from "./pages/AdminProducts";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tienda principal */}
        <Route path="/" element={<Store />} />

        {/* Vista de productos (si la usás en otro lado) */}
        <Route path="/products" element={<Products />} />

        {/* Panel de administración */}
        <Route path="/admin" element={<AdminProducts />} />
      </Routes>
    </BrowserRouter>
  );
}
