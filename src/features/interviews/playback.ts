import { getWPToken } from "@/services/wp-auth";

interface PlaybackState { playing: boolean; buffering: boolean; position: number; duration: number }

/** One bounded request at a time; no recording URL, Blob URL or whole-file cache. */
export class InterviewPlayback {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private controller: AbortController | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private offset = 0;
  private size = 0;
  private position = 0;
  private duration = 0;
  private start = 0;
  private active = false;
  private generation = 0;
  constructor(private path: string, private update: (state: PlaybackState) => void, private error: (message: string) => void) {}

  private emit(buffering = false) { this.update({ playing: this.active, buffering, position: this.position, duration: this.duration }); }

  async play() {
    if (this.active) return;
    this.active = true; this.emit(true);
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      if (this.active) await this.next();
    } catch { this.pause(); this.error("Playback unavailable / 录音无法播放"); }
  }

  private async next() {
    if (!this.active || !this.context) return;
    const generation = this.generation;
    const controller = new AbortController();
    this.controller = controller;
    this.emit(true);
    try {
      const response = await fetch(`https://${import.meta.env["VITE_SUPABASE_PROJECT_ID"]}.supabase.co/functions/v1/interview-audio`, {
        method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json", apikey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
          Authorization: `Bearer ${import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]}`, "x-wp-token": getWPToken() || "" },
        body: JSON.stringify({ action: "stream", path: this.path, offset: this.offset }),
      });
      if (!response.ok) throw new Error("Playback unavailable");
      const nextHeader = response.headers.get("X-Next-Offset");
      const duration = Number(response.headers.get("X-Duration"));
      const position = Number(response.headers.get("X-Position"));
      const size = Number(response.headers.get("X-Recording-Size"));
      if (!nextHeader || !Number.isFinite(duration) || duration <= 0 || !Number.isFinite(position) || size < 1) throw new Error("Invalid stream");
      const data = await response.arrayBuffer();
      if (data.byteLength > 4_000_044) throw new Error("Invalid stream chunk");
      const buffer = await this.context.decodeAudioData(data);
      if (!this.active || generation !== this.generation) return;
      this.duration = duration; this.size = size; this.position = position;
      this.start = this.context.currentTime;
      const node = this.context.createBufferSource();
      node.buffer = buffer; node.connect(this.context.destination); this.source = node;
      this.emit();
      this.timer = setInterval(() => {
        if (!this.context) return;
        this.position = Math.min(duration, position + this.context.currentTime - this.start); this.emit();
      }, 200);
      node.onended = () => {
        if (this.timer) clearInterval(this.timer);
        this.timer = null; this.source = null;
        if (!this.active) return;
        if (nextHeader === "end") { this.offset = 0; this.position = 0; this.active = false; this.emit(); return; }
        const offset = Number(nextHeader);
        if (!Number.isSafeInteger(offset) || offset <= this.offset) { this.pause(); return; }
        this.offset = offset; void this.next();
      };
      node.start();
    } catch (e) {
      if (controller.signal.aborted || generation !== this.generation) return;
      this.pause(); this.error(e instanceof Error ? e.message : "Playback unavailable");
    }
  }

  pause() {
    this.active = false; this.generation++; this.controller?.abort();
    if (this.source) { this.source.onended = null; this.source.stop(); this.source = null; }
    if (this.timer) clearInterval(this.timer);
    this.timer = null; this.emit();
  }

  seek(seconds: number) {
    const resume = this.active;
    this.pause();
    this.position = Math.max(0, Math.min(this.duration, seconds));
    // The server realigns this approximate byte position to PCM/MP3 frame boundaries.
    this.offset = this.duration > 0 ? Math.min(this.size - 1, Math.floor(this.size * this.position / this.duration)) : 0;
    this.emit(); if (resume) void this.play();
  }

  dispose() { this.pause(); void this.context?.close(); this.context = null; }
}