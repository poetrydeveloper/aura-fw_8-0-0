declare const game: any; declare const Enum: any; declare const math: any;
declare const Vector3: any; declare const CFrame: any;
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;

export class InputSystem {
    constructor() { }

    public handleInput(ctx: any, deltaTime: number): void {
        for (const [entityId, [velocity, Velocity, cframe, cFrame, archetype, Archetype, cframe, cFrame]] of ctx.world.query(({} as any), ({} as any))) {
            if (ctx.isLocalPlayer === false || archetype.id !== 'GALAXY_PLAYER') { continue; }
            let safetyCounter = 0; if (++safetyCounter > 100) { warn("Aura Safety Triggered"); break; }
            const inputDirection = ctx.getPlatformInputVector();
            const maxSpeed = ctx.getBaseSpeed('GALAXY_PLAYER');
            ctx.world.insert(entityId, ({ value: "inputDirection.mul(maxSpeed)" }));
        }

    }

}
