// src/pages/Stats.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { Link } from "react-router-dom";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function Stats() {
  const [totals, setTotals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [weekId, setWeekId] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);

  // Obtener semana ISO
  function getCurrentISOWeek() {
    const date = new Date();
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    const year = date.getFullYear();
    const start = new Date(year, 0, 1);
    const diff = date - start;
    const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
    return `${year}-${String(week).padStart(2, "0")}`;
  }

  // Cargar semanas disponibles
  const loadWeeks = async () => {
    const snap = await getDocs(collection(db, "orders"));
    const weeks = new Set();
    snap.forEach((d) => {
      if (d.data().weekId) weeks.add(d.data().weekId);
    });
    setAvailableWeeks([...weeks].sort());
  };

  // Cargar pedidos + totales
  const loadWeekData = (wk) => {
    const q = query(
      collection(db, "orders"),
      where("weekId", "==", wk),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snap) => {
      const allOrders = [];
      const totalsMap = {};

      snap.forEach((doc) => {
        const data = doc.data();
        allOrders.push({ id: doc.id, ...data });

        data.cart?.forEach((item) => {
          if (!totalsMap[item.name]) {
            totalsMap[item.name] = {
              name: item.name,
              unit: item.unit,
              icon: item.icon,
              qty: 0,
            };
          }
          totalsMap[item.name].qty += item.qty;
        });
      });

      // Ordenamos así:
      // 👉 Primero manualOrder, después por createdAt
      const sorted = [...allOrders].sort((a, b) => {
        if (a.manualOrder == null && b.manualOrder != null) return 1;
        if (a.manualOrder != null && b.manualOrder == null) return -1;
        if (a.manualOrder != null && b.manualOrder != null)
          return a.manualOrder - b.manualOrder;
        return a.createdAt?.seconds - b.createdAt?.seconds;
      });

      setOrders(sorted);

      setTotals(
        Object.values(totalsMap).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    });
  };

  // Inicializar
  useEffect(() => {
    const wk = getCurrentISOWeek();
    setWeekId(wk);
    loadWeeks();
  }, []);

  useEffect(() => {
    if (!weekId) return;
    const unsub = loadWeekData(weekId);
    return () => unsub();
  }, [weekId]);

  // 🔥 GUARDAR NUEVO ORDEN EN FIRESTORE
  const saveOrder = async (newOrders) => {
    for (let i = 0; i < newOrders.length; i++) {
      const o = newOrders[i];
      try {
        await updateDoc(doc(db, "orders", o.id), {
          manualOrder: i + 1,
        });
      } catch (err) {
        console.error("Error guardando orden:", err);
      }
    }
  };

  // Handler de Drag & Drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const newList = Array.from(orders);
    const [moved] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, moved);

    setOrders(newList);

    await saveOrder(newList); // Guardar automáticamente
  };

  return (
    <div className="max-w-4xl mx-auto p-4">

      <h1 className="text-2xl font-bold text-center mb-4">
        Estadísticas Semanales
      </h1>

      {/* Selector de semana */}
      <div className="mb-6">
        <label className="font-semibold mr-2">Semana:</label>
        <select
          className="border p-2 rounded"
          value={weekId}
          onChange={(e) => setWeekId(e.target.value)}
        >
          {availableWeeks.map((wk) => (
            <option key={wk} value={wk}>
              {wk}
            </option>
          ))}
        </select>
      </div>

      {/* Totales */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Totales</h2>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border text-left">Producto</th>
              <th className="p-2 border text-center">Cantidad</th>
              <th className="p-2 border text-center">Unidad</th>
            </tr>
          </thead>
          <tbody>
            {totals.map((item) => (
              <tr key={item.name} className="text-center">
                <td className="p-2 border text-left flex items-center gap-2">
                  <span>{item.icon}</span> {item.name}
                </td>
                <td className="p-2 border">{item.qty}</td>
                <td className="p-2 border">{item.unit || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 Pedidos con Drag & Drop */}
      <h2 className="text-xl font-semibold mb-2">Pedidos individuales</h2>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="orders">
          {(provided) => (
            <div
              className="space-y-3"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {orders.map((o, i) => (
                <Draggable key={o.id} draggableId={o.id} index={i}>
                  {(provided) => (
                    <div
                      className="p-3 bg-white border rounded-xl shadow-sm hover:shadow-md cursor-grab"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Link to={`/week/${o.id}`}>
                        <div className="font-semibold">
                          Cliente: {o.customerName || "Sin nombre"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {o.cart?.length || 0} productos — Total: ${o.total}
                        </div>
                      </Link>
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
