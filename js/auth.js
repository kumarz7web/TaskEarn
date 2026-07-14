import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================
// SIGNUP
// ==========================

const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {

  signupBtn.addEventListener("click", async () => {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (name === "" || email === "" || password === "") {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {

        name: name,
        email: email,
        wallet: 0,
        completedTasks: [],
        referrals: 0,
        createdAt: new Date().toISOString()

      });

      alert("🎉 Account Created Successfully!");

      window.location.href = "login.html";

    } catch (error) {

      alert(error.message);

    }

  });

}


// ==========================
// LOGIN
// ==========================

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {

  loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (email === "" || password === "") {
      alert("Please enter email and password.");
      return;
    }

    try {

      await signInWithEmailAndPassword(auth, email, password);

      alert("✅ Login Successful!");

      window.location.href = "dashboard.html";

    } catch (error) {

      alert(error.message);

    }

  });

}