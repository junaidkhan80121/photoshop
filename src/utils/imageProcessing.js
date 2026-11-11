/**
 * Client-side image processing for realtime Photoshop-style edits.
 * Adjustments use a downscaled preview while dragging; full-res on commit.
 */

const clamp = (v, min = 0, max = 255) => Math.max(min, Math.min(max, v));

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getCanvasContext(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  return { canvas, ctx };
}

async function drawToCanvas(src, maxSide = null) {
  const img = typeof src === 'string' ? await loadImage(src) : src;
  let { width, height } = img;

  if (maxSide && Math.max(width, height) > maxSide) {
    const scale = maxSide / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const { canvas, ctx } = getCanvasContext(width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, ctx, width, height, img };
}

function toDataURL(canvas, quality = 0.92) {
  return canvas.toDataURL('image/jpeg', quality);
}

/** Apply exposure / contrast / highlights / shadows on ImageData in place */
function processAdjustments(imageData, { exposure = 0, contrast = 0, highlights = 0, shadows = 0 }) {
  const data = imageData.data;
  const exp = exposure / 100;
  const con = contrast / 100;
  const hi = highlights / 100;
  const sh = shadows / 100;
  const contrastFactor = (259 * (con * 127 + 255)) / (255 * (259 - con * 127));

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Exposure
    r = r * (1 + exp) + exp * 40;
    g = g * (1 + exp) + exp * 40;
    b = b * (1 + exp) + exp * 40;

    // Contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Highlights — bright pixels
    if (lum > 180 && hi !== 0) {
      const t = ((lum - 180) / 75) * hi * 60;
      r += t;
      g += t;
      b += t;
    }

    // Shadows — dark pixels
    if (lum < 80 && sh !== 0) {
      const t = ((80 - lum) / 80) * sh * 60;
      r += t;
      g += t;
      b += t;
    }

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }

  return imageData;
}

/**
 * Live / committed adjustments.
 * @param {string} src - data URL
 * @param {object} adjustments
 * @param {{ preview?: boolean, maxSide?: number, quality?: number }} opts
 */
export async function applyAdjustments(src, adjustments, opts = {}) {
  const { preview = false, maxSide = preview ? 900 : null, quality = preview ? 0.75 : 0.92 } = opts;
  const { canvas, ctx } = await drawToCanvas(src, maxSide);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  processAdjustments(imageData, adjustments);
  ctx.putImageData(imageData, 0, 0);
  return toDataURL(canvas, quality);
}

function convolve(srcData, width, height, kernel, divisor = null) {
  const out = new Uint8ClampedArray(srcData.length);
  const k = kernel;
  const side = Math.sqrt(k.length) | 0;
  const half = (side / 2) | 0;
  let div = divisor;
  if (div == null) {
    div = k.reduce((a, b) => a + b, 0) || 1;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const ix = clamp(x + kx - half, 0, width - 1);
          const iy = clamp(y + ky - half, 0, height - 1);
          const idx = (iy * width + ix) * 4;
          const w = k[ky * side + kx];
          r += srcData[idx] * w;
          g += srcData[idx + 1] * w;
          b += srcData[idx + 2] * w;
        }
      }
      const o = (y * width + x) * 4;
      out[o] = clamp(r / div);
      out[o + 1] = clamp(g / div);
      out[o + 2] = clamp(b / div);
      out[o + 3] = srcData[o + 3];
    }
  }
  return out;
}

function boxBlur(data, width, height, radius) {
  if (radius < 1) return data;
  const tmp = new Uint8ClampedArray(data.length);
  const out = new Uint8ClampedArray(data.length);
  const w = radius * 2 + 1;

  // Horizontal
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let kx = -radius; kx <= radius; kx++) {
        const ix = clamp(x + kx, 0, width - 1);
        const i = (y * width + ix) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        a += data[i + 3];
      }
      const o = (y * width + x) * 4;
      tmp[o] = r / w;
      tmp[o + 1] = g / w;
      tmp[o + 2] = b / w;
      tmp[o + 3] = a / w;
    }
  }

  // Vertical
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        const iy = clamp(y + ky, 0, height - 1);
        const i = (iy * width + x) * 4;
        r += tmp[i];
        g += tmp[i + 1];
        b += tmp[i + 2];
        a += tmp[i + 3];
      }
      const o = (y * width + x) * 4;
      out[o] = r / w;
      out[o + 1] = g / w;
      out[o + 2] = b / w;
      out[o + 3] = a / w;
    }
  }
  return out;
}

function applyFilterToImageData(imageData, filter, width, height) {
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);

  switch (filter) {
    case 'grayscale': {
      for (let i = 0; i < data.length; i += 4) {
        const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = g;
      }
      break;
    }
    case 'negative': {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      break;
    }
    case 'sepia': {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = clamp(0.393 * r + 0.769 * g + 0.189 * b);
        data[i + 1] = clamp(0.349 * r + 0.686 * g + 0.168 * b);
        data[i + 2] = clamp(0.272 * r + 0.534 * g + 0.131 * b);
      }
      break;
    }
    case 'solarize': {
      for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          data[i + c] = data[i + c] < 128 ? data[i + c] : 255 - data[i + c];
        }
      }
      break;
    }
    case 'posterize': {
      const levels = 4;
      const step = 256 / levels;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.floor(data[i] / step) * step;
        data[i + 1] = Math.floor(data[i + 1] / step) * step;
        data[i + 2] = Math.floor(data[i + 2] / step) * step;
      }
      break;
    }
    case 'blur': {
      const blurred = boxBlur(copy, width, height, 4);
      data.set(blurred);
      break;
    }
    case 'sharpen': {
      const k = [0, -1, 0, -1, 5, -1, 0, -1, 0];
      data.set(convolve(copy, width, height, k, 1));
      break;
    }
    case 'emboss': {
      const k = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
      data.set(convolve(copy, width, height, k, 1));
      break;
    }
    case 'glow': {
      const blurred = boxBlur(copy, width, height, 5);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(copy[i] * 1.4 - blurred[i] * 0.4);
        data[i + 1] = clamp(copy[i + 1] * 1.4 - blurred[i + 1] * 0.4);
        data[i + 2] = clamp(copy[i + 2] * 1.4 - blurred[i + 2] * 0.4);
      }
      break;
    }
    case 'pixelate': {
      const block = Math.max(4, Math.floor(Math.min(width, height) / 40));
      for (let y = 0; y < height; y += block) {
        for (let x = 0; x < width; x += block) {
          const i = (y * width + x) * 4;
          const r = copy[i];
          const g = copy[i + 1];
          const b = copy[i + 2];
          for (let by = 0; by < block && y + by < height; by++) {
            for (let bx = 0; bx < block && x + bx < width; bx++) {
              const o = ((y + by) * width + (x + bx)) * 4;
              data[o] = r;
              data[o + 1] = g;
              data[o + 2] = b;
            }
          }
        }
      }
      break;
    }
    case 'vignette': {
      const cx = width / 2;
      const cy = height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist;
          const darken = 1 - dist * dist * 0.85;
          const i = (y * width + x) * 4;
          data[i] = clamp(data[i] * darken);
          data[i + 1] = clamp(data[i + 1] * darken);
          data[i + 2] = clamp(data[i + 2] * darken);
        }
      }
      break;
    }
    case 'canny': {
      // Lightweight edge approx (Sobel magnitude)
      const gray = new Float32Array(width * height);
      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const tl = gray[(y - 1) * width + (x - 1)];
          const tm = gray[(y - 1) * width + x];
          const tr = gray[(y - 1) * width + (x + 1)];
          const ml = gray[y * width + (x - 1)];
          const mr = gray[y * width + (x + 1)];
          const bl = gray[(y + 1) * width + (x - 1)];
          const bm = gray[(y + 1) * width + x];
          const br = gray[(y + 1) * width + (x + 1)];
          const gx = -tl + tr - 2 * ml + 2 * mr - bl + br;
          const gy = -tl - 2 * tm - tr + bl + 2 * bm + br;
          const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
          const i = (y * width + x) * 4;
          data[i] = data[i + 1] = data[i + 2] = mag > 80 ? 255 : 0;
        }
      }
      break;
    }
    case 'heatmap': {
      for (let i = 0; i < data.length; i += 4) {
        const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const t = g / 255;
        data[i] = clamp(255 * Math.min(1, t * 2));
        data[i + 1] = clamp(255 * (1 - Math.abs(t - 0.5) * 2));
        data[i + 2] = clamp(255 * Math.min(1, (1 - t) * 2));
      }
      break;
    }
    case 'hsv': {
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] / 255;
        let g = data[i + 1] / 255;
        let b = data[i + 2] / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        let h = 0;
        const s = max === 0 ? 0 : Math.min(1, (d / max) * 1.5);
        const v = max;
        if (d !== 0) {
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          else if (max === g) h = ((b - r) / d + 2) / 6;
          else h = ((r - g) / d + 4) / 6;
        }
        const iH = Math.floor(h * 6);
        const f = h * 6 - iH;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (iH % 6) {
          case 0: r = v; g = t; b = p; break;
          case 1: r = q; g = v; b = p; break;
          case 2: r = p; g = v; b = t; break;
          case 3: r = p; g = q; b = v; break;
          case 4: r = t; g = p; b = v; break;
          default: r = v; g = p; b = q; break;
        }
        data[i] = clamp(r * 255);
        data[i + 1] = clamp(g * 255);
        data[i + 2] = clamp(b * 255);
      }
      break;
    }
    case 'cartoon': {
      const blurred = boxBlur(copy, width, height, 2);
      const gray = new Float32Array(width * height);
      for (let i = 0, p = 0; i < copy.length; i += 4, p++) {
        gray[p] = 0.299 * copy[i] + 0.587 * copy[i + 1] + 0.114 * copy[i + 2];
      }
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const gx =
            -gray[(y - 1) * width + x - 1] + gray[(y - 1) * width + x + 1] +
            -2 * gray[y * width + x - 1] + 2 * gray[y * width + x + 1] +
            -gray[(y + 1) * width + x - 1] + gray[(y + 1) * width + x + 1];
          const gy =
            -gray[(y - 1) * width + x - 1] - 2 * gray[(y - 1) * width + x] - gray[(y - 1) * width + x + 1] +
            gray[(y + 1) * width + x - 1] + 2 * gray[(y + 1) * width + x] + gray[(y + 1) * width + x + 1];
          const edge = Math.sqrt(gx * gx + gy * gy) > 60 ? 0 : 1;
          const i = (y * width + x) * 4;
          data[i] = blurred[i] * edge;
          data[i + 1] = blurred[i + 1] * edge;
          data[i + 2] = blurred[i + 2] * edge;
        }
      }
      break;
    }
    case 'pencil_sketch': {
      // Invert + blur + color dodge approx
      const inverted = new Uint8ClampedArray(copy.length);
      for (let i = 0; i < copy.length; i += 4) {
        const g = 0.299 * copy[i] + 0.587 * copy[i + 1] + 0.114 * copy[i + 2];
        inverted[i] = inverted[i + 1] = inverted[i + 2] = 255 - g;
        inverted[i + 3] = 255;
      }
      const blurred = boxBlur(inverted, width, height, 6);
      for (let i = 0; i < data.length; i += 4) {
        const g = 0.299 * copy[i] + 0.587 * copy[i + 1] + 0.114 * copy[i + 2];
        const dodge = blurred[i] === 255 ? 255 : Math.min(255, (g * 255) / (255 - blurred[i]));
        data[i] = data[i + 1] = data[i + 2] = dodge;
      }
      break;
    }
    case 'oil_painting': {
      // Posterize + light blur for a painterly feel
      const levels = 8;
      const step = 256 / levels;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.floor(data[i] / step) * step;
        data[i + 1] = Math.floor(data[i + 1] / step) * step;
        data[i + 2] = Math.floor(data[i + 2] / step) * step;
      }
      const painted = boxBlur(new Uint8ClampedArray(data), width, height, 2);
      data.set(painted);
      break;
    }
    default:
      break;
  }

  return imageData;
}

export async function applyFilter(src, filterName, opts = {}) {
  const { quality = 0.92 } = opts;
  const { canvas, ctx, width, height } = await drawToCanvas(src);
  const imageData = ctx.getImageData(0, 0, width, height);
  applyFilterToImageData(imageData, filterName, width, height);
  ctx.putImageData(imageData, 0, 0);
  return toDataURL(canvas, quality);
}

export async function cropImage(src, { x, y, width, height }, quality = 0.92) {
  const img = await loadImage(src);
  const { canvas, ctx } = getCanvasContext(Math.round(width), Math.round(height));
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
  return toDataURL(canvas, quality);
}

export async function rotateImage(src, angleDeg, quality = 0.92) {
  const img = await loadImage(src);
  const rad = (angleDeg * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const newW = Math.round(img.width * cos + img.height * sin);
  const newH = Math.round(img.width * sin + img.height * cos);
  const { canvas, ctx } = getCanvasContext(newW, newH);
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  return toDataURL(canvas, quality);
}

export async function flipImage(src, mode = 'horizontal', quality = 0.92) {
  const img = await loadImage(src);
  const { canvas, ctx } = getCanvasContext(img.width, img.height);
  if (mode === 'horizontal') {
    ctx.translate(img.width, 0);
    ctx.scale(-1, 1);
  } else if (mode === 'vertical') {
    ctx.translate(0, img.height);
    ctx.scale(1, -1);
  } else {
    ctx.translate(img.width, img.height);
    ctx.scale(-1, -1);
  }
  ctx.drawImage(img, 0, 0);
  return toDataURL(canvas, quality);
}

/** Filters that run fully on the client */
export const CLIENT_FILTERS = new Set([
  'grayscale',
  'negative',
  'sepia',
  'solarize',
  'posterize',
  'blur',
  'sharpen',
  'emboss',
  'glow',
  'pixelate',
  'vignette',
  'canny',
  'heatmap',
  'hsv',
  'cartoon',
  'pencil_sketch',
  'oil_painting',
]);

const FORMAT_MIME = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

/**
 * Convert / compress an image for download.
 * @param {string} src
 * @param {{ format?: 'png'|'jpeg'|'webp', quality?: number }} opts
 * @returns {Promise<{ dataUrl: string, mime: string, extension: string }>}
 */
export async function exportImage(src, opts = {}) {
  const format = (opts.format || 'png').toLowerCase();
  const quality = opts.quality ?? 0.92;
  const mime = FORMAT_MIME[format] || 'image/png';
  const extension = format === 'jpg' ? 'jpg' : format === 'jpeg' ? 'jpg' : format;

  const img = await loadImage(src);
  const { canvas, ctx } = getCanvasContext(img.width, img.height);

  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  const dataUrl =
    mime === 'image/png'
      ? canvas.toDataURL(mime)
      : canvas.toDataURL(mime, Math.min(1, Math.max(0.05, quality)));

  return { dataUrl, mime, extension };
}

export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
