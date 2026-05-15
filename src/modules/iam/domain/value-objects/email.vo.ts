export class InvalidEmailError extends Error {
  constructor(raw: string) {
    super(`Email invalide : "${raw}"`);
    this.name = "InvalidEmailError";
  }
}

export class Email {
  private constructor(private readonly value: string) {}

  static create(raw: string): Email {
    const trimmed = raw.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw new InvalidEmailError(raw);
    }
    return new Email(trimmed);
  }

  // Bypass validation — uniquement pour reconstituer depuis une source fiable (DB)
  static reconstitute(value: string): Email {
    return new Email(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
