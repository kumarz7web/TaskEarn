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

// ==========================
// Elements
// ==========================

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");

const nextSpin =
document.getElementById("nextSpin");

const lastReward =
document.getElementById("lastReward");

const spinStatus =
document.getElementById("spinStatus");

let currentUser = null;

// ==========================
// Reward List
// ==========================

const rewards = [

  { money: 2, xp: 2 },

  { money: 5, xp: 3 },

  { money: 10, xp: 5 },

  { money: 20, xp: 8 },

  { money: 50, xp: 12 },

  { money: 100, xp: 20 },

  { money: 500, xp: 50, jackpot: true },

  { money: 0, xp: 0 }

];

// ==========================
// Login Check
// ==========================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "login.html";

    return;

  }

  currentUser = user;

  const userRef =
    doc(db, "users", user.uid);

  const snap =
    await getDoc(userRef);

  if (!snap.exists()) return;

  const data = snap.data();

  if (lastReward) {

    lastReward.textContent =
      "🎁 Last Reward: ₹" +
      Number(data.lastSpinReward || 0);

  }
    // ==========================
  // Daily Spin Check
  // ==========================

  const today =
    new Date().toISOString().split("T")[0];

  if (data.lastSpinDate === today) {

    spinBtn.disabled = true;

    if (spinStatus) {

      spinStatus.textContent =
        "❌ Today's Spin Already Used";

    }

    if (nextSpin) {

      const tomorrow = new Date();

      tomorrow.setDate(
        tomorrow.getDate() + 1
      );

      tomorrow.setHours(0, 0, 0, 0);

      function updateTimer() {

        const now = new Date();

        const diff =
          tomorrow - now;

        if (diff <= 0) {

          nextSpin.textContent =
            "🟢 Spin Ready!";

          spinBtn.disabled = false;

          spinStatus.textContent =
            "✅ Daily Spin Available";

          return;

        }

        const hrs =
          Math.floor(diff / 3600000);

        const mins =
          Math.floor(
            (diff % 3600000) / 60000
          );

        const secs =
          Math.floor(
            (diff % 60000) / 1000
          );

        nextSpin.textContent =
          `🕒 Next Spin: ${hrs}h ${mins}m ${secs}s`;

      }

      updateTimer();

      setInterval(updateTimer, 1000);

    }

  } else {

    spinBtn.disabled = false;

    if (spinStatus) {

      spinStatus.textContent =
        "✅ Daily Spin Available";

    }

    if (nextSpin) {

      nextSpin.textContent =
        "🟢 Ready to Spin";

    }

  }

});
// ==========================
// Spin Button
// ==========================

spinBtn.addEventListener("click", async () => {

  if (!currentUser) return;

  spinBtn.disabled = true;

  try {

    const userRef =
      doc(db, "users", currentUser.uid);

    const snap =
      await getDoc(userRef);

    const data =
      snap.data();

    const today =
      new Date().toISOString().split("T")[0];

    if (data.lastSpinDate === today) {

      alert("🎡 You already used today's spin!");

      spinBtn.disabled = true;

      return;

    }

    // Random Reward
    const index =
      Math.floor(Math.random() * rewards.length);

    const reward =
      rewards[index];

    // Wheel Animation
    const randomAngle =
      Math.floor(Math.random() * 360);

    const rotation =
      (360 * 8) + randomAngle;

    wheel.style.transition =
      "transform 5s ease-out";

    wheel.style.transform =
      `rotate(${rotation}deg)`;

    setTimeout(async () => {

      let title = "";
      let message = "";

      if (reward.money === 0) {

        title = "😔 Better Luck";
        message = "Better Luck Next Time!";

      } else if (reward.jackpot) {

        title = "💎 JACKPOT!";
        message = `💎 JACKPOT! You won ₹${reward.money}`;

      } else {

        title = "🎉 Lucky Spin";
        message = `🎉 You won ₹${reward.money}`;

      }
          // ==========================
      // Save Reward
      // ==========================

      await updateDoc(userRef, {

        wallet: Number(data.wallet || 0) + reward.money,

        totalEarned: Number(data.totalEarned || 0) + reward.money,

        lastSpinReward: reward.money,

        lastSpinDate: today

      });

      // XP
      if (reward.xp > 0) {

        await addXP(currentUser.uid, reward.xp);

      }

      // Transaction
      if (reward.money > 0) {

        await addDoc(collection(db, "transactions"), {

          uid: currentUser.uid,

          title: reward.jackpot
            ? "Lucky Spin Jackpot"
            : "Lucky Spin",

          amount: reward.money,

          type: "Credit",

          createdAt: serverTimestamp()

        });

      }

      // Notification
      await sendNotification(

        currentUser.uid,

        title,

        `${message}\n⭐ XP +${reward.xp}`

      );

      // Update UI

      result.textContent = message;

      if (lastReward) {

        lastReward.textContent =
          "🎁 Last Reward: ₹" + reward.money;

      }

      if (spinStatus) {

        spinStatus.textContent =
          "❌ Today's Spin Already Used";

      }

      if (nextSpin) {

        nextSpin.textContent =
          "🕒 Come back tomorrow";

      }

      alert(message);

    }, 5000);

  } catch (error) {

    console.error(error);

    alert(error.message);

    spinBtn.disabled = false;

  }

});