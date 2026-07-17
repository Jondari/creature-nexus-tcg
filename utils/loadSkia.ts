/**
 * Native implementation.
 *
 * React Native Skia is loaded natively on Android and iOS, so CanvasKit is
 * neither required nor allowed in the native Metro bundle.
 */
export const loadSkia = (): Promise<void> => Promise.resolve();
