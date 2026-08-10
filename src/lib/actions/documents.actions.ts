"use server";

import { createClient } from "@/lib/supabase/server";

export type DocumentCategory = 'touchpoints' | 'templates' | 'comercial' | 'gtm' | 'outros';

export interface DocumentRecord {
  id: string;
  name: string;
  description: string | null;
  category: DocumentCategory;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export type SaveDocumentDTO = {
  name: string;
  description?: string;
  category: DocumentCategory;
  file_path: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
};

async function getCurrentUserEmail(): Promise<string | undefined> {
  const supabase = await createClient();
  if (!supabase) return undefined;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email ?? undefined;
}

export async function getDocumentsAction(): Promise<DocumentRecord[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("hub_documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("[getDocumentsAction]", err);
    return [];
  }
}

export async function saveDocumentAction(
  dto: SaveDocumentDTO,
): Promise<{ success: true; data: DocumentRecord } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Supabase client indisponível" };
    const email = await getCurrentUserEmail();

    const { data, error } = await supabase
      .from("hub_documents")
      .insert({
        name: dto.name,
        description: dto.description ?? null,
        category: dto.category,
        file_path: dto.file_path,
        file_name: dto.file_name,
        file_size: dto.file_size ?? null,
        mime_type: dto.mime_type ?? null,
        uploaded_by: email ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("[saveDocumentAction]", err);
    return { success: false, error: err.message ?? "Erro ao salvar documento." };
  }
}

export async function deleteDocumentAction(
  id: string,
  filePath: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Supabase client indisponível" };

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("hub_documents")
      .remove([filePath]);
    if (storageError) console.warn("[deleteDocumentAction] storage:", storageError.message);

    // Delete metadata
    const { error } = await supabase
      .from("hub_documents")
      .delete()
      .eq("id", id);
    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("[deleteDocumentAction]", err);
    return { success: false, error: err.message ?? "Erro ao deletar documento." };
  }
}

export async function getSignedUrlAction(
  filePath: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    if (!supabase) return { success: false, error: "Supabase client indisponível" };
    const { data, error } = await supabase.storage
      .from("hub_documents")
      .createSignedUrl(filePath, 3600); // 1h
    if (error) throw error;
    return { success: true, url: data.signedUrl };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Erro ao gerar link." };
  }
}
