AuraShell(
    id = "ecs_galaxy_ai_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "EnemyAiSystem",
        "methodName" => "updateAi",
        "uiTrigger" => "Heartbeat",
        "context" => "Расчет векторов движения ИИ перехватчиков по направлению к игроку"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "EnemyAiSystem", "action" => "Mutates", "object" => "VelocityComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "VelocityComponent"], "mutates" => ["VelocityComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent"]) do
            Guard(condition = "archetype.id == 'GALAXY_PLAYER'")
            Safety(limit = 10)
            
            Calculate(var = "playerPos", expr = "cFrame.value.Position")
            
            NestedQuery(target = "ENEMY_INTERCEPTOR") do
                Calculate(var = "enemyPos", expr = "targetCFrame.value.Position")
                Calculate(var = "dirVector", expr = "playerPos.sub(enemyPos).Magnitude > 0 ? playerPos.sub(enemyPos).Unit : new Vector3(0,0,0)")
                Calculate(var = "aiSpeed", expr = "25")
                Calculate(var = "targetVelocity", expr = "dirVector.mul(aiSpeed)")
                
                Mutate(component = "VelocityComponent", values = Dict("value" => "targetVelocity"), targetEntity = "targetEntityId")
            end
        end
    end
)