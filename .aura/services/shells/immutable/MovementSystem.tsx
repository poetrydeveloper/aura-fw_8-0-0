import { AuraShell, Query, Guard, Safety, Calculate, Mutate } from ".aura/core";

export const MovementSystem = AuraShell({
    id: "ecs_move_02_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    className: "MovementSystem",
    flameworkPattern: "MatterSystem",
    methodName: "updateMovement",
    executionSide: "Server",
    rojoTarget: "src/server/systems/MovementSystem.ts", // Наше Rojo-правило v15.0
    subject: "MovementSystem",
    action: "Updates",
    object: "CFrameComponent",
    render(ctx) {
        return (
            <Query components={["VelocityComponent", "CFrameComponent", "ArchetypeComponent"]}>
                <Guard condition="deltaTime <= 0" />
                <Guard condition="archetype.id === 'STATIC_METEOR'" />
                <Safety limit={5000} />
                
                <Calculate var="currentVelocity" expr="velocity.value" />
                <Calculate var="deltaPos" expr="currentVelocity.mul(deltaTime)" />
                <Calculate var="nextCFrame" expr="cFrame.value.add(deltaPos)" />
                
                <Mutate component="CFrameComponent" values={{ value: "nextCFrame" }} />
                
                {/* Отладочный Luau-вектор движения в ОЗУ сервера */}
                if (currentVelocity.Magnitude > 100) {
                    print("[AURA Physics] Обнаружено высокоскоростное перемещение объекта:", entityId);
                }
            </Query>
        );
    }
});
