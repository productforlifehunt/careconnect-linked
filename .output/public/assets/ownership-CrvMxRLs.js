var e=`/** Compare existing WordPress identities only; this creates no relationship. */
export function isPostAuthor(authorId: unknown, userId: unknown): boolean {
  const normalize = (value: unknown) => String(value ?? "").trim().replace(/^wp-/, "");
  const author = normalize(authorId);
  const user = normalize(userId);
  return /^\\d+$/.test(author) && Number(author) > 0 && Number(author) === Number(user);
}`;export{e as default};