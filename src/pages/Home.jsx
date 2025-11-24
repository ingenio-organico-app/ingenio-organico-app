export default function Home() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/fondo.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/45"></div>

      <div className="relative z-10 flex flex-col items-center px-6 pt-12 pb-20 space-y-6">
        <img
          src="/logo.png"
          alt="Ingenio Orgánico"
          className="w-40 drop-shadow-lg"
        />

        <h1 className="text-white text-center text-lg font-medium">
          Verduras frescas de nuestras huertas agroecológicas
        </h1>

        <div className="w-full max-w-sm space-y-4">
          <button
            className="w-full py-3 bg-white/90 rounded-xl text-gray-800 font-semibold shadow-lg active:scale-95 transition"
            onClick={() => (window.location.href = "/store")}
          >
            Ver productos
          </button>

          <button
            className="w-full py-3 bg-white/90 rounded-xl text-gray-800 font-semibold shadow-lg active:scale-95 transition"
            onClick={() => (window.location.href = "/store")}
          >
            Hacer pedido
          </button>

          <button
            className="w-full py-3 bg-white/80 rounded-xl text-gray-900 font-semibold shadow-lg active:scale-95 transition"
            onClick={() => (window.location.href = "/store#extras")}
          >
            Productos extra
          </button>
        </div>

        <p className="text-white/70 text-sm mt-8 text-center">
          Entregas en la zona — Productos 100% agroecológicos
        </p>
      </div>
    </div>
  );
}
