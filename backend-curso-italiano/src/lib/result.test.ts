import { describe, expect, test } from "bun:test";
import { fail, ok } from "./result";

describe("result helpers", () => {
  test("ok retorna data sem erro", () => {
    const result = ok({ id: "1" });
    expect(result.data).toEqual({ id: "1" });
    expect(result.error).toBeNull();
  });

  test("fail retorna erro sem data", () => {
    const result = fail<string>("erro");
    expect(result.data).toBeNull();
    expect(result.error).toBe("erro");
  });
});
