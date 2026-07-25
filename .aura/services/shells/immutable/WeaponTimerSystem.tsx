import { AuraShell, Query, Guard, Safety, Calculate, Mutate } from ".aura/core";

export const WeaponTimerSystem = AuraShell({
    id: "ecs_galaxy_weapon_timer_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    meta: {
        oddLayerIso34503: 3,
        executionSide: "Server",
        flameworkPattern: "MatterSystem",
        className: "WeaponTimerSystem",
        methodName: "tickWeaponTimers",
        uiTrigger: "Heartbeat",
        context: "Управление кулдаунами и готовностью оружия к следующему залпу"
    },
    perspectives: {
        semanticSvo: { subject: "WeaponTimerSystem", action: "Increments", object: "WeaponCooldownComponent" },
        dataFlow: { reads: ["WeaponCooldownComponent"], mutates: ["WeaponCooldownComponent"] }
    },
    render(ctx, deltaTime: number) {
        return (
            <Query components={["WeaponCooldownComponent"]}>
                <Guard condition="weaponCooldown.state === 'READY' || deltaTime <= 0" />
                <Safety limit={2000} />
                
                <Calculate var="nextTimer" expr="weaponCooldown.currentTimer + deltaTime" />
                
                {/* Кассетное ветвление переключения состояния оружия */}
                <Guard condition="nextTimer >= weaponCooldown.rateOfFire" />
                <Mutate component="WeaponCooldownComponent" values={{ state: "'READY'", currentTimer: "0" }} />
                
                <Guard condition="nextTimer < weaponCooldown.rateOfFire" />
                <Mutate component="WeaponCooldownComponent" values={{ currentTimer: "nextTimer" }} />
            </Query>
        );
    }
});
