-- Compiled with roblox-ts v3.0.0
-- Изолировано в общем контуре
local HealthSystem
do
	HealthSystem = setmetatable({}, {
		__tostring = function()
			return "HealthSystem"
		end,
	})
	HealthSystem.__index = HealthSystem
	function HealthSystem.new(...)
		local self = setmetatable({}, HealthSystem)
		return self:constructor(...) or self
	end
	function HealthSystem:constructor()
	end
	function HealthSystem:updateHealth(ctx, deltaTime)
		for entityId, _binding in ctx.world.query(({}), ({})) do
			local health = _binding[1]
			local damage = _binding[2]
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 2000 then
				warn("Aura Safety Triggered")
				break
			end
			local currentHp = health.current
			local damageApplied = damage.value
			local nextHp = math.max(0, currentHp - damageApplied)
			ctx.world.insert(entityId, ({
				current = nextHp,
			}))
			if nextHp == 0 then
				ctx.world.despawn(entityId)
				print("[Aura Health] Сущность уничтожена, здоровье равно нулю: ", entityId)
			end
		end
	end
end
return {
	HealthSystem = HealthSystem,
}
