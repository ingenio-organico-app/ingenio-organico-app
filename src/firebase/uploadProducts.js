// src/firebase/uploadProducts.js
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import products from "../data/products";

export async function uploadProducts() {
  try {
    const colRef = collection(db, "products");

    // Traemos lo que ya existe para no duplicar por nombre
    const snapshot = await getDocs(colRef);
    const existingNames = snapshot.docs
      .map((doc) => doc.data().name)
      .filter(Boolean);

    // newProducts mantiene el orden del array original
    const newProducts = products
      .map((prod, index) => ({
        ...prod,
        __index: index, // índice original en el array
      }))
      .filter(
        (prod) => prod.name && !existingNames.includes(prod.name)
      );

    if (newProducts.length === 0) {
      console.log("No hay productos nuevos para subir");
      return 0;
    }

    const promises = newProducts.map((prod) =>
      addDoc(colRef, {
        ...prod,
        order:
          typeof prod.order === "number"
            ? prod.order
            : prod.__index, // si ya tenía order, lo respeta; si no, usa índice
        available: prod.available ?? true,
      })
    );

    await Promise.all(promises);

    console.log(`✔ ${newProducts.length} productos subidos`);
    return newProducts.length;
  } catch (error) {
    console.error("❌ Error al subir productos:", error);
    throw error;
  }
}
