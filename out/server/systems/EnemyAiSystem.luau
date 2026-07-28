-- Compiled with roblox-ts v3.0.0
-- Изолировано в общем контуре
local EnemyAiSystem
do
	EnemyAiSystem = setmetatable({}, {
		__tostring = function()
			return "EnemyAiSystem"
		end,
	})
	EnemyAiSystem.__index = EnemyAiSystem
	function EnemyAiSystem.new(...)
		local self = setmetatable({}, EnemyAiSystem)
		return self:constructor(...) or self
	end
	function EnemyAiSystem:constructor()
	end
	function EnemyAiSystem:updateAi(ctx, deltaTime)
		for entityId, _binding in ctx.world.query(({}), ({})) do
			local archetype = _binding[1]
			local cFrame = _binding[2]
			if not (archetype.id == "GALAXY_PLAYER") then
				continue
			end
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 10 then
				warn("Aura Safety Triggered")
				break
			end
			local playerPos = cFrame.value.Position
			for targetEntityId, _binding_1 in ctx.world.query(({}), ({})) do
				local targetArchetype = _binding_1[1]
				local targetCFrame = _binding_1[2]
				if targetArchetype.id ~= "ENEMY_INTERCEPTOR" then
					continue
				end
				local enemyPos = targetCFrame.value.Position
				local dirVector = if (playerPos - enemyPos).Magnitude > 0 then (playerPos - enemyPos).Unit else Vector3.new(0, 0, 0)
				local aiSpeed = 25
				local targetVelocity = dirVector * aiSpeed
				ctx.world.insert(targetEntityId, ({
					value = targetVelocity,
				}))
			end
		end
	end
end
return {
	EnemyAiSystem = EnemyAiSystem,
}
