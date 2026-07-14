import { auth, db } from "./firebase.js";
import { sendNotification } from "./notificationHelper.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
collection,
getDocs,
doc,
getDoc,
updateDoc,
addDoc,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================
// Broadcast Notification
// ======================

const notifyTitle =
document.getElementById("notifyTitle");

const notifyMessage =
document.getElementById("notifyMessage");

const sendNotificationBtn =
document.getElementById("sendNotificationBtn");
// ======================
// Task Form
// ======================

const addTaskBtn =
document.getElementById("addTaskBtn");

const taskTitle =
document.getElementById("taskTitle");

const taskDescription =
document.getElementById("taskDescription");

const taskReward =
document.getElementById("taskReward");

const taskLink =
document.getElementById("taskLink");

const taskCategory =
document.getElementById("taskCategory");

const taskActive =
document.getElementById("taskActive");

// ======================
// Dashboard Elements
// ======================

const requestsDiv =
document.getElementById("requests");

const totalUsers =
document.getElementById("totalUsers");

const pendingWithdraw =
document.getElementById("pendingWithdraw");

const approvedWithdraw =
document.getElementById("approvedWithdraw");

const totalPayout =
document.getElementById("totalPayout");

const pendingCount =
document.getElementById("pendingCount");

// New Analytics

const totalSpins =
document.getElementById("totalSpins");

const totalScratch =
document.getElementById("totalScratch");

const totalTasks =
document.getElementById("totalTasks");

const platformEarning =
document.getElementById("platformEarning");

// ======================
// Admin Login Check
// ======================

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

if(user.email.toLowerCase()!=="kumarz7xo@gmail.com"){

alert("❌ Access Denied!");

window.location.href="dashboard.html";

return;

}

try{

requestsDiv.innerHTML="";

// Total Users

const usersSnapshot=
await getDocs(collection(db,"users"));

totalUsers.textContent=
usersSnapshot.size;

// Total Tasks

const taskSnapshot=
await getDocs(collection(db,"tasks"));

if(totalTasks){

totalTasks.textContent=
taskSnapshot.size;

}

// Platform Earnings

let earnings=0;

usersSnapshot.forEach((u)=>{

earnings+=Number(
u.data().totalEarned||0
);

});

if(platformEarning){

platformEarning.textContent=
"₹"+earnings;

}

// Total Spins

let spins=0;

usersSnapshot.forEach((u)=>{

if(u.data().lastSpinDate){

spins++;

}

});

if(totalSpins){

totalSpins.textContent=spins;

}

// Total Scratch

let scratch=0;

usersSnapshot.forEach((u)=>{

if(u.data().lastScratchDate){

scratch++;

}

});

if(totalScratch){

totalScratch.textContent=scratch;

}
  // ======================
// Withdraw Requests
// ======================

const snapshot =
await getDocs(
collection(db,"withdrawRequests")
);

let pending=0;
let approved=0;
let payout=0;

if(snapshot.empty){

pendingWithdraw.textContent="0";
approvedWithdraw.textContent="0";
totalPayout.textContent="₹0";
pendingCount.textContent="0";

requestsDiv.innerHTML=`

<div class="card">

<h3>📭 No Withdraw Requests</h3>

</div>

`;

} else {

snapshot.forEach((request)=>{

const data=request.data();

if(data.status==="Pending"){

pending++;

}

if(data.status==="Approved"){

approved++;

payout+=Number(data.amount||0);

}

let date="Unknown";

if(data.createdAt){

date=data.createdAt
.toDate()
.toLocaleString();

}

const box=document.createElement("div");

box.className="card";

box.innerHTML=`

<h3>👤 ${data.name}</h3>

<p><strong>Email:</strong> ${data.email}</p>

<p><strong>Amount:</strong> ₹${data.amount}</p>

<p><strong>UPI:</strong> ${data.upi}</p>

<p><strong>Status:</strong> ${data.status}</p>

<p><strong>Date:</strong> ${date}</p>

${
data.status==="Pending"
?`

<button id="approve-${request.id}">
✅ Approve
</button>

<button
id="reject-${request.id}"
style="margin-top:10px;background:#ef4444;">

❌ Reject

</button>

`
:""

}

`;

requestsDiv.appendChild(box);
// ======================
// Approve / Reject
// ======================

if(data.status==="Pending"){

// Approve

document
.getElementById(`approve-${request.id}`)
.addEventListener("click",async()=>{

try{

const userRef=doc(db,"users",data.uid);

const userSnap=await getDoc(userRef);

if(!userSnap.exists()){

alert("User not found!");

return;

}

const userData=userSnap.data();

if((userData.wallet||0)<Number(data.amount)){

alert("Wallet balance is low!");

return;

}

await updateDoc(userRef,{

wallet:
(userData.wallet||0)-Number(data.amount),

totalWithdraw:
(userData.totalWithdraw||0)+Number(data.amount)

});

await updateDoc(

doc(db,"withdrawRequests",request.id),

{

status:"Approved",

approvedAt:serverTimestamp()

}

);

await sendNotification(

data.uid,

"✅ Withdraw Approved",

`Your withdrawal of ₹${data.amount} has been approved.`

);

alert("✅ Withdraw Approved");

location.reload();

}catch(error){

console.error(error);

alert(error.message);

}

});

// Reject

document
.getElementById(`reject-${request.id}`)
.addEventListener("click",async()=>{

try{

await updateDoc(

doc(db,"withdrawRequests",request.id),

{

status:"Rejected",

rejectedAt:serverTimestamp()

}

);

await sendNotification(

data.uid,

"❌ Withdraw Rejected",

`Your withdrawal request of ₹${data.amount} has been rejected.`

);

alert("❌ Withdraw Rejected");

location.reload();

}catch(error){

console.error(error);

alert(error.message);

}

});

}
});

// ======================
// Dashboard Stats
// ======================

pendingWithdraw.textContent=pending;

approvedWithdraw.textContent=approved;

totalPayout.textContent=
"₹"+payout;

pendingCount.textContent=pending;

  // ======================
// Add New Task
// ======================

if (addTaskBtn) {

  addTaskBtn.addEventListener("click", async () => {

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const reward = Number(taskReward.value);
    const link = taskLink.value.trim();
    const category = taskCategory.value;
    const active = taskActive.checked;

    if (!title || !description || reward <= 0 || !link) {

      alert("⚠ Please fill all fields correctly.");

      return;

    }

    try {

      await addDoc(collection(db, "tasks"), {

        title,
        description,
        reward,
        link,
        category,
        active,
        createdAt: serverTimestamp()

      });

      alert("✅ Task Added Successfully!");

      // Reset Form

      taskTitle.value = "";
      taskDescription.value = "";
      taskReward.value = "";
      taskLink.value = "";
      taskCategory.value = "Website";
      taskActive.checked = true;

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  });

}

} catch (error) {

  console.error("Admin Error:", error);

  alert(error.message);

}

});

}
// ======================
// Broadcast Notification
// ======================

if (sendNotificationBtn) {

  sendNotificationBtn.addEventListener("click", async () => {

    const title = notifyTitle.value.trim();
    const message = notifyMessage.value.trim();

    if (!title || !message) {

      alert("⚠ Please enter title and message.");

      return;

    }

    try {

  const usersSnapshot =
    await getDocs(collection(db, "users"));

  if (usersSnapshot.empty) {

    alert("No users found.");

    return;

  }

  let sent = 0;

  for (const userDoc of usersSnapshot.docs) {

    await addDoc(collection(db, "notifications"), {

      uid: userDoc.id,

      title: title,

      message: message,

      read: false,

      createdAt: serverTimestamp()

    });

    sent++;

  }

  alert(`✅ Notification sent to ${sent} users.`);

  notifyTitle.value = "";
  notifyMessage.value = "";

} catch (error) {

  console.error(error);

  alert(error.message);

    }
      }

      alert(
        `✅ ${usersSnapshot.size} users found.\nReady to send notification.`
      );

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  });

}