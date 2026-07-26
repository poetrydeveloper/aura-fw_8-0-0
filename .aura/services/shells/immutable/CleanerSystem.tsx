import { AuraShell, Query, Guard, Safety, Calculate, Mutate } from ".aura/core";

export const CleanerSystem = AuraShell({
    id: "ecs_galaxy_cleaner_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    className: "CleanerSystem",
    flameworkPattern: "MatterSystem",
    methodName: "cleanOutOfBounds",
    executionSide: "Server",
    rojoTarget: "src/server/systems/CleanerSystem.ts", // <=== Наше Rojo-правило v15.0
    subject: "CleanerSystem",
    action: "Removes",
    object: "Entity",
    render(ctx) {
        return (
            <Query components={["CFrameComponent", "ArchetypeComponent"]}>
                <Guard condition="archetype.id === 'STATIONARY_OBJECT'" />
                <Guard condition="math.abs(cFrame.value.Position.X) < 2000 && math.abs(cFrame.value.Position.Z) < 2000" />
                <Guard condition="math.abs(cFrame.value.Position.Y) < 500" />
                <Safety limit={500} />
                
                {/* Инженерный Luau-деспавн улетевших или уничтоженных сущностей Галактики */}
                ctx.world.despawn(entityId);
                print("[Aura Garbage Collector] Сущность стерта из ОЗУ мира по космическим границам:", entityId);
            </Query>
        );
    }
});
