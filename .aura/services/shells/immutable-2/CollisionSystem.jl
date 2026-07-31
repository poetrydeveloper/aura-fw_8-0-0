AuraShell(
    id = "ecs_galaxy_collision_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "CollisionSystem",
        "methodName" => "checkCollisions",
        "uiTrigger" => "Heartbeat",
        "context" => "Raschet vectorov stolknoveniy snaryadov i interceptorov"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "CollisionSystem", "action" => "Triggers", "object" => "DamagePayloadComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "DamageComponent"], "mutates" => ["DamagePayloadComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent", "DamageComponent"]) do
            Safety(limit = 1000); 
            
            # 🔥 БЛOЧНЫЙ КАНOН: Каждая проверка открывает свой do-блок
            Guard(condition = "archetype.type === 'PLASMA_BOLT'") do
                
                NestedQuery(target = "ENEMY_INTERCEPTOR") do
                    # Чистый, строго типизированный код без continue и без any
                    Guard(condition = "targetArchetype.type === 'ENEMY_INTERCEPTOR'") do
                        Guard(condition = "cFrame.value.Position.sub(targetCFrame.value.Position).Magnitude < 4") do
                            
                            Mutate(component = "DamagePayloadComponent", values = Dict("value" => "damage.value", "targetEntityId" => "targetEntityId"));
                            ctx.world.despawn(entityId);
                            
                        end
                    end
                end
                
            end
        end
    end
)
