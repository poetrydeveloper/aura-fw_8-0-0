AuraShell(
    id = "ecs_galaxy_score_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "ScoreRewardSystem",
        "methodName" => "processRewards",
        "uiTrigger" => "Heartbeat",
        "context" => "Bezopasny monitoring unichtozheniya vragov i nachislenie ochkov"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "ScoreRewardSystem", "action" => "Triggers", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "HealthComponent", "DamagePayloadComponent"], "mutates" => [])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "HealthComponent", "DamagePayloadComponent"]) do
            Safety(limit = 1000); 
            
            # 🔥 БЛOЧНЫЙ КАНOН: Каскад гвардов раскрывается через вложенные do-блоки
            Guard(condition = "archetype.type === 'ENEMY_INTERCEPTOR'") do
                Guard(condition = "(health.current - damagePayload.value) > 0") do
                    
                    print("[Aura Progress] Enemy destroyed. Reward experience added for entity: ", entityId);
                    
                end
            end
        end
    end
)
