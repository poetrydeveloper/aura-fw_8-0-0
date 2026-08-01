AuraShell(
    id = "ecs_galaxy_ui_score_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Client",
        "flameworkPattern" => "MatterSystem",
        "className" => "UiScoreSystem",
        "methodName" => "updateDisplay",
        "uiTrigger" => "Heartbeat",
        "context" => "Schityvanie progressa ochkov igroka i obnovlenie UI"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "UiScoreSystem", "action" => "Reads", "object" => "ArchetypeComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent"], "mutates" => [])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent"]) do
            Safety(limit = 10); 
            
            # Root assignment slot
            Guard_if(condition = "archetype.type !== 'PLAYER' || entityId !== localPlayerEntityId", slot = "03805_00001");
            
            # =========================================================================
            # MATRICA NAPOLNENIYA
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Calculate(var = "playerInstance", expr = "Players.LocalPlayer");
            Calculate(var = "leaderstats", expr = "playerInstance ? playerInstance.FindFirstChild('leaderstats') : undefined");
            Calculate(var = "scoreObject", expr = "leaderstats ? (leaderstats.FindFirstChild('Points') as NumberValue) : undefined");
            Calculate(var = "currentScore", expr = "scoreObject ? scoreObject.Value : 0");
            
            Calculate(var = "uiTick", expr = "currentScore >= 0 ? print('[Aura UI] Interface display updated. Current score value:', currentScore) : undefined");
            #END_CONTENT_03805_00001#
            
            # Honest mirror end statement dlya root Guard_if block
            end
        end
    end
)

# AURA_END
