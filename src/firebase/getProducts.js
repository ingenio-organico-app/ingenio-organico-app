// src/firebase/getProducts.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function getProducts() {
  const colRef = collection(db, "products");
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
