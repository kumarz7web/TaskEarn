import { auth, db } from "./firebase.js";
import { addXP } from "./xp.js";
import { sendNotification } from "./notificationHelper.js";
import { checkAchievements } from "./achievement.js";

import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =======================
// URL Params
// =======================

const params = new URLSearchParams(window.location.search);

const taskId =
params.get("taskId");

const taskTitle =
params.get("title") || "Task";

const taskDescription =
params.get("description") || "Complete the task.";

const reward =
Number(params.get("reward") || 0);

// =======================
// Elements
// =======================

const timer =
document.getElementById("timer");

const progressFill =
document.getElementById("progressFill");

const verifyBtn =
document.getElementById("verifyBtn");

document.getElementById("taskTitle").textContent =
taskTitle;

document.getElementById("taskDescription").textContent =
taskDescription;

// =======================
// Timer
// =======================

let timeLeft = 30;

const interval = setInterval(() => {

  timeLeft--;

  timer.textContent = timeLeft;

  progressFill.style.width =
  ((30 - timeLeft) / 30) * 100 + "%";

  if (timeLeft <= 0) {

    clearInterval(interval);

    timer.textContent = "✅";

    progressFill.style.width = "100%";

    verifyBtn.disabled = false;

    verifyBtn.textContent =
    "✅ Claim Reward";

  }

}, 1000);
// =======================
// Claim Reward
// =======================

async function claimReward() {

  const user = auth.currentUser;

  if (!user) {

    alert("⚠ Please login first!");

    window.location.href = "login.html";

    return;

  }

  try {

    const userRef =
    doc(db, "users", user.uid);

    const userSnap =
    await getDoc(userRef);

    if (!userSnap.exists()) {

      alert("❌ User not found!");

      return;

    }

    const data =
    userSnap.data();

    const completedTasks =
    data.completedTasks || [];

    // Double Claim Protection
    if (completedTasks.includes(taskId)) {

      alert("✅ Reward already claimed!");

      window.location.href = "tasks.html";

      return;

    }

    // Update User
    await updateDoc(userRef, {

      wallet:
      (data.wallet || 0) + reward,

      totalEarned:
      (data.totalEarned || 0) + reward,

      completedTasks:
      arrayUnion(taskId)

    });

    // XP
    await addXP(
      user.uid,
      10
    );

    // Achievement
    await checkAchievements(
      user.uid
    );

    // Notification
    await sendNotification(

      user.uid,

      "🎉 Task Completed",

      `You earned ₹${reward} from "${taskTitle}".`

    );

    alert(

      "🎉 Reward Claimed!\n\n" +

      "💰 ₹" + reward +

      "\n⭐ +10 XP"

    );

        window.location.href =
    "tasks.html";

  } catch (error) {

    console.error(
      "Reward Error:",
      error
    );

    alert(error.message);

  }

}

// =======================
// Verify Button
// =======================

verifyBtn.addEventListener(

  "click",

  async () => {

    verifyBtn.disabled = true;

    verifyBtn.innerText =
    "⏳ Claiming Reward...";

    await claimReward();

  }

);