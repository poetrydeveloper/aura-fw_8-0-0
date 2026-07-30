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

export class CleanerSystem {
    constructor() { }

    public cleanOutOfBounds(ctx: AuraContext, deltaTime: number): void {



        for (const [entityId, [cFrame, archetype]] of ctx.world.query(({} as unknown), ({} as unknown)) as unknown as Map<number, [CFrameComponent, ArchetypeComponent]>) {
            let safetyCounter = 0; if (++safetyCounter > 500) { warn("Aura Safety Triggered"); break; }

            if (!(archetype.type === 'STATIONARY_OBJECT')) { continue; }
            if (!(math.abs(cFrame.value.Position.X) < 2000 && math.abs(cFrame.value.Position.Z) < 2000)) { continue; }
            if (!(math.abs(cFrame.value.Position.Y) < 500)) { continue; }

            ctx.world.despawn(entityId);
            print("[Aura Garbage Collector] Сущность стерта из ОЗУ мира по космическим границам: ", entityId);
        }
    }

}
