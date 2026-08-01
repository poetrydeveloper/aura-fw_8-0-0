AuraShell(
    id = "ecs_galaxy_explosion_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "ExplosionSystem",
        "methodName" => "emitParticles",
        "uiTrigger" => "Heartbeat",
        "context" => "Generatsiya effectov vzryva chastic pri smerti vragov"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "ExplosionSystem", "action" => "Triggers", "object" => "ArchetypeComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "HealthComponent"], "mutates" => ["ArchetypeComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent", "HealthComponent"]) do
            Safety(limit = 100); 
            
            # Root assignment slot
            Guard_if(condition = "archetype.type === 'ENEMY_INTERCEPTOR'", slot = "03805_00001");
            
            # =========================================================================
            # MATRICA NAPOLNENIYA
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Guard_if(condition = "health.current > 0", slot = "03805_00002");
            
            #START_CONTENT_03805_00002#
            Calculate(var = "deathPos", expr = "cFrame.value.Position");
            Calculate(var = "randomX", expr = "deathPos.X");
            
            ctx.world.despawn(entityId);
            
            print("[Aura Visual] Entity destroyed. Particles generated at position X: ", randomX);
            #END_CONTENT_03805_00002#
            
            # Chestnye zerkalnye end dlya kazhdogo vlozhennogo Guard_if!
            end
            #END_CONTENT_03805_00001#
        end
    end
)

# AURA_END
