import { BrowserRouter, Routes, Route } from "react-router-dom";

import Store from "./pages/Store";
import AdminProducts from "./pages/AdminProducts";
import Stats from "./pages/Stats";
import WeekDetails from "./pages/WeekDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🟢 PÁGINA PRINCIPAL */}
        <Route path="/" element={<Store />} />

        {/* 🟣 ADMIN DE PRODUCTOS */}
        <Route path="/admin" element={<AdminProducts />} />

        {/* 📊 ESTADÍSTICAS GENERALES DE LA SEMANA */}
        <Route path="/stats" element={<Stats />} />

        {/* 📋 DETALLE POR SEMANA */}
        <Route path="/stats/:weekId" element={<WeekDetails />} />

      </Routes>
    </BrowserRouter>
  );
}
