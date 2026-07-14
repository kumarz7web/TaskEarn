// =========================================
// TaskEarn Daily Bonus System
// Part 1
// =========================================

import { auth, db } from "./firebase.js";
import { addXP } from "./xp.js";
import { sendNotification } from "./notificationHelper.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
doc,
getDoc,
updateDoc,
addDoc,
collection,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================================
// 7-Day Rewards
// =========================================

const rewards = [
5,
10,
15,
20,
25,
30,
35
];

// =========================================
// HTML Elements
// =========================================

const claimBtn =
document.getElementById("claimBonus");

const currentDay =
document.getElementById("currentDay");

const todayReward =
document.getElementById("todayReward");

const currentStreak =
document.getElementById("currentStreak");

const bonusStatus =
document.getElementById("bonusStatus");

// =========================================
// Global Variables
// =========================================

let currentUser = null;
let userData = null;

// =========================================
// Format Date
// =========================================

function getTodayDate(){

return new Date()
.toISOString()
.split("T")[0];

}

// =========================================
// Get Reward
// =========================================

function getReward(day){

return rewards[day-1] || 5;

}

// =========================================
// Load User
// =========================================

async function loadUser(uid){

const userRef =
doc(db,"users",uid);

const userSnap =
await getDoc(userRef);

if(!userSnap.exists()){

throw new Error(
"User data not found."
);

}

userData =
userSnap.data();

return userData;

}
// =========================================
// Update Bonus UI
// =========================================

function updateBonusUI(data){

const day =
Number(data.dailyBonusDay || 1);

const streak =
Number(data.dailyBonusStreak || 1);

const reward =
getReward(day);

// Current Day

if(currentDay){

currentDay.textContent =
`Day ${day}`;

}

// Today's Reward

if(todayReward){

todayReward.textContent =
`₹${reward}`;

}

// Current Streak

if(currentStreak){

currentStreak.textContent =
`${streak} Day`;

}

// Highlight Reward Cards

for(let i=1;i<=7;i++){

const card =
document.getElementById(`day${i}`);

if(!card) continue;

card.classList.remove(
"active",
"claimed"
);

if(i<day){

card.classList.add(
"claimed"
);

}

if(i===day){

card.classList.add(
"active"
);

}

}

// Bonus Status

const today =
getTodayDate();

if(data.lastBonusDate===today){

if(bonusStatus){

bonusStatus.textContent =
"✅ Today's Bonus Already Claimed";

bonusStatus.style.color =
"#22c55e";

}

if(claimBtn){

claimBtn.disabled=true;

claimBtn.textContent=
"✅ Claimed";

}

}else{

if(bonusStatus){

bonusStatus.textContent =
"🎁 Bonus Available";

bonusStatus.style.color =
"#38bdf8";

}

if(claimBtn){

claimBtn.disabled=false;

claimBtn.textContent=
"🎁 Claim Bonus";

}

}

}

// =========================================
// Authentication
// =========================================

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href=
"login.html";

return;

}

currentUser=user;

try{

const data=
await loadUser(user.uid);

updateBonusUI(data);

}catch(error){

console.error(error);

alert(error.message);

}

});
// =========================================
// Claim Bonus
// =========================================

if(claimBtn){

claimBtn.addEventListener("click",async()=>{

try{

if(!currentUser) return;

const userRef=
doc(db,"users",currentUser.uid);

const userSnap=
await getDoc(userRef);

if(!userSnap.exists()){

alert("User data not found!");

return;

}

const data=
userSnap.data();

const today=
getTodayDate();

// Already Claimed

if(data.lastBonusDate===today){

alert("🎁 You have already claimed today's bonus.");

return;

}

// Current Day

let day=
Number(data.dailyBonusDay || 1);

let streak=
Number(data.dailyBonusStreak || 1);

const reward=
getReward(day);

// Next Day

let nextDay=day+1;

if(nextDay>7){

nextDay=1;

}

// Wallet Update

await updateDoc(userRef,{

wallet:
Number(data.wallet || 0)+reward,

bonus:
Number(data.bonus || 0)+reward,

totalEarned:
Number(data.totalEarned || 0)+reward,

dailyBonusDay:
nextDay,

dailyBonusStreak:
streak+1,

lastBonusDate:
today

});

// Refresh Local Data

userData={

...data,

wallet:
Number(data.wallet || 0)+reward,

bonus:
Number(data.bonus || 0)+reward,

totalEarned:
Number(data.totalEarned || 0)+reward,

dailyBonusDay:
nextDay,

dailyBonusStreak:
streak+1,

lastBonusDate:
today

};

updateBonusUI(userData);
  // =========================================
// Give XP
// =========================================

await addXP(
currentUser.uid,
5
);

// =========================================
// Transaction History
// =========================================

await addDoc(
collection(db,"transactions"),
{

uid:
currentUser.uid,

title:
"Daily Bonus",

amount:
reward,

type:
"Credit",

createdAt:
serverTimestamp()

}
);

// =========================================
// Notification
// =========================================

await sendNotification(

currentUser.uid,

"🎁 Daily Bonus",

`Congratulations!

₹${reward} Daily Bonus has been added to your wallet.

⭐ +5 XP Earned.`

);

// =========================================
// Success Message
// =========================================

alert(

`🎉 Daily Bonus Claimed!

💰 Reward : ₹${reward}

🔥 Current Streak : ${streak+1} Days

⭐ XP Earned : +5`

);

// Optional Refresh

setTimeout(()=>{

location.reload();

},800);

}catch(error){

console.error(error);

alert(error.message);

}

});

}