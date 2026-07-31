AuraShell(
    id = "ecs_galaxy_spawn_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso33503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "EnemySpawnSystem",
        "methodName" => "spawnWaves",
        "uiTrigger" => "Heartbeat",
        "context" => "Bezopasnaya generatsiya suschnostey vragov bez spama"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "EnemySpawnSystem", "action" => "Triggers", "object" => "ArchetypeComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent"], "mutates" => ["ArchetypeComponent"])
    ),
    
    render = function(ctx)
        Calculate(var = "randomX", expr = "math.min(500, math.max(-500, 200))");
        
        # 🔥 БЛOЧНЫЙ КАНOН: Каждая проверка открывает свой do-блок и закрывается своим end!
        Guard(condition = "math.abs(randomX) >= 1000") do
            Guard(condition = "tick() % 5 > 0.1") do
                Mutate(component = "ArchetypeComponent", values = Dict("type" => "'ENEMY_INTERCEPTOR'", "faction" => "'ALIENS'", "mass" => "100", "targetEntityId" => "ctx.world.spawn()"));
                print("[Aura Spawner] Entity spawned at position X: ", randomX);
            end
        end
    end
)