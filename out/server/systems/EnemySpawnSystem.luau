-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Изолировано в общем контуре
local _constants = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "constants")
local ENEMY_INTERCEPTOR = _constants.ENEMY_INTERCEPTOR
local ALIENS = _constants.ALIENS
local EnemySpawnSystem
do
	EnemySpawnSystem = setmetatable({}, {
		__tostring = function()
			return "EnemySpawnSystem"
		end,
	})
	EnemySpawnSystem.__index = EnemySpawnSystem
	function EnemySpawnSystem.new(...)
		local self = setmetatable({}, EnemySpawnSystem)
		return self:constructor(...) or self
	end
	function EnemySpawnSystem:constructor()
	end
	function EnemySpawnSystem:spawnWaves(ctx, deltaTime)
		local spawnCooldown = 5
		local randomX = math.min(500, math.max(-500, 200))
		local spawnPos = Vector3.new(randomX, 0, 0)
		if (math.abs(randomX) < 1000) then
			ctx.world.insert(ctx.world.spawn(), ({
				id = ENEMY_INTERCEPTOR,
				faction = ALIENS,
				mass = 100,
			}))
			print("[Aura Spawner] Новая волна ИИ-перехватчиков материализована в координатах: ", randomX)
		end
	end
end
return {
	EnemySpawnSystem = EnemySpawnSystem,
}
