import { auth, db } from "./firebase.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
collection,
query,
orderBy,
limit,
getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const leaderboard =
document.getElementById("leaderboard");

const earnTab =
document.getElementById("earnTab");

const xpTab =
document.getElementById("xpTab");

const refTab =
document.getElementById("refTab");

let currentUser = null;

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.href="login.html";

return;

}

currentUser=user;

loadLeaderboard("totalEarned");

});

// ==========================
// Load Leaderboard
// ==========================

async function loadLeaderboard(field){

leaderboard.innerHTML="<p>Loading...</p>";

try{

const q=query(

collection(db,"users"),

orderBy(field,"desc"),

limit(10)

);

const snap=await getDocs(q);

let html="";

let rank=1;

snap.forEach((doc)=>{

const data=doc.data();

let medal="";

if(rank===1) medal="🥇";
else if(rank===2) medal="🥈";
else if(rank===3) medal="🥉";
else medal="🏅";

let cls="player-card";

if(currentUser && currentUser.uid===data.uid){

cls+=" me";

}
        html += `

      <div class="${cls}
      ${rank===1?" gold":""}
      ${rank===2?" silver":""}
      ${rank===3?" bronze":""}">

        <div class="player-left">

          <div class="rank">
            ${medal}
          </div>

          <div>

            <div class="name">
              ${data.name || "User"}
            </div>

            <small>
              Level ${data.level || 1}
            </small>

          </div>

        </div>

        <div class="value">

          ${
            field==="totalEarned"
              ? "₹"+Number(data.totalEarned||0)
            : field==="xp"
              ? Number(data.xp||0)+" XP"
            : Number(data.referrals||0)
          }

        </div>

      </div>

      `;

      rank++;

    });

    if(html===""){

      html="<p>No users found.</p>";

    }

    leaderboard.innerHTML=html;

  }catch(error){

    console.error(error);

    leaderboard.innerHTML=
    `<p>${error.message}</p>`;

  }

}

// ==========================
// Tabs
// ==========================

earnTab.addEventListener("click",()=>{

loadLeaderboard("totalEarned");

});

xpTab.addEventListener("click",()=>{

loadLeaderboard("xp");

});

refTab.addEventListener("click",()=>{

loadLeaderboard("referrals");

});