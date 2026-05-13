// Firebase Authentication for UndeMananc
import { auth } from "./firebase-config.js";
import { createUserProfile, getUserProfile } from "./db.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  reauthenticateWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ── Auth state observer ───────────────────────────────────────────────────────
// Calls callback(user) whenever auth state changes. user is null if logged out.
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function currentUser() {
  return auth.currentUser;
}

// ── Register ─────────────────────────────────────────────────────────────────
export async function register(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await createUserProfile(cred.user.uid, { name, email });
  return cred.user;
}

// ── Login ────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const cred = await signInWithPopup(auth, provider);
    await ensureUserProfile(cred.user);
    return cred.user;
  } catch (error) {
    if (error.code === "auth/popup-blocked") {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

export async function finishGoogleRedirectLogin() {
  const result = await getRedirectResult(auth);
  if (!result?.user) return null;
  await ensureUserProfile(result.user);
  return result.user;
}

async function ensureUserProfile(user) {
  const profile = await getUserProfile(user.uid);
  if (!profile) {
    await createUserProfile(user.uid, {
      name: getDisplayName(user),
      email: user.email || ""
    });
  }
}

// ── Logout ───────────────────────────────────────────────────────────────────
export async function logout() {
  await signOut(auth);
}

export async function reauthenticate(password) {
  const user = auth.currentUser;
  if (!user?.email) throw new Error("Nu ești conectat.");

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  return user;
}

export async function reauthenticateWithGoogle() {
  const user = auth.currentUser;
  if (!user) throw new Error("Nu ești conectat.");

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await reauthenticateWithPopup(user, provider);
  return user;
}

export async function deleteAccount() {
  const user = auth.currentUser;
  if (!user) throw new Error("Nu ești conectat.");
  await deleteUser(user);
}

// ── Get display name ─────────────────────────────────────────────────────────
export function getDisplayName(user) {
  return user?.displayName || user?.email?.split("@")[0] || "Utilizator";
}
