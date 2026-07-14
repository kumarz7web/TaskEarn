import { auth, db } from "./firebase.js";
import { sendNotification } from "./notificationHelper.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// Elements
// =========================

const withdrawBtn = document.getElementById("withdrawBtn");
const walletBalance = document.getElementById("walletBalance");

// =========================
// Auth Check
// =========================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // =========================
  // Load Wallet Balance
  // =========================

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const userData = userSnap.data();

      walletBalance.innerText =
        "₹" + Number(userData.wallet || 0);

    }

  } catch (error) {

    console.error("Wallet Load Error:", error);

  }

  if (!withdrawBtn) return;

  withdrawBtn.addEventListener("click", async () => {

    const amount =
      Number(document.getElementById("amount").value);

    const upi =
      document.getElementById("upi").value.trim();

    // =========================
    // Validation
    // =========================

    if (!amount || amount <= 0) {

      alert("⚠ Enter a valid amount.");

      return;

    }

    if (amount < 100) {

      alert("⚠ Minimum withdraw amount is ₹100.");

      return;

    }

    if (!upi) {

      alert("⚠ Enter your UPI ID.");

      return;

    }

    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/;

    if (!upiRegex.test(upi)) {

      alert("⚠ Enter a valid UPI ID.");

      return;

    }

    withdrawBtn.disabled = true;
    withdrawBtn.innerText = "Processing...";

        try {

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {

        alert("❌ User data not found.");

        return;

      }

      const userData = userSnap.data();

      if (Number(userData.wallet || 0) < amount) {

        alert("❌ Insufficient wallet balance.");

        return;

      }

      // =========================
      // Check Pending Withdraw
      // =========================

      const pendingQuery = query(
        collection(db, "withdrawRequests"),
        where("uid", "==", user.uid),
        where("status", "==", "Pending")
      );

      const pendingSnap = await getDocs(pendingQuery);

      if (!pendingSnap.empty) {

        alert("⚠ You already have a pending withdraw request.");

        return;

      }

      // =========================
      // Save Withdraw Request
      // =========================

      await addDoc(collection(db, "withdrawRequests"), {

        uid: user.uid,
        name: userData.name,
        email: userData.email,

        amount: amount,

        upi: upi,

        status: "Pending",

        createdAt: serverTimestamp()

      });

      // =========================
      // Notification
      // =========================

      await sendNotification(

        user.uid,

        "💸 Withdraw Request",

        `Your withdraw request of ₹${amount} has been submitted successfully and is waiting for admin approval.`

      );

                alert(
        "✅ Withdraw Request Submitted!\n\n" +
        "💸 Amount: ₹" + amount +
        "\n⏳ Status: Pending Approval"
      );

      // Clear Form
      document.getElementById("amount").value = "";
      document.getElementById("upi").value = "";

      // Go Dashboard
      window.location.href = "dashboard.html";

    } catch (error) {

      console.error("Withdraw Error:", error);

      alert(error.message || "Something went wrong.");

    } finally {

      withdrawBtn.disabled = false;

      withdrawBtn.innerText = "🚀 Request Withdraw";

    }

  });

});