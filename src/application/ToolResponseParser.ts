interface ToolResponseContent {
  text?: unknown;
}

interface ToolResponseEnvelope {
  isError?: unknown;
  content?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export class ToolResponseParser {
  public parseJson<T>(response: unknown, missingMessage: string): T {
    const envelope = isRecord(response) ? response as ToolResponseEnvelope : {};
    const content = Array.isArray(envelope.content) ? envelope.content : [];
    const text = content
      .filter((item): item is ToolResponseContent => isRecord(item))
      .map((item) => item.text)
      .find((value): value is string => typeof value === "string" && value.trim().length > 0);

    if (envelope.isError === true) {
      throw new Error(text ?? "El consumidor de herramientas devolvió un error");
    }
    if (!text) throw new Error(missingMessage);

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`El consumidor devolvió JSON inválido: ${reason}`);
    }
  }
}
