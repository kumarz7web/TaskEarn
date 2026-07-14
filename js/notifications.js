import { auth, db } from "./firebase.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const notificationList =
document.getElementById("notificationList");

const refreshBtn =
document.getElementById("refreshBtn");

// =========================
// Load Notifications
// =========================

async function loadNotifications(user){

notificationList.innerHTML=`
<div class="card">
<h3>⏳ Loading...</h3>
<p>Please wait...</p>
</div>
`;

try{

const q=query(

collection(db,"notifications"),

where("uid","==",user.uid),

orderBy("createdAt","desc")

);

const snapshot=await getDocs(q);

notificationList.innerHTML="";

if(snapshot.empty){

notificationList.innerHTML=`
<div class="card">

<h3>📭 No Notifications</h3>

<p>
You don't have any notifications yet.
</p>

</div>
`;

return;

}

snapshot.forEach((doc)=>{

const data=doc.data();

let date="Just Now";

if(data.createdAt){

date=data.createdAt
.toDate()
.toLocaleString();

}

let icon="🔔";

if(data.title){

if(data.title.includes("Task"))
icon="✅";

else if(data.title.includes("Login"))
icon="🎁";

else if(data.title.includes("Approved"))
icon="💸";

else if(data.title.includes("Rejected"))
icon="❌";

else if(data.title.includes("Withdraw"))
icon="💰";

}

notificationList.innerHTML+=`

<div class="card">

<h3>${icon} ${data.title}</h3>

<p>${data.message}</p>

<small>

🕒 ${date}

</small>

</div>

`;

});

}catch(error){

console.error(error);

notificationList.innerHTML=`

<div class="card">

<h3>❌ Error</h3>

<p>${error.message}</p>

</div>

`;

}

}

// =========================
// Auth
// =========================

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.href="login.html";

return;

}

loadNotifications(user);

if(refreshBtn){

refreshBtn.onclick=()=>{

loadNotifications(user);

};

}

});