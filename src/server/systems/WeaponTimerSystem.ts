declare const game: any; declare const Enum: any; declare const math: any;
declare const Vector3: any; declare const CFrame: any;
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;

export class WeaponTimerSystem {
    constructor() { }

    public updateWeaponCooldowns(ctx: any, deltaTime: number): void {
        AuraShell(
            id = "ecs_galaxy_weapon_timer_v1",
            status = "active",
            version = 1,
            vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
            className = "WeaponTimerSystem",
            flameworkPattern = "MatterSystem",
            methodName = "updateWeaponCooldowns",
            executionSide = "Server",
            rojoTarget = "src/server/systems/WeaponTimerSystem.ts",
            subject = "WeaponTimerSystem",
            action = "Updates",
            object = "WeaponStateComponent",

            render = function(ctx)
        for (const [entityId, [weaponState, archetype]] of ctx.world.query(({} as any), ({} as any))) {
            if (weaponState.isCharging == true) { continue; }
            if (weaponState.nextTimer <= 0) { continue; }
            let safetyCounter = 0; if (++safetyCounter > 2000) { warn("Aura Safety Triggered"); break; }

            const timeDecrement = deltaTime;
            const nextTimer = math.max(0, weaponState.nextTimer - timeDecrement);

            if (nextTimer == 0) { continue; }
            ctx.world.insert(entityId, ({ nextTimer: 0, isCharging: false }));

            print("[Aura Weapon Grid] Перезарядка орудий завершена для сущности: ", entityId)
        }
    }
        )

}

}
