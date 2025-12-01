// src/pages/EditProduct.jsx
import { useState } from "react";
import { db, storage } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditProduct({ product, onSaved, onCancel }) {
  const [name, setName] = useState(product?.name || "");
  const [extra, setExtra] = useState(!!product?.extra);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = { name, extra };

      if (imageFile) {
        const imageRef = ref(
          storage,
          `products/${Date.now()}-${imageFile.name}`
        );
        await uploadBytes(imageRef, imageFile);
        updates.image = await getDownloadURL(imageRef);
      }

      await updateDoc(doc(db, "products", product.id), updates);

      onSaved({ ...product, ...updates });

      alert("Producto actualizado ✔");
    } catch (error) {
      console.error(error);
      alert("❌ Error al editar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded mb-6 bg-gray-50">
      <h2 className="text-xl font-semibold mb-3">Editar: {product.name}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-medium">Nombre:</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={extra}
            onChange={() => setExtra(!extra)}
          />
          <label>Es extra</label>
        </div>

        <div>
          <label className="block mb-1 font-medium">Imagen nueva:</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
          />
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded"
          >
            Guardar
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
