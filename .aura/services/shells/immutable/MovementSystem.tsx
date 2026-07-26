import { AuraShell, Query, Guard, Safety, Calculate, Mutate } from ".aura/core";

export const MovementSystem = AuraShell({
    id: "ecs_move_02_v1",
    status: "active",
    version: 1,
    vocabularyContract: "Aura_Galaxy_Vocabulary_v7.0",
    className: "MovementSystem",
    flameworkPattern: "MatterSystem",
    methodName: "updateMovement",
    executionSide: "Server",
    subject: "MovementSystem",
    action: "Updates",
    object: "CFrameComponent",
    render(ctx, deltaTime: number) {
        return (
            <Query components={["VelocityComponent", "CFrameComponent"]}>
                <Guard condition="deltaTime <= 0" />
                <Safety limit={5000} />
                <Calculate var="deltaPos" expr="velocity.value.mul(deltaTime)" />
                <Mutate component="CFrameComponent" values={{ value: "cframe.value.add(deltaPos)" }} />
            </Query>
        );
    }
});
