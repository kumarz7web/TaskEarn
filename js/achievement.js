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
// Achievement Checker
// ==============================

export async function checkAchievements(uid) {

  try {

    if (!uid) return;

    const userRef = doc(db, "users", uid);

    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    const data = snap.data();

    const completed =
      (data.completedTasks || []).length;

    let badge = "None";

    if (completed >= 100) {

      badge = "💎 Diamond";

    } else if (completed >= 50) {

      badge = "🥇 Gold";

    } else if (completed >= 20) {

      badge = "🥈 Silver";

    } else if (completed >= 5) {

      badge = "🥉 Bronze";

    }

    // Badge Changed
    if ((data.badge || "None") !== badge) {

      await updateDoc(userRef, {

        badge: badge

      });

      if (badge !== "None") {

        // Notification
        await addDoc(collection(db, "notifications"), {

          uid: uid,

          title: "🏆 Achievement Unlocked",

          message: `Congratulations! You unlocked the ${badge} badge.`,

          read: false,

          createdAt: serverTimestamp()

        });

        // Transaction History
        await addDoc(collection(db, "transactions"), {

          uid: uid,

          title: "Achievement Unlocked",

          amount: 0,

          type: "Info",

          createdAt: serverTimestamp()

        });

        alert(
          `🎉 Congratulations!

🏆 New Achievement Unlocked!

${badge}`
        );

      }

    }

  } catch (error) {

    console.error("Achievement Error:", error);

  }

}