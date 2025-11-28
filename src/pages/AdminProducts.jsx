// src/pages/AdminProducts.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { uploadProducts as uploadProductsFunc } from "../firebase/uploadProducts";
import UploadProducts from "./UploadProducts";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, "products");
      const snapshot = await getDocs(colRef);

      const result = snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? "—",
            available: !!data.available,
            extra: !!data.extra,
            weighed: !!data.weighed,
            icon: data.icon ?? "❔",
            price: data.price ?? 0,
            unit: data.unit ?? "unidad",
            image: data.image ?? "",
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      setProducts(result);
    } catch (err) {
      console.error("Error fetchProducts:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleAvailable = async (prodId, current) => {
    try {
      const docRef = doc(db, "products", prodId);
      await updateDoc(docRef, { available: !current });
      setProducts((prev) =>
        prev.map((p) => (p.id === prodId ? { ...p, available: !current } : p))
      );
    } catch (err) {
      console.error("Error toggleAvailable:", err);
      alert("Error al cambiar disponibilidad");
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!confirm("¿Querés eliminar este producto?")) return;
    try {
      await deleteDoc(doc(db, "products", prodId));
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
    } catch (err) {
      console.error("Error deleteProduct:", err);
      alert("Error al eliminar producto");
    }
  };

  const handleUploadProducts = async () => {
    setUploading(true);
    try {
      await uploadProductsFunc();
      alert("✔ Lista de productos subida correctamente");
      await fetchProducts();
    } catch (error) {
      console.error("Error subir lista:", error);
      alert("❌ Error al subir productos");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Cargando productos...</p>;

  const generalProducts = products.filter((p) => !p.extra);
  const extraProducts = products.filter((p) => p.extra);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Administrar Productos</h1>

      <UploadProducts onProductAdded={fetchProducts} />

      <div className="mb-4">
        <button
          onClick={handleUploadProducts}
          disabled={uploading}
          className={`px-4 py-2 rounded text-white ${
            uploading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {uploading ? "Subiendo lista..." : "Subir lista completa de productos"}
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Productos Generales</h2>
      <table className="w-full border mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Disponible</th>
            <th className="p-2 border">Acción</th>
          </tr>
        </thead>
        <tbody>
          {generalProducts.map((prod) => (
            <tr key={prod.id} className="text-center">
              <td className="p-2 border">{prod.name}</td>
              <td className="p-2 border">{prod.available ? "✅" : "❌"}</td>
              <td className="p-2 border space-x-2">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => toggleAvailable(prod.id, prod.available)}
                >
                  Cambiar
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDeleteProduct(prod.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-2">Productos Extra</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Disponible</th>
            <th className="p-2 border">Acción</th>
          </tr>
        </thead>
        <tbody>
          {extraProducts.map((prod) => (
            <tr key={prod.id} className="text-center">
              <td className="p-2 border">{prod.name}</td>
              <td className="p-2 border">{prod.available ? "✅" : "❌"}</td>
              <td className="p-2 border space-x-2">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => toggleAvailable(prod.id, prod.available)}
                >
                  Cambiar
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDeleteProduct(prod.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
