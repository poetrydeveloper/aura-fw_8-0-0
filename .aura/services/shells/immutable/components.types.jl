# .aura/services/shells/immutable/components.types.jl
AuraComponentPassport(
    id = "GalaxyArchetype",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    flameworkPattern = "Component",
    className = "GalaxyComponents",
    rojoTarget = "src/shared/components.types.ts",
    context = "Полный семантический паспорт ДНК-компонентов Matter ECS для космического симулятора",
    
    components = Dict(
        "ArchetypeComponent" => Dict("id" => "string", "faction" => "string", "mass" => "number"),
        "VelocityComponent" => Dict("value" => "Vector3", "angular" => "Vector3"),
        "CFrameComponent" => Dict("value" => "CFrame", "lastUpdated" => "number"),
        "WeaponStateComponent" => Dict("isCharging" => "boolean", "nextTimer" => "number", "ammoCapacity" => "number"),
        "HealthComponent" => Dict("current" => "number", "max" => "number", "isInvulnerable" => "boolean"),
        "ExplosionTriggerComponent" => Dict("radius" => "number", "force" => "number", "active" => "boolean")
    )
)
