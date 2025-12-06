// src/pages/Store.jsx
import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { saveOrder } from "../firebase/orders";

export default function Store() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrito expandible
  const [cartOpen, setCartOpen] = useState(false);

  // Cargar productos
  useEffect(() => {
    async function loadProducts() {
      try {
        const snap = await getDocs(collection(db, "products"));
        const list = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((p) => p.available !== false);

        setProducts(list);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const updateQty = (id, delta, prod) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === id);

      if (!exists && delta > 0) return [...prev, { ...prod, qty: 1 }];

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
    .reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);

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
    .join(
      "\n"
    )}\n\n--------------------\nSubtotal: $${subtotal}\nEnvío: $${envio}\n${totalText}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const handleSendOrder = async () => {
    if (cart.length === 0) return;

    try {
      await saveOrder({
        cart,
        subtotal,
        envio,
        customerName: "",
      });

      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.error("Error guardando pedido:", err);
      alert("No se pudo guardar el pedido 😕");
      window.open(whatsappUrl, "_blank");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Cargando productos...</p>;
  }

  // Orden de productos
  const sortByOrder = (a, b) => {
    const ao = typeof a.order === "number" ? a.order : 999999;
    const bo = typeof b.order === "number" ? b.order : 999999;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  };

  const generalProducts = products.filter((p) => !p.extra).sort(sortByOrder);
  const extraProducts = products.filter((p) => p.extra).sort(sortByOrder);

  const renderCard = (prod) => {
    const qty = cart.find((i) => i.id === prod.id)?.qty || 0;

    return (
      <div
        key={prod.id}
        className="
          p-4 bg-white rounded-2xl border border-gray-200
          flex flex-col items-center text-center
          transition-all duration-200
          shadow-[0_4px_14px_rgba(0,0,0,0.08)]
          hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)]
          active:scale-95 active:shadow-inner active:border-emerald-400 active:bg-emerald-50
        "
      >
        {/* Imagen */}
        {prod.image ? (
          <img
            src={prod.image}
            alt={prod.name}
            className="h-24 w-24 object-cover rounded-xl mb-3"
          />
        ) : (
          <span className="text-5xl mb-3">🥬</span>
        )}

        {/* Nombre */}
        <h3 className="font-semibold text-base mb-1 text-gray-900">
          {prod.name}
        </h3>

        {/* Precio */}
        <p className="text-gray-700 text-sm mb-2">
          {prod.unit === "gr" && prod.gramAmount
            ? `$${prod.price} / ${prod.gramAmount}g`
            : `$${prod.price} / ${prod.unit}`}
        </p>

        {/* Badges */}
        {prod.extra && (
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full mb-1">
            EXTRA
          </span>
        )}

        {prod.weighed && (
          <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full mb-2">
            A pesar
          </span>
        )}

        {/* CONTROLES DE CANTIDAD */}
        <div className="flex items-center justify-center gap-2 mt-auto w-full">
          <button
            className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-lg text-base hover:bg-gray-300 transition"
            onClick={() => updateQty(prod.id, -1, prod)}
          >
            –
          </button>

          <span
            key={qty}
            className="w-6 text-center font-bold text-gray-800 text-sm animate-[bounce_0.2s]"
          >
            {qty}
          </span>

          <button
            className="w-7 h-7 flex items-center justify-center bg-emerald-500 text-white rounded-lg text-base hover:bg-emerald-600 transition"
            onClick={() => updateQty(prod.id, 1, prod)}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto p-4">
        {/* HEADER */}
        <div className="rounded-3xl bg-white/40 backdrop-blur-sm border border-white/20 py-8 mb-10">
          <div className="flex flex-col items-center">
            <img
              src="/images/logo.png"
              alt="Ingenio Orgánico"
              className="w-[483px] mb-4 max-w-full"
            />
            <img
              src="/images/sublogo.png"
              alt="La Tienda"
              className="w-[300px] max-w-full"
            />
          </div>
        </div>

        {/* LISTA GENERAL */}
        <div className="flex items-center gap-3 mb-3 ml-[6px]">
          <img
            src="/images/lista-general.png"
            alt="Lista General"
            className="w-[161px] max-w-[60%]"
          />
          <div className="h-[1px] flex-1 bg-gray-300 rounded-full" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10 max-[480px]:grid-cols-2">
          {generalProducts.map(renderCard)}
        </div>

        {/* PRODUCTOS EXTRA */}
        <div className="flex items-center gap-3 mt-8 mb-3 ml-[6px]">
          <img
            src="/images/productos-extra.png"
            alt="Productos Extra"
            className="w-[184px] max-w-[70%]"
          />
          <div className="h-[1px] flex-1 bg-gray-300 rounded-full" />
        </div>

        <div className="grid grid-cols-3 gap-3 max-[480px]:grid-cols-2">
          {extraProducts.map(renderCard)}
        </div>

        {/* Espacio para que el carrito flotante no tape los productos */}
        <div className="h-24" />

        {/* CARRITO COMPACTO */}
        {cart.length > 0 && !cartOpen && (
          <div
            className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-xl border-t p-4 flex justify-between items-center active:scale-95 transition cursor-pointer"
            onClick={() => setCartOpen(true)}
          >
            <span className="font-semibold text-gray-800">
              🛒 {cart.length}{" "}
              {cart.length === 1 ? "producto" : "productos"} — ${subtotal}
            </span>

            <button className="bg-emerald-500 text-white px-3 py-1 rounded-lg">
              Ver carrito
            </button>
          </div>
        )}

        {/* CARRITO EXPANDIDO (BOTTOM SHEET) */}
        {cartOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-end">
            <div className="bg-white w-full rounded-t-3xl p-6 shadow-xl max-h-[80%] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tu carrito</h2>
                <button
                  className="text-gray-500 text-2xl"
                  onClick={() => setCartOpen(false)}
                >
                  ×
                </button>
              </div>

              {/* Lista de productos */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border"
                  >
                    <span className="font-medium">
                      {item.name} x{item.qty}
                    </span>
                    <span className="font-semibold text-gray-800">
                      ${item.price * item.qty}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="mt-6 text-lg font-bold text-gray-800">
                Total: ${subtotal + envio}
              </div>

              {/* Botón enviar */}
              <button
                onClick={handleSendOrder}
                className="w-full mt-4 py-3 bg-emerald-500 text-white rounded-xl text-lg font-semibold active:scale-95 transition"
              >
                Enviar pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
