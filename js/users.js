import { auth, db } from "./firebase.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const usersList =
document.getElementById("usersList");

const searchUser =
document.getElementById("searchUser");

let allUsers = [];

// =====================
// Admin Check
// =====================

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

if(user.email.toLowerCase()!=="kumarz7xo@gmail.com"){

alert("❌ Access Denied");

window.location.href="dashboard.html";

return;

}

loadUsers();

});

// =====================
// Load Users
// =====================

async function loadUsers(){

usersList.innerHTML="Loading...";

const snapshot=
await getDocs(collection(db,"users"));

allUsers=[];

snapshot.forEach(doc=>{

allUsers.push({

id:doc.id,

...doc.data()

});

});

displayUsers(allUsers);

}

// =====================
// Display Users
// =====================

function displayUsers(users){

usersList.innerHTML="";

if(users.length===0){

usersList.innerHTML=`
<h3>No Users Found</h3>
`;

return;

}

users.forEach(user=>{

usersList.innerHTML+=`

<div class="user-card">

<h3>${user.name||"User"}</h3>

<p>📧 ${user.email}</p>

<p>💰 Wallet: ₹${user.wallet||0}</p>

<p>⭐ XP: ${user.xp||0}</p>

<p>👑 Level: ${user.level||1}</p>

<p>👥 Referrals: ${user.referrals||0}</p>

<div class="action-buttons">

<button
class="edit-btn"
id="edit-${user.id}">

✏ Edit

</button>

<button
class="ban-btn"
id="ban-${user.id}">

🚫 Ban

</button>

</div>

</div>

`;

});

}

// =====================
// Live Search
// =====================

searchUser.addEventListener("input",()=>{

const value=
searchUser.value.toLowerCase();

const filtered=
allUsers.filter(user=>

(user.name||"")
.toLowerCase()
.includes(value)

||

(user.email||"")
.toLowerCase()
.includes(value)

);

displayUsers(filtered);

});
// =====================
// Edit Wallet / XP / Level
// =====================

import {
doc,
updateDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Display Users ko replace karo is version se

function displayUsers(users){

usersList.innerHTML="";

if(users.length===0){

usersList.innerHTML="<h3>No Users Found</h3>";

return;

}

users.forEach(user=>{

usersList.innerHTML+=`

<div class="user-card">

<h3>${user.name||"User"}</h3>

<p>📧 ${user.email}</p>

<p>💰 Wallet: ₹${user.wallet||0}</p>

<p>⭐ XP: ${user.xp||0}</p>

<p>👑 Level: ${user.level||1}</p>

<p>👥 Referrals: ${user.referrals||0}</p>

<div class="action-buttons">

<button
class="edit-btn"
onclick="editUser('${user.id}',${user.wallet||0},${user.xp||0},${user.level||1})">

✏ Edit

</button>

<button
class="ban-btn"
onclick="toggleBan('${user.id}',${user.banned||false})">

${user.banned ? "✅ Unban" : "🚫 Ban"}

</button>

</div>

</div>

`;

});

}

// =====================
// Global Functions
// =====================

window.editUser=async(id,wallet,xp,level)=>{

const newWallet=prompt("Wallet",wallet);

if(newWallet===null)return;

const newXP=prompt("XP",xp);

if(newXP===null)return;

const newLevel=prompt("Level",level);

if(newLevel===null)return;

await updateDoc(doc(db,"users",id),{

wallet:Number(newWallet),

xp:Number(newXP),

level:Number(newLevel)

});

alert("✅ User Updated");

loadUsers();

};

// =====================
// Ban / Unban
// =====================

window.toggleBan=async(id,status)=>{

await updateDoc(doc(db,"users",id),{

banned:!status

});

alert(status?"✅ User Unbanned":"🚫 User Banned");

loadUsers();

};