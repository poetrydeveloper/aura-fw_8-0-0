-- Compiled with roblox-ts v3.0.0
-- Изолировано в общем контуре
local CollisionSystem
do
	CollisionSystem = setmetatable({}, {
		__tostring = function()
			return "CollisionSystem"
		end,
	})
	CollisionSystem.__index = CollisionSystem
	function CollisionSystem.new(...)
		local self = setmetatable({}, CollisionSystem)
		return self:constructor(...) or self
	end
	function CollisionSystem:constructor()
	end
	function CollisionSystem:checkCollisions(ctx, deltaTime)
		for entityId, _binding in ctx.world.query(({}), ({}), ({})) do
			local archetype = _binding[1]
			local cFrame = _binding[2]
			local damage = _binding[3]
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 1000 then
				warn("Aura Safety Triggered")
				break
			end
			if not (archetype.id ~= "PLASMA_BOLT") then
				continue
			end
			for targetEntityId, _binding_1 in ctx.world.query(({}), ({})) do
				local targetArchetype = _binding_1[1]
				local targetCFrame = _binding_1[2]
				if targetArchetype.id ~= "ENEMY_INTERCEPTOR" then
					continue
				end
				local _position = cFrame.value.Position
				local _position_1 = targetCFrame.value.Position
				if not ((_position - _position_1).Magnitude < 4) then
					continue
				end
				ctx.world.insert(targetEntityId, ({
					value = damage.value,
				}))
				ctx.world.despawn(entityId)
			end
		end
	end
end
return {
	CollisionSystem = CollisionSystem,
}
