import type { Envs } from "./load-envs";

declare global {
  var env: Envs;
}
