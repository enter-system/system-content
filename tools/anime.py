#!/usr/bin/env python3
"""Turn a photo into a flat, cel-shaded "anime still" look (filter, not generated art).
    python3 tools/anime.py photos/library/x.jpg photos/anime/x.jpg [--lift 1.0]
Crops to 9:16, lifts dark photos, flattens colour into painted blocks, adds ink lines and a soft glow."""
import sys, cv2, numpy as np
src, dst = sys.argv[1], sys.argv[2]
lift = float(sys.argv[sys.argv.index('--lift') + 1]) if '--lift' in sys.argv else 1.0
im = cv2.imread(src)
h, w = im.shape[:2]
tw = int(h * 9 / 16)
if tw <= w: x = (w - tw) // 2; im = im[:, x:x + tw]
else: th = int(w * 16 / 9); y = max(0, (h - th) // 2); im = im[y:y + th]
im = cv2.resize(im, (1080, 1920), interpolation=cv2.INTER_AREA)
# lift shadows (gamma on L), keep highlights
lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
L = lab[..., 0] / 255
g = np.clip(0.75 / max(L.mean(), .05), 1, 2.6) ** .5 * lift
lab[..., 0] = np.clip((L ** (1 / g)) * 255, 0, 255)
im = cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2BGR)
# flat painted colour: strong edge-preserving smoothing at half size
small = cv2.resize(im, (540, 960))
for _ in range(2): small = cv2.pyrMeanShiftFiltering(small, 14, 28)
flat = cv2.resize(small, (1080, 1920), interpolation=cv2.INTER_CUBIC)
for _ in range(2): flat = cv2.bilateralFilter(flat, 9, 60, 9)
# posterise lightness into cel bands, boost saturation
hsv = cv2.cvtColor(flat, cv2.COLOR_BGR2HSV).astype(np.float32)
v = hsv[..., 2] / 255; bands = 7
hsv[..., 2] = np.clip((np.floor(v * bands) + .5) / bands * .55 + v * .45, 0, 1) * 255
hsv[..., 1] = np.clip(hsv[..., 1] * 1.35 + 8, 0, 255)
flat = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
# ink lines
gray = cv2.GaussianBlur(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), (0, 0), 1.6)
e = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 6)
e = cv2.medianBlur(e, 5)
ink = cv2.GaussianBlur(e, (0, 0), .8).astype(np.float32) / 255
out = flat.astype(np.float32) * (0.25 + 0.75 * ink[..., None])
# soft bloom + cool anime grade
bloom = cv2.GaussianBlur(out, (0, 0), 28)
out = np.clip(out * .88 + bloom * .22, 0, 255)
out[..., 0] *= 1.06; out[..., 2] *= .97
cv2.imwrite(dst, np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
print('anime', dst)
