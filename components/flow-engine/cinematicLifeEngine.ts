import { MathUtils } from "three";
import { FlowEmotion, FlowMode } from "./types";

export type CinematicLifeFrame = {
  breath: number;
  breathLift: number;
  bodySway: number;
  weightShift: number;
  eyeYaw: number;
  eyePitch: number;
  headYaw: number;
  headPitch: number;
  shoulderLift: number;
  fingerCurl: number;
  smile: number;
  browUp: number;
  browDown: number;
  squint: number;
};

export class FlowCinematicLifeEngine {
  private gazeX = 0;
  private gazeY = 0;
  private saccadeX = 0;
  private saccadeY = 0;
  private nextSaccadeAt = 0;
  private weightSeed = Math.random() * Math.PI * 2;

  update(
    elapsed: number,
    delta: number,
    pointerX: number,
    pointerY: number,
    emotion: FlowEmotion,
    mode: FlowMode,
  ): CinematicLifeFrame {
    const calm = MathUtils.clamp(emotion.calm, 0, 1);
    const energy = MathUtils.clamp(emotion.energy, 0, 1);
    const stress = MathUtils.clamp(emotion.stress, 0, 1);
    const attention = MathUtils.clamp(emotion.attention, 0, 1);
    const joy = MathUtils.clamp(emotion.joy, 0, 1);
    const curiosity = MathUtils.clamp(emotion.curiosity, 0, 1);

    if (elapsed >= this.nextSaccadeAt) {
      const range = 0.035 + curiosity * 0.035 + stress * 0.025;
      this.saccadeX = (Math.random() - 0.5) * range;
      this.saccadeY = (Math.random() - 0.5) * range * 0.6;
      this.nextSaccadeAt = elapsed + 0.45 + Math.random() * (1.8 + calm * 1.7);
    }

    const gazeResponsiveness = mode === "listening" ? 11 : mode === "thinking" ? 4.5 : 7.5;
    const gazeAlpha = 1 - Math.exp(-delta * gazeResponsiveness);
    const targetX = pointerX * (0.11 + attention * 0.12) + this.saccadeX;
    const targetY = -pointerY * (0.06 + attention * 0.07) + this.saccadeY;
    this.gazeX = MathUtils.lerp(this.gazeX, targetX, gazeAlpha);
    this.gazeY = MathUtils.lerp(this.gazeY, targetY, gazeAlpha);

    const respirationRate = 0.18 + energy * 0.08 + stress * 0.1;
    const breath = Math.sin(elapsed * Math.PI * 2 * respirationRate);
    const secondaryBreath = Math.sin(elapsed * Math.PI * 2 * respirationRate * 2 + 0.7) * 0.22;
    const weightShift = Math.sin(elapsed * 0.31 + this.weightSeed) * (0.55 + (1 - calm) * 0.45);
    const bodySway = Math.sin(elapsed * 0.43 + this.weightSeed * 0.6);
    const talkingPulse = mode === "talking" ? Math.sin(elapsed * 3.1) * 0.5 + 0.5 : 0;

    return {
      breath,
      breathLift: (breath + secondaryBreath) * (0.0045 + energy * 0.0025 + stress * 0.002),
      bodySway: bodySway * (0.006 + (1 - calm) * 0.006),
      weightShift: weightShift * (0.007 + (1 - calm) * 0.006),
      eyeYaw: this.gazeX,
      eyePitch: this.gazeY,
      headYaw: this.gazeX * 0.42,
      headPitch: this.gazeY * 0.38,
      shoulderLift: breath * (0.004 + stress * 0.006),
      fingerCurl: 0.035 + stress * 0.055 + talkingPulse * 0.035,
      smile: MathUtils.clamp(joy * 0.62 + (mode === "waving" ? 0.18 : 0), 0, 0.82),
      browUp: MathUtils.clamp(curiosity * 0.26 + (mode === "thinking" ? 0.13 : 0), 0, 0.48),
      browDown: MathUtils.clamp(stress * 0.22 + (mode === "thinking" ? 0.05 : 0), 0, 0.34),
      squint: MathUtils.clamp(joy * 0.12 + stress * 0.1, 0, 0.24),
    };
  }
}
