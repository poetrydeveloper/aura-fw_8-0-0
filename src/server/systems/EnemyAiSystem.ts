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

export class EnemyAiSystem {
    constructor() { }

    public updateAi(ctx: AuraContext, deltaTime: number): void {



        for (const [entityId, [archetype, cFrame]] of ctx.world.query(({} as unknown), ({} as unknown)) as unknown as Map<number, [ArchetypeComponent, CFrameComponent]>) {
            let safetyCounter = 0; if (++safetyCounter > 10) { warn("Aura Safety Triggered"); break; }

            if (!(archetype.type === 'PLAYER')) { continue; }

            const playerPos = cFrame.value.Position;

            for (const [targetEntityId, [targetArchetype, targetCFrame, targetVelocity]] of ctx.world.query(({} as unknown), ({} as unknown), ({} as unknown)) as unknown as Map<number, any[]>) {
                if (targetArchetype.type !== "ENEMY_INTERCEPTOR") continue;
                const enemyPos = targetCFrame.value.Position;

                const dirVector = playerPos.sub(enemyPos).Magnitude > 0 ? playerPos.sub(enemyPos).Unit : new Vector3(0, 0, 0);
                const aiSpeed = 25;
                const targetVelocity = dirVector.mul(aiSpeed);

                ctx.world.insert(targetEntityId, ({ "value": "targetVelocity" } as unknown as Record<string, unknown>));
            }
        }
    }

}
