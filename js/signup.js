import { auth, db } from "./firebase.js";
import { addXP } from "./xp.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const referralCode = document
    .getElementById("referralCode")
    .value
    .trim()
    .toUpperCase();

  const submitBtn = signupForm.querySelector("button");

  if (!name || !email || !password || !confirmPassword) {
    alert("⚠ Please fill all fields.");
    return;
  }

  if (password.length < 6) {
    alert("⚠ Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    alert("⚠ Passwords do not match.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating Account...";

  try {

    // Create Firebase User
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Generate Unique Referral Code
    const myReferralCode =
      name.replace(/\s+/g, "")
      .substring(0, 4)
      .toUpperCase() +
      Math.floor(1000 + Math.random() * 9000);

    // Save New User
    await setDoc(doc(db, "users", user.uid), {

      uid: user.uid,

      name,

      email,

      wallet: 10,

      totalEarned: 10,

      bonus: 10,

      referrals: 0,

      referralReward: 0,

      referralCode: myReferralCode,

      referredBy: referralCode || "",

      completedTasks: [],

      streak: 0,

      loginStreak: 0,

      level: 1,

      xp: 0,

      createdAt: serverTimestamp()

    });

        // ==========================
    // Welcome Bonus Transaction
    // ==========================

    await addDoc(collection(db, "transactions"), {

      uid: user.uid,

      title: "Welcome Bonus",

      amount: 10,

      type: "Credit",

      createdAt: serverTimestamp()

    });

    // ==========================
    // Welcome Notification
    // ==========================

    await addDoc(collection(db, "notifications"), {

      uid: user.uid,

      title: "🎉 Welcome to TaskEarn",

      message: "You received ₹10 Welcome Bonus. Start completing tasks and earn more!",

      read: false,

      createdAt: serverTimestamp()

    });

    // ==========================
    // Referral Reward
    // ==========================

    if (referralCode !== "") {

      const q = query(
        collection(db, "users"),
        where("referralCode", "==", referralCode)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {

        const referrerDoc = snapshot.docs[0];
        const referrer = referrerDoc.data();

        // Referrer Reward
        await updateDoc(referrerDoc.ref, {

          wallet: Number(referrer.wallet || 0) + 20,

          totalEarned: Number(referrer.totalEarned || 0) + 20,

          referrals: increment(1),

          referralReward: Number(referrer.referralReward || 0) + 20

        });

        // New User Bonus
        await updateDoc(doc(db, "users", user.uid), {

          wallet: 20,

          totalEarned: 20,

          bonus: 20

        });

        // Referrer XP
        await addXP(referrer.uid, 20);

        // Referrer Transaction
        await addDoc(collection(db, "transactions"), {

          uid: referrer.uid,

          title: "Referral Bonus",

          amount: 20,

          type: "Credit",

          createdAt: serverTimestamp()

        });

        // New User Transaction
        await addDoc(collection(db, "transactions"), {

          uid: user.uid,

          title: "Referral Signup Bonus",

          amount: 10,

          type: "Credit",

          createdAt: serverTimestamp()

        });

        // Referrer Notification
        await addDoc(collection(db, "notifications"), {

          uid: referrer.uid,

          title: "🎉 Referral Bonus",

          message: `${name} joined using your referral code. You earned ₹20.`,

          read: false,

          createdAt: serverTimestamp()

        });

        // New User Notification
        await addDoc(collection(db, "notifications"), {

          uid: user.uid,

          title: "🎁 Referral Applied",

          message: "Referral code applied successfully. Enjoy your bonus rewards!",

          read: false,

          createdAt: serverTimestamp()

        });

      } else {

        alert("⚠ Invalid Referral Code. Account created successfully.");

      }

    }

        // ==========================
    // Success
    // ==========================

    alert(
      "🎉 Account Created Successfully!\n\n" +
      "💰 Welcome Bonus: ₹10\n" +
      (referralCode ? "🎁 Referral Applied Successfully!\n" : "") +
      "\nNow Login & Start Earning!"
    );

    window.location.href = "login.html";

  } catch (error) {

    console.error(error);

    switch (error.code) {

      case "auth/email-already-in-use":
        alert("⚠ This email is already registered.");
        break;

      case "auth/invalid-email":
        alert("⚠ Invalid email address.");
        break;

      case "auth/weak-password":
        alert("⚠ Password is too weak.");
        break;

      case "auth/network-request-failed":
        alert("🌐 Network Error! Check your internet connection.");
        break;

      default:
        alert(error.message);

    }

  } finally {

    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";

  }

});