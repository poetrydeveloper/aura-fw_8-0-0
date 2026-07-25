import { AuraShell, Query, Guard, Safety, Mutate } from ".aura/core";

export const CleanerSystem = AuraShell({
    id: "ecs_galaxy_cleaner_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    meta: {
        oddLayerIso34503: 5,
        executionSide: "Server",
        flameworkPattern: "MatterSystem",
        className: "CleanerSystem",
        methodName: "cleanupMemory",
        uiTrigger: "Heartbeat",
        context: "Очистка памяти сервера от улетевших снарядов и уничтоженных кораблей"
    },
    perspectives: {
        semanticSvo: { subject: "CleanerSystem", action: "Restricts", object: "ArchetypeComponent" },
        dataFlow: { reads: ["ArchetypeComponent", "CFrameComponent", "HealthComponent"], mutates: [] }
    },
    render(ctx) {
        return (
            <Query components={["ArchetypeComponent", "CFrameComponent"]}>
                <Safety limit={5000} />
                
                {/* Кассета 1: Утилизация плазменных снарядов за границами арены */}
                <Guard condition="archetype.id === 'PLASMA_BOLT' && math.abs(cframe.value.Z) > 150" />
                ctx.world.despawn(entityId);
                
                {/* Кассета 2: Деспавн кораблей с нулевым здоровьем */}
                
                ctx.world.despawn(entityId);
            </Query>
        );
    }
});
