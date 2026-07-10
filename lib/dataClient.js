'use client';

import { supabase } from './supabaseBrowser';
import { CAT_ICON, CAT_LABEL } from './constants';

export async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

export async function requireLogin() {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function insertProduct({ cat, title, description, imageUrl }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('products').insert({
    cat, icon: CAT_ICON[cat], label: CAT_LABEL[cat], title, description, image_url: imageUrl || null, created_by: user.id,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function insertListing({ productId, region, price, deposit, meta, contact, imageUrl }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('listings').insert({
    product_id: productId, region, price, deposit, meta, contact, image_url: imageUrl || null, created_by: user.id,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateProductImage(productId, imageUrl) {
  const { error } = await supabase.from('products').update({ image_url: imageUrl }).eq('id', productId);
  if (error) throw error;
}

export async function updateProductInfo(productId, { title, description }) {
  const { error } = await supabase.from('products').update({ title, description }).eq('id', productId);
  if (error) throw error;
}

export async function insertInquiry({ listingId, name, contact, wantedDate, message }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('inquiries').insert({
    listing_id: listingId, name, contact, wanted_date: wantedDate || null, message, created_by: user.id,
  });
  if (error) throw error;
}

/* folder is 'products' or 'listings', just for tidy storage organisation */
export async function uploadPhoto(file, folder) {
  const { data: { user } } = await supabase.auth.getUser();
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${user.id}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('photos').upload(path, file, { cacheControl: '3600' });
  if (error) throw error;
  const { data } = supabase.storage.from('photos').getPublicUrl(path);
  return data.publicUrl;
}
