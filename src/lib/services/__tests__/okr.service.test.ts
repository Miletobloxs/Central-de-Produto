import { describe, it, expect, vi, beforeEach } from 'vitest';
import { okrService } from '../okr.service';
import { createClient } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(),
}));

describe('OKRService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            from: vi.fn(),
            select: vi.fn(),
            eq: vi.fn(),
            order: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            single: vi.fn(),
        };

        // Setup chainable returns
        mockSupabase.from.mockReturnValue(mockSupabase);
        mockSupabase.select.mockReturnValue(mockSupabase);
        mockSupabase.eq.mockReturnValue(mockSupabase);
        mockSupabase.order.mockReturnValue(mockSupabase);
        mockSupabase.insert.mockReturnValue(mockSupabase);
        mockSupabase.update.mockReturnValue(mockSupabase);
        mockSupabase.delete.mockReturnValue(mockSupabase);
        mockSupabase.single.mockReturnValue(mockSupabase);

        (createClient as any).mockReturnValue(mockSupabase);
    });

    it('should fetch objectives for a specific quarter', async () => {
        const mockData = [
            { id: '1', title: 'Objective 1', quarter: 'Q1 2026', status: 'on_track' },
        ];

        mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

        const result = await okrService.getObjectivesByQuarter('Q1 2026');

        expect(mockSupabase.from).toHaveBeenCalledWith('objectives');
        expect(mockSupabase.eq).toHaveBeenCalledWith('quarter', 'Q1 2026');
        expect(result).toEqual(mockData);
    });

    it('should calculate objective progress based on key results', () => {
        const objective = {
            id: '1',
            key_results: [
                { current_value: 50, target_value: 100 },
                { current_value: 25, target_value: 100 },
            ],
        } as any;

        const progress = okrService.calculateObjectiveProgress(objective);
        expect(progress).toBe(38); // (50% + 25%) / 2 = 37.5 -> 38
    });

    it('should create a new objective', async () => {
        const newObj = { id: '2', title: 'New Goal', quarter: 'Q1 2026', status: 'on_track' };
        mockSupabase.single.mockResolvedValue({ data: newObj, error: null });

        const result = await okrService.createObjective('New Goal', 'Q1 2026');

        expect(mockSupabase.insert).toHaveBeenCalledWith({
            title: 'New Goal',
            quarter: 'Q1 2026',
            status: 'on_track',
        });
        expect(result).toEqual(newObj);
    });

    it('should delete an objective', async () => {
        await okrService.deleteObjective('123');

        expect(mockSupabase.from).toHaveBeenCalledWith('objectives');
        expect(mockSupabase.delete).toHaveBeenCalled();
        expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123');
    });
});
