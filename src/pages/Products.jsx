// src/pages/Products.jsx
import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const colRef = collection(db, "products");
        const snap = await getDocs(colRef);

        const list = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((p) => p.available !== false) // solo productos disponibles
          .sort((a, b) => a.name.localeCompare(b.name));

        setProducts(list);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-xl">
        Cargando productos...
      </p>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Productos disponibles
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-lg">No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="border rounded-lg p-3 shadow bg-white text-center"
            >
              {prod.image && (
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}

              <h2 className="font-semibold text-lg">{prod.name}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
