import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==============================
// Elements
// ==============================
const totalEarned =
document.getElementById("totalEarned");

const totalWithdraw =
document.getElementById("totalWithdraw");

const currentWallet =
document.getElementById("currentWallet");
const xpFill = document.getElementById("xpFill");
const xpProgress = document.getElementById("xpProgress");

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

const walletBalance = document.getElementById("walletBalance");
const completedTasks = document.getElementById("completedTasks");
const referrals = document.getElementById("referrals");

const level = document.getElementById("level");
const xp = document.getElementById("xp");
const badge = document.getElementById("badge");
const userBadge = document.getElementById("userBadge");

const referralCode = document.getElementById("referralCode");
const referralReward = document.getElementById("referralReward");

const loginStreak = document.getElementById("loginStreak");
const joinDate = document.getElementById("joinDate");

const editNameBtn = document.getElementById("editNameBtn");
const emailStatus = document.getElementById("emailStatus");

const copyReferral = document.getElementById("copyReferral");
const shareReferral = document.getElementById("shareReferral");

// ==============================
// Load Profile
// ==============================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "login.html";
    return;

  }

  try {

    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {

      alert("User data not found.");
      return;

    }

    const data = userSnap.data();

    // Basic Info

    userName.textContent =
      data.name || "User";

    userEmail.textContent =
      data.email || user.email;

    emailStatus.textContent =
      user.emailVerified
      ? "✅ Verified"
      : "❌ Not Verified";

    walletBalance.textContent =
  "₹" + Number(data.wallet || 0);

currentWallet.textContent =
  "₹" + Number(data.wallet || 0);

totalEarned.textContent =
  "₹" + Number(data.totalEarned || 0);

totalWithdraw.textContent =
  "₹" + Number(data.totalWithdraw || 0);

completedTasks.textContent =
  (data.completedTasks || []).length;

    referrals.textContent =
      Number(data.referrals || 0);

    level.textContent =
  Number(data.level || 1);

const currentXP =
  Number(data.xp || 0);

const currentLevel =
  Number(data.level || 1);

xp.textContent =
  currentXP;

const maxXP =
  currentLevel * 100;

const percent =
  Math.min(
    (currentXP / maxXP) * 100,
    100
  );

xpFill.style.width =
  percent + "%";

xpProgress.textContent =
  `${currentXP} / ${maxXP} XP`;

badge.textContent =
  data.badge || "None";

userBadge.textContent =
  "🏆 " + (data.badge || "None");

    referralCode.textContent =
      data.referralCode || "Not Available";

    referralReward.textContent =
      "₹" + Number(data.referralReward || 0);

    loginStreak.textContent =
      Number(data.loginStreak || 0) + " Day";

    if (data.createdAt) {

      joinDate.textContent =
        data.createdAt
        .toDate()
        .toLocaleDateString("en-IN");

    } else {

      joinDate.textContent = "-";

    }

    // ==========================
    // Edit Name
    // ==========================

    if (editNameBtn) {

      editNameBtn.onclick = async () => {

        const newName =
          prompt(
            "Enter your new name",
            data.name || ""
          );

        if (!newName || !newName.trim())
          return;

        try {

          await updateDoc(userRef, {

            name: newName.trim()

          });

          userName.textContent =
            newName.trim();

          alert("✅ Name Updated!");

        } catch (error) {

          console.error(error);

          alert(error.message);

        }

      };

    }

    // ==========================
    // Copy Referral
    // ==========================

    if (copyReferral) {

      copyReferral.onclick = async () => {

        try {

          await navigator.clipboard.writeText(
            data.referralCode || ""
          );

          alert("✅ Referral Code Copied!");

        } catch {

          alert("❌ Copy Failed");

        }

      };

    }

    // ==========================
    // Share Referral
    // ==========================

    if (shareReferral) {

      shareReferral.onclick = () => {

        const message =
`💰 Join TaskEarn and start earning online!

🎁 Use my Referral Code:

${data.referralCode}

🔥 Start earning today!`;

        window.open(

          `https://wa.me/?text=${encodeURIComponent(message)}`,

          "_blank"

        );

      };

    }

  } catch (error) {

    console.error(error);

    alert(error.message);

  }

});