import { describe, expect, it } from "bun:test";
import { Email, InvalidEmailError } from "./email.vo";

describe("Email", () => {
  describe("create()", () => {
    it("accepte un email valide", () => {
      const email = Email.create("user@example.com");
      expect(email.toString()).toBe("user@example.com");
    });

    it("normalise en minuscules", () => {
      const email = Email.create("USER@EXAMPLE.COM");
      expect(email.toString()).toBe("user@example.com");
    });

    it("supprime les espaces en début et fin", () => {
      const email = Email.create("  user@example.com  ");
      expect(email.toString()).toBe("user@example.com");
    });

    it("lève InvalidEmailError pour un email sans @", () => {
      expect(() => Email.create("notanemail")).toThrow(InvalidEmailError);
    });

    it("lève InvalidEmailError pour un email sans domaine", () => {
      expect(() => Email.create("user@")).toThrow(InvalidEmailError);
    });

    it("lève InvalidEmailError pour un email sans TLD", () => {
      expect(() => Email.create("user@domain")).toThrow(InvalidEmailError);
    });

    it("lève InvalidEmailError pour une chaîne vide", () => {
      expect(() => Email.create("")).toThrow(InvalidEmailError);
    });

    it("inclut l'email invalide dans le message d'erreur", () => {
      expect(() => Email.create("bad")).toThrow('Email invalide : "bad"');
    });
  });

  describe("reconstitute()", () => {
    it("reconstruit un Email sans validation", () => {
      const email = Email.reconstitute("stored@db.com");
      expect(email.toString()).toBe("stored@db.com");
    });
  });

  describe("equals()", () => {
    it("retourne true pour deux emails identiques", () => {
      const a = Email.create("user@example.com");
      const b = Email.create("user@example.com");
      expect(a.equals(b)).toBe(true);
    });

    it("retourne false pour deux emails différents", () => {
      const a = Email.create("alice@example.com");
      const b = Email.create("bob@example.com");
      expect(a.equals(b)).toBe(false);
    });

    it("considère égaux deux emails qui se normalisent identiquement", () => {
      const a = Email.create("USER@EXAMPLE.COM");
      const b = Email.create("user@example.com");
      expect(a.equals(b)).toBe(true);
    });
  });

  describe("toString()", () => {
    it("retourne la valeur normalisée de l'email", () => {
      const email = Email.create("User@Example.COM");
      expect(email.toString()).toBe("user@example.com");
    });
  });
});
