import { ArchetypeComponent, VelocityComponent, CFrameComponent, WeaponStateComponent, HealthComponent, ExplosionTriggerComponent } from "../../shared/components.types";


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

// Изолировано в общем контуре

declare global {
    interface DamageComponent {
        value: number | string;
    }
}


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


import { ENEMY_INTERCEPTOR, GALAXY_PLAYER, PLASMA_BOLT, ALIENS, HUMANS, NEUTRAL } from "../../shared/constants";

export class EnemySpawnSystem {
    constructor() { }

    public spawnWaves(ctx: AuraContext, deltaTime: number): void {
        const spawnCooldown = 5;
        const randomX = math.min(500, math.max(-500, 200));
        const spawnPos = new Vector3(randomX, 0, 0);

        if ((math.abs(randomX) < 1000)) {
            ctx.world.insert(ctx.world.spawn(), ({ id: ENEMY_INTERCEPTOR, faction: ALIENS, mass: 100 } as unknown as Record<string, unknown>));
            print("[Aura Spawner] Новая волна ИИ-перехватчиков материализована в координатах: ", randomX)
        }
    }

}
