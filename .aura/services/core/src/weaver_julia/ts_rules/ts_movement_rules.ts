/**
 * ⚡ ИЗОЛИРОВАННОЕ ПРАВИЛО ТИПИЗАЦИИ: TS_MOVEMENT_RULES v42.1
 * Защита геометрии векторов и CFrame-перемещений от слепоты линтера roblox-ts.
 */
export const tsMovementRules = `
interface SafePosition {
    X: number;
    Y: number;
    Z: number;
}

interface SafeCFrameValue {
    Position: SafePosition;
}

interface SafeVector3Value {
    X: number;
    Y: number;
    Z: number;
    Magnitude: number;
    sub: (other: SafePosition) => SafeVector3Value;
    mul: (scalar: number) => SafeVector3Value;
}

declare global {
    interface CFrameComponent {
        value: SafeCFrameValue;
        lastUpdated: number;
    }
    interface VelocityComponent {
        value: SafeVector3Value;
        angular: SafeVector3Value;
    }
}
`;