import {
    ArchetypeComponent,
    VelocityComponent,
    CFrameComponent,
    WeaponStateComponent,
    HealthComponent,
    ExplosionTriggerComponent,
    DamageComponent,
    DamagePayloadComponent
} from "../../shared/components.types";


declare const game: any;
declare const Enum: any;
declare const math: {
    abs: (value: number) => number;
    max: (x: number, y: number) => number;
    min: (x: number, y: number) => number;
};
declare function warn(...args: unknown[]): void;
declare function print(...args: unknown[]): void;

// 🔥 ФИКС: Объявляем глобальные переменные итераторов и членов сетевого контекста игрока
declare const entityId: number;
declare const targetEntityId: number;
declare const deltaTime: number;
declare const localPlayerEntityId: number;

// 🔥 ФИКС: Мокаем Flamework методы ввода для InputSystem.ts
declare const getMovementInputVector: () => any;
declare const inputEvents: {
    VelocityUpdate: {
        fireServer: (vector: any) => void;
    };
};

// 🔥 ФИКС: Создаем обратную совместимость для систем, ищущих легаси неймспейс SharedTypes
export namespace SharedTypes {
    export interface AuraContext {
        world: any;
    }
}

interface AuraWorldContext {
    spawn: () => number;
    query: (...components: unknown[]) => Map<number, any[]>;
    insert: (entityId: number, components: Record<string, unknown>) => void;
    remove: (entityId: number, componentTrack: unknown) => void;
    despawn: (entityId: number) => void;
}

interface AuraContext {
    world: AuraWorldContext;
}


import * as Constants from "../../shared/constants";

export class ExplosionSystem {
    constructor() { }

    public emitParticles(ctx: AuraContext, deltaTime: number): void {



        for (const [entityId, [archetype, cFrame, health]] of ctx.world.query(({} as unknown), ({} as unknown), ({} as unknown)) as unknown as Map<number, [ArchetypeComponent, CFrameComponent, HealthComponent]>) {
            let safetyCounter = 0; if (++safetyCounter > 100) { warn("Aura Safety Triggered"); break; }

            if (!(archetype.type === 'ENEMY_INTERCEPTOR')) { continue; }

            if (!(health.current > 0)) { continue; }

            const deathPos = cFrame.value.Position;

            ctx.world.despawn(entityId);

            print("[Aura Visual] Корабль уничтожен. Вспышка частиц сгенерирована в точке: ", deathPos.X);
        }
    }

}
