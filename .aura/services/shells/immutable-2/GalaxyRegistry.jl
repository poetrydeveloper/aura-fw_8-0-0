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
        "context" => "Globalny reestr strogovih konstant fractiy i tegov"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "GalaxyRegistry", "action" => "Defines", "object" => "Identifiers")
    ),
    
    # Pure dataflow constants contract (no functions or nested end tokens)
    render = (ctx) -> (
        Calculate(var = "Identifiers", expr = "['ENEMY_INTERCEPTOR', 'PLAYER', 'PLASMA_BOLT'] as const");
        Calculate(var = "Factions", expr = "['ALIENS', 'HUMANS', 'NEUTRAL'] as const");
    )
)

# AURA_END
