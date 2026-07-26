import { AuraShell, Query, Guard, Safety, Calculate, Mutate } from ".aura/core";

export const InputSystem = AuraShell({
    id: "ctl_input_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    className: "InputSystem",
    flameworkPattern: "ControllerMethod",
    methodName: "processLocalInput",
    executionSide: "Client",
    rojoTarget: "src/client/controllers/InputSystem.ts", // Наше Rojo-правило v15.0
    subject: "InputSystem",
    action: "Modifies",
    object: "VelocityComponent",
    render(ctx) {
        return (
            <Query components={["VelocityComponent", "ArchetypeComponent", "CFrameComponent"]}>
                <Guard condition="ctx.isLocalPlayer === false" />
                <Guard condition="archetype.id !== 'GALAXY_PLAYER'" />
                <Safety limit={100} />
                
                <Calculate var="inputDirection" expr="ctx.getPlatformInputVector()" />
                <Calculate var="maxSpeed" expr="ctx.getBaseSpeed('GALAXY_PLAYER')" />
                <Calculate var="targetVelocity" expr="inputDirection.mul(maxSpeed)" />
                
                <Guard condition="targetVelocity.Magnitude === 0 && velocity.value.Magnitude === 0" />
                <Mutate component="VelocityComponent" values={{ value: "targetVelocity" }} />
                
                {/* Локальный Luau-инжект обработки пользовательского ввода */}
                ctx.inputDispatcher.fireAccelerationHeartbeat(targetVelocity);
            </Query>
        );
    }
});
