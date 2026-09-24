import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Standard SVG for 512x512 & 192x192 (purpose: "any")
const standardSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#24140B" />
      <stop offset="70%" stop-color="#150D08" />
      <stop offset="100%" stop-color="#0D0704" />
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5D1" />
      <stop offset="35%" stop-color="#E5BC58" />
      <stop offset="70%" stop-color="#C59328" />
      <stop offset="100%" stop-color="#FFF2B2" />
    </linearGradient>
    <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D4AF37" />
      <stop offset="50%" stop-color="#FFF9E2" />
      <stop offset="100%" stop-color="#C59A27" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)" />
  <!-- Subtle ornate outer border -->
  <rect x="16" y="16" width="480" height="480" rx="88" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.4" />
  <rect x="24" y="24" width="464" height="464" rx="80" fill="none" stroke="url(#goldGrad)" stroke-width="1" stroke-opacity="0.2" stroke-dasharray="6 4" />

  <!-- Center emblem group -->
  <g filter="url(#shadow)" transform="translate(256, 240) scale(1.15)">
    <!-- Chef Hat Top -->
    <g transform="translate(0, -115) scale(1.5)">
      <path
        d="M-28 12 C-38 10, -42 -4, -30 -14 C-34 -28, -10 -32, 0 -22 C10 -32, 34 -28, 30 -14 C42 -4, 38 10, 28 12 Z"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="3.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <!-- Hat Pleats -->
      <path d="M-14 -18 Q-12 -4 -15 10" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85" />
      <path d="M0 -20 Q0 -4 0 10" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85" />
      <path d="M14 -18 Q12 -4 15 10" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85" />
      <!-- Hat Gold Ribbon -->
      <path
        d="M-30 12 Q0 18 30 12 L27 20 Q0 26 -27 20 Z"
        fill="url(#goldGrad)"
      />
    </g>

    <!-- Brand Name: Ghosh -->
    <text
      x="0"
      y="-10"
      font-family="'Playfair Display', Georgia, serif"
      font-size="68"
      font-style="italic"
      font-weight="700"
      fill="url(#goldGrad)"
      text-anchor="middle"
      letter-spacing="-1"
    >
      Ghosh
    </text>

    <!-- Subtitle: SWEET HOUSE -->
    <text
      x="0"
      y="28"
      font-family="'Cinzel', 'Times New Roman', serif"
      font-size="20"
      font-weight="700"
      letter-spacing="7"
      fill="url(#goldShine)"
      text-anchor="middle"
    >
      SWEET HOUSE
    </text>

    <!-- Ornate flourish -->
    <g transform="translate(0, 42) scale(0.8)">
      <path
        d="M0 -3 C-5 -10, -11 -7, -6 -1 C-2 3, 0 6, 0 6 C0 6, 2 3, 6 -1 C11 -7, 5 -10, 0 -3 Z"
        fill="url(#goldGrad)"
      />
      <circle cx="-16" cy="1" r="2" fill="#D4AF37" />
      <circle cx="16" cy="1" r="2" fill="#D4AF37" />
      <line x1="-42" y1="1" x2="-22" y2="1" stroke="url(#goldGrad)" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
      <line x1="22" y1="1" x2="42" y2="1" stroke="url(#goldGrad)" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
    </g>

    <!-- Bengali Heritage Tag -->
    <text
      x="0"
      y="66"
      font-family="'Hind Siliguri', sans-serif"
      font-size="16"
      font-weight="600"
      fill="#F5E6BE"
      text-anchor="middle"
      opacity="0.9"
    >
      ঘোষ মিষ্টান্ন ভাণ্ডার
    </text>

    <!-- Quality Badge -->
    <text
      x="0"
      y="84"
      font-family="'Cinzel', serif"
      font-size="10"
      font-weight="600"
      letter-spacing="2"
      fill="#D4AF37"
      text-anchor="middle"
      opacity="0.75"
    >
      ESTD. 1998 • MALDA
    </text>
  </g>
</svg>
`;

// 2. Maskable SVG: Safe zone 80% circle, full-bleed solid background (no rounded corners, no edge strokes)
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGradMask" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#22130A" />
      <stop offset="70%" stop-color="#150D08" />
      <stop offset="100%" stop-color="#0E0805" />
    </radialGradient>
    <linearGradient id="goldGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5D1" />
      <stop offset="35%" stop-color="#E5BC58" />
      <stop offset="70%" stop-color="#C59328" />
      <stop offset="100%" stop-color="#FFF2B2" />
    </linearGradient>
    <linearGradient id="goldShineMask" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D4AF37" />
      <stop offset="50%" stop-color="#FFF9E2" />
      <stop offset="100%" stop-color="#C59A27" />
    </linearGradient>
    <filter id="shadowMask" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Full-bleed background for maskable (Android clips arbitrarily) -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Center emblem group scaled to fit safely within the 70% inner circle (radius ~175px) -->
  <g filter="url(#shadowMask)" transform="translate(256, 252) scale(0.95)">
    <!-- Chef Hat Top -->
    <g transform="translate(0, -112) scale(1.45)">
      <path
        d="M-28 12 C-38 10, -42 -4, -30 -14 C-34 -28, -10 -32, 0 -22 C10 -32, 34 -28, 30 -14 C42 -4, 38 10, 28 12 Z"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="3.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <path d="M-14 -18 Q-12 -4 -15 10" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85" />
      <path d="M0 -20 Q0 -4 0 10" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85" />
      <path d="M14 -18 Q12 -4 15 10" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85" />
      <path
        d="M-30 12 Q0 18 30 12 L27 20 Q0 26 -27 20 Z"
        fill="url(#goldGradMask)"
      />
    </g>

    <!-- Brand Name: Ghosh -->
    <text
      x="0"
      y="-10"
      font-family="'Playfair Display', Georgia, serif"
      font-size="66"
      font-style="italic"
      font-weight="700"
      fill="url(#goldGradMask)"
      text-anchor="middle"
      letter-spacing="-1"
    >
      Ghosh
    </text>

    <!-- Subtitle: SWEET HOUSE -->
    <text
      x="0"
      y="26"
      font-family="'Cinzel', 'Times New Roman', serif"
      font-size="19"
      font-weight="700"
      letter-spacing="6"
      fill="url(#goldShineMask)"
      text-anchor="middle"
    >
      SWEET HOUSE
    </text>

    <!-- Ornate flourish -->
    <g transform="translate(0, 40) scale(0.75)">
      <path
        d="M0 -3 C-5 -10, -11 -7, -6 -1 C-2 3, 0 6, 0 6 C0 6, 2 3, 6 -1 C11 -7, 5 -10, 0 -3 Z"
        fill="url(#goldGradMask)"
      />
      <circle cx="-16" cy="1" r="2" fill="#D4AF37" />
      <circle cx="16" cy="1" r="2" fill="#D4AF37" />
      <line x1="-42" y1="1" x2="-22" y2="1" stroke="url(#goldGradMask)" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
      <line x1="22" y1="1" x2="42" y2="1" stroke="url(#goldGradMask)" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
    </g>

    <!-- Bengali Heritage Tag -->
    <text
      x="0"
      y="64"
      font-family="'Hind Siliguri', sans-serif"
      font-size="16"
      font-weight="600"
      fill="#F5E6BE"
      text-anchor="middle"
      opacity="0.9"
    >
      ঘোষ মিষ্টান্ন ভাণ্ডার
    </text>
  </g>
</svg>
`;

async function generate() {
  console.log('Generating PWA icons...');
  
  // Write SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg.trim());
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), maskableSvg.trim());

  // 1. pwa-512x512.png
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ pwa-512x512.png created');

  // 2. pwa-192x192.png
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ pwa-192x192.png created');

  // 3. pwa-maskable-512x512.png
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ pwa-maskable-512x512.png created');

  // 4. apple-touch-icon.png (180x180)
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png created');

  // 5. favicon.png (64x64)
  await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ favicon.png created');

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
