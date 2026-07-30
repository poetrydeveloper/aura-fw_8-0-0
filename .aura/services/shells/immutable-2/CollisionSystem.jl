AuraShell(
    id = "ecs_galaxy_collision_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "CollisionSystem",
        "methodName" => "checkCollisions",
        "uiTrigger" => "Heartbeat",
        "context" => "Исправленный расчет пересечения пространственных векторов снарядов и перехватчиков по стандарту v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "CollisionSystem", "action" => "Triggers", "object" => "DamagePayloadComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "DamageComponent"], "mutates" => ["DamagePayloadComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent", "DamageComponent"]) do
            Safety(limit = 1000); # Канон: Точка с запятой на месте
            
            # Если это НЕ плазменный болт — мы пропускаем (система обрабатывает только летящие снаряды)
            Guard(condition = "archetype.type === 'PLASMA_BOLT'"); # Инвертировано условие под канон Early Return
            
            NestedQuery(target = "ENEMY_INTERCEPTOR") do
                # Вычисляем расстояние между снарядом (cFrame) и перехватчиком (targetCFrame)
                Guard(condition = "cFrame.value.Position.sub(targetCFrame.value.Position).Magnitude < 4");
                
                # Канон: targetEntityId перенесен внутрь словаря Dict, стрелочка Джулии =>
                Mutate(component = "DamagePayloadComponent", values = Dict("value" => "damage.value", "targetEntityId" => "targetEntityId"));
                
                # Мгновенно стираем снаряд из мира, чтобы он не пробил 5 врагов насквозь за один тик
                ctx.world.despawn(entityId);
            end
        end
    end
)
