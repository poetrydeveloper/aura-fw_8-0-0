AuraShell(
    id = "registry_galaxy_game_over_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "GameOverSystem",
        "methodName" => "checkDefeat",
        "uiTrigger" => "Heartbeat",
        "context" => "Мониторинг гибели игрока на сервере и инициация триггера перезапуска игрового раунда"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "GameOverSystem", "action" => "Triggers", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "HealthComponent"], "mutates" => ["HealthComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "HealthComponent"]) do
            Safety(limit = 10)
            
            Calculate(var = "playerHp", expr = "health.current")
            Calculate(var = "archId", expr = "archetype.id")
            
if archId == GALAXY_PLAYER
                if playerHp == 0
                    print("[Aura Core] Крах игрока зафиксирован! Запуск контура телепортации и перезапуска плейса...")
                end
            end
        end
    end
)
