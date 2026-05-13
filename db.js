// Firestore database operations for UndeMananc
import { db } from "./firebase-config.js";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs, query, where,
  serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── User profile ─────────────────────────────────────────────────────────────

export async function createUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), {
    name: data.name || "",
    email: data.email || "",
    createdAt: serverTimestamp()
  }, { merge: true });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
}

export async function deleteUserData(uid) {
  const batch = writeBatch(db);

  const favoritesSnap = await getDocs(collection(db, "users", uid, "favorites"));
  favoritesSnap.docs.forEach(favorite => batch.delete(favorite.ref));

  const reviewsSnap = await getDocs(query(collection(db, "reviews"), where("uid", "==", uid)));
  reviewsSnap.docs.forEach(review => batch.delete(review.ref));

  batch.delete(doc(db, "users", uid));
  await batch.commit();
}

// ── Favorites ────────────────────────────────────────────────────────────────

export async function getFavorites(uid) {
  const snap = await getDocs(collection(db, "users", uid, "favorites"));
  return new Set(snap.docs.map(d => d.id));
}

export async function addFavorite(uid, restaurantName) {
  await setDoc(doc(db, "users", uid, "favorites", restaurantName), {
    addedAt: serverTimestamp()
  });
}

export async function removeFavorite(uid, restaurantName) {
  await deleteDoc(doc(db, "users", uid, "favorites", restaurantName));
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export async function getReviews(restaurantId) {
  const q = query(
    collection(db, "reviews"),
    where("restaurantId", "==", restaurantId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt));
}

export async function addReview(uid, userName, restaurantId, rating, text) {
  await addDoc(collection(db, "reviews"), {
    uid,
    userName,
    restaurantId,
    rating,
    text,
    createdAt: serverTimestamp()
  });
}

// ── Restaurants ──────────────────────────────────────────────────────────────

export async function getRestaurants() {
  const snap = await getDocs(collection(db, "restaurants"));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

export async function seedRestaurants(restaurants) {
  const snap = await getDocs(collection(db, "restaurants"));
  if (!snap.empty) return; // already seeded
  const batch = writeBatch(db);
  restaurants.forEach(r => {
    const ref = doc(db, "restaurants", r.id || slugify(r.name));
    batch.set(ref, serializeRestaurant(r));
  });
  await batch.commit();
}

function serializeRestaurant(restaurant) {
  return {
    ...restaurant,
    menu: restaurant.menu.map(item => {
      if (!Array.isArray(item)) return item;
      const [name, desc, price, img] = item;
      return { name, desc, price, img };
    })
  };
}

function timestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  return new Date(value).getTime() || 0;
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
