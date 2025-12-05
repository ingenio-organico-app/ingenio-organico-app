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
import { Link } from "react-router-dom";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

// Orden auxiliar
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
  const [showAddPanel, setShowAddPanel] = useState(false);

  // Cargar productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "products"));
      const list = snapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      }));
      setProducts(list);
    } catch (e) {
      console.error("Error al obtener productos:", e);
      alert("Error cargando productos");
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
      const newValue = prod.available === false ? true : !prod.available;
      await updateDoc(doc(db, "products", prod.id), {
        available: newValue,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id ? { ...p, available: newValue } : p
        )
      );
    } catch (e) {
      console.error(e);
      alert("Error al cambiar disponibilidad");
    }
  };

  // Eliminar producto
  const deleteProduct = async (prod) => {
    if (!window.confirm(`¿Eliminar "${prod.name}"?`)) return;

    try {
      if (prod.image) {
        try {
          await deleteObject(ref(storage, prod.image));
        } catch (e) {
          console.warn("No se pudo borrar imagen:", e);
        }
      }

      await deleteDoc(doc(db, "products", prod.id));
      setProducts((prev) => prev.filter((p) => p.id !== prod.id));
    } catch (e) {
      console.error(e);
      alert("Error al eliminar producto");
    }
  };

  // 🔥 Guardar orden al soltar
  const saveOrderToFirestore = async (items) => {
    try {
      await Promise.all(
        items.map((p, idx) =>
          updateDoc(doc(db, "products", p.id), {
            order: idx,
          })
        )
      );
    } catch (err) {
      console.error("Error guardando orden:", err);
    }
  };

  // Drag & Drop handler
  const onDragEnd = async (result, groupType) => {
    if (!result.destination) return;

    const group = products
      .filter((p) => (!!p.extra === (groupType === "extra")))
      .sort(sortByOrder);

    const newList = Array.from(group);
    const [moved] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, moved);

    // Guardar en Firestore
    await saveOrderToFirestore(newList);

    // Actualizar estado global
    setProducts((prev) =>
      prev.map((p) => {
        const newPos = newList.findIndex((g) => g.id === p.id);
        return newPos !== -1 ? { ...p, order: newPos } : p;
      })
    );
  };

  if (loading) return <p>Cargando productos...</p>;

  const general = products.filter((p) => !p.extra).sort(sortByOrder);
  const extra = products.filter((p) => p.extra).sort(sortByOrder);

  // Render fila
  const renderRow = (prod) => (
    <div className="grid grid-cols-5 gap-2 p-2 border-b bg-white rounded">
      <div>{prod.name}</div>
      <div>{typeof prod.price === "number" ? `$${prod.price}` : "—"}</div>
      <div>{prod.available === false ? "❌" : "✅"}</div>

      <div className="flex gap-1">
        <button
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
          onClick={() => toggleAvailable(prod)}
        >
          Disponibilidad
        </button>

        <button
          className="px-2 py-1 text-xs bg-orange-500 text-white rounded"
          onClick={() => setEditingProduct(prod)}
        >
          Editar
        </button>

        <button
          className="px-2 py-1 text-xs bg-red-600 text-white rounded"
          onClick={() => deleteProduct(prod)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">Admin de productos</h1>

      {editingProduct && (
        <EditProduct
          product={editingProduct}
          onSaved={(updated) => {
            setProducts((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            setEditingProduct(null);
          }}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {/* Botones principales */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <Link
          to="/stats"
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Ver estadísticas
        </Link>

        <Link
          to="/"
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Ir a la tienda
        </Link>

        <button
          onClick={() => setShowAddPanel(!showAddPanel)}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          {showAddPanel ? "Cerrar panel" : "Agregar producto nuevo"}
        </button>

        <button
          onClick={async () => {
            setUploading(true);
            await uploadProducts();
            await fetchProducts();
            setUploading(false);
          }}
          disabled={uploading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-500"
        >
          {uploading ? "Subiendo..." : "Subir lista completa"}
        </button>
      </div>

      {showAddPanel && (
        <div className="mb-6">
          <UploadProducts onProductAdded={fetchProducts} />
        </div>
      )}

      {/* LISTA GENERAL */}
      <h2 className="text-xl font-semibold mb-2">Lista General</h2>

      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, "general")}
      >
        <Droppable droppableId="general">
          {(provided) => (
            <div
              className="bg-white/40 backdrop-blur-sm p-3 rounded-xl mb-6 border"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {general.map((p, i) => (
                <Draggable key={p.id} draggableId={p.id} index={i}>
                  {(provided) => (
                    <div
                      className="cursor-grab"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {renderRow(p)}
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* EXTRAS */}
      <h2 className="text-xl font-semibold mb-2">Productos Extra</h2>

      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, "extra")}
      >
        <Droppable droppableId="extra">
          {(provided) => (
            <div
              className="bg-white/40 backdrop-blur-sm p-3 rounded-xl border"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {extra.map((p, i) => (
                <Draggable key={p.id} draggableId={p.id} index={i}>
                  {(provided) => (
                    <div
                      className="cursor-grab"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {renderRow(p)}
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
