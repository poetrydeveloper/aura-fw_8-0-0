AuraShell(
    id = "registry_galaxy_constants_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 1,
        "executionSide" => "Shared",
        "flameworkPattern" => "GlobalConstants",
        "className" => "GalaxyRegistry",
        "context" => "Глобальный реестр строковых констант, фракций и тегов игры Galaxy по стандарту v38.5"
    ),
    
    render = function(ctx)
        Registry(
            Identifiers = [
                "ENEMY_INTERCEPTOR",
                "PLAYER", # Исправлено под сквозной стандарт 'PLAYER' во всех гвардах систем
                "PLASMA_BOLT"
            ],
            Factions = [
                "ALIENS",
                "HUMANS",
                "NEUTRAL"
            ]
        ); # Канон: Вызов закрыт точкой с запятой
    end
)
