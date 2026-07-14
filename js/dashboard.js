import { auth, db } from "./firebase.js";
import { claimLoginReward } from "./loginReward.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const shareReferralBtn =
document.getElementById("shareReferralBtn");
const myReferralCode =
document.getElementById("myReferralCode");

const referralReward =
document.getElementById("referralReward");

const copyReferralBtn =
document.getElementById("copyReferralBtn");
const username = document.getElementById("username");
const wallet = document.getElementById("wallet");
const logoutBtn = document.getElementById("logoutBtn");

const greeting = document.getElementById("greeting");
const todayDate = document.getElementById("todayDate");
const liveTime = document.getElementById("liveTime");

// User Login Check
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 🎁 Daily Login Reward
  await claimLoginReward(user.uid);

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const data = userSnap.data();
if (myReferralCode) {

  myReferralCode.textContent =
    data.referralCode || "N/A";

}

if (referralReward) {

  referralReward.textContent =
    "₹" + Number(data.referralReward || 0);

}

      // Username
      username.textContent = data.name || "User";

      // Wallet
      wallet.textContent = "₹" + Number(data.wallet || 0);

      // Total Earned
      const totalEarned = document.getElementById("totalEarned");
      if (totalEarned) {
        totalEarned.textContent =
"₹" + Number(data.totalEarned || 0);
      }

      // Completed Tasks
      const completedTasks =
        document.getElementById("completedTasks");

      if (completedTasks) {
        completedTasks.textContent =
          (data.completedTasks || []).length;
      }

      // Bonus
      const bonusEarned =
        document.getElementById("bonusEarned");

      if (bonusEarned) {
        bonusEarned.textContent =
"₹" + Number(data.bonus || 0);
      }

      // Referrals
      const referrals =
        document.getElementById("referrals");

      if (referrals) {
        referrals.textContent =
          data.referrals || 0;
      }

      // Level
      const level =
        document.getElementById("levelValue");

      if (level) {
        level.textContent =
          data.level || 1;
      }

      // XP
      const xp =
        document.getElementById("xpValue");

      if (xp) {
        xp.textContent =
          (data.xp || 0) + " XP";
      }

      // Streak
      const streak =
        document.getElementById("streakCount");

      if (streak) {
        streak.textContent =
(data.loginStreak || 0) + " 🔥";
      }

      // Rank
      const rank =
        document.getElementById("userRank");

      if (rank) {

        const completed =
          (data.completedTasks || []).length;

        if (completed >= 50) {

          rank.textContent = "👑 Legend";

        } else if (completed >= 20) {

          rank.textContent = "🔥 Pro";

        } else {

          rank.textContent = "🌱 Beginner";

        }

      }

      // XP Progress
      const progress =
        document.querySelector(".progress-fill");

      if (progress) {

        const percent =
          Math.min((data.xp || 0) % 100, 100);

        progress.style.width =
          percent + "%";

      }

    } else {

      username.textContent = "User";
      wallet.textContent = "₹0";

    }

  } catch (error) {

    console.error("Dashboard Error:", error);

    username.textContent = "User";
    wallet.textContent = "₹0";

  }

});
// ==============================
// Logout
// ==============================

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    try {

      await signOut(auth);

      alert("✅ Logged Out Successfully");

      window.location.href = "login.html";

    } catch (error) {

      console.error(error);

      alert("Logout Failed!");

    }

  });

}

// ==============================
// Greeting
// ==============================

function updateGreeting() {

  if (!greeting) return;

  const hour = new Date().getHours();

  if (hour < 12) {

    greeting.textContent = "🌞 Good Morning";

  } else if (hour < 17) {

    greeting.textContent = "☀️ Good Afternoon";

  } else {

    greeting.textContent = "🌙 Good Evening";

  }

}

// ==============================
// Live Date & Time
// ==============================

function updateDateTime() {

  const now = new Date();

  if (todayDate) {

    todayDate.textContent =
      now.toLocaleDateString("en-IN", {

        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"

      });

  }

  if (liveTime) {

    liveTime.textContent =
      now.toLocaleTimeString("en-IN");

  }

}

updateGreeting();
updateDateTime();

setInterval(updateDateTime, 1000);

// ==============================
// Notification Count
// ==============================

const notifyCount =
document.getElementById("notifyCount");

if (notifyCount) {

  notifyCount.textContent = "3";

}

// ==============================
// Theme Toggle
// ==============================

const themeBtn =
document.getElementById("themeBtn");

if (themeBtn) {

  const savedTheme =
    localStorage.getItem("theme");

  if (savedTheme === "light") {

    document.body.classList.add("light-theme");

    themeBtn.textContent = "☀️";

  } else {

    themeBtn.textContent = "🌙";

  }

  themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light-theme");

    if (
      document.body.classList.contains("light-theme")
    ) {

      localStorage.setItem("theme", "light");

      themeBtn.textContent = "☀️";

    } else {

      localStorage.setItem("theme", "dark");

      themeBtn.textContent = "🌙";

    }

  });

}

// ==============================
// Welcome Animation
// ==============================

window.addEventListener("load", () => {

  document.body.style.opacity = "1";

});
if (copyReferralBtn) {

  copyReferralBtn.addEventListener("click", () => {

    const code =
      document.getElementById("myReferralCode")
      ?.textContent;

    if (!code) return;

    navigator.clipboard.writeText(code);

    alert("✅ Referral Code Copied!");

  });

}

// ==============================
// Copy Referral Code
// ==============================

if (copyReferralBtn) {

  copyReferralBtn.addEventListener("click", async () => {

    const code = myReferralCode.textContent;

    if (!code || code === "Loading..." || code === "N/A") {
      alert("❌ Referral Code not available.");
      return;
    }

    try {

      await navigator.clipboard.writeText(code);

      alert("✅ Referral Code Copied!");

    } catch (error) {

      console.error(error);

      alert("❌ Copy Failed.");

    }

  });

}
// ==============================
// Share Referral
// ==============================

if (shareReferralBtn) {

  shareReferralBtn.addEventListener("click", () => {

    const code = myReferralCode.textContent;

    const message =
`🔥 Join TaskEarn and earn money online!

🎁 Use my Referral Code:
${code}

💸 Get your signup bonus and start earning today!`;

    const url =
`https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");

  });

}