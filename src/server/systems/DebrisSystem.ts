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

export class DebrisSystem {
    constructor() { }

    public cleanGarbage(ctx: AuraContext, deltaTime: number): void {
        for (const [entityId, [archetype, cFrame]] of ctx.world.query(({} as unknown), ({} as unknown)) as unknown as Map<number, [ArchetypeComponent, CFrameComponent]>) {
            let safetyCounter = 0; if (++safetyCounter > 1000) { warn("Aura Safety Triggered"); break; }

            const currentPos = cFrame.value.Position;
            const archId = archetype.id;

            if ((archId === PLASMA_BOLT)) {
                if ((math.abs(currentPos.X) > 2000)) {
                    ctx.world.despawn(entityId)
                    print("[Aura Garbage] Снаряд выжжен из ОЗУ сервера по лимиту дистанции.")
                }
            }

            if ((archId === ENEMY_INTERCEPTOR)) {
                if ((math.abs(currentPos.X) > 3000)) {
                    ctx.world.despawn(entityId)
                    print("[Aura Garbage] Потерянный перехватчик удален из памяти для оптимизации.")
                }
            }
        }
    }

}
