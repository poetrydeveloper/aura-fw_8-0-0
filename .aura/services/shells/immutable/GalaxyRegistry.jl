AuraShell(
    id = "registry_galaxy_constants_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 1,
        "executionSide" => "Shared",
        "flameworkPattern" => "GlobalConstants",
        "className" => "GalaxyRegistry",
        "context" => "Глобальный реестр строковых констант, фракций и тегов игры Galaxy"
    ),
    
    render = function(ctx)
        Registry(
            Identifiers = [
                "ENEMY_INTERCEPTOR",
                "GALAXY_PLAYER",
                "PLASMA_BOLT"
            ],
            Factions = [
                "ALIENS",
                "HUMANS",
                "NEUTRAL"
            ]
        )
    end
)
