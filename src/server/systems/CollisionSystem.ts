declare const game: any; declare const Enum: any; declare const math: any;
declare const Vector3: any; declare const CFrame: any;
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;

export class CollisionSystem {
    constructor() { }

    public checkCollisions(ctx: any, deltaTime: number): void {
        for (const [entityId, [cFrame, velocity, archetype]] of ctx.world.query(({} as any), ({} as any), ({} as any))) {
            if (ctx.isServer === false) { continue; }
            if (archetype.id !== 'PROJECTILE') { continue; }
            let safetyCounter = 0; if (++safetyCounter > 1000) { warn("Aura Safety Triggered"); break; }
            for (const [targetEntityId, [targetArchetype, targetCFrame]] of ctx.world.query(({} as any), ({} as any))) {
                if (targetArchetype.id !== "GALAXY_PLAYER") continue;
                const distance = cFrame.value.Position.sub(targetCFrame.value.Position).Magnitude;
                if (distance > 3) { continue; }
                const damagePayload = math.clamp(velocity.value.Magnitude.mul(2), 10, 50);
                ctx.world.insert(targetEntityId, ({ current: "targetHealth.current.sub(damagePayload)" }));
                ctx.world.insert(entityId, ({ radius: 12, force: 300, active: true }));
            }
        }

    }

}
