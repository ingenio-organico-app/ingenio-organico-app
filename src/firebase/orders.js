import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

// Obtiene semana actual en formato año-semana
function getCurrentWeek() {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);

  return `${now.getFullYear()}-${week}`;
}

export async function saveOrder(orderData) {
  try {
    const { cart, subtotal, envio } = orderData;
    const total = subtotal + envio;

    const docRef = await addDoc(collection(db, "orders"), {
      cart,
      subtotal,
      envio,
      total,
      createdAt: new Date(),
      week: getCurrentWeek(),
    });

    console.log("Pedido guardado con ID:", docRef.id);
    return docRef.id; // devolvemos el ID para poder usarlo si queremos
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    throw error;
  }
}
