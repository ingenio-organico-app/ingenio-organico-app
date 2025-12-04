// src/firebase/stats.js
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import { getCurrentISOWeek } from "./orders";
import { useEffect, useState } from "react";

// 🔹 ID de la semana actual (ej: "2025-03")
export function getCurrentWeekId() {
  return getCurrentISOWeek().weekId;
}

// 🔹 Totales por producto para una semana (listener en tiempo real)
export function calculateTotals(weekId, callback) {
  const q = query(collection(db, "orders"), where("weekId", "==", weekId));

  return onSnapshot(q, (snapshot) => {
    let totals = {};

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (!Array.isArray(data.cart)) return;

      data.cart.forEach((item) => {
        if (!totals[item.name]) {
          totals[item.name] = {
            name: item.name,
            unit: item.unit,
            icon: item.icon,
            qty: 0,
          };
        }
        totals[item.name].qty += item.qty || 0;
      });
    });

    const totalsArray = Object.values(totals).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    callback(totalsArray);
  });
}

// 🔹 Todas las semanas que existen en la colección orders
export async function getAllWeeks() {
  const snap = await getDocs(collection(db, "orders"));
  const set = new Set();

  snap.docs.forEach((d) => {
    const data = d.data();
    if (data.weekId) {
      set.add(data.weekId);
    }
  });

  return Array.from(set).sort(); // orden ascendente
}

// 🔹 Hook usado por Admin.jsx para mostrar stats rápidas
export function useWeeklyStats() {
  const [state, setState] = useState({
    week: getCurrentWeekId(),
    totalOrders: 0,
    totalRevenue: 0,
    products: [],
  });

  useEffect(() => {
    const { weekId } = getCurrentISOWeek();
    const q = query(collection(db, "orders"), where("weekId", "==", weekId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totals = {};
      let totalOrders = snapshot.size;
      let totalRevenue = 0;

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        totalRevenue += data.total || 0;

        if (!Array.isArray(data.cart)) return;

        data.cart.forEach((item) => {
          const key = item.name;
          if (!totals[key]) {
            totals[key] = {
              name: item.name,
              unit: item.unit,
              icon: item.icon,
              qty: 0,
            };
          }
          totals[key].qty += item.qty || 0;
        });
      });

      const products = Object.values(totals).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setState({
        week: weekId,
        totalOrders,
        totalRevenue,
        products,
      });
    });

    return () => unsubscribe();
  }, []);

  return state;
}
