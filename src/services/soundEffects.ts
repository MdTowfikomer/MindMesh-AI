import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

// Generate a subtle, crisp paper crumple WAV audio
function generatePaperCrumpleWavBase64(): string {
  const sampleRate = 22050;
  const duration = 0.38; // 380ms
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2;
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // WAV Header
  view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46); // "RIFF"
  view.setUint32(4, fileSize - 8, true);
  view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45); // "WAVE"
  view.setUint8(12, 0x66); view.setUint8(13, 0x6D); view.setUint8(14, 0x74); view.setUint8(15, 0x20); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61); // "data"
  view.setUint32(40, dataSize, true);

  // Synthesize soft paper crushing texture
  let lastVal = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / duration;
    const envelope = Math.sin(progress * Math.PI) * Math.exp(-progress * 2.8);

    const burst1 = Math.sin(t * 110) > 0.4 ? 1.2 : 0.2;
    const burst2 = Math.cos(t * 240) > 0.3 ? 1.1 : 0.1;
    const crackle = (Math.random() * 2 - 1) * burst1 * burst2;
    
    const currentNoise = (Math.random() * 2 - 1) * 0.5 + crackle * 0.6;
    lastVal = lastVal * 0.4 + currentNoise * 0.6;

    const sample = Math.max(-0.6, Math.min(0.6, lastVal * envelope));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(44 + i * 2, intSample, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Generate a warm, gentle "save" pop-chime (528Hz & 792Hz harmonic)
function generateSaveChimeWavBase64(): string {
  const sampleRate = 22050;
  const duration = 0.28; // 280ms
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2;
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // WAV Header
  view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46); // "RIFF"
  view.setUint32(4, fileSize - 8, true);
  view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45); // "WAVE"
  view.setUint8(12, 0x66); view.setUint8(13, 0x6D); view.setUint8(14, 0x74); view.setUint8(15, 0x20); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61); // "data"
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / duration;
    // Fast attack, smooth exponential decay
    const attack = Math.min(1, t / 0.015);
    const decay = Math.exp(-progress * 6.5);
    const envelope = attack * decay;

    // Harmonic bell tone: 528 Hz (fundamental) + 792 Hz (perfect fifth) + warm 264 Hz sub
    const tone1 = Math.sin(2 * Math.PI * 528 * t) * 0.55;
    const tone2 = Math.sin(2 * Math.PI * 792 * t) * 0.3;
    const tone3 = Math.sin(2 * Math.PI * 264 * t) * 0.15;
    const combined = (tone1 + tone2 + tone3) * envelope * 0.5;

    const intSample = combined < 0 ? combined * 0x8000 : combined * 0x7FFF;
    view.setInt16(44 + i * 2, intSample, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

let crumpleSoundObject: Audio.Sound | null = null;
let saveSoundObject: Audio.Sound | null = null;
let crumpleFileUri: string | null = null;
let saveFileUri: string | null = null;

export const SoundEffects = {
  // Gentle, physical paper crumple
  async playCrumpleSound() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 80);

      if (!crumpleFileUri) {
        const base64 = generatePaperCrumpleWavBase64();
        crumpleFileUri = `${FileSystem.cacheDirectory}paper_crumple_v2.wav`;
        await FileSystem.writeAsStringAsync(crumpleFileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      if (crumpleSoundObject) {
        await crumpleSoundObject.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: crumpleFileUri },
        { shouldPlay: true, volume: 0.35 } // Lowered to subtle comfortable level
      );
      crumpleSoundObject = sound;
    } catch (err) {
      console.log('Crumple sound fallback:', err);
    }
  },

  // Soft, warm "saved to mind" pop-chime
  async playSaveSound() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!saveFileUri) {
        const base64 = generateSaveChimeWavBase64();
        saveFileUri = `${FileSystem.cacheDirectory}memory_saved_chime.wav`;
        await FileSystem.writeAsStringAsync(saveFileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      if (saveSoundObject) {
        await saveSoundObject.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: saveFileUri },
        { shouldPlay: true, volume: 0.35 } // Gentle pleasant chime
      );
      saveSoundObject = sound;
    } catch (err) {
      console.log('Save sound fallback:', err);
    }
  },
};
