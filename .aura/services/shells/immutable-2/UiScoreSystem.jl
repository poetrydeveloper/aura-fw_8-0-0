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
            
            # 🔥 БЛOЧНЫЙ КАНOН: Guard открывает логическое тело do. continue стерт из ОЗУ.
            Guard(condition = "archetype.type !== 'PLAYER' || entityId !== localPlayerEntityId") do
                
                Calculate(var = "playerInstance", expr = "Players.LocalPlayer");
                Calculate(var = "leaderstats", expr = "playerInstance ? playerInstance.FindFirstChild('leaderstats') : undefined");
                Calculate(var = "scoreObject", expr = "leaderstats ? (leaderstats.FindFirstChild('Points') as NumberValue) : undefined");
                Calculate(var = "currentScore", expr = "scoreObject ? scoreObject.Value : 0");
                
                Calculate(var = "uiTick", expr = "currentScore >= 0 ? print('[Aura UI] Interface display updated. Current score value:', currentScore) : undefined");
                
            end
        end
    end
)
