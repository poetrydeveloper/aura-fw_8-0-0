/**
 * ⚡ ИЗОЛИРОВАННОЕ ПРАВИЛО ТИПИЗАЦИИ: TS_GLOBAL_MOCKS v43.8
 * Полное выжигание глобальных declare const констант контента игры.
 * Исключает коллизии слияния областей видимости с файлом constants.ts.
 */
export const tsGlobalMocks = `
declare const game: unknown;
declare const Enum: unknown;
declare const math: {
    abs: (value: number) => number;
    max: (x: number, y: number) => number;
    min: (x: number, y: number) => number;
};
declare function warn(...args: unknown[]): void;
declare function print(...args: unknown[]): void;

interface AuraWorldContext {
    spawn: () => number;
    query: (...components: unknown[]) => Map<number, unknown[]>;
    insert: (entityId: number, components: Record<string, unknown>) => void;
    despawn: (entityId: number) => void;
}

interface AuraContext {
    world: AuraWorldContext;
    isLocalPlayer: boolean;
    getPlatformInputVector: () => SafeVector3Value;
    getBaseSpeed: (archetypeId: string) => number;
    inputDispatcher: {
        fireAccelerationHeartbeat: (velocity: SafeVector3Value) => void;
    };
}
`;