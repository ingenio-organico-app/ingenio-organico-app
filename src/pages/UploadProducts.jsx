// src/pages/UploadProducts.jsx
import { useState } from "react";
import { db, storage } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadProducts({ onProductAdded }) {
  const [name, setName] = useState("");
  const [extra, setExtra] = useState(false);
  const [weighed, setWeighed] = useState(false); // producto pesable
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [gramAmount, setGramAmount] = useState(""); // 👈 NUEVO
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        const imageRef = ref(
          storage,
          `products/${Date.now()}-${imageFile.name}`
        );
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const numericPrice = Number(price);

      const newProduct = {
        name,
        extra,
        weighed,
        price: isNaN(numericPrice) ? 0 : numericPrice,
        image: imageUrl,
        available: true,
        createdAt: serverTimestamp(),
        order: Date.now(), // para que vaya al final
      };

      await addDoc(collection(db, "products"), newProduct);

      setName("");
      setExtra(false);
      setWeighed(false);
      setPrice("");
      setUnit("");
      gramAmount: unit === "gr" ? Number(gramAmount) : null; 
      setImageFile(null);

      if (onProductAdded) onProductAdded();

      alert("Producto agregado con éxito ✔");
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("❌ Error al agregar producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded mb-6 bg-gray-50">
      <h2 className="text-xl font-semibold mb-3">Agregar producto nuevo</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block mb-1 font-medium">Nombre:</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block mb-1 font-medium">Precio:</label>
          <input
            type="number"
            min="0"
            step="1"
            className="border p-2 w-full rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
 {/* Unidad */}
// Dentro del form de agregar producto → AGREGAR ESTE CAMPO:

<div className="mb-3">
  <label className="block text-sm font-medium mb-1">Unidad</label>
  <select
    value={unit}
    onChange={(e) => setUnit(e.target.value)}
    className="border p-2 rounded w-full"
  >
    <option value="">Seleccionar unidad</option>
    <option value="unidad">Unidad</option>
    <option value="atado">Atado</option>
    <option value="gr">Gramos (gr)</option>
    <option value="kg">Kilos (kg)</option>
  </select>
</div>
{unit === "gr" && (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1">Cantidad de gramos</label>
    <input
      type="number"
      value={gramAmount}
      onChange={(e) => setGramAmount(e.target.value)}
      className="border p-2 rounded w-full"
      placeholder="Ej: 250"
    />
  </div>
)}


        {/* Extra / Pesable */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={extra}
              onChange={() => setExtra(!extra)}
            />
            <span>Es producto extra</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={weighed}
              onChange={() => setWeighed(!weighed)}
            />
            <span>Es producto pesable</span>
          </label>
        </div>

        {/* Imagen */}
        <div>
          <label className="block mb-1 font-medium">
            Imagen (opcional):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-white rounded ${
            loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Guardando..." : "Agregar Producto"}
        </button>
      </form>
    </div>
  );
}
