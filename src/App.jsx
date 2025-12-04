// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Store from "./pages/Store";
import Products from "./pages/Products";
import AdminProducts from "./pages/AdminProducts";
import Stats from "./pages/Stats";
import WeekDetails from "./pages/WeekDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/products" element={<Products />} />
        <Route path="/admin" element={<AdminProducts />} />

        {/* Estadísticas */}
        <Route path="/stats" element={<Stats />} />
        <Route path="/stats/week/:weekId" element={<WeekDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
