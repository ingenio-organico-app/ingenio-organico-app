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

// Orden: primero por "order", si no existe se manda al final.
// En empate, orden alfabético por nombre.
const sortByOrder = (a, b) => {
  const ao = typeof a.order === "number" ? a.order : 999999;
  const bo = typeof b.order === "number" ? b.order : 999999;
  if (ao !== bo) return ao - bo;
  return (a.name || "").localeCompare(b.name || "");
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false); // panel desplegable

  // Cargar productos desde Firestore
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "products"));

      const list = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id, // id real del documento
          originalId: data.id ?? null, // opcional, id viejo numérico si existía
        };
      });

      setProducts(list);
    } catch (e) {
      console.error("Error al obtener productos:", e);
      alert("Error cargando productos: " + (e.message || e));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Cambiar disponibilidad
  const toggleAvailable = async (prod) => {
    try {
      const current = prod.available;
      const newValue = current === false ? true : !current;

      await updateDoc(doc(db, "products", prod.id), {
        available: newValue,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id ? { ...p, available: newValue } : p
        )
      );
    } catch (e) {
      console.error("Error al cambiar disponibilidad:", e);
      alert("Error al cambiar disponibilidad: " + (e.message || e));
    }
  };

  // Eliminar producto (y su imagen si tiene)
  const deleteProduct = async (prod) => {
    const ok = window.confirm(`¿Eliminar "${prod.name}"?`);
    if (!ok) return;

    try {
      if (prod.image) {
        try {
          await deleteObject(ref(storage, prod.image));
        } catch (e) {
          console.warn("No se pudo borrar imagen (puede no existir):", e);
        }
      }

      await deleteDoc(doc(db, "products", prod.id));

      setProducts((prev) => prev.filter((p) => p.id !== prod.id));
      alert("Producto eliminado ✔");
    } catch (e) {
      console.error("Error al eliminar producto:", e);
      alert("Error al eliminar producto: " + (e.message || e));
    }
  };

  // Mover producto arriba/abajo dentro de su grupo (general/extra)
  const moveProduct = async (prod, direction) => {
    try {
      const isExtra = !!prod.extra;

      // Grupo donde pertenece (general o extra)
      const group = products
        .filter((p) => !!p.extra === isExtra)
        .sort(sortByOrder);

      const index = group.findIndex((p) => p.id === prod.id);
      if (index === -1) return;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= group.length) return;

      // Nuevo array con el producto movido
      const newGroup = [...group];
      const temp = newGroup[index];
      newGroup[index] = newGroup[targetIndex];
      newGroup[targetIndex] = temp;

      // Asignar orden consecutivo a TODO el grupo
      const newGroupWithOrder = newGroup.map((p, idx) => ({
        ...p,
        order: idx,
      }));

      // Guardar en Firestore
      await Promise.all(
        newGroupWithOrder.map((p) =>
          updateDoc(doc(db, "products", p.id), { order: p.order })
        )
      );

      // Actualizar estado local
      setProducts((prev) =>
        prev.map((p) => {
          const updated = newGroupWithOrder.find((g) => g.id === p.id);
          return updated ? { ...p, order: updated.order } : p;
        })
      );
    } catch (e) {
      console.error("Error al cambiar orden:", e);
      alert("Error al cambiar orden: " + (e.message || e));
    }
  };

  // Subir lista de data/products.js
  const handleUploadProducts = async () => {
    try {
      setUploading(true);
      const added = await uploadProducts();
      alert(
        added > 0
          ? `${added} productos nuevos subidos`
          : "No había productos nuevos para subir"
      );
      await fetchProducts();
    } catch (e) {
      console.error("Error en uploadProducts:", e);
      alert("Error al subir lista de productos: " + (e.message || e));
    } finally {
      setUploading(false);
    }
  };

  // Cuando se guarda un producto desde EditProduct
  const handleUpdated = (updated) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setEditingProduct(null);
  };

  if (loading) return <p>Cargando productos...</p>;

  const general = products.filter((p) => !p.extra).sort(sortByOrder);
  const extra = products.filter((p) => p.extra).sort(sortByOrder);

  const renderRow = (prod, idx, groupLength) => (
    <tr key={prod.id} className="text-center">
      <td className="border p-2 text-left">{prod.name ?? "—"}</td>
      <td className="border p-2">
        {typeof prod.price === "number" ? `$${prod.price}` : "—"}
      </td>
      <td className="border p-2">
        {prod.available === false ? "❌" : "✅"}
      </td>

      <td className="border p-2">
        <button
          className="px-2 border rounded mr-1 disabled:opacity-40"
          disabled={idx === 0}
          onClick={() => moveProduct(prod, "up")}
          title="Subir"
        >
          ↑
        </button>
        <button
          className="px-2 border rounded disabled:opacity-40"
          disabled={idx === groupLength - 1}
          onClick={() => moveProduct(prod, "down")}
          title="Bajar"
        >
          ↓
        </button>
      </td>

      <td className="border p-2 space-x-1">
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          onClick={() => toggleAvailable(prod)}
        >
          Disponibilidad
        </button>

        <button
          className="px-2 py-1 bg-orange-500 text-white rounded text-xs"
          onClick={() => setEditingProduct(prod)}
        >
          Editar
        </button>

        <button
          className="px-2 py-1 bg-red-600 text-white rounded text-xs"
          onClick={() => deleteProduct(prod)}
        >
          Eliminar
        </button>
      </td>
    </tr>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin de productos</h1>

      {/* PANEL DE EDICIÓN */}
      {editingProduct && (
        <EditProduct
          product={editingProduct}
          onSaved={handleUpdated}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {/* BOTÓN PARA MOSTRAR/OCULTAR PANEL DE AGREGAR */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowAddPanel((prev) => !prev)}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          {showAddPanel
            ? "Cerrar panel de nuevo producto"
            : "Agregar producto nuevo"}
        </button>

        <button
          onClick={handleUploadProducts}
          disabled={uploading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-500"
        >
          {uploading ? "Subiendo lista..." : "Subir lista completa"}
        </button>
      </div>

      {/* PANEL DESPLEGABLE DE NUEVO PRODUCTO */}
      {showAddPanel && (
        <div className="mb-6">
          <UploadProducts onProductAdded={fetchProducts} />
        </div>
      )}

      {/* LISTA GENERAL CON FONDO TRANSLÚCIDO */}
      <h2 className="text-xl font-semibold mt-2 mb-2">Lista General</h2>
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 mb-6">
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border text-left">Nombre</th>
              <th className="p-2 border">Precio</th>
              <th className="p-2 border">Disp.</th>
              <th className="p-2 border">Orden</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {general.map((p, i) => renderRow(p, i, general.length))}
          </tbody>
        </table>
      </div>

      {/* PRODUCTOS EXTRA CON FONDO TRANSLÚCIDO */}
      <h2 className="text-xl font-semibold mt-2 mb-2">Productos Extra</h2>
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border text-left">Nombre</th>
              <th className="p-2 border">Precio</th>
              <th className="p-2 border">Disp.</th>
              <th className="p-2 border">Orden</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {extra.map((p, i) => renderRow(p, i, extra.length))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
