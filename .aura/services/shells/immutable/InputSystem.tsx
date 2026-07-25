import { AuraShell, Query, Guard, Safety, Calculate, Mutate } from ".aura/core";

export const InputSystem = AuraShell({
    id: "ctl_input_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    meta: {
        oddLayerIso34503: 3,
        executionSide: "Client",
        flameworkPattern: "MatterSystem",
        className: "InputSystem",
        methodName: "handleInput",
        uiTrigger: "Heartbeat",
        context: "Инжекция направления перемещения локального игрока в ECS компоненты"
    },
    perspectives: {
        semanticSvo: { subject: "InputSystem", action: "Modifies", object: "VelocityComponent" },
        dataFlow: { reads: ["VelocityComponent", "ArchetypeComponent"], mutates: ["VelocityComponent"] }
    },
    render(ctx) {
        return (
            <Query components={["VelocityComponent", "ArchetypeComponent"]}>
                <Guard condition="ctx.isLocalPlayer === false || archetype.id !== 'GALAXY_PLAYER'" />
                <Safety limit={100} />
                
                <Calculate var="inputDirection" expr="ctx.getPlatformInputVector()" />
                <Calculate var="maxSpeed" expr="ctx.getBaseSpeed('GALAXY_PLAYER')" />
                
                <Mutate component="VelocityComponent" values={{ value: "inputDirection.mul(maxSpeed)" }} />
            </Query>
        );
    }
});
