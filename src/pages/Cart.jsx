import { Link } from "react-router-dom";

export default function Cart({ cart, setCart }) {
  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        )
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const envio = 100;
  const total = subtotal + envio;

  const message = `Hola! Te paso mi pedido:\n\n${cart
    .map((item) => `• ${item.name} x ${item.qty}`)
    .join("\n")}\n\nSubtotal: $${subtotal}\nEnvío: $${envio}\nTOTAL: $${total}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Tu pedido</h1>

      <Link
        to="/"
        className="inline-block mb-6 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
      >
        ⬅ Seguir comprando
      </Link>

      {cart.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-white p-4 rounded-lg shadow"
              >
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {item.price} / {item.unit}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="bg-gray-200 px-2 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="bg-gray-200 px-2 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Subtotal: ${subtotal}</h2>
            <h3 className="text-md">Envío: ${envio}</h3>
            <h1 className="text-xl font-bold">Total: ${total}</h1>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Enviar pedido por WhatsApp
              </button>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
