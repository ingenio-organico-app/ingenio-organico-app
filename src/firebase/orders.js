// firebase/orders.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// 🔥 Obtener semana ISO real (lunes a domingo)
export function getCurrentISOWeek() {
  const date = new Date();
  const day = date.getDay() || 7; 
  date.setDate(date.getDate() + 4 - day);

  const isoYear = date.getFullYear();
  const startOfYear = new Date(isoYear, 0, 1);
  const diff = date - startOfYear;
  const isoWeek = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));

  return {
    weekId: `${isoYear}-${String(isoWeek).padStart(2, "0")}`,
    weekNumber: isoWeek,
    year: isoYear,
  };
}

export async function saveOrder(orderData) {
  try {
    const { cart, subtotal, envio, customerName = "" } = orderData;
    const total = subtotal + envio;

    const { weekId, weekNumber, year } = getCurrentISOWeek();

    const docRef = await addDoc(collection(db, "orders"), {
      cart,
      subtotal,
      envio,
      total,
      customerName,
      createdAt: serverTimestamp(),
      weekId,
      weekNumber,
      year,
    });

    console.log("Pedido guardado con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    throw error;
  }
}
