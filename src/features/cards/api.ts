import { supabase } from '@/lib/supabase';
import type { SessionType } from '@/types/database';

export interface DbCard {
  key: string;
  sessionType: SessionType;
  dayCode: string;
  title: string;
}

function fromRow(row: { key: string; session_type: SessionType; day_code: string; title: string }): DbCard {
  return { key: row.key, sessionType: row.session_type, dayCode: row.day_code, title: row.title };
}

export async function listDbCardsForType(sessionType: SessionType) {
  const { data, error } = await supabase
    .from('cards')
    .select('key, session_type, day_code, title')
    .eq('session_type', sessionType)
    .order('created_at');
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

// Takvim gibi tüm türleri birlikte gösteren ekranlar için tek seferde tüm
// veritabanı kartlarını çeker (session_type ayrımı olmadan).
export async function listAllDbCards() {
  const { data, error } = await supabase.from('cards').select('key, session_type, day_code, title');
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function getDbCardByKey(key: string) {
  const { data, error } = await supabase
    .from('cards')
    .select('key, session_type, day_code, title')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

function slugify(text: string) {
  const map: Record<string, string> = {
    İ: 'i', I: 'i', ı: 'i', Ğ: 'g', ğ: 'g', Ü: 'u', ü: 'u', Ş: 's', ş: 's', Ö: 'o', ö: 'o', Ç: 'c', ç: 'c',
  };
  const replaced = text.replace(/[İIığĞğÜüŞşÖöÇç]/g, (c) => map[c] ?? c);
  const slug = replaced.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '');
  return slug || 'kart';
}

export interface NewCardExercise {
  exerciseId: string;
  sets: number;
  repsPerSet: number;
}

// Yeni bir kart (gün programı) oluşturur ve seçilen hareketleri sırayla
// card_exercises'e yazar. Anahtar (key) diğer tüm veriyi (session_entries,
// card_exercises) bu karta bağlamak için kullanılan sabit metindir.
export async function createCard(sessionType: SessionType, dayCode: string, exercises: NewCardExercise[]) {
  const key = `${sessionType}-${slugify(dayCode)}-${Date.now().toString(36)}`;
  const { error } = await supabase
    .from('cards')
    .insert({ key, session_type: sessionType, day_code: dayCode, title: dayCode });
  if (error) throw error;

  if (exercises.length > 0) {
    const rows = exercises.map((ex, index) => ({
      card_key: key,
      exercise_id: ex.exerciseId,
      sets: ex.sets,
      reps_per_set: ex.repsPerSet,
      sort_order: index,
    }));
    const { error: exError } = await supabase.from('card_exercises').insert(rows);
    if (exError) throw exError;
  }
  return key;
}
