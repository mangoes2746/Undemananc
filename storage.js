// Firebase Storage helpers for restaurant media
import { app } from "./firebase-config.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const storage = getStorage(app);

export async function uploadRestaurantPhoto(uid, restaurantId, file) {
  if (!uid) throw new Error("Nu ești conectat.");
  if (!file) throw new Error("Alege o imagine.");
  if (!file.type.startsWith("image/")) throw new Error("Fișierul trebuie să fie o imagine.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Imaginea trebuie să aibă cel mult 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `restaurants/${restaurantId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, {
    contentType: file.type,
    customMetadata: { ownerId: uid, restaurantId }
  });
  return getDownloadURL(fileRef);
}

export async function uploadProfilePhoto(uid, file) {
  if (!uid) throw new Error("Nu eÈ™ti conectat.");
  if (!file) throw new Error("Alege o imagine.");
  if (!file.type.startsWith("image/")) throw new Error("FiÈ™ierul trebuie sÄƒ fie o imagine.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Imaginea trebuie sÄƒ aibÄƒ cel mult 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `profiles/${uid}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, {
    contentType: file.type,
    customMetadata: { ownerId: uid }
  });
  return getDownloadURL(fileRef);
}
