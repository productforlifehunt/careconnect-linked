import type { SourceAnnotation } from './source-notes';

/** One compressed scalar avoids RPC object-graph/output limits for the complete catalogue. */
export async function encodeNotes(notes: SourceAnnotation[]): Promise<string> {
  const stream = new Blob([JSON.stringify(notes)]).stream().pipeThrough(new CompressionStream('gzip'));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return btoa(binary);
}

export async function decodeNotes(encoded: string): Promise<SourceAnnotation[]> {
  const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const result: unknown = JSON.parse(await new Response(stream).text());
  if (!Array.isArray(result)) throw new Error('注释返回格式异常，请重试。');
  return result as SourceAnnotation[];
}