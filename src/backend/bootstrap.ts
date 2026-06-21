import { runMigrations } from "./migrate";
import { seedDatabase } from "./seed";

let bootstrapPromise: Promise<void> | undefined;

export function ensureBackendReady() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      runMigrations();
      await seedDatabase();
    })();
  }

  return bootstrapPromise;
}
