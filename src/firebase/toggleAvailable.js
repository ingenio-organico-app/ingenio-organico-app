import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function toggleAvailable(productId, currentState) {
  try {
    const ref = doc(db, "products", productId);
    await updateDoc(ref, { available: !currentState });
    console.log("Disponibilidad cambiada");
    return true;
  } catch (error) {
    console.error("Error al cambiar disponibilidad:", error);
    throw error;
  }
}
