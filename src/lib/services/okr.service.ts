import { createClient } from '@/lib/supabase/client';
import type { Objective, KeyResult, OKRStatus } from '@/types/product';

export class OKRService {
    private get supabase() {
        return createClient();
    }

    async getObjectivesByQuarter(quarter: string): Promise<Objective[]> {
        const { data } = await this.supabase
            .from('objectives')
            .select('*, key_results(*)')
            .eq('quarter', quarter)
            .order('created_at', { ascending: true });

        return data ?? [];
    }

    calculateObjectiveProgress(obj: Objective): number {
        const krs = obj.key_results ?? [];
        if (krs.length === 0) return 0;

        const avg = krs.reduce((s, kr) => {
            const progress = (kr.current_value / (kr.target_value || 1)) * 100;
            return s + Math.min(100, Math.max(0, progress));
        }, 0) / krs.length;

        return Math.round(avg);
    }

    async createObjective(title: string, quarter: string): Promise<Objective | null> {
        const { data } = await this.supabase
            .from('objectives')
            .insert({ title: title.trim(), quarter, status: 'on_track' as OKRStatus })
            .select()
            .single();

        return data;
    }

    async deleteObjective(id: string): Promise<void> {
        await this.supabase.from('objectives').delete().eq('id', id);
    }
}

export const okrService = new OKRService();
