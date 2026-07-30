/**
 * ⚡ МОДЕРНИЗИРОВАННОЕ ПРАВИЛО ТИПИЗАЦИИ: TS_MOVEMENT_RULES v38.9 (JULIA SYNCHRONIZED)
 * Полная защита геометрии векторов и CFrame-перемещений без конфликтов declare global.
 * Внедрен метод .add() для физического движка MovementSystem.jl.
 */
export const tsMovementRules = `
// Суррогатные типы математической матрицы Roblox API для линтера rbxtsc
interface SafePosition {
    X: number;
    Y: number;
    Z: number;
}

interface SafeCFrameValue {
    Position: SafePosition;
    // 🔥 ФИКС: Инжектирован метод add() для нативного смещения матриц в MovementSystem.jl
    add: (vectorDelta: SafeVector3Value) => SafeCFrameValue;
}

interface SafeVector3Value {
    X: number;
    Y: number;
    Z: number;
    Magnitude: number;
    Unit: SafeVector3Value; // Добавлено свойство нормализации .Unit для EnemyAiSystem.jl!
    sub: (other: SafePosition | SafeVector3Value) => SafeVector3Value;
    mul: (scalar: number) => SafeVector3Value;
}

// 🔥 ФИКС: Убран declare global. Интерфейсы бесшовно расширяются свойствами 
// благодаря общему скоупу импорта в ts_post_processor.ts
interface CFrameComponent {
    value: SafeCFrameValue;
    lastUpdated: number;
}

interface VelocityComponent {
    value: SafeVector3Value;
    angular: SafeVector3Value;
}
`;
