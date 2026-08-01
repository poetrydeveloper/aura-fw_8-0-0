AuraComponentPassport(
    id = "GalaxyArchetype_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    flameworkPattern = "Component",
    className = "GalaxyComponents",
    rojoTarget = "src/shared/components.types.ts",
    context = "Polny semanticheskiy pasport komponentov Matter ECS dlya kosmicheskogo simulatora",
    
    # Component specification (Flat structure)
    components = Dict(
        "ArchetypeComponent" => Dict(
            "type" => "string",
            "faction" => "string",
            "mass" => "number"
        ),
        "VelocityComponent" => Dict(
            "value" => "Vector3",
            "angular" => "Vector3"
        ),
        "CFrameComponent" => Dict(
            "value" => "CFrame",
            "lastUpdated" => "number"
        ),
        "WeaponStateComponent" => Dict(
            "isCharging" => "boolean",
            "nextTimer" => "number",
            "ammoCapacity" => "number"
        ),
        "HealthComponent" => Dict(
            "current" => "number",
            "max" => "number",
            "isInvulnerable" => "boolean"
        ),
        "ExplosionTriggerComponent" => Dict(
            "radius" => "number",
            "force" => "number",
            "active" => "boolean"
        ),
        "DamageComponent" => Dict(
            "value" => "number"
        ),
        "DamagePayloadComponent" => Dict(
            "value" => "number",
            "targetEntityId" => "number"
        )
    )
)

# AURA_END
