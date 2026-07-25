import { AuraShell, Query, Guard, Safety, NestedQuery, Mutate } from ".aura/core";

export const CollisionSystem = AuraShell({
    id: "ecs_galaxy_collision_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    meta: {
        oddLayerIso34503: 5,
        executionSide: "Server",
        flameworkPattern: "MatterSystem",
        className: "CollisionSystem",
        methodName: "checkCollisions",
        uiTrigger: "Heartbeat",
        context: "Расчет пересечения пространственных векторов снарядов и перехватчиков"
    },
    perspectives: {
        semanticSvo: { subject: "CollisionSystem", action: "Triggers", object: "DamagePayloadComponent" },
        dataFlow: { reads: ["ArchetypeComponent", "CFrameComponent", "DamageComponent"], mutates: ["DamagePayloadComponent"] }
    },
    render(ctx) {
        return (
            <Query components={["ArchetypeComponent", "CFrameComponent", "DamageComponent"]}>
                <Safety limit={1000} />
                <Guard condition="archetype.id !== 'PLASMA_BOLT'" />
                
                {/* Вложенный цикл сканирования по архетипу врагов */}
                <NestedQuery target="ENEMY_INTERCEPTOR">
                    <Guard condition="cframe.value.Position.sub(targetCFrame.value.Position).Magnitude < 4" />
                    {/* Накладываем дельту урона на цель и мгновенно утилизируем снаряд */}
                    <Mutate component="DamagePayloadComponent" values={{ value: "damage.value" }} targetEntity="targetEntityId" />
                    ctx.world.despawn(entityId);
                </NestedQuery>
            </Query>
        );
    }
});
