import { auth, db } from "./firebase.js";
import { addXP } from "./xp.js";
import { sendNotification } from "./notificationHelper.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const redeemBtn =
document.getElementById("redeemBtn");

const redeemCode =
document.getElementById("redeemCode");

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "login.html";

    return;

  }

  redeemBtn.addEventListener("click", async () => {

    const code =
    redeemCode.value.trim().toUpperCase();

    if (!code) {

      alert("⚠ Enter Promo Code");

      return;

    }

    try {

      const userRef =
      doc(db,"users",user.uid);

      const userSnap =
      await getDoc(userRef);

      if (!userSnap.exists()) return;

      const data =
      userSnap.data();
      // ==========================
      // Promo Codes
      // ==========================

      const promoCodes = {

        "WELCOME100": {
          reward: 100,
          xp: 20
        },

        "TASK50": {
          reward: 50,
          xp: 10
        },

        "BONUS25": {
          reward: 25,
          xp: 5
        }

      };

      if (!promoCodes[code]) {

        alert("❌ Invalid Promo Code");

        return;

      }

      const usedCodes =
      data.usedPromoCodes || [];

      if (usedCodes.includes(code)) {

        alert("⚠ You have already used this code.");

        return;

      }

      const reward =
      promoCodes[code].reward;

      const xp =
      promoCodes[code].xp;

      await updateDoc(userRef, {

        wallet:
        Number(data.wallet || 0) + reward,

        totalEarned:
        Number(data.totalEarned || 0) + reward,

        usedPromoCodes: [
          ...usedCodes,
          code
        ]

      });

      await addXP(user.uid, xp);
            // ==========================
      // Transaction History
      // ==========================

      await addDoc(collection(db, "transactions"), {

        uid: user.uid,

        title: "Promo Code Reward",

        amount: reward,

        type: "Credit",

        createdAt: serverTimestamp()

      });

      // ==========================
      // Notification
      // ==========================

      await sendNotification(

        user.uid,

        "🎁 Promo Code Redeemed",

        `You redeemed ${code} and received ₹${reward} + ${xp} XP.`

      );

      alert(
        `🎉 Success!\n\n💰 Reward: ₹${reward}\n⭐ XP: +${xp}`
      );

      redeemCode.value = "";

    } catch (error) {

      console.error("Redeem Error:", error);

      alert(error.message);

    }

  });

});