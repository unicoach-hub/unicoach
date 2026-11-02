/**
 * Phone audio helpers for the Riya call bridge (services/riyaCalls.js).
 * Vobiz streams G.711 μ-law at 8 kHz; ElevenLabs may want 16-bit little-endian PCM at another rate.
 * When the ElevenLabs agent is set to ulaw_8000 both ways, none of this runs (audio passes through).
 */

const BIAS = 0x84;
const CLIP = 32635;

const DECODE_TABLE = new Int16Array(256);
for (let i = 0; i < 256; i += 1) {
  const u = ~i & 0xff;
  const sign = u & 0x80;
  const exponent = (u >> 4) & 0x07;
  const mantissa = u & 0x0f;
  const sample = (((mantissa << 3) + BIAS) << exponent) - BIAS;
  DECODE_TABLE[i] = sign ? -sample : sample;
}

function encodeSample(sample) {
  let s = sample;
  const sign = s < 0 ? 0x80 : 0;
  if (sign) s = -s;
  if (s > CLIP) s = CLIP;
  s += BIAS;
  let exponent = 7;
  for (let mask = 0x4000; (s & mask) === 0 && exponent > 0; exponent -= 1, mask >>= 1);
  const mantissa = (s >> (exponent + 3)) & 0x0f;
  return ~(sign | (exponent << 4) | mantissa) & 0xff;
}

/** μ-law bytes → Int16Array */
function ulawToPcm(buf) {
  const out = new Int16Array(buf.length);
  for (let i = 0; i < buf.length; i += 1) out[i] = DECODE_TABLE[buf[i]];
  return out;
}

/** Int16Array → μ-law bytes */
function pcmToUlaw(samples) {
  const out = Buffer.alloc(samples.length);
  for (let i = 0; i < samples.length; i += 1) out[i] = encodeSample(samples[i]);
  return out;
}

/** 16-bit little-endian PCM bytes ↔ Int16Array */
function bytesToPcm(buf) {
  const out = new Int16Array(Math.floor(buf.length / 2));
  for (let i = 0; i < out.length; i += 1) out[i] = buf.readInt16LE(i * 2);
  return out;
}
function pcmToBytes(samples) {
  const out = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i += 1) out.writeInt16LE(samples[i], i * 2);
  return out;
}

/**
 * Change the sample rate of one chunk. Downsampling averages the source samples each output
 * sample covers (a cheap low-pass); upsampling interpolates linearly. Good enough for a phone line.
 */
function resample(samples, fromRate, toRate) {
  if (fromRate === toRate || !samples.length) return samples;
  const ratio = fromRate / toRate;
  const length = Math.max(1, Math.floor(samples.length / ratio));
  const out = new Int16Array(length);
  for (let i = 0; i < length; i += 1) {
    const pos = i * ratio;
    if (ratio > 1) {
      const start = Math.floor(pos);
      const end = Math.min(samples.length, Math.max(start + 1, Math.floor(pos + ratio)));
      let sum = 0;
      for (let j = start; j < end; j += 1) sum += samples[j];
      out[i] = Math.round(sum / (end - start));
    } else {
      const a = Math.floor(pos);
      const b = Math.min(a + 1, samples.length - 1);
      const t = pos - a;
      out[i] = Math.round(samples[a] * (1 - t) + samples[b] * t);
    }
  }
  return out;
}

/** "pcm_16000" → { encoding: 'pcm', rate: 16000 }; "ulaw_8000" → { encoding: 'ulaw', rate: 8000 } */
function parseFormat(format) {
  const m = /^(pcm|ulaw)_(\d+)$/.exec(String(format || ''));
  return m ? { encoding: m[1], rate: Number(m[2]) } : { encoding: 'pcm', rate: 16000 };
}

/** Vobiz μ-law 8 kHz chunk → the format ElevenLabs asked for */
function fromPhone(ulawBuf, format) {
  const f = parseFormat(format);
  if (f.encoding === 'ulaw' && f.rate === 8000) return ulawBuf;
  const pcm = resample(ulawToPcm(ulawBuf), 8000, f.rate);
  return f.encoding === 'ulaw' ? pcmToUlaw(pcm) : pcmToBytes(pcm);
}

/** ElevenLabs audio chunk → μ-law 8 kHz for Vobiz */
function toPhone(buf, format) {
  const f = parseFormat(format);
  if (f.encoding === 'ulaw' && f.rate === 8000) return buf;
  const pcm = f.encoding === 'ulaw' ? ulawToPcm(buf) : bytesToPcm(buf);
  return pcmToUlaw(resample(pcm, f.rate, 8000));
}

module.exports = { ulawToPcm, pcmToUlaw, bytesToPcm, pcmToBytes, resample, parseFormat, fromPhone, toPhone };
