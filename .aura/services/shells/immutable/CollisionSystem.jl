# .aura/services/shells/immutable/CollisionSystem.jl
AuraShell(
    id = "ecs_galaxy_collision_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "CollisionSystem",
        "methodName" => "checkCollisions",
        "uiTrigger" => "Heartbeat",
        "context" => "Расчет пересечения пространственных векторов снарядов и перехватчиков"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "CollisionSystem", "action" => "Triggers", "object" => "DamagePayloadComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "DamageComponent"], "mutates" => ["DamagePayloadComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent", "DamageComponent"]) do
            Safety(limit = 1000)
            Guard(condition = "archetype.id !== 'PLASMA_BOLT'")
            
            NestedQuery(target = "ENEMY_INTERCEPTOR") do
                Guard(condition = "cFrame.value.Position.sub(targetCFrame.value.Position).Magnitude < 4")
                Mutate(component = "DamagePayloadComponent", values = Dict("value" => "damage.value"), targetEntity = "targetEntityId")
                
                ctx.world.despawn(entityId)
            end
        end
    end
)
