AuraShell(
    id = "ecs_galaxy_ai_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "EnemyAiSystem",
        "methodName" => "updateAi",
        "uiTrigger" => "Heartbeat",
        "context" => "Исправленный расчет векторов движения ИИ перехватчиков строго по канону v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "EnemyAiSystem", "action" => "Mutates", "object" => "VelocityComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "VelocityComponent"], "mutates" => ["VelocityComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent"]) do
            Safety(limit = 10); # Канон: Теперь строго первой строкой внутри цикла
            
            # Проверяем, является ли текущая сущность игроком. Если нет — пропускаем.
            Guard(condition = "archetype.type === 'PLAYER'"); 
            
            # Кэшируем позицию игрока (Транслятор сделает camelCase: cFrame с большой 'F')
            Calculate(var = "playerPos", expr = "cFrame.value.Position");
            
            NestedQuery(target = "ENEMY_INTERCEPTOR") do
                # Внутри NestedQuery Ткач соберет переменную targetCFrame (с большой 'F')
                Calculate(var = "enemyPos", expr = "targetCFrame.value.Position");
                
                # Математический расчет вектора направления к игроку
                Calculate(var = "dirVector", expr = "playerPos.sub(enemyPos).Magnitude > 0 ? playerPos.sub(enemyPos).Unit : new Vector3(0,0,0)");
                Calculate(var = "aiSpeed", expr = "25");
                Calculate(var = "targetVelocity", expr = "dirVector.mul(aiSpeed)");
                
                # Канон: Мутация вектора скорости врага. targetEntityId перенесен внутрь словаря Dict
                Mutate(component = "VelocityComponent", values = Dict("value" => "targetVelocity", "targetEntityId" => "targetEntityId"));
            end
        end
    end
)
