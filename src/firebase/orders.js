// src/firebase/orders.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// 📌 Obtener semana ISO (lunes a domingo)
export function getCurrentISOWeek() {
  const date = new Date();

  // Pasamos al jueves de la semana actual (regla ISO)
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));

  // Año ISO
  const isoYear = date.getFullYear();

  // Calculamos semana ISO
  const startOfYear = new Date(isoYear, 0, 1);
  const diff = date - startOfYear;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const isoWeek = Math.ceil(diff / oneWeek);

  return {
    weekId: `${isoYear}-${String(isoWeek).padStart(2, "0")}`, // ej: 2025-03
    weekNumber: isoWeek,
    year: isoYear,
  };
}

export async function saveOrder(orderData) {
  try {
    const { cart, subtotal, envio, customerName = "" } = orderData;
    const total = subtotal + envio;

    // 🔥 Obtener semana ISO
    const { weekId, weekNumber, year } = getCurrentISOWeek();

    const docRef = await addDoc(collection(db, "orders"), {
      cart,
      subtotal,
      envio,
      total,

      // 📌 Timestamp oficial del servidor
      createdAt: serverTimestamp(),

      // 📌 Semana para estadísticas
      weekId,      // ejemplo: "2025-03"
      weekNumber,  // ejemplo: 3
      year,        // ejemplo: 2025

      // 📌 Nombre editable luego en el panel
      customerName,
    });

    console.log("Pedido guardado con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    throw error;
  }
}
