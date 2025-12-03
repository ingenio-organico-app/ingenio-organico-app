// src/pages/Store.jsx
import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Store() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="text-center mt-10">Cargando productos...</p>;
  }

  // Ordenar productos
  const sortByOrder = (a, b) => {
    const ao = typeof a.order === "number" ? a.order : 999999;
    const bo = typeof b.order === "number" ? b.order : 999999;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  };

  const generalProducts = products.filter((p) => !p.extra).sort(sortByOrder);
  const extraProducts = products.filter((p) => p.extra).sort(sortByOrder);

  const renderCard = (prod) => (
    <div
      key={prod.id}
      className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center transition transform hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200"
    >
      {prod.image ? (
        <img
          src={prod.image}
          alt={prod.name}
          className="h-16 w-16 object-cover rounded mb-2"
        />
      ) : (
        <span className="text-5xl mb-2">🥬</span>
      )}

      <h3 className="font-semibold text-sm">{prod.name}</h3>

      {prod.price && prod.unit && (
        <p className="text-gray-600 text-xs mb-1">
          ${prod.price} / {prod.unit}
        </p>
      )}

      {prod.weighed && (
        <p className="text-[10px] text-orange-600 mb-1">A pesar</p>
      )}

      <div className="flex items-center gap-2 mt-auto">
        <button
          className="px-2 py-1 bg-gray-200 rounded-md text-sm"
          onClick={() => updateQty(prod.id, -1, prod)}
        >
          -
        </button>

        <span className="w-6 text-center font-bold">
          {cart.find((i) => i.id === prod.id)?.qty || 0}
        </span>

        <button
          className="px-2 py-1 bg-gray-200 rounded-md text-sm"
          onClick={() => updateQty(prod.id, 1, prod)}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto p-4">

        {/* HEADER PREMIUM */}
        <div className="rounded-3xl bg-white/40 backdrop-blur-sm border border-white/20 py-8 mb-10">
          <div className="flex flex-col items-center">

            {/* Logo (igual tamaño) */}
            <img
              src="/images/logo.png"
              alt="Ingenio Orgánico"
              className="w-[483px] mb-4"
            />

            {/* Sublogo (15% más chico → 424px → 360px) */}
            <img
              src="/images/sublogo.png"
              alt="La Tienda"
              className="w-[300px]"
            />
          </div>
        </div>

        {/* LISTA GENERAL — imagen + línea */}
        <div className="flex items-center gap-3 mb-3 ml-[6px]">
          <img
            src="/images/lista-general.png"
            alt="Lista General"
            className="w-[161px]"
          />
          <div className="h-[1px] flex-1 bg-gray-300 rounded-full" />
        </div>

        {/* Productos lista general */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {generalProducts.map(renderCard)}
        </div>

        {/* PRODUCTOS EXTRA — título */}
        <div className="flex items-center gap-3 mt-8 mb-3 ml-[6px]">
          <img
            src="/images/productos-extra.png"
            alt="Productos Extra"
            className="w-[184px]"
          />
          <div className="h-[1px] flex-1 bg-gray-300 rounded-full" />
        </div>

        {/* Productos extra */}
        <div className="grid grid-cols-3 gap-3">
          {extraProducts.map(renderCard)}
        </div>

        {/* CARRITO PREMIUM (ya no está comentado) */}
        {cart.length > 0 && (
          <div className="mt-10 p-5 bg-white/40 backdrop-blur-md border border-white/30 rounded-3xl shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-center">Tu pedido</h2>

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-2 text-sm"
              >
                <span>
                  {item.name} x {item.qty}
                  {item.weighed && " (a pesar)"}
                  {item.extra && " (EXTRA)"}
                </span>

                <button
                  className="text-red-500 hover:text-red-600 text-xs"
                  onClick={() => removeItem(item.id)}
                >
                  ❌
                </button>
              </div>
            ))}

            <p className="mt-4 font-semibold text-sm">Subtotal: ${subtotal}</p>
            <p className="text-sm">Envío: ${envio}</p>
            <p className="mt-1 font-bold text-sm">{totalText}</p>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <button className="mt-4 w-full py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition">
                Enviar pedido por WhatsApp
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
