import { auth, db } from "./firebase.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================
// Elements
// ======================

const historyDiv = document.getElementById("history");
const totalTransactions = document.getElementById("totalTransactions");

// ======================
// Auth
// ======================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {

    const q = query(
      collection(db, "withdrawRequests"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    totalTransactions.textContent = snapshot.size;

    if (snapshot.empty) {

      historyDiv.innerHTML = `
      <div class="card">
        <h3>📭 No Withdraw History</h3>
        <p>You haven't submitted any withdrawal request yet.</p>
      </div>
      `;

      return;

    }

    let approvedAmount = 0;
    let html = "";

    snapshot.forEach((withdraw) => {

      const data = withdraw.data();

      let date = "Just Now";

      if (data.createdAt) {
        date = data.createdAt.toDate().toLocaleString();
      }

      let status = "⏳ Pending";
      let color = "#facc15";

      if (data.status === "Approved") {

        status = "✅ Approved";
        color = "#22c55e";

        approvedAmount += Number(data.amount || 0);

      }

      if (data.status === "Rejected") {

        status = "❌ Rejected";
        color = "#ef4444";

      }

      html += `

      <div class="card">

        <h3>💸 Withdraw Request</h3>

        <p><strong>Amount:</strong> ₹${Number(data.amount || 0)}</p>

        <p>
          <strong>Status:</strong>
          <span style="color:${color};font-weight:bold;">
            ${status}
          </span>
        </p>

        <p><strong>UPI:</strong> ${data.upi || "-"}</p>

        <p><strong>Date:</strong> ${date}</p>

      </div>

      `;

    });

    historyDiv.innerHTML = `

    <div class="card">

      <h3>💰 Total Approved Withdraw</h3>

      <h2 style="color:#22c55e;">
        ₹${approvedAmount}
      </h2>

    </div>

    ${html}

    `;

  } catch (error) {

    console.error("Withdraw History Error:", error);

    totalTransactions.textContent = "0";

    historyDiv.innerHTML = `
    <div class="card">
      <h3>❌ Error Loading Withdraw History</h3>
      <p>${error.message}</p>
    </div>
    `;

  }

});