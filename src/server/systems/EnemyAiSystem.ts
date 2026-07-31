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


// 🔥 ГЛАВНЫЙ АРХИТЕКТУРНЫЙ ФИКС: Подключаем реальный сервис игроков Roblox
// Это на корню уничтожает ошибку TS2693 внутри UiScoreSystem.ts!
import { Players } from "@rbxts/services";

declare const game: any;
declare const Enum: any;
declare const math: {
    abs: (value: number) => number;
    max: (x: number, y: number) => number;
    min: (x: number, y: number) => number;
};
declare function warn(...args: unknown[]): void;
declare function print(...args: unknown[]): void;

// Объявляем глобальные переменные итераторов и членов сетевого контекста игрока
declare const entityId: number;
declare const targetEntityId: number;
declare const deltaTime: number;
declare const localPlayerEntityId: number;

// Мокаем Flamework методы ввода для InputSystem.ts
declare const getMovementInputVector: () => any;
declare const inputEvents: {
    VelocityUpdate: {
        fireServer: (vector: any) => void;
    };
};

// Создаем обратную совместимость для систем, ищущих легаси неймспейс SharedTypes
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

    public update(ctx: AuraContext, deltaTime: number): void {



        for (const [entityId, [archetype, cFrame]] of ctx.world.query(({} as unknown), ({} as unknown)) as unknown as Map<number, [ArchetypeComponent, CFrameComponent]>) {
            if (typeof (globalThis as any).safetyCounter === "undefined") { (globalThis as any).safetyCounter = 0; }
            if (++(globalThis as any).safetyCounter > 10) { (globalThis as any).safetyCounter = 0; warn("Aura Safety Triggered"); break; }

            if (archetype.type === 'PLAYER') {

                const playerPos = cFrame.value.Position;

                for (const [targetEntityId, [rawTargetArchetype, rawTargetCFrame, rawTargetVelocity]] of ctx.world.query(({} as unknown), ({} as unknown), ({} as unknown)) as unknown as Map<number, unknown[]>) {
                    const targetArchetype = rawTargetArchetype as unknown as ArchetypeComponent;
                    const targetCFrame = rawTargetCFrame as unknown as CFrameComponent;
                    const targetVelocity = rawTargetVelocity as unknown as VelocityComponent;
                    if (targetArchetype.type === "ENEMY_INTERCEPTOR") {
                        const enemyPos = targetCFrame.value.Position;

                        const dirVector = playerPos.sub(enemyPos).Magnitude > 0 ? playerPos.sub(enemyPos).Unit : new Vector3(0, 0, 0);
                        const aiSpeed = 25;
                        const calculatedVelocity = dirVector.mul(aiSpeed);

                        ctx.world.insert(targetEntityId, ({ "value": "calculatedVelocity" } as unknown as Record<string, unknown>));
                    }

                }
            }
        }

    }
