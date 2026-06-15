"use server";

import { commercialService, type CreateClientDTO, type UpdateClientDTO, type CommercialStage, type ClosedReason, type CreateActivityDTO } from "@/lib/services/commercial.service";
import { createClient } from "@/lib/supabase/server";

async function getCurrentUserEmail(): Promise<string | undefined> {
    const supabase = await createClient();
    const { data: { user } } = await supabase?.auth.getUser() ?? { data: { user: null } };
    return user?.email ?? undefined;
}

export async function getClientsAction() {
    try {
        return await commercialService.getClients();
    } catch (err: any) {
        console.error("[getClientsAction]", err);
        return [];
    }
}

export async function createClientAction(dto: CreateClientDTO): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const email = await getCurrentUserEmail();
        const client = await commercialService.createClient(dto, email);
        return { success: true, data: client };
    } catch (err: any) {
        console.error("[createClientAction]", err);
        return { success: false, error: err.message ?? "Erro ao criar cliente." };
    }
}

export async function updateClientAction(id: string, dto: UpdateClientDTO): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const client = await commercialService.updateClient(id, dto);
        return { success: true, data: client };
    } catch (err: any) {
        console.error("[updateClientAction]", err);
        return { success: false, error: err.message ?? "Erro ao atualizar cliente." };
    }
}

export async function updateStageAction(
    id: string,
    newStage: CommercialStage,
    closedReason?: ClosedReason,
    fromStage?: CommercialStage,
): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const email = await getCurrentUserEmail();
        const client = await commercialService.updateStage(id, newStage, closedReason, email, fromStage);
        return { success: true, data: client };
    } catch (err: any) {
        console.error("[updateStageAction]", err);
        return { success: false, error: err.message ?? "Erro ao mover cliente." };
    }
}

export async function getActivitiesAction(clientId: string) {
    try {
        return await commercialService.getActivities(clientId);
    } catch (err: any) {
        console.error("[getActivitiesAction]", err);
        return [];
    }
}

export async function addActivityAction(clientId: string, dto: CreateActivityDTO): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const email = await getCurrentUserEmail();
        const activity = await commercialService.addActivity(clientId, { ...dto, recorded_by: email });
        return { success: true, data: activity };
    } catch (err: any) {
        console.error("[addActivityAction]", err);
        return { success: false, error: err.message ?? "Erro ao registrar atividade." };
    }
}
