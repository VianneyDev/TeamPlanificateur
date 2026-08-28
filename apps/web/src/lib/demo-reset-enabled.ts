/** Cloud Run / banner gate. Isolated so SSR layout does not import the wipe module. */
export function isDemoResetEnabled(): boolean {
  return process.env.DEMO_RESET_ENABLED === "true";
}
