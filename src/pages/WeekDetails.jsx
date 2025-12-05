// src/pages/WeekDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function WeekDetails() {
  const { weekId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "orders", weekId));
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    }
    load();
  }, [weekId]);

  if (!order) return <div className="p-4">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">
        Pedido de {order.customerName || "Sin nombre"}
      </h1>

      <p className="mb-3 text-gray-700">
        Total: ${order.total}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Productos</h2>

      <div className="space-y-2">
        {order.cart?.map((item) => (
          <div
            key={item.name}
            className="p-3 bg-white shadow rounded border flex justify-between"
          >
            <div>{item.name}</div>
            <div>
              {item.qty} {item.unit || ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
