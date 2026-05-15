import type { GraphQLFormattedError } from "graphql";
import { UserNotFoundError } from "@iam/domain/user/errors/user-not-found.error";
import { UserAlreadyExistsError } from "@iam/domain/user/errors/user-already-exists.error";
import { InvalidEmailError } from "@shared/value-objects/email.vo";

export function formatError(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  if (error instanceof UserNotFoundError)
    return { message: error.message, extensions: { code: "NOT_FOUND" } };
  if (error instanceof UserAlreadyExistsError)
    return { message: error.message, extensions: { code: "USER_ALREADY_EXISTS" } };
  if (error instanceof InvalidEmailError)
    return { message: error.message, extensions: { code: "INVALID_INPUT" } };
  return formattedError;
}
