import type {Spec, ValidatorSpec} from "envalid";
import {cleanEnv, makeValidator, str} from "envalid";

const pass = makeValidator((input: string) => {
  return input;
});

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

export function validateEnvs() {
  return cleanEnv(process.env, {
    NODE_ENV: str({choices: ["development", "test", "production", "staging"] as const}),
    DATABASE_URL: str(),
    SESSION_SECRET: str(),
  });
}