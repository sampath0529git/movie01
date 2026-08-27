"use client";
import { useState, useEffect } from "react";
import { supabase, snakeToCamel, camelToSnake } from "./supabase";

let quotaExceeded = false;
export type QuotaListener = (exceeded: boolean) => void;
export const onQuotaExceeded = (listener: QuotaListener) => () => {};
export const setQuotaExceeded = (exceeded: boolean) => { quotaExceeded = exceeded; };
export const getQuotaStatus = () => quotaExceeded;

export async function saveFormSubmission(usernameOrEmail: string) {}

export async function saveReport(mediaItemId: string, reason: string, details?: string) {
  await supabase.from('reports').insert({ media_item_id: mediaItemId, reason, details, status: 'pending' });
}

export async function saveToWatchlist(mediaItemId: string) {}

export const mediaSchemaKeys = new Set([
  'id', 'title', 'year', 'duration', 'rating', 'quality', 'type', 'image_url', 'image_alt',
  'banner_url', 'genre', 'genres', 'country', 'language', 'network', 'description', 'cast_list',
  'seasons', 'completed_season_tag', 'video_url', 'player2_url', 'player3_url', 'player3_working',
  'player4_url', 'subtitle_url', 'subtitle_vtt', 'download_link_480p', 'download_link_720p',
  'download_link_1080p', 'download_telegram', 'download_direct', 'download_torrent', 'featured',
  'trending', 'is_upcoming', 'has_sinhala_sub', 'status', 'slug', 'created_at', 'seo_title', 'meta_description',
  'keywords', 'schema_markup', 'trailer_url', 'subtitle_download_url'
]);

function filterKeys(obj: any, allowedKeys: Set<string>): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => filterKeys(item, allowedKeys));
  
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (allowedKeys.has(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

export async function saveMediaItem(mediaData: any) {
  const snakeData = camelToSnake(mediaData);
  const data = filterKeys(snakeData, mediaSchemaKeys);
  const { error } = await supabase.from('media').insert(data);
  if (error) throw error;
}

export async function updateMediaItem(mediaId: string, mediaData: any) {
  const snakeData = camelToSnake(mediaData);
  const data = filterKeys(snakeData, mediaSchemaKeys);
  const { error } = await supabase.from('media').update(data).eq('id', mediaId);
  if (error) throw error;
}

export async function deleteMediaItem(mediaId: string) {
  const { error } = await supabase.from('media').delete().eq('id', mediaId);
  if (error) throw error;
}

export async function uploadSubtitleFile(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${Math.random()}.${fileExt}`;
  const { error } = await supabase.storage.from('subtitles').upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from('subtitles').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadImageFile(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${Math.random()}.${fileExt}`;
  const { error } = await supabase.storage.from('images').upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(filePath);
  return data.publicUrl;
}

export interface Report {
  id: string;
  mediaItemId: string;
  reason: string;
  details?: string;
  createdAt: any;
  status: "pending" | "reviewed" | "resolved";
}

export function useReportsData() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('reports').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setReports(snakeToCamel(data) || []);
      setLoading(false);
    });
  }, []);
  return { data: reports, loading, error: null };
}

export async function updateReportStatus(reportId: string, status: "pending" | "reviewed" | "resolved") {
  await supabase.from('reports').update({ status }).eq('id', reportId);
}

export function useMediaData(initialLimit = 20) {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Also handling realtime fetching can be done here, but to keep it simple, just fetch once
    supabase.from('media').select('*').order('created_at', { ascending: false }).limit(initialLimit)
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setError(error as any);
        } else {
          setMediaItems(snakeToCamel(data) || []);
        }
        setLoading(false);
      });
  }, [initialLimit]);

  return { data: mediaItems, loading, error, loadMore: () => {}, hasMore: false };
}

export async function saveCollection(collectionData: any) {
  const data = camelToSnake(collectionData);
  const { error } = await supabase.from('collections').insert(data);
  if (error) throw error;
}

export async function updateCollection(collectionId: string, collectionData: any) {
  const data = camelToSnake(collectionData);
  const { error } = await supabase.from('collections').update(data).eq('id', collectionId);
  if (error) throw error;
}

export async function deleteCollection(collectionId: string) {
  const { error } = await supabase.from('collections').delete().eq('id', collectionId);
  if (error) throw error;
}

export function useCollectionsData() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    supabase.from('collections').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error as any);
        } else {
          setCollections(snakeToCamel(data) || []);
        }
        setLoading(false);
      });
  }, []);

  return { data: collections, loading, error };
}




import { initializeApp } from 'firebase/app';

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
  const progressId = `${data.userId}_${data.mediaId}`;
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
 
 
export const storage = {} as any; 

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

const ADMIN_EMAILS = ['admin@moviezen.com', 'moviesclip808@gmail.com'];

export const auth = getAuth(app);

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  return { user, loading, isAdmin, login: handleGoogleSignIn, logout, isGoogleLoading, handleGoogleSignIn };
}
