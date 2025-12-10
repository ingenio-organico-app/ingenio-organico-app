// src/pages/WeekDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default function WeekDetails() {
  const { weekId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar pedido
  useEffect(() => {
    async function load() {
      try {
        const ref = doc(db, "orders", weekId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setOrder(data);
          setCustomerName(data.customerName || "");
        }
      } catch (err) {
        console.error("Error cargando pedido:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [weekId]);

  if (loading) return <div className="p-4">Cargando...</div>;
  if (!order) return <div className="p-4">Pedido no encontrado.</div>;

  const total = order.subtotal + order.envio;

  // Guardar edición del nombre
  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "orders", weekId), {
        customerName: customerName.trim(),
      });
      alert("Nombre actualizado ✔");
    } catch (err) {
      alert("Error al guardar");
      console.error(err);
    }
  };

  // Eliminar pedido
  const handleDelete = async () => {
    if (!confirm("¿Seguro que querés eliminar este pedido?")) return;

    try {
      await deleteDoc(doc(db, "orders", weekId));
      alert("Pedido eliminado ✔");
      navigate("/stats");
    } catch (err) {
      alert("No se pudo eliminar");
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">
        Pedido de {customerName || "Sin nombre"}
      </h1>

      {/* Totales */}
      <p className="text-gray-700 mb-1">Subtotal: ${order.subtotal}</p>
      <p className="text-gray-700 mb-1">Envío: ${order.envio}</p>
      <p className="text-lg font-semibold mt-2 mb-4">Total: ${total}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Productos</h2>

      <div className="space-y-2">
        {order.cart?.map((item, i) => (
          <div
            key={i}
            className="p-3 bg-white shadow rounded border flex justify-between"
          >
            <div>
              {item.name}
              {item.extra && (
                <span className="ml-2 text-purple-600 text-xs">(EXTRA)</span>
              )}
              {item.weighed && (
                <span className="ml-2 text-orange-600 text-xs">(a pesar)</span>
              )}
            </div>

            <div>
              {item.qty} {item.unit || ""}
            </div>
          </div>
        ))}
      </div>

      {/* Editar nombre */}
      <h2 className="text-xl font-semibold mt-8 mb-2">Datos del cliente</h2>

      <input
        type="text"
        className="w-full border p-2 rounded mb-3"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Nombre del cliente"
      />

      <button
        className="w-full bg-emerald-600 text-white py-2 rounded mb-3"
        onClick={handleSave}
      >
        Guardar nombre
      </button>

      {/* Eliminar */}
      <button
        className="w-full bg-red-600 text-white py-2 rounded mb-3"
        onClick={handleDelete}
      >
        Eliminar pedido
      </button>

      {/* Volver */}
      <button
        className="w-full bg-gray-500 text-white py-2 rounded"
        onClick={() => navigate("/stats")}
      >
        Volver
      </button>
    </div>
  );
}
