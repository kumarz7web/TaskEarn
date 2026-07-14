import { auth, db } from "./firebase.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================
// Elements
// ======================

const walletBalance = document.getElementById("walletBalance");
const totalEarned = document.getElementById("totalEarned");
const totalWithdraw = document.getElementById("totalWithdraw");
const historyCard = document.querySelector(".history-card");

// ======================
// Auth
// ======================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {

      walletBalance.textContent = "₹0";
      totalEarned.textContent = "₹0";
      totalWithdraw.textContent = "₹0";

      historyCard.innerHTML = `
      <h3>📜 Recent Activity</h3>
      <p>User data not found.</p>
      `;

      return;

    }

    const data = userSnap.data();

    // ======================
    // Wallet Summary
    // ======================

    walletBalance.textContent = "₹" + Number(data.wallet || 0);

    totalEarned.textContent = "₹" + Number(data.totalEarned || 0);

    totalWithdraw.textContent =
      "₹" + Number(data.totalWithdraw || 0);

    // ======================
// Withdraw History
// ======================

const q = query(
  collection(db, "withdrawRequests"),
  where("uid", "==", user.uid),
  orderBy("createdAt", "desc"),
  limit(5)
);

const snap = await getDocs(q);

// Calculate Approved Withdraw Total

let withdrawTotal = 0;

snap.forEach((doc) => {

  const item = doc.data();

  if (item.status === "Approved") {

    withdrawTotal += Number(item.amount || 0);

  }

});

totalWithdraw.textContent = "₹" + withdrawTotal;

if (snap.empty) {

  historyCard.innerHTML = `
  <h3>📜 Recent Withdrawals</h3>
  <p>No withdrawal history.</p>
  `;

  return;

}

let html = `<h3>📜 Recent Withdrawals</h3>`;

snap.forEach((doc) => {

  const item = doc.data();

  let color = "#facc15";

  if (item.status === "Approved") color = "#22c55e";

  if (item.status === "Rejected") color = "#ef4444";

  let date = "Just Now";

  if (item.createdAt) {

    date = item.createdAt.toDate().toLocaleString();

  }

  html += `

  <div style="
  padding:12px;
  margin-top:10px;
  border-radius:12px;
  background:rgba(255,255,255,.08);
  display:flex;
  justify-content:space-between;
  align-items:center;
  ">

    <div>

      <b>💸 ₹${item.amount}</b>

      <br>

      <small>${date}</small>

    </div>

    <div style="
    color:${color};
    font-weight:bold;
    ">

      ${item.status}

    </div>

  </div>

  `;

});

historyCard.innerHTML = html;

  } catch (error) {

    console.error("Wallet Error:", error);

    walletBalance.textContent = "₹0";
    totalEarned.textContent = "₹0";
    totalWithdraw.textContent = "₹0";

    historyCard.innerHTML = `
    <h3>📜 Recent Activity</h3>
    <p>${error.message}</p>
    `;

  }

});