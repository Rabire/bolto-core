export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`Aucun utilisateur trouvé avec l'id "${id}"`);
    this.name = "UserNotFoundError";
  }
}
