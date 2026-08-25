-- Kartın hareket programına takım geneli için varsayılan ağırlık (kg) eklenir.
-- Bir oyuncu antrenmana ilk kez katıldı işaretlendiğinde session_entries'e bu
-- varsayılan ağırlık kopyalanır; oyuncu bazında bu değer sonradan değiştirilebilir
-- (session_entries.load_kg), kartın kendi varsayılanı değişmez.

alter table public.card_exercises add column default_weight_kg numeric(6, 2);
