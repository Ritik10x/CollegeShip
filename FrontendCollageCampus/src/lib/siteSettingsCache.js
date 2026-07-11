import { doc, getDoc } from "firebase/firestore";

const cache = new Map();

export async function getCachedDoc(db, collectionName, docId) {
  const key = `${collectionName}/${docId}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  const snap = await getDoc(doc(db, collectionName, docId));
  const data = snap.exists() ? snap.data() : null;
  cache.set(key, data);
  return data;
}

export function invalidateCachedDoc(collectionName, docId) {
  cache.delete(`${collectionName}/${docId}`);
}
