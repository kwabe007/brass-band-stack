import type {Spec, ValidatorSpec} from "envalid";
import { cleanEnv, EnvError, makeValidator } from "envalid";

const pass = makeValidator((input: string) => {
  return input;
});

/**
 * Adds check for empty string over regular str validator.
 */
const strDef = makeValidator<string>((input: string) => {
  if (typeof input === 'string' && input) return input
  throw new EnvError(`Invalid or empty string value: "${input}"`)
})

/**
 * Returns a validator that is only run when condition is met. Appropriate to use when an environment variable is only
 * required depending on value of another variable.
 */
function requiredIf<T>(condition: boolean, validator: (spec?: Spec<T> | undefined) => ValidatorSpec<T>) {
  if (condition) {
    return validator();
  } else {
    return pass({ default: undefined });
  }
}

function loadEnvs() {
  return cleanEnv(process.env, {
    NODE_ENV: strDef({choices: ["development", "test", "production", "staging"] as const}),
    DATABASE_URL: strDef(),
    SESSION_SECRET: strDef(),
  });
}

type Envs = ReturnType<typeof loadEnvs>;

if (!global.env) {
  global.env = loadEnvs();
}

const env = global.env;

export { env }
export type { Envs }
