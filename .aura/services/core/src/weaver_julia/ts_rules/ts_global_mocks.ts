/**
 * ⚡ МОДЕРНИЗИРОВАННОЕ ПРАВИЛО ТИПИЗАЦИИ: TS_GLOBAL_MOCKS v38.9 (JULIA SYNCHRONIZED)
 * Полное выжигание устаревших легаси-контекстов, синхронизация с каноном Luau/Matter ECS v38.9.
 */
export const tsGlobalMocks = `
// --- AURA RUNTIME GLOBAL MOCKS INTERFACES v38.9 ---
declare const game: unknown;
declare const Enum: unknown;
declare const math: {
    abs: (value: number) => number;
    max: (x: number, y: number) => number;
    min: (x: number, y: number) => number;
};
declare function warn(...args: unknown[]): void;
declare function print(...args: unknown[]): void;

// Декларируем глобальные переменные итераторов, чтобы линтер rbxtsc не выдавал Cannot find name
declare const entityId: number;
declare const targetEntityId: number;
declare const deltaTime: number;

interface AuraWorldContext {
    spawn: () => number;
    query: (...components: unknown[]) => Map<number, unknown[]>;
    insert: (entityId: number, components: Record<string, unknown>) => void;
    remove: (entityId: number, componentTrack: unknown) => void; // Добавлен метод remove для HealthSystem!
    despawn: (entityId: number) => void;
}

interface AuraContext {
    world: AuraWorldContext;
}
`;
