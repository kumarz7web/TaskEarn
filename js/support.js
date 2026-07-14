import { auth, db } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
collection,
addDoc,
query,
where,
orderBy,
serverTimestamp,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const chatBox =
document.getElementById("chatBox");

const messageInput =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

let currentUser = null;

// =====================
// Auth
// =====================

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.href="login.html";

return;

}

currentUser=user;

loadChat();

});

// =====================
// Live Chat
// =====================

function loadChat(){

const q=query(

collection(db,"supportChats"),

where("uid","==",currentUser.uid),

orderBy("createdAt","asc")

);

onSnapshot(q,(snapshot)=>{

chatBox.innerHTML="";

if(snapshot.empty){

chatBox.innerHTML=`
<p class="loading">
Start chatting with Support 👋
</p>
`;

return;

}

snapshot.forEach((doc)=>{

const data=doc.data();

let time="";

if(data.createdAt){

time=data.createdAt
.toDate()
.toLocaleTimeString();

}

chatBox.innerHTML+=`

<div class="message ${data.sender}">

${data.message}

<span class="time">

${time}

</span>

</div>

`;

});

chatBox.scrollTop=chatBox.scrollHeight;

});

}

// =====================
// Send Message
// =====================

sendBtn.addEventListener("click",sendMessage);

messageInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

sendMessage();

}

});

async function sendMessage(){

const text=messageInput.value.trim();

if(!text)return;

try{

await addDoc(collection(db,"supportChats"),{

uid:currentUser.uid,

sender:"user",

message:text,

createdAt:serverTimestamp()

});

messageInput.value="";

}catch(error){

console.error(error);

alert(error.message);

}

}