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

export class WeaponTimerSystem {
    constructor() { }

    public updateWeaponCooldowns(ctx: AuraContext, deltaTime: number): void {



        for (const [entityId, [weaponState, archetype]] of ctx.world.query(({} as unknown), ({} as unknown)) as unknown as Map<number, [WeaponStateComponent, ArchetypeComponent]>) {
            let safetyCounter = 0; if (++safetyCounter > 2000) { warn("Aura Safety Triggered"); break; }

            if (!(weaponState.isCharging === false)) { continue; }

            if (!(weaponState.nextTimer <= 0)) { continue; }

            const timeDecrement = deltaTime;
            const nextCooldown = math.max(0, weaponState.nextTimer - timeDecrement);

            ctx.world.insert(entityId, ({} as unknown as Record<string, unknown>));
            component = "WeaponStateComponent",
                values = Dict(
                    "nextTimer" => "nextCooldown",
                    "isCharging" => "nextCooldown > 0 ? true : false", # Если таймер еще тикает — остаемся в режиме зарядки
        "ammoCapacity" => "weaponState.ammoCapacity"
                )
        );

            if (!(nextCooldown > 0)) { continue; }

            print("[Aura Weapon Grid] Перезарядка орудий завершена для сущности: ", entityId);
        }
    }

}
