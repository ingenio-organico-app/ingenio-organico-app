import { useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function UploadProducts({ onProductAdded }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [icon, setIcon] = useState("");
  const [extra, setExtra] = useState(false);
  const [weighed, setWeighed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name || !price || !unit) return alert("Completa nombre, precio y unidad");
    
    setLoading(true);
    try {
      const colRef = collection(db, "products");

      // Traer ids existentes para no duplicar
      const snapshot = await getDocs(colRef);
      const existingIds = snapshot.docs.map(doc => doc.data().id);
      const newId = existingIds.length ? Math.max(...existingIds) + 1 : 1;

      const newProduct = {
        available: true,
        icon,
        id: newId,
        name,
        price: Number(price),
        unit,
        ...(weighed ? { weighed: true } : {}),
        ...(extra ? { extra: true } : {})
      };

      await addDoc(colRef, newProduct);
      alert("Producto agregado ✔");
      onProductAdded?.();
      setName(""); setPrice(""); setUnit(""); setIcon(""); setExtra(false); setWeighed(false);
    } catch (err) {
      console.error(err);
      alert("Error al agregar producto");
    }
    setLoading(false);
  };

  return (
    <div className="border p-4 rounded mb-6">
      <h2 className="text-xl font-semibold mb-3">Agregar Producto</h2>
      <input
        className="border p-1 mb-2 w-full"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border p-1 mb-2 w-full"
        placeholder="Precio"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        className="border p-1 mb-2 w-full"
        placeholder="Unidad (ej: kg, unidad)"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
      />
      <input
        className="border p-1 mb-2 w-full"
        placeholder="Icono (emoji)"
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
      />
      <div className="flex gap-4 mb-2">
        <label>
          <input type="checkbox" checked={extra} onChange={() => setExtra(!extra)} /> Extra
        </label>
        <label>
          <input type="checkbox" checked={weighed} onChange={() => setWeighed(!weighed)} /> Pesable
        </label>
      </div>
      <button
        onClick={handleAdd}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {loading ? "Agregando..." : "Agregar Producto"}
      </button>
    </div>
  );
}
