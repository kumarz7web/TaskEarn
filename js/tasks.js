import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const tasksContainer =
document.getElementById("tasksContainer");

// =======================
// Open Verification Page
// =======================

function openVerifyPage(taskId, data) {

  // Open Task Website
  window.open(data.link, "_blank");

  // Redirect to Verification Page
  const url =
  `verify-task.html?` +

  `taskId=${encodeURIComponent(taskId)}` +

  `&title=${encodeURIComponent(data.title)}` +

  `&description=${encodeURIComponent(data.description)}` +

  `&reward=${encodeURIComponent(data.reward)}` +

  `&category=${encodeURIComponent(data.category || "Website")}`;

  window.location.href = url;

}
// =======================
// Load Dynamic Tasks
// =======================

async function loadTasks() {

  try {

    const snapshot =
    await getDocs(collection(db, "tasks"));

    if (snapshot.empty) {

      tasksContainer.innerHTML = `

      <div class="task-card">

      <h3>📭 No Tasks Available</h3>

      <p>Please check again later.</p>

      </div>

      `;

      return;

    }

    tasksContainer.innerHTML = "";

    snapshot.forEach((task) => {

      const data = task.data();

      if (data.active === false) return;

      let icon = "📌";

      if (data.category === "Website") {

        icon = "🌐";

      } else if (data.category === "Video") {

        icon = "📺";

      } else if (data.category === "Survey") {

        icon = "📋";

      }

      tasksContainer.innerHTML += `

      <div class="task-card">

        <div class="task-top">

          <h3>${icon} ${data.title}</h3>

          <span class="reward">

            +₹${data.reward}

          </span>

        </div>

        <p>${data.description}</p>

        <button id="${task.id}">

          ▶ Start Task

        </button>

      </div>

      `;

    });

    // =======================
    // Button Events
    // =======================

    const buttons =
    tasksContainer.querySelectorAll("button");

    buttons.forEach((btn) => {

      btn.addEventListener("click", () => {

        const taskDoc =
        snapshot.docs.find(
          (t) => t.id === btn.id
        );

        if (!taskDoc) return;

        const data =
        taskDoc.data();

        openVerifyPage(
          taskDoc.id,
          data
        );

      });

    });

  } catch (error) {

    console.error(
      "Task Load Error:",
      error
    );

    tasksContainer.innerHTML = `

    <div class="task-card">

      <h3>❌ Error Loading Tasks</h3>

      <p>${error.message}</p>

    </div>

    `;

  }

}
// =======================
// Disable Completed Tasks
// =======================

async function loadCompletedTasks() {

  const user = auth.currentUser;

  if (!user) return;

  try {

    const userRef =
    doc(db, "users", user.uid);

    const userSnap =
    await getDoc(userRef);

    if (!userSnap.exists()) return;

    const completedTasks =
    userSnap.data().completedTasks || [];

    completedTasks.forEach((taskId) => {

      const btn =
      document.getElementById(taskId);

      if (btn) {

        btn.disabled = true;

        btn.innerText =
        "✅ Completed";

      }

    });

  } catch (error) {

    console.error(
      "Completed Task Error:",
      error
    );

  }

}

// =======================
// Firebase Auth
// =======================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
    "login.html";

    return;

  }

  await loadTasks();

  // Wait until buttons are created
  setTimeout(async () => {

    await loadCompletedTasks();

  }, 300);

});