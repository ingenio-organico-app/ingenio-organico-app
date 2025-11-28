import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function getProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  
  const products = [];
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });

  return products;
}
