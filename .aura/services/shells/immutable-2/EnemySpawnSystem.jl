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
        
        # Matrix root slot assignment
        Guard_if(condition = "math.abs(randomX) >= 1000", slot = "03805_00001");
        
        # =========================================================================
        # MATRICA NAPOLNENIYA
        # =========================================================================
        
        #START_CONTENT_03805_00001#
        Guard_if(condition = "tick() % 5 > 0.1", slot = "03805_00002");
        
        #START_CONTENT_03805_00002#
        Mutate(component = "ArchetypeComponent", values = Dict("type" => "'ENEMY_INTERCEPTOR'", "faction" => "'ALIENS'", "mass" => "100", "targetEntityId" => "ctx.world.spawn()"));
        print("[Aura Spawner] Entity spawned at position X: ", randomX);
        #END_CONTENT_03805_00002#
        
        # Chestnye zerkalnye end dlya kazhdogo vlozhennogo Guard_if!
        end
        #END_CONTENT_03805_00001#
    end
)

# AURA_END
