import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function Products() {
  const [general, setGeneral] = useState([]);
  const [extra, setExtra] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, "products");
    const q = query(colRef, orderBy("name"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const available = list.filter((p) => p.available);

      setGeneral(available.filter((p) => !p.extra));
      setExtra(available.filter((p) => p.extra));

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Lista de Productos</h1>

      <h2 className="text-lg font-semibold mb-2">Productos</h2>
      <ul className="mb-6">
        {general.map((p) => (
          <li key={p.id} className="mb-2">
            {p.icon} {p.name} – ${p.price} / {p.unit}
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mb-2">Productos Extra</h2>
      <ul>
        {extra.map((p) => (
          <li key={p.id} className="mb-2">
            {p.icon} {p.name} – ${p.price} / {p.unit}
          </li>
        ))}
      </ul>
    </div>
  );
}
