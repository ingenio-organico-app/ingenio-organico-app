import { useState } from "react";
import products from "../data/products";

export default function StoreB2() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item
        )
        .filter((i) => i.qty > 0)
    );
  };

  const getQty = (id) => cart.find((i) => i.id === id)?.qty || 0;

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
        `• ${item.name} x ${item.qty}${
          item.weighed ? " (🟰 a pesar)" : ""
        }${item.extra ? " (EXTRA)" : ""}`
    )
    .join("\n")}\n\n--------------------\nSubtotal: $${subtotal}\nEnvío: $${envio}\n${totalText}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Productos</h1>

      <div className="flex flex-col gap-3">
        {products.map((prod) =>
          prod.separator ? (
            <h2
              key={prod.label}
              className="text-lg font-semibold bg-gray-100 px-3 py-2 rounded-md mt-3"
            >
              {prod.label}
            </h2>
          ) : (
            <div
              key={prod.id}
              className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{prod.icon}</span>

                <div>
                  <h3 className="font-semibold text-base">{prod.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {prod.price} / {prod.unit}
                  </p>
                  {prod.weighed && (
                    <p className="text-xs text-orange-600">Producto a pesar</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 bg-gray-200 rounded-lg active:scale-90 text-lg"
                  onClick={() => {
                    if (getQty(prod.id) > 0) updateQty(prod.id, -1);
                  }}
                >
                  -
                </button>

                <span className="w-6 text-center font-semibold text-lg">
                  {getQty(prod.id)}
                </span>

                <button
                  className="px-3 py-2 bg-gray-200 rounded-lg active:scale-90 text-lg"
                  onClick={() => {
                    if (getQty(prod.id) > 0) updateQty(prod.id, 1);
                    else addToCart(prod);
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )
        )}
      </div>

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
              </span>

              <button
                className="text-red-500 hover:text-red-700"
                onClick={() =>
                  setCart((prev) => prev.filter((i) => i.id !== item.id))
                }
              >
                ❌
              </button>
            </div>
          ))}

          <p className="mt-4 font-semibold">Subtotal: ${subtotal}</p>
          <p>Envío: ${envio}</p>
          <p className="mt-2 font-bold">{totalText}</p>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <button className="mt-4 w-full py-2 bg-green-500 text-white rounded-xl hover:bg-green-600">
              Enviar pedido por WhatsApp
            </button>
          </a>
        </div>
      )}
    </div>
  );
}
