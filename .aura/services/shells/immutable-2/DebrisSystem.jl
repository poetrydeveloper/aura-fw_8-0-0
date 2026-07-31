AuraShell(
    id = "ecs_galaxy_debris_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "DebrisSystem",
        "methodName" => "cleanGarbage",
        "uiTrigger" => "Heartbeat",
        "context" => "Ochistka pamyati servera po kosmicheskim granitsam"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "DebrisSystem", "action" => "Triggers", "object" => "CFrameComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent"], "mutates" => ["CFrameComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent"]) do
            Safety(limit = 1000);
            
            if archetype.type === "PLASMA_BOLT"
                # 🔥 БЛOЧНЫЙ КАНOН: Запрещенный continue стерт. Guard открывает вложенный блок!
                Guard(condition = "math.abs(cFrame.value.Position.X) > 2000") do
                    ctx.world.despawn(entityId);
                    print("[Aura Garbage Collector] Entity removed out of bounds: ", entityId);
                end
            end
            
            if archetype.type === "ENEMY_INTERCEPTOR"
                # Канон v39.0: Никаких continue, только строгое ветвление условий
                Guard(condition = "math.abs(cFrame.value.Position.X) > 3000") do
                    ctx.world.despawn(entityId);
                    print("[Aura Garbage Collector] Entity removed out of bounds: ", entityId);
                end
            end
        end
    end
)