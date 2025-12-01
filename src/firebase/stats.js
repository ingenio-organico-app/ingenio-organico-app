// firebase/stats.js
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// función que calcula semana actual
export function getCurrentWeek() {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
  return `${now.getFullYear()}-${week}`;
}

export function calculateTotals(weekId, callback) {
  const q = query(collection(db, "orders"), where("week", "==", weekId));

  return onSnapshot(q, (snapshot) => {
    let totals = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (!data.cart) return;

      data.cart.forEach((item) => {
        if (!totals[item.name]) {
          totals[item.name] = { name: item.name, unit: item.unit, icon: item.icon, qty: 0 };
        }
        totals[item.name].qty += item.qty;
      });
    });

    const totalsArray = Object.values(totals).sort((a, b) => a.name.localeCompare(b.name));
    callback(totalsArray);
  });
}
