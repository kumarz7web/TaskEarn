import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==============================
// Add XP & Level Up
// ==============================

export async function addXP(uid, xpAmount) {

  try {

    if (!uid || !xpAmount) return;

    const userRef = doc(db, "users", uid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const data = userSnap.data();

    let xp = Number(data.xp || 0) + Number(xpAmount);

    let level = Number(data.level || 1);

    let leveledUp = false;

    while (xp >= 100) {

      xp -= 100;

      level++;

      leveledUp = true;

    }

    await updateDoc(userRef, {

      xp: xp,

      level: level

    });

    // Level Up Notification
    if (leveledUp) {

      await addDoc(collection(db, "notifications"), {

        uid: uid,

        title: "🎉 Level Up!",

        message: `Congratulations! You reached Level ${level}.`,

        read: false,

        createdAt: serverTimestamp()

      });

      // Transaction History
      await addDoc(collection(db, "transactions"), {

        uid: uid,

        title: "Level Up",

        amount: 0,

        type: "Info",

        createdAt: serverTimestamp()

      });

    }

  } catch (error) {

    console.error("XP Error:", error);

  }

}