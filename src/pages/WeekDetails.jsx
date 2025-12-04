// src/pages/WeekDetails.jsx
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useParams, Link } from "react-router-dom";

export default function WeekDetails() {
  const { weekId } = useParams();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), where("weekId", "==", weekId));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);
    });

    return () => unsub();
  }, [weekId]);

  const updateName = async (orderId, newName) => {
    await updateDoc(doc(db, "orders", orderId), {
      customerName: newName,
    });
  };

  const removeOrder = async (orderId) => {
    const ok = window.confirm("¿Eliminar este pedido?");
    if (!ok) return;
    await deleteDoc(doc(db, "orders", orderId));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Pedidos de la semana {weekId}
      </h1>

      <Link
        to="/stats"
        className="px-3 py-2 bg-gray-200 rounded inline-block mb-4"
      >
        ← Volver a estadísticas
      </Link>

      {orders.length === 0 && <p>No hay pedidos esta semana.</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          className="mb-6 p-4 bg-white rounded shadow border border-gray-200"
        >
          <div className="flex justify-between items-center mb-3">
            <input
              type="text"
              placeholder="Nombre del cliente"
              defaultValue={order.customerName}
              className="border p-2 rounded flex-1 mr-4"
              onBlur={(e) => updateName(order.id, e.target.value)}
            />

            <button
              onClick={() => removeOrder(order.id)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Borrar
            </button>
          </div>

          <div className="text-sm">
            {order.cart.map((i) => (
              <p key={i.name}>
                • {i.name} x {i.qty}
                {i.weighed && " (a pesar)"}
                {i.extra && " (EXTRA)"}
              </p>
            ))}
          </div>

          <p className="mt-3 font-semibold">
            Subtotal: ${order.subtotal} — Envío: ${order.envio}
          </p>

          <p className="font-bold">Total: ${order.total}</p>
        </div>
      ))}
    </div>
  );
}
