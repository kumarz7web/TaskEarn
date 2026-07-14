import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==========================
// Send Notification
// ==========================

export async function sendNotification(
  uid,
  title,
  message
) {

  try {

    // Validation
    if (!uid || !title || !message) {

      console.error("Notification Error: Missing required fields.");

      return false;

    }

    await addDoc(collection(db, "notifications"), {

      uid: uid,

      title: title,

      message: message,

      read: false,

      createdAt: serverTimestamp()

    });

    return true;

  } catch (error) {

    console.error("Notification Error:", error);

    return false;

  }

}