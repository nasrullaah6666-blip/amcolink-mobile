/** Shop reviews (website: ShopReviews, ReviewForm, ReplyForm). The database decides who may review (review_status). */
import type { SupabaseClient } from '@supabase/supabase-js';
import { db, must } from './db';

export type Review = { id: string; reviewer_id: string; reviewer_name: string; rating: number; comment: string; seller_reply: string | null; created_at: string };

export async function fetchReviews(shopId: string, c: SupabaseClient = db()): Promise<{ list: Review[]; status: string }> {
  const [r, st] = await Promise.all([
    c.from('reviews').select('id,reviewer_id,reviewer_name,rating,comment,seller_reply,created_at').eq('shop_id', shopId).order('created_at', { ascending: false }).limit(30),
    c.rpc('review_status', { p_shop: shopId }),
  ]);
  return { list: must(r) as Review[], status: String(st.data || 'signin') };
}

export async function saveReview(userId: string, shopId: string, rating: number, comment: string, existingId?: string, c: SupabaseClient = db()) {
  const values = { rating, comment: comment.trim().slice(0, 500) };
  const { error } = existingId
    ? await c.from('reviews').update(values).eq('id', existingId)
    : await c.from('reviews').insert({ ...values, shop_id: shopId, reviewer_id: userId });
  if (error) throw new Error(error.message);
}

export async function saveReply(reviewId: string, text: string, c: SupabaseClient = db()) {
  const { error } = await c.from('reviews').update({ seller_reply: text.trim().slice(0, 500) || null }).eq('id', reviewId);
  if (error) throw new Error(error.message);
}
