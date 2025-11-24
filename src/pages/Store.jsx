import { useState } from "react";
import products from "../data/products";

export default function Store() {
  const [cart, setCart] = useState([]);

  const updateQty = (id, delta, prod) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === id);

      if (!exists && delta > 0) {
        return [...prev, { ...prod, qty: 1 }];
      }

      return prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item
        )
        .filter((i) => i.qty > 0);
    });
  };

  const removeItem = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const subtotal = cart
    .filter((i) => !i.weighed)
    .reduce((sum, item) => sum + item.price * item.qty, 0);

  const weighedProducts = cart.filter((i) => i.weighed);
  const weighedNames = weighedProducts.map((i) => i.name).join(", ");

  const envio = 100;

  const totalText =
    weighedProducts.length > 0
      ? `Total: $${subtotal + envio} + productos a pesar (${weighedNames})`
      : `Total: $${subtotal + envio}`;

  const message = `Hola! Te paso mi pedido:\n\n${cart
    .map(
      (item) =>
        `• ${item.name} x ${item.qty}${item.weighed ? " (🟰 a pesar)" : ""}${
          item.extra ? " (EXTRA)" : ""
        }`
    )
    .join("\n")}\n\n--------------------\nSubtotal: $${subtotal}\nEnvío: $${envio}\n${totalText}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Productos</h1>

      {/* GRID DE 3 COLUMNAS */}
      <div className="grid grid-cols-3 gap-3">
        {products.map((prod) =>
          prod.separator ? (
            <div key={prod.label} className="col-span-3 mt-4 mb-1">
              <h2 className="text-lg font-semibold border-b pb-1">
                {prod.label}
              </h2>
            </div>
          ) : (
            <div
              key={prod.id}
              className="p-2 bg-white rounded-xl shadow-sm flex flex-col items-center text-center"
            >
              {/* ICONO */}
              <span className="text-4xl mb-1">
                {prod.icon || "🥬"}
              </span>

              {/* NOMBRE */}
              <h3 className="font-semibold text-sm leading-tight">
                {prod.name}
              </h3>

              {/* PRECIO */}
              <p className="text-gray-600 text-xs mb-1">
                ${prod.price} / {prod.unit}
              </p>

              {prod.weighed && (
                <p className="text-[10px] text-orange-600 mb-1">
                  A pesar
                </p>
              )}

              {/* CONTROLES */}
              <div className="flex items-center gap-2 mt-auto mb-1">
                <button
                  className="px-2 py-1 bg-gray-200 rounded-lg active:scale-90 text-sm"
                  onClick={() => updateQty(prod.id, -1, prod)}
                >
                  -
                </button>

                <span className="w-5 text-center font-bold text-sm">
                  {cart.find((i) => i.id === prod.id)?.qty || 0}
                </span>

                <button
                  className="px-2 py-1 bg-gray-200 rounded-lg active:scale-90 text-sm"
                  onClick={() => updateQty(prod.id, 1, prod)}
                >
                  +
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* CARRITO */}
      {cart.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-3">Tu pedido:</h2>

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center mb-1"
            >
              <span>
                {item.name} x {item.qty} {item.weighed && "(a pesar)"}
                {item.extra && " (EXTRA)"}
              </span>

              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => removeItem(item.id)}
              >
                ❌
              </button>
            </div>
          ))}

          <p className="mt-4 font-semibold">Subtotal: ${subtotal}</p>
          <p>Envío: ${envio}</p>
          <p className="mt-2 font-bold">{totalText}</p>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <button className="mt-4 w-full py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Enviar pedido por WhatsApp
            </button>
          </a>
        </div>
      )}
    </div>
  );
}
