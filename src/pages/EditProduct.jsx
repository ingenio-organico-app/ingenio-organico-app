// src/pages/EditProduct.jsx
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export default function EditProduct({ product, onSaved, onCancel }) {
  const [name, setName] = useState(product.name || "");
  const [price, setPrice] = useState(product.price || 0);
  const [unit, setUnit] = useState(product.unit || "unidad");
  const [gramAmount, setGramAmount] = useState(product.gramAmount || "");
  const [extra, setExtra] = useState(product.extra || false);
  const [weighed, setWeighed] = useState(product.weighed || false);

  // Imagen
  const [imageUrl, setImageUrl] = useState(product.image || "");
  const [newImageFile, setNewImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setRemoveImage(false);
    // Preview local (opcional)
    const preview = URL.createObjectURL(file);
    setImageUrl(preview);
  };

  const handleRemoveImageClick = () => {
    setRemoveImage(true);
    setNewImageFile(null);
    setImageUrl("");
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Base actualizado
      const updated = {
        name: name.trim(),
        price: Number(price),
        unit,
        gramAmount: unit === "gr" ? Number(gramAmount) : null,
        extra,
        weighed,
        available: product.available, // mantenemos disponibilidad del admin
      };

      let finalImage = product.image || null;

      // Si el usuario quiere quitar la imagen
      if (removeImage && !newImageFile) {
        if (product.image) {
          try {
            await deleteObject(ref(storage, product.image));
          } catch (e) {
            console.warn("No se pudo borrar la imagen anterior:", e);
          }
        }
        finalImage = null;
      }

      // Si el usuario seleccionó una nueva imagen
      if (newImageFile) {
        // Borrar imagen anterior si existía
        if (product.image) {
          try {
            await deleteObject(ref(storage, product.image));
          } catch (e) {
            console.warn("No se pudo borrar la imagen anterior:", e);
          }
        }

        const storageRef = ref(
          storage,
          `products/${product.id}-${newImageFile.name}`
        );
        await uploadBytes(storageRef, newImageFile);
        finalImage = await getDownloadURL(storageRef);
      }

      updated.image = finalImage || null;

      // Actualizar en Firestore
      await updateDoc(doc(db, "products", product.id), updated);

      // Devolver al AdminProducts para refrescar la tabla
      onSaved({
        ...product,
        ...updated,
      });
    } catch (err) {
      console.error("Error al editar producto:", err);
      alert("Error al editar producto: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 mb-6 border rounded-xl bg-white shadow">
      <h2 className="text-lg font-semibold mb-3">Editar producto</h2>

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
          <option value="unidad">Unidad</option>
          <option value="gr">Gramos</option>
          <option value="kg">Kg</option>
          <option value="lt">Litro</option>
        </select>
      </label>

      {/* GramAmount solo si unidad = gr */}
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

        {imageUrl ? (
          <div className="mb-2 flex items-center gap-4">
            <img
              src={imageUrl}
              alt={name}
              className="w-20 h-20 object-cover rounded-lg border"
            />
            <button
              type="button"
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              onClick={handleRemoveImageClick}
            >
              Quitar imagen
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 mb-1">
            No hay imagen cargada actualmente.
          </p>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-sm"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-4">
        <button
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
