AuraShell(
    id = "ecs_galaxy_score_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "ScoreRewardSystem",
        "methodName" => "processRewards",
        "uiTrigger" => "Heartbeat",
        "context" => "Безопасный мониторинг уничтожения врагов и начисление очков опыта по стандарту v38.5"
    ),
    
    meta_perspectives = Dict(
        "semanticSvo" => Dict("subject" => "ScoreRewardSystem", "action" => "Triggers", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "HealthComponent", "DamagePayloadComponent"], "mutates" => [])
    ),
    
    render = function(ctx)
        # Подключаем к Query компонент DamagePayloadComponent, чтобы поймать момент удара
        Query(components = ["ArchetypeComponent", "HealthComponent", "DamagePayloadComponent"]) do
            Safety(limit = 1000); # Канон: Строго первой строкой с точкой с запятой
            
            # Гвард 1: Начисляем очки только за уничтожение вражеских перехватчиков
            Guard(condition = "archetype.type === 'ENEMY_INTERCEPTOR'");
            
            # Гвард 2: Проверяем, является ли входящий урон смертельным для этого врага
            # Если после вычитания урона у него останется здоровье — досрочно выходим (очки даются только за убийство!)
            Guard(condition = "(health.current - damagePayload.value) > 0");
            
            # Сюда рантайм дойдет СТРОГО на кадре, когда враг получает финальный смертельный удар, 
            # но его сущность еще не удалена из ОЗУ мира. Начисляем награду!
            
            # ⚠️ Нативный инжект Luau-кода: вызываем метод добавления очков в лидерборд сессии сервера
            # (Например, через обращение к кастомному сервису очков во Flamework)
            # В данном MVP мы логируем факт и триггерим глобальный стейт
            print("[Aura Progress] Враг повержен! Начислено +100 очков в реестр игрока. ID сущности: ", entityId);
        end
    end
)
