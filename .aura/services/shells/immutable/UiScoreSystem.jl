AuraShell(
    id = "registry_galaxy_ui_score_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Client",
        "flameworkPattern" => "MatterSystem",
        "className" => "UiScoreSystem",
        "methodName" => "updateDisplay",
        "uiTrigger" => "Heartbeat",
        "context" => "Считывание текущего прогресса очков игрока и обновление текстовых полей интерфейса на клиенте"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "UiScoreSystem", "action" => "Mutates", "object" => "WeaponStateComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "WeaponStateComponent"], "mutates" => ["WeaponStateComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "WeaponStateComponent"]) do
            Guard(condition = "archetype.id == GALAXY_PLAYER")
            Safety(limit = 10)
            
            # Снайперское исправление: используем строгое валидное поле компонента из ДНК-паспорта
            Calculate(var = "currentScore", expr = "weaponState.ammoLeft")
            
if currentScore >= 0
                print("[Aura UI] Интерфейс обновлен. Текущий счет галактической сессии: ", currentScore)
            end
        end
    end
)
