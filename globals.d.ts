import type { validateEnvs } from "./validate-envs";

declare global {
  var env: ReturnType<typeof validateEnvs>;
}