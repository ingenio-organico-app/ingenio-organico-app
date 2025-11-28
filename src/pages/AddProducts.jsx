import { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase";

export default function AddProduct({ onProductAdded }) {
  const [name, setName] = useState("");
  const [extra, setExtra] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      // Subir imagen si existe
      if (imageFile) {
        const imageRef = ref(storage, `products/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Crear producto en Firestore
      const newProduct = {
        name,
        extra,
        image: imageUrl,
        available: true,
      };

      await addDoc(collection(db, "products"), newProduct);

      // Limpiar formulario
      setName("");
      setExtra(false);
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
    <div className="border p-4 rounded mb-6">
      <h2 className="text-xl font-semibold mb-3">Agregar producto nuevo</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={extra}
            onChange={() => setExtra(!extra)}
          />
          <label>Es producto extra</label>
        </div>

        <div>
          <label className="block mb-1 font-medium">Imagen (opcional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-white rounded ${loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"}`}
        >
          {loading ? "Guardando..." : "Agregar Producto"}
        </button>
      </form>
    </div>
  );
}
