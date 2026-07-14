import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const loginBtn = loginForm.querySelector("button");

  if (!email || !password) {
    alert("⚠ Please fill all fields.");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging In...";

  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    // ======================
    // Ban Check
    // ======================

    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const data = userSnap.data();

      if (data.banned === true) {

        alert("🚫 Your account has been banned by Admin.");

        await signOut(auth);

        return;

      }

    }

    alert("🎉 Login Successful!");

    window.location.href = "dashboard.html";

  } catch (error) {

    console.error(error);

    switch (error.code) {

      case "auth/invalid-email":
        alert("⚠ Invalid Email.");
        break;

      case "auth/invalid-credential":
        alert("❌ Wrong Email or Password.");
        break;

      case "auth/user-disabled":
        alert("❌ This account has been disabled.");
        break;

      case "auth/too-many-requests":
        alert("⚠ Too many attempts. Try again later.");
        break;

      default:
        alert(error.message);

    }

  } finally {

    loginBtn.disabled = false;
    loginBtn.textContent = "Login";

  }

});