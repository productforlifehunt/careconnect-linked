/** Select complete MPEG Layer III frames; never return raw bytes to visitors. */
export function mp3Segment(buffer: ArrayBuffer, absoluteStart: number, fileSize: number) {
  const bytes = new Uint8Array(buffer);
  let pos = 0;
  if (absoluteStart === 0 && bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51) {
    pos = 10 + ((bytes[6] ?? 0) & 127) * 2097152 + ((bytes[7] ?? 0) & 127) * 16384 + ((bytes[8] ?? 0) & 127) * 128 + ((bytes[9] ?? 0) & 127);
  }
  const chunks: Uint8Array[] = [];
  let seconds = 0;
  while (pos + 4 <= bytes.length && seconds < 30) {
    const a = bytes[pos] ?? 0, b = bytes[pos + 1] ?? 0, c = bytes[pos + 2] ?? 0;
    const version = b >> 3 & 3, layer = b >> 1 & 3, rateIndex = c >> 2 & 3, bitrateIndex = c >> 4;
    if (a !== 255 || (b & 224) !== 224 || version === 1 || layer !== 1 || rateIndex === 3 || bitrateIndex === 0 || bitrateIndex === 15) { pos++; continue; }
    const bitrate = (version === 3 ? [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320] : [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160])[bitrateIndex] ?? 0;
    const sampleRate = ([44100,48000,32000][rateIndex] ?? 44100) / (version === 3 ? 1 : version === 2 ? 2 : 4);
    const frameSize = Math.floor((version === 3 ? 144000 : 72000) * bitrate / sampleRate) + (c >> 1 & 1);
    if (pos + frameSize > bytes.length) break;
    chunks.push(bytes.subarray(pos, pos + frameSize));
    seconds += (version === 3 ? 1152 : 576) / sampleRate;
    pos += frameSize;
  }
  if (!chunks.length) throw new Error("No MP3 frames in segment");
  const nextOffset = absoluteStart + pos >= fileSize - 128 ? null : absoluteStart + pos;
  const result = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let out = 0;
  for (const chunk of chunks) { result.set(chunk, out); out += chunk.length; }
  let binary = "";
  for (let i = 0; i < result.length; i += 0x8000) binary += String.fromCharCode(...result.subarray(i, i + 0x8000));
  return { audio: btoa(binary), nextOffset, estimatedRemaining: nextOffset === null ? 0 : Math.ceil((fileSize - nextOffset) / Math.max(1, pos)) };
}