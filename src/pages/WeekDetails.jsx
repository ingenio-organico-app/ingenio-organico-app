// src/pages/WeekDetails.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

export default function WeekDetails() {
  const { weekId } = useParams(); // en realidad acá recibimos el ID DEL PEDIDO
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    async function load() {
      const ref = doc(db, "orders", weekId);
      const snap = await getDoc(ref);

      if (!snap.exists()) return;
      const data = snap.data();
      setOrder({ id: snap.id, ...data });
      setCustomerName(data.customerName || "");
    }
    load();
  }, [weekId]);

  const saveName = async () => {
    await updateDoc(doc(db, "orders", weekId), {
      customerName,
    });
    alert("Nombre actualizado ✔");
  };

  const deleteOrder = async () => {
    if (!confirm("¿Eliminar este pedido?")) return;
    await deleteDoc(doc(db, "orders", weekId));
    alert("Pedido eliminado ✔");
    navigate("/stats");
  };

  if (!order) return <p>Cargando...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pedido</h1>

      <div className="mb-4">
        <label className="font-semibold">Cliente:</label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border p-2 rounded ml-2"
        />
        <button
          onClick={saveName}
          className="ml-3 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Guardar
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Productos</h2>

      <ul className="space-y-2">
        {order.cart?.map((item, i) => (
          <li key={i} className="border p-2 rounded">
            {item.name} — x{item.qty}
          </li>
        ))}
      </ul>

      <p className="mt-4 font-bold">Subtotal: ${order.subtotal}</p>
      <p className="font-bold">Envío: ${order.envio}</p>
      <p className="font-bold">Total: ${order.total}</p>

      <button
        onClick={deleteOrder}
        className="mt-5 w-full bg-red-500 text-white py-2 rounded"
      >
        Eliminar pedido
      </button>
    </div>
  );
}
