import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import products from "../data/products"; // tu lista predefinida

export async function uploadProducts() {
  try {
    const colRef = collection(db, "products");

    // Traer productos existentes para no duplicar
    const snapshot = await getDocs(colRef);
    const existingNames = snapshot.docs.map(doc => doc.data().name);

    // Filtrar productos nuevos
    const newProducts = products.filter(prod => !existingNames.includes(prod.name));

    if (newProducts.length === 0) {
      console.log("No hay productos nuevos para subir");
      return 0;
    }

    // Traer ids existentes
    const existingIds = snapshot.docs.map(doc => doc.data().id);
    let nextId = existingIds.length ? Math.max(...existingIds) + 1 : 1;

    // Subir todos los productos nuevos en paralelo
    const promises = newProducts.map(prod => {
      const productToAdd = {
        available: true,
        icon: prod.icon || "",
        id: nextId++,
        name: prod.name || "",
        price: Number(prod.price) || 0,
        unit: prod.unit || "",
        ...(prod.weighed ? { weighed: true } : {}),
        ...(prod.extra ? { extra: true } : {})
      };
      return addDoc(colRef, productToAdd);
    });

    await Promise.all(promises);
    console.log(`✔ ${newProducts.length} productos subidos con éxito`);
    return newProducts.length;
  } catch (error) {
    console.error("❌ Error al subir productos:", error);
    throw error;
  }
}
