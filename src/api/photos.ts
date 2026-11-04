/**
 * Photo upload, same result as the website (components/ImageUpload.tsx):
 * one JPEG of at most 2048 px and about 1.5 MB at `{user id}/{random}.jpg`, plus a small 480 px copy next to it
 * (`…_t.webp`, or `…_t.jpg` if WebP fails) for lists. Files are saved with a 1-year cache: names never repeat.
 */
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import type { SupabaseClient } from '@supabase/supabase-js';
import { thumbPath } from '@/core/images';
import { db } from './db';

const MAX_SIDE = 2048;
const MAX_BYTES = 1.5 * 1024 * 1024;
const THUMB_SIDE = 480;

const randomName = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

function fitWithin(w: number, h: number, max: number): { width?: number; height?: number } | null {
  if (!w || !h || Math.max(w, h) <= max) return null;
  return w >= h ? { width: max } : { height: max };
}

async function bytesOf(uri: string): Promise<ArrayBuffer> {
  const res = await fetch(uri);
  return res.arrayBuffer();
}

export type PickedPhoto = { uri: string; width: number; height: number };

/** Makes the upload-ready JPEG: resized, then compressed until it is under 1.5 MB. */
export async function prepareJpeg(p: PickedPhoto): Promise<ArrayBuffer> {
  const resize = fitWithin(p.width, p.height, MAX_SIDE);
  for (const q of [0.9, 0.8, 0.7, 0.6]) {
    const out = await manipulateAsync(p.uri, resize ? [{ resize }] : [], { compress: q, format: SaveFormat.JPEG });
    const data = await bytesOf(out.uri);
    if (data.byteLength <= MAX_BYTES || q === 0.6) return data;
  }
  throw new Error('That photo could not be prepared.');
}

export async function uploadAdPhoto(userId: string, p: PickedPhoto, c: SupabaseClient = db(), bucket: 'ad-photos' | 'shop-media' = 'ad-photos'): Promise<string> {
  const jpeg = await prepareJpeg(p);
  const path = `${userId}/${randomName()}.jpg`;
  const { error } = await c.storage.from(bucket).upload(path, jpeg, { contentType: 'image/jpeg', upsert: false, cacheControl: '31536000' });
  if (error) throw new Error(error.message);
  // Small copy for lists and cards (best effort: without it the full photo is shown).
  try {
    const small = fitWithin(p.width, p.height, THUMB_SIDE) ?? {};
    let thumb: ArrayBuffer; let webp = true;
    try {
      thumb = await bytesOf((await manipulateAsync(p.uri, [{ resize: small }], { compress: 0.78, format: SaveFormat.WEBP })).uri);
    } catch {
      webp = false;
      thumb = await bytesOf((await manipulateAsync(p.uri, [{ resize: small }], { compress: 0.74, format: SaveFormat.JPEG })).uri);
    }
    await c.storage.from(bucket).upload(thumbPath(path, webp ? 'webp' : 'jpg'), thumb, { contentType: webp ? 'image/webp' : 'image/jpeg', upsert: false, cacheControl: '31536000' });
  } catch { /* ignore */ }
  return c.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
