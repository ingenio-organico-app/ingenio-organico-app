// src/pages/Stats.jsx
import { useEffect, useState } from "react";
import { getCurrentWeek, calculateTotals } from "../firebase/stats";

export default function Stats() {
  const [totals, setTotals] = useState([]);
  const weekId = getCurrentWeek();

  useEffect(() => {
    // Listener en tiempo real
    const unsubscribe = calculateTotals(weekId, setTotals);
    return () => unsubscribe();
  }, [weekId]);

  if (!totals || totals.length === 0) {
    return <p className="text-center mt-10">Cargando estadísticas...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Estadísticas Semanales
      </h1>

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
              <td className="p-2 border flex items-center gap-2">
                <span className="text-xl">{item.icon}</span> {item.name}
              </td>
              <td className="p-2 border">{item.qty}</td>
              <td className="p-2 border">{item.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
