import type { PluginListenerHandle } from '@capacitor/core';

export type MotionActivity = 'stationary' | 'walking' | 'running' | 'cycling' | 'automotive' | 'unknown';
export interface NativePosition {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  headingAccuracy: number | null;
  speed: number | null;
  speedAccuracy: number | null;
  timestamp: number;
  moving_type: MotionActivity;
  simulated: boolean | null;
  accessory: boolean | null;
  battery_level: number | null;
  phone_is_charging: boolean | null;
}
export interface PendingPosition extends NativePosition { sequence: number }
export interface CircleFence { identifier: string; latitude: number; longitude: number; radius: number; notifyOnEntry: boolean; notifyOnExit: boolean }
export interface CareLocationPlugin {
  getCurrentPosition(options: { timeout: number }): Promise<NativePosition>;
  getPermissions(): Promise<{ location: string; accuracy: string; motion: string }>;
  start(options: { background: boolean; distanceFilter?: number; collectMotion?: boolean; collectVisits?: boolean }): Promise<{ background: boolean }>;
  stop(): Promise<void>;
  getPending(): Promise<{ positions: PendingPosition[] }>;
  acknowledge(options: { sequences: number[] }): Promise<void>;
  clearPending(): Promise<void>;
  setGeofences(options: { fences: CircleFence[] }): Promise<void>;
  addListener(event: 'position', listener: (position: NativePosition) => void): Promise<PluginListenerHandle>;
  addListener(event: 'error', listener: (error: { message: string }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'permissions', listener: (permissions: { location: string; accuracy: string; motion: string }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'geofence', listener: (event: { identifier: string; transition: 'enter' | 'exit' }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'visit', listener: (event: { latitude: number; longitude: number; accuracy: number; arrival: number | null; departure: number | null }) => void): Promise<PluginListenerHandle>;
}
export const CareLocation: CareLocationPlugin;