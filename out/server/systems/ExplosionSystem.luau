-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Изолировано в общем контуре
local ENEMY_INTERCEPTOR = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "constants").ENEMY_INTERCEPTOR
local ExplosionSystem
do
	ExplosionSystem = setmetatable({}, {
		__tostring = function()
			return "ExplosionSystem"
		end,
	})
	ExplosionSystem.__index = ExplosionSystem
	function ExplosionSystem.new(...)
		local self = setmetatable({}, ExplosionSystem)
		return self:constructor(...) or self
	end
	function ExplosionSystem:constructor()
	end
	function ExplosionSystem:emitParticles(ctx, deltaTime)
		for entityId, _binding in ctx.world.query(({}), ({}), ({})) do
			local archetype = _binding[1]
			local cFrame = _binding[2]
			local health = _binding[3]
			if not (archetype.id == ENEMY_INTERCEPTOR) then
				continue
			end
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 100 then
				warn("Aura Safety Triggered")
				break
			end
			local currentHp = health.current
			local deathPos = cFrame.value.Position
			if currentHp == 0 then
				print("[Aura Visual] Визуальная вспышка частиц сгенерирована в точке: ", deathPos.X)
			end
		end
	end
end
return {
	ExplosionSystem = ExplosionSystem,
}
