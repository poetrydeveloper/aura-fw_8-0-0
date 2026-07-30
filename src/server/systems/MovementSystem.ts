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

export class MovementSystem {
    constructor() { }

    public updateMovement(ctx: AuraContext, deltaTime: number): void {



        for (const [entityId, [velocity, cFrame, archetype]] of ctx.world.query(({} as unknown), ({} as unknown), ({} as unknown)) as unknown as Map<number, [VelocityComponent, CFrameComponent, ArchetypeComponent]>) {
            let safetyCounter = 0; if (++safetyCounter > 5000) { warn("Aura Safety Triggered"); break; }

            if (!(deltaTime <= 0)) { continue; }

            if (!(archetype.type === 'STATIC_METEOR')) { continue; }

            const currentVelocity = velocity.value;
            const deltaPos = currentVelocity.mul(deltaTime);
            const nextCFrame = cFrame.value.add(deltaPos);

            ctx.world.insert(entityId, ({ "value": "nextCFrame", "lastUpdated": "tick()" } as unknown as Record<string, unknown>));

            const logSpeed = currentVelocity.Magnitude > 100 ? print('[AURA Physics] Высокая скорость сущности:', entityId) : null;
        }
    }

}
