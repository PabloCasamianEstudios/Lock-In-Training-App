/**
 * Lógica de conteo de repeticiones basada en puntos de referencia de pose.
 * Soporta de momento: PUSHUPS.
 */
export class RepCounter {
  private count: number = 0;
  private stage: 'UP' | 'DOWN' = 'UP';

  public reset() {
    this.count = 0;
    this.stage = 'UP';
  }

  public getCount(): number {
    return this.count;
  }

  public updatePushups(landmarks: any): boolean {
    if (!landmarks || landmarks.length < 15) return false;

    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];

    if (!leftShoulder || !leftElbow || !leftWrist) return false;

    // Calculamos el ángulo del codo
    const angle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);

    // Lógica de estados
    if (angle > 160) {
      this.stage = 'UP';
    }
    if (angle < 90 && this.stage === 'UP') {
      this.stage = 'DOWN';
      this.count++;
      return true;
    }

    return false;
  }

  private calculateAngle(a: any, b: any, c: any): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  }
}
