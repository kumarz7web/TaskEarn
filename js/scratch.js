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

const scratchBtn =
document.getElementById("scratchBtn");

const rewardText =
document.getElementById("rewardText");

const scratchStatus =
document.getElementById("scratchStatus");

const nextScratch =
document.getElementById("nextScratch");

const lastScratchReward =
document.getElementById("lastScratchReward");

let currentUser = null;

// ==========================
// Rewards
// ==========================

const rewards = [

  { money:2, xp:2 },

  { money:5, xp:3 },

  { money:10, xp:5 },

  { money:20, xp:8 },

  { money:50, xp:12 },

  { money:100, xp:20 },

  { money:200, xp:40, jackpot:true }

];

// ==========================
// Login
// ==========================

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

currentUser=user;

const userRef=
doc(db,"users",user.uid);

const snap=
await getDoc(userRef);

if(!snap.exists()) return;

const data=snap.data();

lastScratchReward.textContent=
"🎁 Last Reward: ₹"+
Number(data.lastScratchReward||0);
  // ==========================
// Daily Scratch Check
// ==========================

const today =
new Date().toISOString().split("T")[0];

if(data.lastScratchDate===today){

scratchBtn.disabled=true;

scratchStatus.textContent=
"❌ Today's Scratch Already Used";

const tomorrow=new Date();

tomorrow.setDate(
tomorrow.getDate()+1
);

tomorrow.setHours(0,0,0,0);

function updateTimer(){

const now=new Date();

const diff=tomorrow-now;

if(diff<=0){

nextScratch.textContent=
"🟢 Scratch Ready!";

scratchBtn.disabled=false;

scratchStatus.textContent=
"✅ Daily Scratch Available";

return;

}

const hrs=
Math.floor(diff/3600000);

const mins=
Math.floor((diff%3600000)/60000);

const secs=
Math.floor((diff%60000)/1000);

nextScratch.textContent=
`🕒 Next Scratch: ${hrs}h ${mins}m ${secs}s`;

}

updateTimer();

setInterval(updateTimer,1000);

}else{

scratchBtn.disabled=false;

scratchStatus.textContent=
"✅ Daily Scratch Available";

nextScratch.textContent=
"🟢 Ready to Scratch";

}

});
// ==========================
// Scratch Button
// ==========================

scratchBtn.addEventListener("click", async () => {

  if (!currentUser) return;

  scratchBtn.disabled = true;

  try {

    const userRef =
      doc(db, "users", currentUser.uid);

    const snap =
      await getDoc(userRef);

    const data =
      snap.data();

    const today =
      new Date().toISOString().split("T")[0];

    if (data.lastScratchDate === today) {

      alert("🎁 You already used today's scratch!");

      scratchBtn.disabled = true;

      return;

    }

    // Random Reward

    const index =
      Math.floor(Math.random() * rewards.length);

    const reward =
      rewards[index];

    let title = "";
    let message = "";

    if (reward.jackpot) {

      title = "💎 JACKPOT!";
      message =
        `💎 JACKPOT!\nYou won ₹${reward.money}`;

    } else {

      title = "🎁 Daily Scratch";
      message =
        `🎉 You won ₹${reward.money}`;

    }

    rewardText.textContent = message;

    // Update Wallet

    await updateDoc(userRef, {

      wallet:
        Number(data.wallet || 0) + reward.money,

      totalEarned:
        Number(data.totalEarned || 0) + reward.money,

      lastScratchReward:
        reward.money,

      lastScratchDate:
        today

    });

    // XP

    await addXP(
      currentUser.uid,
      reward.xp
    );
        // ==========================
    // Transaction
    // ==========================

    await addDoc(collection(db, "transactions"), {

      uid: currentUser.uid,

      title: reward.jackpot
        ? "Scratch Jackpot"
        : "Daily Scratch",

      amount: reward.money,

      type: "Credit",

      createdAt: serverTimestamp()

    });

    // ==========================
    // Notification
    // ==========================

    await sendNotification(

      currentUser.uid,

      title,

      `${message}\n⭐ XP +${reward.xp}`

    );

    // ==========================
    // Update UI
    // ==========================

    lastScratchReward.textContent =
      "🎁 Last Reward: ₹" + reward.money;

    scratchStatus.textContent =
      "❌ Today's Scratch Already Used";

    nextScratch.textContent =
      "🕒 Come back tomorrow";

    alert(message);

  } catch (error) {

    console.error("Scratch Error:", error);

    alert(error.message);

    scratchBtn.disabled = false;

  }

});