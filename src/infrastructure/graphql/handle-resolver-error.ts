import { GraphQLError } from "graphql";
import { UserNotFoundError } from "../../modules/iam/domain/user/errors/user-not-found.error";
import { UserAlreadyExistsError } from "../../modules/iam/domain/user/errors/user-already-exists.error";
import { InvalidEmailError } from "../../modules/iam/domain/user/value-objects/email.vo";

export function handleResolverError(error: unknown): never {
  if (error instanceof UserNotFoundError)
    throw new GraphQLError(error.message, {
      extensions: { code: "NOT_FOUND" },
    });

  if (error instanceof UserAlreadyExistsError)
    throw new GraphQLError(error.message, {
      extensions: { code: "USER_ALREADY_EXISTS" },
    });

  if (error instanceof InvalidEmailError)
    throw new GraphQLError(error.message, {
      extensions: { code: "INVALID_INPUT" },
    });

  throw error;
}
