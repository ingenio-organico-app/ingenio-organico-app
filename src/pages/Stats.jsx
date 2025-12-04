// src/pages/Stats.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { Link } from "react-router-dom";

export default function Stats() {
  const [totals, setTotals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [weekId, setWeekId] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);

  // 🔥 Obtener semana ISO
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

  // Cargar totales + pedidos de la semana
  const loadWeekData = (wk) => {
    const q = query(
      collection(db, "orders"),
      where("weekId", "==", wk)
      // ❌ NUNCA orderBy ACA → rompe Firestore sin index
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

      setOrders(allOrders);
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

  // Listener
  useEffect(() => {
    if (!weekId) return;
    const unsub = loadWeekData(weekId);
    return () => unsub();
  }, [weekId]);

  // 📤 Enviar resumen semanal por WhatsApp
  const sendWeeklySummary = () => {
    const msg =
      `Resumen semanal (${weekId}):\n\n` +
      totals
        .map((t) => `• ${t.name}: ${t.qty} ${t.unit || ""}`)
        .join("\n");

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
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

        <button
          onClick={sendWeeklySummary}
          className="mt-4 py-2 w-full bg-green-600 text-white rounded-lg"
        >
          Enviar resumen por WhatsApp
        </button>
      </div>

      {/* Pedidos */}
      <h2 className="text-xl font-semibold mb-2">Pedidos individuales</h2>

      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            to={`/stats/${o.id}`}
            className="block p-3 bg-white border rounded-xl shadow-sm hover:shadow-md"
          >
            <div className="font-semibold">
              Cliente: {o.customerName || "Sin nombre"}
            </div>
            <div className="text-sm text-gray-600">
              {o.cart?.length || 0} productos — Total: ${o.total}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
