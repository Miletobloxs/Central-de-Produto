import { createClient } from "@/lib/supabase/server";

export type CommercialStage = 'contact' | 'nda' | 'proposal' | 'homologation' | 'active' | 'closed';
export type ActivityType = 'meeting' | 'email' | 'call' | 'nda_sent' | 'nda_signed' | 'contract_sent' | 'contract_signed' | 'go_live' | 'note' | 'stage_change';
export type ClosedReason = 'churn' | 'lost' | 'disqualified';

export interface CommercialClient {
    id: string;
    company_name: string;
    contact_name: string | null;
    contact_email: string | null;
    stage: CommercialStage;
    product_type: string[];
    origin_channel: string | null;
    hubspot_deal_id: string | null;
    nda_sent_at: string | null;
    nda_signed_at: string | null;
    nda_url: string | null;
    contract_sent_at: string | null;
    contract_signed_at: string | null;
    contract_url: string | null;
    contract_mrr: number | null;
    portal_access_at: string | null;
    go_live_at: string | null;
    epic_ids: string[];
    blockers: string | null;
    closed_reason: string | null;
    notes: string | null;
    owner: string | null;
    created_at: string;
    updated_at: string;
}

export interface CommercialActivity {
    id: string;
    client_id: string;
    activity_type: ActivityType;
    title: string;
    description: string | null;
    stage_from: string | null;
    stage_to: string | null;
    recorded_by: string | null;
    occurred_at: string;
    created_at: string;
}

export type CreateClientDTO = {
    company_name: string;
    contact_name?: string;
    contact_email?: string;
    product_type?: string[];
    origin_channel?: string;
    owner?: string;
};

export type UpdateClientDTO = Partial<Omit<CommercialClient, 'id' | 'created_at' | 'updated_at'>>;

export type CreateActivityDTO = {
    activity_type: ActivityType;
    title: string;
    description?: string;
    stage_from?: string;
    stage_to?: string;
    recorded_by?: string;
    occurred_at?: string;
};

export class CommercialService {
    private async db() {
        return createClient();
    }

    async getClients(): Promise<CommercialClient[]> {
        const supabase = await this.db();
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('commercial_clients')
            .select('*')
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data ?? [];
    }

    async createClient(dto: CreateClientDTO, recordedBy?: string): Promise<CommercialClient> {
        const supabase = await this.db();
        if (!supabase) throw new Error('Supabase unavailable');

        const { data: client, error } = await supabase
            .from('commercial_clients')
            .insert({
                company_name: dto.company_name,
                contact_name: dto.contact_name ?? null,
                contact_email: dto.contact_email ?? null,
                product_type: dto.product_type ?? [],
                origin_channel: dto.origin_channel ?? null,
                owner: dto.owner ?? null,
                stage: 'contact',
            })
            .select()
            .single();
        if (error) throw error;

        await this.addActivity(client.id, {
            activity_type: 'meeting',
            title: 'Prospect criado',
            description: `Primeiro contato com ${dto.company_name}`,
            recorded_by: recordedBy,
        });

        return client;
    }

    async updateClient(id: string, dto: UpdateClientDTO): Promise<CommercialClient> {
        const supabase = await this.db();
        if (!supabase) throw new Error('Supabase unavailable');
        const { data, error } = await supabase
            .from('commercial_clients')
            .update(dto)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateStage(id: string, newStage: CommercialStage, closedReason?: ClosedReason, recordedBy?: string, fromStage?: CommercialStage): Promise<CommercialClient> {
        const supabase = await this.db();
        if (!supabase) throw new Error('Supabase unavailable');

        const patch: Record<string, unknown> = { stage: newStage };
        if (newStage === 'closed' && closedReason) patch.closed_reason = closedReason;

        const { data, error } = await supabase
            .from('commercial_clients')
            .update(patch)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;

        const stageLabels: Record<string, string> = {
            contact: 'Contato Inicial', nda: 'NDA', proposal: 'Proposta / Contrato',
            homologation: 'Homologação', active: 'Cliente Ativo', closed: 'Encerrado',
        };

        await this.addActivity(id, {
            activity_type: 'stage_change',
            title: `Avançou para ${stageLabels[newStage] ?? newStage}`,
            stage_from: fromStage,
            stage_to: newStage,
            recorded_by: recordedBy,
        });

        return data;
    }

    async getActivities(clientId: string): Promise<CommercialActivity[]> {
        const supabase = await this.db();
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('commercial_activities')
            .select('*')
            .eq('client_id', clientId)
            .order('occurred_at', { ascending: false });
        if (error) throw error;
        return data ?? [];
    }

    async addActivity(clientId: string, dto: CreateActivityDTO): Promise<CommercialActivity> {
        const supabase = await this.db();
        if (!supabase) throw new Error('Supabase unavailable');
        const { data, error } = await supabase
            .from('commercial_activities')
            .insert({
                client_id: clientId,
                activity_type: dto.activity_type,
                title: dto.title,
                description: dto.description ?? null,
                stage_from: dto.stage_from ?? null,
                stage_to: dto.stage_to ?? null,
                recorded_by: dto.recorded_by ?? null,
                occurred_at: dto.occurred_at ?? new Date().toISOString(),
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
}

export const commercialService = new CommercialService();
