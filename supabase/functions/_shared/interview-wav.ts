/** PCM WAV processing shared by browser and server; no storage access here. */
const RATE = 16000;
export const SEGMENT_SECONDS = 30;
export interface WavInfo { audioFormat: number; channels: number; sampleRate: number; bitsPerSample: number; blockAlign: number; dataOffset: number; dataSize: number }

export function readWavInfo(buffer: ArrayBuffer): WavInfo | null {
  const view = new DataView(buffer);
  if (view.byteLength < 44 || view.getUint32(0, false) !== 0x52494646 || view.getUint32(8, false) !== 0x57415645) return null;
  let offset = 12;
  let format: Omit<WavInfo, "dataOffset" | "dataSize"> | null = null;
  while (offset + 8 <= view.byteLength) {
    const id = String.fromCharCode(...new Uint8Array(buffer, offset, 4));
    const size = view.getUint32(offset + 4, true);
    if (id === "fmt " && size >= 16 && offset + 8 + size <= view.byteLength) {
      format = { audioFormat: view.getUint16(offset + 8, true), channels: view.getUint16(offset + 10, true), sampleRate: view.getUint32(offset + 12, true), blockAlign: view.getUint16(offset + 20, true), bitsPerSample: view.getUint16(offset + 22, true) };
    }
    if (id === "data" && format) return { ...format, dataOffset: offset + 8, dataSize: size };
    offset += 8 + size + size % 2;
  }
  return null;
}

export function wavChunkToMono(buffer: ArrayBuffer, info: WavInfo): Float32Array {
  if (info.channels < 1 || info.channels > 32 || info.sampleRate < 1 || info.blockAlign !== info.channels * info.bitsPerSample / 8) throw new Error("Invalid WAV format");
  const view = new DataView(buffer);
  const frames = Math.floor(view.byteLength / info.blockAlign);
  const output = new Float32Array(frames);
  const sample = (offset: number) => {
    if (info.audioFormat === 3 && info.bitsPerSample === 32) return view.getFloat32(offset, true);
    if (info.audioFormat !== 1) throw new Error("Unsupported WAV encoding");
    if (info.bitsPerSample === 8) return (view.getUint8(offset) - 128) / 128;
    if (info.bitsPerSample === 16) return view.getInt16(offset, true) / 32768;
    if (info.bitsPerSample === 24) {
      let value = view.getUint8(offset) | view.getUint8(offset + 1) << 8 | view.getUint8(offset + 2) << 16;
      if (value & 0x800000) value |= ~0xffffff;
      return value / 8388608;
    }
    if (info.bitsPerSample === 32) return view.getInt32(offset, true) / 2147483648;
    throw new Error("Unsupported WAV bit depth");
  };
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    for (let c = 0; c < info.channels; c++) sum += sample(i * info.blockAlign + c * info.bitsPerSample / 8);
    output[i] = sum / info.channels;
  }
  if (info.sampleRate === RATE) return output;
  const resampled = new Float32Array(Math.floor(output.length * RATE / info.sampleRate));
  for (let i = 0; i < resampled.length; i++) {
    const source = i * info.sampleRate / RATE;
    const left = Math.floor(source);
    const fraction = source - left;
    resampled[i] = (output[left] ?? 0) * (1 - fraction) + (output[Math.min(left + 1, output.length - 1)] ?? 0) * fraction;
  }
  return resampled;
}

export function wavBase64(samples: Float32Array): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buffer);
  const word = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) v.setUint8(offset + i, value.charCodeAt(i)); };
  word(0, "RIFF"); v.setUint32(4, buffer.byteLength - 8, true); word(8, "WAVE"); word(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, RATE, true); v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  word(36, "data"); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const x = Math.max(-1, Math.min(1, samples[i] ?? 0));
    v.setInt16(44 + i * 2, x < 0 ? x * 32768 : x * 32767, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}