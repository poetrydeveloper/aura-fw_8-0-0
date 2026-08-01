AuraShell(
    id = "ecs_galaxy_game_over_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "GameOverSystem",
        "methodName" => "checkDefeat",
        "uiTrigger" => "Heartbeat",
        "context" => "Monitoring gibeli igroka na servere i trigger perezapuska"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "GameOverSystem", "action" => "Triggers", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "HealthComponent"], "mutates" => ["HealthComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "HealthComponent"]) do
            Safety(limit = 10); 
            
            # Root assignment slot
            Guard_if(condition = "archetype.type !== 'PLAYER' || health.current > 0", slot = "03805_00001");
            
            # =========================================================================
            # MATRICA NAPOLNENIYA
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Mutate(component = "HealthComponent", values = Dict("current" => "0", "max" => "health.max", "isInvulnerable" => "true"));
            
            print("[Aura Core] Player defeat detected. Restarting game loop session...", entityId);
            #END_CONTENT_03805_00001#
            
            # Chestnye zerkalnye end dlya kazhdogo vlozhennogo Guard_if!
            end
        end
    end
)

# AURA_END
