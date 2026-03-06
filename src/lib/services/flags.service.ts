import { prisma } from "@/lib/prisma";

export type FlagType = "release" | "experiment" | "kill_switch";

export interface CreateFlagDTO {
    key: string;
    label: string;
    description?: string;
    type: FlagType;
    rollout?: number;
    segments?: string[];
}

export class FlagsService {
    /**
     * Lista todas as feature flags ordenadas por atualização.
     */
    async getFlags() {
        return await prisma.featureFlag.findMany({
            orderBy: { updatedAt: "desc" },
        });
    }

    /**
     * Cria uma nova feature flag.
     */
    async createFlag(data: CreateFlagDTO) {
        return await prisma.featureFlag.create({
            data: {
                key: data.key,
                label: data.label,
                description: data.description,
                type: data.type,
                rollout: data.rollout ?? 0,
                segments: data.segments ?? [],
                // Inicializa flags de ambiente como false por padrão
                isDev: true,
                isStaging: false,
                isProd: false
            },
        });
    }

    /**
   * Ativa ou desativa uma flag em um ambiente específico.
   */
    async toggleFlag(id: string, environment: "dev" | "staging" | "prod", active: boolean) {
        const data: any = {};
        if (environment === "dev") data.isDev = active;
        if (environment === "staging") data.isStaging = active;
        if (environment === "prod") data.isProd = active;

        return await prisma.featureFlag.update({
            where: { id },
            data,
        });
    }

    /**
     * Atualiza o percentual de rollout.
     */
    async updateRollout(id: string, rollout: number) {
        return await prisma.featureFlag.update({
            where: { id },
            data: { rollout },
        });
    }
}

export const flagsService = new FlagsService();
