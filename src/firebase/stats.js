// firebase/stats.js
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export async function getWeeksList() {
  const snap = await getDocs(collection(db, "orders"));
  return [...new Set(snap.docs.map((d) => d.data().weekId))].sort();
}

export function listenWeekTotals(weekId, callback) {
  const q = query(collection(db, "orders"), where("weekId", "==", weekId));

  return onSnapshot(q, (snapshot) => {
    let totals = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.cart) return;

      data.cart.forEach((item) => {
        if (!totals[item.name]) {
          totals[item.name] = {
            name: item.name,
            unit: item.unit,
            icon: item.icon,
            qty: 0,
          };
        }
        totals[item.name].qty += item.qty;
      });
    });

    callback(Object.values(totals).sort((a, b) => a.name.localeCompare(b.name)));
  });
}

export function listenWeekOrders(weekId, callback) {
  const q = query(collection(db, "orders"), where("weekId", "==", weekId));

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}
