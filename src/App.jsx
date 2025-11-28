import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Store from "./pages/Store";
import AdminProducts from "./pages/AdminProducts";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/admin" element={<AdminProducts />} />
      </Routes>
    </Router>
  );
}
