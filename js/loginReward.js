import { db } from "./firebase.js";
import { addXP } from "./xp.js";

import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function claimLoginReward(uid) {

  try {

    if (!uid) return;

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    const data = snap.data();

    const today = new Date().toISOString().split("T")[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayStr =
      yesterday.toISOString().split("T")[0];

    // Already claimed today
    if (data.lastLoginReward === today) {
      return;
    }

    let streak = 1;

    if (data.lastLoginReward === yesterdayStr) {

      streak = Number(data.loginStreak || 0) + 1;

    } else {

      streak = 1;

    }

    if (streak > 7) {
      streak = 1;
    }

    const rewards = [5, 10, 15, 20, 25, 30, 100];
    const xps = [2, 4, 6, 8, 10, 12, 20];

    const reward = rewards[streak - 1];
    const xp = xps[streak - 1];

    // Update User
    await updateDoc(userRef, {

      wallet: Number(data.wallet || 0) + reward,

      totalEarned: Number(data.totalEarned || 0) + reward,

      loginStreak: streak,

      streak: streak,

      lastLoginReward: today

    });

    // XP
    await addXP(uid, xp);

    // Save Transaction
    await addDoc(collection(db, "transactions"), {

      uid: uid,

      title: `Daily Login Reward - Day ${streak}`,

      amount: reward,

      type: "Credit",

      createdAt: serverTimestamp()

    });

    // Notification
    await addDoc(collection(db, "notifications"), {

      uid: uid,

      title: "🎁 Daily Login Reward",

      message: `🔥 Day ${streak} Login Reward Claimed!\n\n💰 ₹${reward}\n⭐ +${xp} XP`,

      read: false,

      createdAt: serverTimestamp()

    });

    alert(
      `🎉 Daily Login Reward Claimed!\n\n🔥 Day ${streak}\n💰 Reward: ₹${reward}\n⭐ XP: +${xp}`
    );

  } catch (error) {

    console.error("Login Reward Error:", error);

  }

}