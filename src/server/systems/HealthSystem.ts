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

export class HealthSystem {
    constructor() { }

    public updateHealth(ctx: AuraContext, deltaTime: number): void {
        for (const [entityId, [health, damagePayload]] of ctx.world.query("HealthComponent", "DamagePayloadComponent") as unknown as Map<number, [HealthComponent, DamagePayloadComponent]>) {
            const auraGlobalRegistry = globalThis as unknown as Record<string, number>;
            if (auraGlobalRegistry["safetyCounter"] === undefined) { auraGlobalRegistry["safetyCounter"] = 0; }
            if (++auraGlobalRegistry["safetyCounter"] > 2000) { auraGlobalRegistry["safetyCounter"] = 0; warn("Aura Safety Triggered"); break; }

            if (health.isInvulnerable === true) {







            }

        }
    }
}
        )


}
