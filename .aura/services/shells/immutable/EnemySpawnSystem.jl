AuraShell(
    id = "ecs_galaxy_spawn_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "EnemySpawnSystem",
        "methodName" => "spawnWaves",
        "uiTrigger" => "Heartbeat",
        "context" => "Автоматическая генерация сущностей вражеских перехватчиков по таймеру"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "EnemySpawnSystem", "action" => "Triggers", "object" => "ArchetypeComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent"], "mutates" => ["ArchetypeComponent"])
    ),
    
    render = function(ctx)
        Calculate(var = "spawnCooldown", expr = "5")
        Calculate(var = "randomX", expr = "math.min(500, math.max(-500, 200))")
        Calculate(var = "spawnPos", expr = "new Vector3(randomX, 0, 0)")
        
        if (math.abs(randomX) < 1000)
            Mutate(component = "ArchetypeComponent", values = Dict("id" => "ENEMY_INTERCEPTOR", "faction" => "ALIENS", "mass" => "100"), targetEntity = "ctx.world.spawn()")
            print("[Aura Spawner] Новая волна ИИ-перехватчиков материализована в координатах: ", randomX)
        end
    end
)
