'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { User } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

export async function registerUser(name: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Nama minimal terdiri dari 2 karakter.' };
    }

    if (trimmedName.length > 50) {
      return { success: false, error: 'Nama maksimal 50 karakter.' };
    }

    // Seamless fallback to mock database if Supabase credentials are placeholder values
    if (!isSupabaseConfigured()) {
      const user = mockDb.registerUser(trimmedName);
      return { success: true, user };
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('users')
      .insert({
        name: trimmedName,
        score: 0,
        current_level: 1,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Gagal mendaftarkan peserta ke Nexus.' };
    }

    return {
      success: true,
      user: data as User,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal server.';
    return { success: false, error: message };
  }
}
