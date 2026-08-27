import fs from 'fs';
let content = fs.readFileSync('src/firebase.ts', 'utf8');

const firebaseInit = `
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export async function saveWatchProgress(data: {
  userId: string;
  mediaId: string;
  mediaType: string;
  progress: number;
  duration?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  title: string;
  imageUrl: string;
}) {
  if (!data.userId) return;
  const progressId = \`\${data.userId}_\${data.mediaId}\`;
  const docRef = doc(firestoreDb, 'watch_progress', progressId);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getContinueWatching(userId: string) {
  if (!userId) return [];
  const q = query(
    collection(firestoreDb, 'watch_progress'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
`;

content = content.replace('export const db = {} as any;', firebaseInit);
fs.writeFileSync('src/firebase.ts', content);
