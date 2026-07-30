AuraComponentPassport(
    id = "GalaxyArchetype_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    flameworkPattern = "Component",
    className = "GalaxyComponents",
    rojoTarget = "src/shared/components.types.ts",
    context = "Полный семантический паспорт ДНК-компонентов Matter ECS для космического симулятора по стандарту v38.5",
    
    # Спецификация компонентов (Плоская структура, без фигурных скобок!)
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
        # 👇 ИНЖЕКТ КРИТИЧЕСКИХ КОМПОНЕНТОВ (Страховка контура компиляции)
        "DamageComponent" => Dict(
            "value" => "number"
        ),
        "DamagePayloadComponent" => Dict(
            "value" => "number",
            "targetEntityId" => "number"
        )
    )
)
