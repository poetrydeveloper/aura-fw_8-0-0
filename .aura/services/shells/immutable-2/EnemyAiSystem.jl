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
        "context" => "Raschet vectorov dvizheniya AI dlya interceptorov"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "EnemyAiSystem", "action" => "Mutates", "object" => "VelocityComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "VelocityComponent"], "mutates" => ["VelocityComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent"]) do
            Safety(limit = 10); 
            
            # 🪐 КВАНТОВЫЙ МАТРИЧНЫЙ КАНOН v42.0: Декларативный корневой слот
            Guard_if(condition = "archetype.type === 'PLAYER'", slot = "03805_00001");
            
            # =========================================================================
            # 🛰️ МАТРИЦА НАПОЛНЕНИЯ (Изолированные капсулы контента)
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Calculate(var = "playerPos", expr = "cFrame.value.Position");
            
            NestedQuery(target = "ENEMY_INTERCEPTOR") do
                # Нативный внутренний if для проверки захваченного таргета
                if targetArchetype.type === "ENEMY_INTERCEPTOR"
                    Calculate(var = "enemyPos", expr = "targetCFrame.value.Position");
                    
                    Calculate(var = "dirVector", expr = "playerPos.sub(enemyPos).Magnitude > 0 ? playerPos.sub(enemyPos).Unit : new Vector3(0, 0, 0)");
                    Calculate(var = "aiSpeed", expr = "25");
                    Calculate(var = "calculatedVelocity", expr = "dirVector.mul(aiSpeed)");
                    
                    Mutate(component = "VelocityComponent", values = Dict("value" => "calculatedVelocity", "targetEntityId" => "targetEntityId"));
                end
            end
            #END_CONTENT_03805_00001#
            
        end
    end
)

# 🔥 АБСОЛЮТНЫЙ КАНOН v42.0: Токен стоит ЗА пределами структуры AuraShell!
# Он служит чистым стоп-краном и больше БЕЗДУМНО НЕ ПЛОДИТ призрачных скобок!
# AURA_END
