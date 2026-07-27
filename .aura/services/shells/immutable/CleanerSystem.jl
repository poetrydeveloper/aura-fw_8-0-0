# .aura/services/shells/immutable/CleanerSystem.jl
AuraShell(
    id = "ecs_galaxy_cleaner_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "CleanerSystem",
        "methodName" => "cleanOutOfBounds",
        "uiTrigger" => "Heartbeat",
        "context" => "Инженерный Luau-деспавн улетевших или уничтоженных сущностей Галактики"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "CleanerSystem", "action" => "Removes", "object" => "Entity"),
        "dataFlow" => Dict("reads" => ["CFrameComponent", "ArchetypeComponent"], "mutates" => [])
    ),
    
    render = function(ctx)
        Query(components = ["CFrameComponent", "ArchetypeComponent"]) do
            Guard(condition = "archetype.id == 'STATIONARY_OBJECT'")
            Guard(condition = "math.abs(cFrame.value.Position.X) < 2000 && math.abs(cFrame.value.Position.Z) < 2000")
            Guard(condition = "math.abs(cFrame.value.Position.Y) < 500")
            Safety(limit = 500)
            
            ctx.world.despawn(entityId)
            print("[Aura Garbage Collector] Сущность стерта из ОЗУ мира по космическим границам: ", entityId)
        end
    end
)
