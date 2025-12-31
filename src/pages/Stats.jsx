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

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Stats() {
  const [totals, setTotals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [weekId, setWeekId] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);

  // Obtener semana ISO actual
  function getCurrentISOWeek() {
    const date = new Date();
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    const year = date.getFullYear();
    const start = new Date(year, 0, 1);
    const diff = date - start;
    const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
    return `${year}-${String(week).padStart(2, "0")}`;
  }

  // Etiqueta de unidad para “lista de cosecha”
  const getUnitLabel = (item) => {
    const u = item?.unit || "unidad";
    if (u === "gr") {
      const ga = item?.gramAmount;
      return ga ? `${ga}gr` : "gr";
    }
    if (u === "kg") return "kg";
    if (u === "atado") return "atado";
    if (u === "unidad") return "unidad";
    return u; // por si aparece otra unidad
  };

  // Cargar semanas disponibles
  const loadWeeks = async () => {
    const snap = await getDocs(collection(db, "orders"));
    const weeks = new Set();
    snap.forEach((d) => {
      if (d.data().weekId) weeks.add(d.data().weekId);
    });
    setAvailableWeeks([...weeks].sort());
  };

  // Cargar pedidos + totales de una semana
  const loadWeekData = (wk) => {
    const q = query(
      collection(db, "orders"),
      where("weekId", "==", wk),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snap) => {
      const allOrders = [];
      const totalsMap = {};

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const order = { id: docSnap.id, ...data };
        allOrders.push(order);

        // Sumar totales por producto a partir de cart
        order.cart?.forEach((item) => {
          const key = item.name; // asumimos nombre único por producto
          if (!totalsMap[key]) {
            totalsMap[key] = {
              name: item.name,
              icon: item.icon,
              unitLabel: getUnitLabel(item),
              qty: 0,
            };
          }
          totalsMap[key].qty += item.qty || 0;
        });
      });

      // Ordenar pedidos: primero manualOrder, luego por createdAt
      const sorted = [...allOrders].sort((a, b) => {
        if (a.manualOrder == null && b.manualOrder != null) return 1;
        if (a.manualOrder != null && b.manualOrder == null) return -1;
        if (a.manualOrder != null && b.manualOrder != null)
          return a.manualOrder - b.manualOrder;
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      });

      setOrders(sorted);

      // ✅ Totales alfabético A-Z
      setTotals(
        Object.values(totalsMap).sort((a, b) => a.name.localeCompare(b.name))
      );
    });
  };

  // Inicializar semana y lista de semanas
  useEffect(() => {
    const wk = getCurrentISOWeek();
    setWeekId(wk);
    loadWeeks();
  }, []);

  // Suscribirse a los datos de la semana seleccionada
  useEffect(() => {
    if (!weekId) return;
    const unsub = loadWeekData(weekId);
    return () => unsub();
  }, [weekId]);

  // Guardar nuevo orden de pedidos (drag & drop)
  const saveOrder = async (newOrders) => {
    for (let i = 0; i < newOrders.length; i++) {
      const o = newOrders[i];
      try {
        await updateDoc(doc(db, "orders", o.id), { manualOrder: i + 1 });
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
    await saveOrder(newList);
  };

  // Stats generales
  const totalPedidos = orders.length;
  const totalItems = orders.reduce(
    (sum, o) =>
      sum + (o.cart?.reduce((acc, item) => acc + (item.qty || 0), 0) || 0),
    0
  );
  const totalRecaudado = orders.reduce(
    (sum, o) => sum + (o.subtotal || 0) + (o.envio || 0),
    0
  );

  // Construir resumen de totales para copiar
  const buildSummaryText = () => {
    let text = `Resumen semana ${weekId}\n\n`;
    text += `Pedidos: ${totalPedidos}\n`;
    text += `Total ítems: ${totalItems}\n`;
    text += `Total recaudado: $${totalRecaudado}\n\n`;
    text += `Totales por producto:\n`;
    totals.forEach((t) => {
      text += `- ${t.name} (${t.unitLabel || "-" }): ${t.qty}\n`;
    });
    return text;
  };

  const handleCopySummary = async () => {
    const text = buildSummaryText();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        alert("Resumen copiado al portapapeles ✔");
      } else {
        window.prompt("Copiá el resumen:", text);
      }
    } catch (err) {
      console.error("Error copiando resumen:", err);
      window.prompt("Copiá el resumen:", text);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        Estadísticas Semanales
      </h1>

      {/* Selector de semana */}
      <div className="mb-6 flex items-center gap-3">
        <div>
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

        {/* Stats generales */}
        <div className="text-sm text-gray-700 flex-1 text-right">
          <div>Pedidos: {totalPedidos}</div>
          <div>Ítems totales: {totalItems}</div>
          <div>Total recaudado: ${totalRecaudado}</div>
        </div>
      </div>

      {/* Totales por producto */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Totales</h2>
          <button
            onClick={handleCopySummary}
            className="text-sm px-3 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Copiar resumen
          </button>
        </div>

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
                  {item.icon && <span>{item.icon}</span>}
                  {item.name}
                </td>
                <td className="p-2 border">{item.qty}</td>
                <td className="p-2 border">{item.unitLabel || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pedidos individuales con Drag & Drop */}
      <h2 className="text-xl font-semibold mb-2">Pedidos individuales</h2>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="orders">
          {(provided) => (
            <div
              className="space-y-3"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {orders.map((o, i) => {
                const total = (o.subtotal || 0) + (o.envio || 0);

                return (
                  <Draggable key={o.id} draggableId={o.id} index={i}>
                    {(provided) => (
                      <div
                        className="p-3 bg-white border rounded-xl shadow-sm hover:shadow-md cursor-grab"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Link to={`/stats/${o.id}`}>
                          <div className="font-semibold">
                            Cliente: {o.customerName || "Sin nombre"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {o.cart?.length || 0} productos — Total: ${total}
                          </div>
                        </Link>
                      </div>
                    )}
                  </Draggable>
                );
              })}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
