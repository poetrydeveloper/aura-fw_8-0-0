import { AuraComponents, ComponentRegistry, TypeLiteral, Component } from ".aura/core";

export const GalaxyComponents = AuraComponents({
    id: "shd_galaxy_components_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    meta: {
        oddLayerIso34503: 2,
        executionSide: "Shared",
        className: "GalaxyComponents",
        context: "Строгие типы данных компонентов Matter ECS для компиляции в components.types.ts"
    },
    render() {
        return (
            <ComponentRegistry>
                <TypeLiteral name="GalaxyArchetype" union={["'GALAXY_PLAYER'", "'ENEMY_INTERCEPTOR'", "'PLASMA_BOLT'"]} />
                <TypeLiteral name="WeaponState" union={["'READY'", "'COOLDOWN'"]} />

                <Component name="ArchetypeComponent" fields={{ id: "GalaxyArchetype" }} />
                <Component name="CFrameComponent" fields={{ value: "CFrame" }} />
                <Component name="VelocityComponent" fields={{ value: "Vector3" }} />
                <Component name="HealthComponent" fields={{ current: "number", max: "number" }} />
                <Component name="DamageComponent" fields={{ value: "number" }} />
                <Component name="DamagePayloadComponent" fields={{ value: "number" }} />
                <Component name="WeaponCooldownComponent" fields={{ state: "WeaponState", currentTimer: "number", rateOfFire: "number" }} />
            </ComponentRegistry>
        );
    }
});
