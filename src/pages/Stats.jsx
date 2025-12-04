// src/pages/Stats.jsx
import { useEffect, useState } from "react";
import {
  calculateTotals,
  getAllWeeks,
  getCurrentWeekId,
} from "../firebase/stats";
import { Link } from "react-router-dom";

export default function Stats() {
  const [weekId, setWeekId] = useState(getCurrentWeekId());
  const [totals, setTotals] = useState([]);
  const [weeks, setWeeks] = useState([]);

  // Cargar semanas disponibles
  useEffect(() => {
    getAllWeeks().then(setWeeks);
  }, []);

  // Listener para la semana actual seleccionada
  useEffect(() => {
    if (!weekId) return;
    const unsubscribe = calculateTotals(weekId, setTotals);
    return () => unsubscribe();
  }, [weekId]);

  if (!totals) return <p className="mt-10 text-center">Cargando...</p>;

  // Crear resumen semanal
  const summaryText = totals
    .map((t) => `• ${t.name} x ${t.qty} ${t.unit || ""}`)
    .join("\n");

  const message =
    `Resumen de productos pedidos en la semana ${weekId}:\n\n` +
    summaryText;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
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
          {weeks.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      {/* Botones */}
      <div className="flex gap-4 mb-6">
        <a
          href={whatsappUrl}
          target="_blank"
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
        >
          Enviar resumen por WhatsApp
        </a>

        <button
          onClick={() => navigator.clipboard.writeText(message)}
          className="px-4 py-2 bg-gray-300 rounded-lg"
        >
          Copiar resumen
        </button>

        <Link
          to={`/stats/week/${weekId}`}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Ver pedidos individuales
        </Link>
      </div>

      {/* Tabla de totales */}
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
            <tr key={item.name}>
              <td className="p-2 border flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </td>
              <td className="p-2 border text-center">{item.qty}</td>
              <td className="p-2 border text-center">{item.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
