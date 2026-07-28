AuraShell(
    id = "ecs_galaxy_score_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "ScoreRewardSystem",
        "methodName" => "processRewards",
        "uiTrigger" => "Heartbeat",
        "context" => "Мониторинг уничтожения врагов и начисление очков опыта на серверной стороне"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "ScoreRewardSystem", "action" => "Triggers", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "HealthComponent"], "mutates" => ["HealthComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "HealthComponent"]) do
            Guard(condition = "archetype.id == 'ENEMY_INTERCEPTOR'")
            Safety(limit = 1000)
            
            Calculate(var = "currentHp", expr = "health.current")
            
            if currentHp == 0
                print("[Aura Progress] Враг повержен! Начислено +100 очков в реестр игрока. ID сущности: ", entityId)
            end
        end
    end
)