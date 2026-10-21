import { preloadRecordingUrl } from "./transcribe";

interface PlaybackState { playing: boolean; buffering: boolean; position: number; duration: number }

/** Native full-recording preload for the four explicitly consented demos only. */
export class PreloadedInterviewPlayback {
  private audio: HTMLAudioElement;
  private ready: Promise<void>;
  private disposed = false;
  private buffering = false;

  constructor(path: string, private update: (state: PlaybackState) => void, private error: (message: string) => void) {
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.controls = false;
    this.audio.setAttribute("controlsList", "nodownload");
    this.audio.addEventListener("timeupdate", this.emit);
    this.audio.addEventListener("durationchange", this.emit);
    this.audio.addEventListener("play", this.emit);
    this.audio.addEventListener("pause", this.emit);
    this.audio.addEventListener("ended", this.emit);
    this.audio.addEventListener("waiting", this.waiting);
    this.audio.addEventListener("canplay", this.canplay);
    this.audio.addEventListener("error", this.failed);
    this.ready = preloadRecordingUrl(path).then((url) => {
      if (this.disposed) return;
      this.audio.src = url;
      this.audio.load();
    }).catch(() => { if (!this.disposed) this.error("Playback unavailable / 录音无法播放"); });
  }

  private emit = () => {
    if (this.disposed) return;
    this.update({ playing: !this.audio.paused && !this.audio.ended, buffering: this.buffering,
      position: this.audio.currentTime || 0, duration: Number.isFinite(this.audio.duration) ? this.audio.duration : 0 });
  };
  private waiting = () => { this.buffering = true; this.emit(); };
  private canplay = () => { this.buffering = false; this.emit(); };
  private failed = () => { if (!this.disposed) { this.pause(); this.error("Playback unavailable / 录音无法播放"); } };

  async play() {
    await this.ready;
    if (this.disposed || !this.audio.src) return;
    try { await this.audio.play(); } catch { this.failed(); }
  }
  pause() { this.audio.pause(); this.buffering = false; this.emit(); }
  seek(seconds: number) {
    if (!Number.isFinite(this.audio.duration) || this.audio.duration <= 0) return;
    this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, seconds));
    this.emit();
  }
  dispose() {
    this.disposed = true;
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
  }
}