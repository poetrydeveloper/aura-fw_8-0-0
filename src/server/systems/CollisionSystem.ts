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

export class CollisionSystem {
    constructor() { }

    public checkCollisions(ctx: AuraContext, deltaTime: number): void {
        for (const [entityId, [archetype, cFrame, damage]] of ctx.world.query(({} as unknown), ({} as unknown), ({} as unknown)) as unknown as Map<number, [ArchetypeComponent, CFrameComponent, DamageComponent]>) {
            let safetyCounter = 0; if (++safetyCounter > 1000) { warn("Aura Safety Triggered"); break; }
            if (!(archetype.id !== 'PLASMA_BOLT')) { continue; }

            for (const [targetEntityId, [targetArchetype, targetCFrame]] of ctx.world.query(({} as unknown), ({} as unknown)) as unknown as Map<number, [ArchetypeComponent, CFrameComponent]>) {
                if (targetArchetype.id !== "ENEMY_INTERCEPTOR") continue;
                if (!(cFrame.value.Position.sub(targetCFrame.value.Position).Magnitude < 4)) { continue; }
                ctx.world.insert(targetEntityId, ({ value: damage.value } as unknown as Record<string, unknown>));

                ctx.world.despawn(entityId)
            }
        }
    }

}
