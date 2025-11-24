import { useState } from "react";
import products from "../data/products";

export default function Store() {
  const [cart, setCart] = useState({});

  const addItem = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const qty = (prev[id] || 0) - 1;
      if (qty <= 0) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: qty };
    });
  };

  const getSubtotal = () => {
    return Object.entries(cart).reduce((acc, [id, qty]) => {
      const product = products.find((p) => p.id === Number(id));
      return acc + product.price * qty;
    }, 0);
  };

  const subtotal = getSubtotal();

  return (
    <div className="p-3 max-w-5xl mx-auto">

      {/* TÍTULO */}
      <h1 className="text-2xl font-bold text-center mb-4">Lista General</h1>

      {/* GRID A3 – 4 columnas */}
      <div
        className="
          grid gap-3
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
        "
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="
              bg-white rounded-xl shadow p-3
              flex flex-col items-center
              text-center
            "
          >
            {/* ICONO */}
            <img
              src={p.icon || "/placeholder_veg.png"}
              alt={p.name}
              className="w-14 h-14 object-contain mb-2"
            />

            {/* NOMBRE */}
            <h2 className="font-semibold text-sm leading-tight mb-1">
              {p.name}
            </h2>

            {/* PRECIO */}
            <p className="text-gray-600 text-sm mb-2">
              ${p.price} / {p.unit}
            </p>

            {/* CONTADOR */}
            <div className="flex items-center gap-2 mt-auto">
              <button
                onClick={() => removeItem(p.id)}
                className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold"
              >
                –
              </button>

              <span className="w-5 text-center font-semibold">
                {cart[p.id] || 0}
              </span>

              <button
                onClick={() => addItem(p.id)}
                className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="mt-6 text-center text-xl font-bold">
        Total: ${subtotal}
      </div>
    </div>
  );
}
