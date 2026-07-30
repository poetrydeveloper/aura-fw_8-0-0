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
        "context" => "Считывание текущего прогресса очков игрока и обновление текстовых полей интерфейса по стандарту v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "UiScoreSystem", "action" => "Reads", "object" => "ArchetypeComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent"], "mutates" => []) # Мы убрали WeaponStateComponent из мутаций!
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent"]) do
            Safety(limit = 10); # Канон: Строго первой строкой
            
            # Гвард: Работаем только с сущностью локального игрока
            Guard(condition = "archetype.type !== 'PLAYER' || entityId !== this.localPlayerEntityId");
            
            # Исправлено: Обращаемся к нативным лидерстатам игрока Roblox (Каноничный способ для UI в Roblox-TS)
            Calculate(var = "playerInstance", expr = "Players.LocalPlayer");
            Calculate(var = "leaderstats", expr = "playerInstance ? playerInstance.FindFirstChild('leaderstats') : null");
            Calculate(var = "scoreObject", expr = "leaderstats ? leaderstats.FindFirstChild('Points') : null");
            Calculate(var = "currentScore", expr = "scoreObject ? scoreObject.Value : 0");
            
            # Заворачиваем лог в безопасный тернарный оператор TypeScript-строкой без использования if-блоков Julia
            Calculate(var = "uiTick", expr = "currentScore >= 0 ? print('[Aura UI] Интерфейс обновлен. Текущий счет:', currentScore) : null");
        end
    end
)
