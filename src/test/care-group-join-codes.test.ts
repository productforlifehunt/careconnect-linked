import { expect, it } from "vitest";
import { normalizeInvite } from "@/features/care-groups/source.wordpress-extended";

const code = (extra: Record<string, string>) => normalizeInvite({ _ID: "1", a64: "b56", a65: "482913", a59: "0", ...extra });

it("a join code with no expiry and no max uses stays valid", () => {
  const c = code({ a571: "b56", a581: "b56", a59: "999" });
  expect(c.kind).toBe("code");
  expect(c.join_code).toBe("482913");
  expect(c.is_active).toBe(true);
});

it("an expiry only counts when Has expiration is Yes", () => {
  expect(code({ a571: "b56", a572: "2000-01-01T00:00:00Z" }).is_active).toBe(true);
  expect(code({ a571: "b55", a572: "2000-01-01T00:00:00Z" }).is_expired).toBe(true);
  expect(code({ a571: "b55", a572: "2999-01-01T00:00:00Z" }).is_active).toBe(true);
});

it("max uses only counts when Has max uses is Yes", () => {
  expect(code({ a581: "b56", a582: "2", a59: "5" }).is_active).toBe(true);
  expect(code({ a581: "b55", a582: "2", a59: "2" }).is_exhausted).toBe(true);
  expect(code({ a581: "b55", a582: "2", a59: "1" }).is_active).toBe(true);
});

it("Is active No turns the code off; empty means active", () => {
  expect(code({ a60: "b56" }).is_active).toBe(false);
  expect(code({}).is_active).toBe(true);
});

it("rows without a64 Pass code are invite links", () => {
  expect(normalizeInvite({ _ID: "2", a55: "TOKEN" }).kind).toBe("link");
});
