// src/pages/AdminProducts.jsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
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

  const sortByOrder = (a, b) => {
    const ao = typeof a.order === "number" ? a.order : 999999;
    const bo = typeof b.order === "number" ? b.order : 999999;
    if (ao !== bo) return ao - bo;
    return (a.name || "").localeCompare(b.name || "");
  };

  const fetchProducts = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "products"));

    const prods = snapshot.docs
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      .filter((p) => p.name)
      .sort(sortByOrder);

    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleAvailable = async (id, current) => {
    await updateDoc(doc(db, "products", id), {
      available: !current,
    });

    setProducts((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, available: !current } : p))
        .sort(sortByOrder)
    );
  };

  const deleteProduct = async (prod) => {
    const ok = window.confirm(`¿Eliminar "${prod.name}"?`);
    if (!ok) return;

    try {
      if (prod.image) {
        const imgRef = ref(storage, prod.image);
        await deleteObject(imgRef).catch(() => {});
      }

      await deleteDoc(doc(db, "products", prod.id));

      setProducts((prev) => prev.filter((p) => p.id !== prod.id));

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

  // Cambiar orden ↑ / ↓
  const changeOrder = async (prod, direction) => {
    const currentOrder =
      typeof prod.order === "number" ? prod.order : 999999;
    const delta = direction === "up" ? -1 : 1;
    const newOrder = currentOrder + delta;

    try {
      await updateDoc(doc(db, "products", prod.id), { order: newOrder });

      setProducts((prev) =>
        prev
          .map((p) =>
            p.id === prod.id ? { ...p, order: newOrder } : p
          )
          .sort(sortByOrder)
      );
    } catch (err) {
      console.error("Error cambiando orden:", err);
      alert("❌ No se pudo cambiar el orden");
    }
  };

  if (loading) return <p>Cargando productos...</p>;

  const generalProducts = products.filter((p) => !p.extra);
  const extraProducts = products.filter((p) => p.extra);

  const renderRow = (prod) => (
    <tr key={prod.id} className="text-center">
      <td className="p-2 border">{prod.name}</td>
      <td className="p-2 border">{prod.available ? "✅" : "❌"}</td>

      <td className="p-2 border">
        {typeof prod.order === "number" ? prod.order : "—"}
      </td>

      <td className="p-2 border space-x-2">
        <button
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => changeOrder(prod, "up")}
        >
          ↑
        </button>
        <button
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => changeOrder(prod, "down")}
        >
          ↓
        </button>
      </td>

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
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Administrar Productos</h1>

      {editingProduct && (
        <EditProduct
          product={editingProduct}
          onSaved={(updated) => {
            setProducts((prev) =>
              prev
                .map((p) => (p.id === updated.id ? updated : p))
                .sort(sortByOrder)
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
      <table className="w-full border mb-6 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Disp.</th>
            <th className="p-2 border">Orden</th>
            <th className="p-2 border">Mover</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>{generalProducts.map(renderRow)}</tbody>
      </table>

      <h2 className="text-xl font-semibold mb-2">Productos Extra</h2>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Disp.</th>
            <th className="p-2 border">Orden</th>
            <th className="p-2 border">Mover</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>{extraProducts.map(renderRow)}</tbody>
      </table>
    </div>
  );
}
