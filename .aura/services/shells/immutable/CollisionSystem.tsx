import { AuraShell, Query, Guard, Safety, Calculate, Mutate, NestedQuery } from ".aura/core";

export const CollisionSystem = AuraShell({
    id: "ecs_galaxy_collision_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    className: "CollisionSystem",
    flameworkPattern: "MatterSystem",
    methodName: "checkCollisions",
    executionSide: "Server",
    rojoTarget: "src/server/systems/CollisionSystem.ts", // <=== Наше Rojo-правило v15.0
    subject: "CollisionSystem",
    action: "Detects",
    object: "HealthComponent",
    render(ctx) {
        return (
            <Query components={["CFrameComponent", "VelocityComponent", "ArchetypeComponent"]}>
                <Guard condition="ctx.isServer === false" />
                <Guard condition="archetype.id !== 'PROJECTILE'" />
                <Safety limit={1000} />
                
                <NestedQuery target="GALAXY_PLAYER">
                    <Calculate var="distance" expr="cFrame.value.Position.sub(targetCFrame.value.Position).Magnitude" />
                    <Guard condition="distance > 3" />
                    
                    <Calculate var="damagePayload" expr="math.clamp(velocity.value.Magnitude.mul(2), 10, 50)" />
                    <Mutate targetEntity="targetEntityId" component="HealthComponent" values={{ current: "targetHealth.current.sub(damagePayload)" }} />
                    <Mutate component="ExplosionTriggerComponent" values={{ radius: 12, force: 300, active: true }} />
                    
                    {/* Прямой Luau-код обработки эффектов на сервере */}
                    print("Cosmic Collision detected between Projectile and Player! Distance:", distance);
                    warn("Applying planetary damage payload to Entity:", targetEntityId);
                </NestedQuery>
            </Query>
        );
    }
});
