//#region node_modules/.nitro/vite/services/ssr/assets/ownership-CinhkazV.js
var ownership_default = "/** Compare existing WordPress identities only; this creates no relationship. */\nexport function isPostAuthor(authorId: unknown, userId: unknown): boolean {\n  const normalize = (value: unknown) => String(value ?? \"\").trim().replace(/^wp-/, \"\");\n  const author = normalize(authorId);\n  const user = normalize(userId);\n  return /^\\d+$/.test(author) && Number(author) > 0 && Number(author) === Number(user);\n}";
//#endregion
export { ownership_default as default };
