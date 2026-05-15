export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Un utilisateur avec l'email "${email}" existe déjà`);
    this.name = "UserAlreadyExistsError";
  }
}
