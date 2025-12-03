import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

// 🔥 Importamos estadísticas semanales
import { useWeeklyStats } from "../firebase/stats";

import { uploadProducts } from "../firebase/uploadProducts";

export default function Admin() {
  const [passwordInput, setPasswordInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const ADMIN_PASSWORD = "admin";

  // Listener de estadísticas
  const weekly = useWeeklyStats();

  // Validar clave
  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      fetchProducts();
    } else {
      alert("Clave incorrecta");
    }
  };

  // Traer productos desde Firestore
  const fetchProducts = async () => {
    setLoading(true);
    const colRef = collection(db, "products");
    const snapshot = await getDocs(colRef);
    const prods = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProducts(prods);
    setLoading(false);
  };

  // Cambiar disponibilidad
  const toggleAvailable = async (prodId, current) => {
    const docRef = doc(db, "products", prodId);
    await updateDoc(docRef, { available: !current });
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, available: !current } : p))
    );
  };

  // Subir productos desde archivo
  const handleUpload = async () => {
    setUploading(true);
    try {
      await uploadProducts();
      alert("✔ Productos subidos con éxito");
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("❌ Error al subir productos");
    } finally {
      setUploading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto p-4 mt-20">
        <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>
        <input
          type="password"
          placeholder="Ingresa la clave"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={handleLogin}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ingresar
        </button>
      </div>
    );
  }

  if (loading) return <p className="text-center mt-10">Cargando productos...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
<h1 style={{ color: "red" }}>PRUEBA ADMIN</h1>

      <h1 className="text-2xl font-bold mb-6 text-center">
        Administrar Productos
      </h1>

      {/* Botón subir productos */}
      <div className="mb-8 text-center">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`px-4 py-2 rounded text-white ${
            uploading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {uploading ? "Subiendo..." : "Subir productos"}
        </button>
      </div>

      {/* ✅ TABLA CON FONDO TRANSLÚCIDO PREMIUM */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 mb-10">

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Disponible</th>
              <th className="p-2 border">Acción</th>
            </tr>
          </thead>

          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} className="text-center">
                <td className="p-2 border">{prod.name}</td>
                <td className="p-2 border">{prod.available ? "✅" : "❌"}</td>
                <td className="p-2 border">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => toggleAvailable(prod.id, prod.available)}
                  >
                    Cambiar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* 🔥 ESTADÍSTICAS SEMANALES CON ESTILO PREMIUM */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
        <h2 className="text-xl font-bold mb-3 text-center">
          📅 Estadísticas Semanales
        </h2>

        <p className="text-center mb-2">
          <strong>Semana actual:</strong> {weekly.week}
        </p>

        <p className="text-center">
          <strong>Pedidos totales:</strong> {weekly.totalOrders}
        </p>

        <p className="text-center mb-4">
          <strong>Total vendido:</strong> ${weekly.totalRevenue}
        </p>

        <h3 className="font-semibold mb-2">Productos vendidos:</h3>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Producto</th>
              <th className="p-2 border">Cantidad</th>
            </tr>
          </thead>

          <tbody>
            {weekly.products.length === 0 && (
              <tr>
                <td colSpan="2" className="p-2 text-center">
                  Sin pedidos esta semana
                </td>
              </tr>
            )}

            {weekly.products.map((p) => (
              <tr key={p.name}>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border text-center">{p.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
