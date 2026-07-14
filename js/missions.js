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

// ==============================
// Elements
// ==============================

const loginProgress =
document.getElementById("loginProgress");

const taskProgress =
document.getElementById("taskProgress");

const referralProgress =
document.getElementById("referralProgress");

const spinProgress =
document.getElementById("spinProgress");

const taskCount =
document.getElementById("taskCount");

const referralCount =
document.getElementById("referralCount");

const claimLogin =
document.getElementById("claimLogin");

const claimTask =
document.getElementById("claimTask");

const claimReferral =
document.getElementById("claimReferral");

const claimSpin =
document.getElementById("claimSpin");

// ==============================
// Auth
// ==============================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "login.html";

    return;

  }

  try {

    const userRef =
    doc(db, "users", user.uid);

    const userSnap =
    await getDoc(userRef);

    if (!userSnap.exists()) return;

    const data =
    userSnap.data();

    // Login Mission
    loginProgress.style.width = "100%";

    // Task Mission
    const completed =
    (data.completedTasks || []).length;

    const taskPercent =
    Math.min((completed / 3) * 100, 100);

    taskProgress.style.width =
    taskPercent + "%";

    taskCount.textContent =
    `${Math.min(completed,3)} / 3`;

    if (completed >= 3) {
      claimTask.disabled = false;
    }

    // Referral Mission
    const refs =
    Number(data.referrals || 0);

    referralProgress.style.width =
    Math.min(refs,1) * 100 + "%";

    referralCount.textContent =
    `${Math.min(refs,1)} / 1`;

    if (refs >= 1) {
      claimReferral.disabled = false;
    }

    // Spin Mission
    if (data.spinToday === true) {

      spinProgress.style.width = "100%";

      claimSpin.disabled = false;

    }
        // ==========================
    // Daily Login Reward Claim
    // ==========================

    claimLogin.addEventListener("click", async () => {

      if (data.loginMissionClaimed) {

        alert("✅ Already claimed today.");

        return;

      }

      await updateDoc(userRef, {
        wallet: Number(data.wallet || 0) + 5,
        totalEarned: Number(data.totalEarned || 0) + 5,
        loginMissionClaimed: true
      });

      await addXP(user.uid, 5);

      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        title: "Daily Mission - Login",
        amount: 5,
        type: "Credit",
        createdAt: serverTimestamp()
      });

      await sendNotification(
        user.uid,
        "🎯 Daily Mission",
        "You received ₹5 for Daily Login."
      );

      alert("🎉 ₹5 Reward Claimed");

      location.reload();

    });

    // ==========================
    // Complete 3 Tasks Mission
    // ==========================

    claimTask.addEventListener("click", async () => {

      if (data.taskMissionClaimed) {

        alert("✅ Already claimed.");

        return;

      }

      await updateDoc(userRef, {
        wallet: Number(data.wallet || 0) + 10,
        totalEarned: Number(data.totalEarned || 0) + 10,
        taskMissionClaimed: true
      });

      await addXP(user.uid, 10);

      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        title: "Mission - Complete 3 Tasks",
        amount: 10,
        type: "Credit",
        createdAt: serverTimestamp()
      });

      await sendNotification(
        user.uid,
        "🎯 Mission Completed",
        "You earned ₹10 for completing 3 tasks."
      );

      alert("🎉 ₹10 Reward Claimed");

      location.reload();

    });
        // ==========================
    // Referral Mission
    // ==========================

    claimReferral.addEventListener("click", async () => {

      if (data.referralMissionClaimed) {
        alert("✅ Already claimed.");
        return;
      }

      await updateDoc(userRef, {
        wallet: Number(data.wallet || 0) + 20,
        totalEarned: Number(data.totalEarned || 0) + 20,
        referralMissionClaimed: true
      });

      await addXP(user.uid, 20);

      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        title: "Mission - Referral",
        amount: 20,
        type: "Credit",
        createdAt: serverTimestamp()
      });

      await sendNotification(
        user.uid,
        "👥 Referral Mission",
        "You earned ₹20 for referring a friend."
      );

      alert("🎉 ₹20 Reward Claimed");

      location.reload();

    });

    // ==========================
    // Spin Mission
    // ==========================

    claimSpin.addEventListener("click", async () => {

      if (data.spinMissionClaimed) {
        alert("✅ Already claimed.");
        return;
      }

      await updateDoc(userRef, {
        wallet: Number(data.wallet || 0) + 5,
        totalEarned: Number(data.totalEarned || 0) + 5,
        spinMissionClaimed: true
      });

      await addXP(user.uid, 5);

      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        title: "Mission - Spin Wheel",
        amount: 5,
        type: "Credit",
        createdAt: serverTimestamp()
      });

      await sendNotification(
        user.uid,
        "🎡 Spin Mission",
        "You earned ₹5 from Spin Mission."
      );

      alert("🎉 ₹5 Reward Claimed");

      location.reload();

    });

  } catch (error) {

    console.error("Mission Error:", error);

    alert(error.message);

  }

});