import { z } from "zod";

/**
 * Mensagens por omissão do Zod em pt-PT. Só entram quando o schema não traz a sua própria
 * mensagem, por isso as mensagens escritas nos schemas continuam a ganhar.
 * Importado por src/lib/api.ts e src/lib/validation.ts (servidor e browser).
 */
z.config({
  customError: (iss) => {
    switch (iss.code) {
      case "invalid_type":
        return iss.input === undefined || iss.input === null ? "Campo obrigatório." : "Valor inválido.";
      case "too_small":
        if (iss.origin === "string") return Number(iss.minimum) <= 1 ? "Campo obrigatório." : `Use pelo menos ${iss.minimum} caracteres.`;
        if (iss.origin === "array" || iss.origin === "set") return `Escolha pelo menos ${iss.minimum}.`;
        return `O valor mínimo é ${iss.minimum}.`;
      case "too_big":
        if (iss.origin === "string") return `Use no máximo ${iss.maximum} caracteres.`;
        if (iss.origin === "array" || iss.origin === "set") return `Escolha no máximo ${iss.maximum}.`;
        return `O valor máximo é ${iss.maximum}.`;
      case "invalid_format":
        return iss.format === "email" ? "Email inválido." : "Formato inválido.";
      case "invalid_value":
      case "invalid_union":
        return "Opção inválida.";
      default:
        return "Valor inválido.";
    }
  },
});
