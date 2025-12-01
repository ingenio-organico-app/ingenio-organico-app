// src/pages/AdminProducts.jsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import { uploadProducts } from "../firebase/uploadProducts";
import UploadProducts from "./UploadProducts";
import EditProduct from "./EditProduct";
import { ref, deleteObject } from "firebase/storage";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "products"));

    const prods = snapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleAvailable = async (id, current) => {
    await updateDoc(doc(db, "products", id), {
      available: !current
    });

    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, available: !current } : p))
    );
  };

  const deleteProduct = async prod => {
    const ok = confirm(`¿Eliminar "${prod.name}"?`);
    if (!ok) return;

    try {
      if (prod.image) {
        const imgRef = ref(storage, prod.image);
        await deleteObject(imgRef).catch(() => {});
      }

      await deleteDoc(doc(db, "products", prod.id));

      setProducts(prev => prev.filter(p => p.id !== prod.id));

      alert("Producto eliminado ✔");
    } catch (err) {
      console.error(err);
      alert("❌ Error al eliminar producto");
    }
  };

  const handleUploadProducts = async () => {
    setUploading(true);
    const added = await uploadProducts();
    alert(`${added} productos nuevos subidos`);
    await fetchProducts();
    setUploading(false);
  };

  if (loading) return <p>Cargando productos...</p>;

  const generalProducts = products.filter(p => !p.extra);
  const extraProducts = products.filter(p => p.extra);

  const renderRow = prod => (
    <tr key={prod.id} className="text-center">
      <td className="p-2 border">{prod.name}</td>
      <td className="p-2 border">{prod.available ? "✅" : "❌"}</td>
      <td className="p-2 border space-x-2">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => toggleAvailable(prod.id, prod.available)}
        >
          Disponibilidad
        </button>

        <button
          className="px-3 py-1 bg-amber-500 text-white rounded"
          onClick={() => setEditingProduct(prod)}
        >
          Editar
        </button>

        <button
          className="px-3 py-1 bg-red-600 text-white rounded"
          onClick={() => deleteProduct(prod)}
        >
          Eliminar
        </button>
      </td>
    </tr>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">Administrar Productos</h1>

      {editingProduct && (
        <EditProduct
          product={editingProduct}
          onSaved={updated => {
            setProducts(prev =>
              prev.map(p => (p.id === updated.id ? updated : p))
            );
            setEditingProduct(null);
          }}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      <UploadProducts onProductAdded={fetchProducts} />

      <div className="mb-4">
        <button
          onClick={handleUploadProducts}
          disabled={uploading}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {uploading ? "Subiendo..." : "Subir lista completa"}
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Productos Generales</h2>
      <table className="w-full border mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Disponible</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>{generalProducts.map(renderRow)}</tbody>
      </table>

      <h2 className="text-xl font-semibold mb-2">Productos Extra</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Disponible</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>{extraProducts.map(renderRow)}</tbody>
      </table>
    </div>
  );
}
