// src/pages/AddProduct.jsx
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddProduct({ onCreated }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState("gr");
  const [gramAmount, setGramAmount] = useState("");
  const [extra, setExtra] = useState(false);
  const [weighed, setWeighed] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Falta el nombre del producto");
      return;
    }

    try {
      setSaving(true);

      let imageURL = null;

      // SUBIR IMAGEN SI HAY
      if (imageFile) {
        const imgRef = ref(
          storage,
          `products/${Date.now()}-${imageFile.name}`
        );
        await uploadBytes(imgRef, imageFile);
        imageURL = await getDownloadURL(imgRef);
      }

      const newProduct = {
        name: name.trim(),
        price: Number(price),
        unit,
        gramAmount: unit === "gr" ? Number(gramAmount) : null,
        extra,
        weighed,
        available: true,
        image: imageURL,
        order: 999999, // se puede modificar en admin
      };

      const docRef = await addDoc(collection(db, "products"), newProduct);

      onCreated({ id: docRef.id, ...newProduct });
    } catch (err) {
      console.error("Error creando producto:", err);
      alert("Error creando producto: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 mb-6 border rounded-xl bg-white shadow">
      <h2 className="text-lg font-semibold mb-3">Agregar producto</h2>

      {/* Nombre */}
      <label className="block mb-2 text-sm">
        Nombre:
        <input
          type="text"
          className="w-full border p-2 rounded mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      {/* Precio */}
      <label className="block mb-2 text-sm">
        Precio:
        <input
          type="number"
          className="w-full border p-2 rounded mt-1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>

      {/* Unidad */}
      <label className="block mb-2 text-sm">
        Unidad:
        <select
          className="w-full border p-2 rounded mt-1"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option value="gr">Gramos</option>
          <option value="kg">Kg</option>
          <option value="atado">Atado</option>
        </select>
      </label>

      {/* Cantidad de gramos */}
      {unit === "gr" && (
        <label className="block mb-3 text-sm">
          Cantidad en gramos:
          <input
            type="number"
            className="w-full border p-2 rounded mt-1"
            value={gramAmount}
            onChange={(e) => setGramAmount(e.target.value)}
          />
        </label>
      )}

      {/* Extra */}
      <label className="flex items-center gap-2 mb-2 text-sm">
        <input
          type="checkbox"
          checked={extra}
          onChange={(e) => setExtra(e.target.checked)}
        />
        Producto extra
      </label>

      {/* A pesar */}
      <label className="flex items-center gap-2 mb-4 text-sm">
        <input
          type="checkbox"
          checked={weighed}
          onChange={(e) => setWeighed(e.target.checked)}
        />
        Se pesa aparte
      </label>

      {/* Imagen */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-1">Imagen:</p>

        {imagePreview && (
          <img
            src={imagePreview}
            alt="preview"
            className="w-20 h-20 object-cover rounded-lg border mb-2"
          />
        )}

        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      {/* Botón */}
      <button
        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60"
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? "Guardando..." : "Agregar producto"}
      </button>
    </div>
  );
}
