-- Compiled with roblox-ts v3.0.0
-- Создаем строгие локальные интерфейсы для математических формул линтера rbxtsc
-- Переопределяем типы полей value внутри систем, чтобы линтер видел в них числа, а не any!
local InputSystem
do
	InputSystem = setmetatable({}, {
		__tostring = function()
			return "InputSystem"
		end,
	})
	InputSystem.__index = InputSystem
	function InputSystem.new(...)
		local self = setmetatable({}, InputSystem)
		return self:constructor(...) or self
	end
	function InputSystem:constructor()
	end
	function InputSystem:handleInput(ctx)
		for entityId, _binding in ctx.world.query(({}), ({}), ({})) do
			local velocity = _binding[1]
			local archetype = _binding[2]
			local cFrame = _binding[3]
			if not (ctx.isLocalPlayer == false) then
				continue
			end
			if not (archetype.id ~= "GALAXY_PLAYER") then
				continue
			end
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 100 then
				warn("Aura Safety Triggered")
				break
			end
			local inputDirection = ctx.getPlatformInputVector()
			local maxSpeed = ctx.getBaseSpeed("GALAXY_PLAYER")
			local targetVelocity = inputDirection.mul(maxSpeed)
			if not (targetVelocity.Magnitude == 0 and velocity.value.Magnitude == 0) then
				continue
			end
			ctx.world.insert(entityId, ({
				value = targetVelocity,
			}))
			ctx.inputDispatcher.fireAccelerationHeartbeat(targetVelocity)
		end
	end
end
return {
	InputSystem = InputSystem,
}
