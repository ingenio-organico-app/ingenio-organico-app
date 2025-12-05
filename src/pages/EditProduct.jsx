// src/pages/EditProduct.jsx
import { useState } from "react";
import { db, storage } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditProduct({ product, onSaved, onCancel }) {
  const [name, setName] = useState(product?.name || "");
  const [unit, setUnit] = useState(product.unit || "");
const [gramAmount, setGramAmount] = useState(product.gramAmount || "");
  const [extra, setExtra] = useState(!!product?.extra);
  const [weighed, setWeighed] = useState(!!product?.weighed); // producto pesable
  const [price, setPrice] = useState(
    typeof product?.price === "number" ? String(product.price) : ""
  );
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(product?.image || null); // 👈 vista previa
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = {
  name,
  price,
  unit,
  extra,
  weighed,
  available,
  gramAmount: unit === "gr" ? Number(gramAmount) : null,
};


      // Precio numérico
      const numericPrice = Number(price);
      updates.price = isNaN(numericPrice) ? 0 : numericPrice;

      // Imagen nueva (solo si se seleccionó archivo)
      if (imageFile) {
        const imageRef = ref(
          storage,
          `products/${Date.now()}-${imageFile.name}`
        );
        await uploadBytes(imageRef, imageFile);
        const url = await getDownloadURL(imageRef);
        updates.image = url;
      }

      // Guardar en Firestore
      await updateDoc(doc(db, "products", product.id), updates);

      if (onSaved) onSaved({ ...product, ...updates });

      alert("Producto actualizado ✔");
    } catch (e) {
      console.error("Error al editar producto:", e);
      alert("Error al editar producto: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded mb-6 bg-gray-100">
      <h2 className="text-xl font-semibold mb-3">
        Editar producto: <span className="font-normal">{product.name}</span>
      </h2>

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
<div className="mb-3">
  <label className="font-semibold">Unidad</label>
  <select
    value={unit}
    onChange={(e) => setUnit(e.target.value)}
    className="border p-2 rounded w-full"
  >
    <option value="">Seleccionar…</option>
    <option value="unidad">Unidad</option>
    <option value="atado">Atado</option>
    <option value="kg">Kg</option>
    <option value="gr">Gramos</option>
  </select>
</div>

{/* Si la unidad es gramos, pedir cantidad */}
{unit === "gr" && (
  <div className="mb-3">
    <label className="font-semibold">Cantidad en gramos</label>
    <input
      type="number"
      min="1"
      value={gramAmount || ""}
      onChange={(e) => setGramAmount(Number(e.target.value))}
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

        {/* Imagen nueva + vista previa */}
        <div>
          <label className="block mb-1 font-medium">
            Cambiar imagen (opcional):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {previewUrl && (
            <div className="mt-2">
              <p className="text-xs mb-1 text-gray-600">
                Vista previa de la imagen:
              </p>
              <img
                src={previewUrl}
                alt={`Imagen de ${name}`}
                className="h-24 w-24 object-cover rounded border"
              />
            </div>
          )}

          {!imageFile && product.image && (
            <p className="text-xs mt-1 text-gray-500">
              Si no elegís otra imagen, se mantiene la actual.
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-white rounded ${
              loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded border border-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
