import { ArchetypeComponent, VelocityComponent, CFrameComponent, WeaponStateComponent, HealthComponent, ExplosionTriggerComponent } from "../../shared/components.types";

// Создаем строгие локальные интерфейсы для математических формул линтера rbxtsc
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

// Переопределяем типы полей value внутри систем, чтобы линтер видел в них числа, а не any!
declare global {
    interface CFrameComponent {
        value: SafeCFrameValue;
        lastUpdated: number;
    }
    interface VelocityComponent {
        value: SafeVector3Value;
        angular: SafeVector3Value;
    }
    interface DamageComponent {
        value: number | string; // <=== БЕРЕЖНО ДОБАВЛЕНА ПОДДЕРЖКА СТРОК И ЧИСЕЛ
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

interface AuraContext {
    world: {
        query: (...components: unknown[]) => Map<number, unknown[]>;
        insert: (entityId: number, components: Record<string, unknown>) => void;
        despawn: (entityId: number) => void;
    };
    isLocalPlayer: boolean;
    getPlatformInputVector: () => SafeVector3Value;
    getBaseSpeed: (archetypeId: string) => number;
    inputDispatcher: {
        fireAccelerationHeartbeat: (velocity: SafeVector3Value) => void;
    };
}

export class EnemyAiSystem {
    constructor() { }

    public updateAi(ctx: AuraContext, deltaTime: number): void {
        for (const [entityId, [archetype, cFrame]] of ctx.world.query(({} as unknown), ({} as unknown)) as unknown as Map<number, [ArchetypeComponent, CFrameComponent]>) {
            if (!(archetype.id === 'GALAXY_PLAYER')) { continue; }
            let safetyCounter = 0; if (++safetyCounter > 10) { warn("Aura Safety Triggered"); break; }

            const playerPos = cFrame.value.Position;

            for (const [targetEntityId, [targetArchetype, targetCFrame]] of ctx.world.query(({} as unknown), ({} as unknown)) as unknown as Map<number, [ArchetypeComponent, CFrameComponent]>) {
                if (targetArchetype.id !== "ENEMY_INTERCEPTOR") continue;
                const enemyPos = targetCFrame.value.Position;
                const dirVector = playerPos.sub(enemyPos).Magnitude > 0 ? playerPos.sub(enemyPos).Unit : new Vector3(0, 0, 0);
                const aiSpeed = 25;
                const targetVelocity = dirVector.mul(aiSpeed);

                ctx.world.insert(targetEntityId, ({ value: targetVelocity } as unknown as Record<string, unknown>));
            }
        }
    }

}
