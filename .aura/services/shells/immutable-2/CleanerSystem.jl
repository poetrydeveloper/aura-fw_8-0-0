AuraShell(
    id = "ecs_galaxy_cleaner_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "CleanerSystem",
        "methodName" => "cleanOutOfBounds",
        "uiTrigger" => "Heartbeat",
        "context" => "Despawn uletevshih obfektov Galaktiki po standartu"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "CleanerSystem", "action" => "Removes", "object" => "Entity"),
        "dataFlow" => Dict("reads" => ["CFrameComponent", "ArchetypeComponent"], "mutates" => [])
    ),
    
    render = function(ctx)
        Query(components = ["CFrameComponent", "ArchetypeComponent"]) do
            Safety(limit = 500); 
            
            # 🔥 БЛOЧНЫЙ КАНOН: Каждый Guard открывает вложенный блок и закрывается своим end!
            Guard(condition = "archetype.type === 'STATIONARY_OBJECT'") do
                Guard(condition = "math.abs(cFrame.value.Position.X) < 2000 && math.abs(cFrame.value.Position.Z) < 2000") do
                    Guard(condition = "math.abs(cFrame.value.Position.Y) < 500") do
                        
                        ctx.world.despawn(entityId);
                        print("[Aura Garbage Collector] Entity removed out of bounds: ", entityId);
                        
                    end
                end
            end
        end
    end
)