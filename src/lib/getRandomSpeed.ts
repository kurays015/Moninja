export default function getRandomSpeed(speedRange: {
  min: number;
  max: number;
}): number {
  return Math.random() * (speedRange.max - speedRange.min) + speedRange.min;
}
