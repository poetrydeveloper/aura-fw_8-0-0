import { AuraShell, Query, Guard, Safety, Calculate, Mutate } from ".aura/core";

export const WeaponTimerSystem = AuraShell({
    id: "ecs_galaxy_weapon_timer_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    className: "WeaponTimerSystem",
    flameworkPattern: "MatterSystem",
    methodName: "updateWeaponCooldowns",
    executionSide: "Server",
    rojoTarget: "src/server/systems/WeaponTimerSystem.ts", // <=== Наше Rojo-правило v15.0
    subject: "WeaponTimerSystem",
    action: "Updates",
    object: "WeaponStateComponent",
    render(ctx) {
        return (
            <Query components={["WeaponStateComponent", "ArchetypeComponent"]}>
                <Guard condition="weaponState.isCharging === true" />
                <Guard condition="weaponState.nextTimer <= 0" />
                <Safety limit={2000} />
                
                <Calculate var="timeDecrement" expr="deltaTime" />
                <Calculate var="nextTimer" expr="math.max(0, weaponState.nextTimer.sub(timeDecrement))" />
                
                <Guard condition="nextTimer === 0" />
                <Mutate component="WeaponStateComponent" values={{ nextTimer: "0", isCharging: "false" }} />
                
                {/* Luau-уведомление о готовности турелей коробля к залпу */}
                print("[Aura Weapon Grid] Перезарядка орудий завершена для сущности:", entityId);
            </Query>
        );
    }
});
