"""Render the UniCoach app icon set (Option A: teal tile, white U, ink cap, mustard tassel).

Usage: python3 scripts/make_icons.py node_modules/@expo-google-fonts/urbanist/900Black/Urbanist_900Black.ttf assets/images
Needs Pillow (pip3 install pillow).
"""
import sys
from PIL import Image, ImageDraw, ImageFont

FONT, OUT = sys.argv[1], sys.argv[2]
TEAL, INK, WHITE, MUSTARD = (20, 131, 126, 255), (22, 19, 15, 255), (255, 255, 255, 255), (242, 183, 5, 255)
SS = 4  # supersample for smooth edges


def quad(p0, p1, p2, n=24):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
             (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in (i / n for i in range(n + 1))]


def draw_mark(d, cx, size, ink=INK, u=WHITE, tassel=True, cap=True):
    """U glyph plus cap, centred on cx; `size` is the U's font size in px."""
    font = ImageFont.truetype(FONT, size)
    l, t, r, b = font.getbbox('U')
    gw, gh = r - l, b - t
    cap_w = gw * 1.05 if cap else 0
    cap_h = cap_w * 0.70
    total_h = gh + (cap_h * 0.5 if cap else 0)
    top = d.im.size[1] / 2 - total_h / 2  # vertical centre of the whole mark
    u_top = top + (cap_h * 0.5 if cap else 0)
    d.text((cx - gw / 2 - l, u_top - t), 'U', font=font, fill=u)
    if not cap:
        return
    sx, sy = cap_w / 100, cap_h / 70
    ox, oy = cx - cap_w / 2 + gw * 0.08, top

    def P(x, y):
        return (ox + x * sx, oy + y * sy)
    # base first and reaching up under the board, so no seam shows between the two shapes
    base = [P(26, 24), P(26, 45)] + [P(*q) for q in quad((26, 45), (50, 57), (74, 45))] + [P(74, 24), P(50, 30)]
    d.polygon(base, fill=ink)
    d.polygon([P(50, 4), P(94, 22), P(50, 40), P(6, 22)], fill=ink)
    if tassel:
        w = max(2, int(4 * sx))
        d.line([P(50, 22), P(84, 30), P(84, 48)], fill=MUSTARD, width=w, joint='curve')
        r = 5.5 * sx
        c = P(84, 52)
        d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=MUSTARD)


def canvas(px, bg=(0, 0, 0, 0)):
    im = Image.new('RGBA', (px * SS, px * SS), bg)
    return im, ImageDraw.Draw(im)


def save(im, px, name):
    im.resize((px, px), Image.LANCZOS).save(f'{OUT}/{name}')


# iOS / store icon: full-bleed teal, the OS rounds the corners
im, d = canvas(1024, TEAL)
draw_mark(d, 512 * SS, 600 * SS)
save(im, 1024, 'icon.png')

# Android adaptive: mark inside the 66% safe zone on transparent, teal background layer
im, d = canvas(1024)
draw_mark(d, 512 * SS, 400 * SS)
save(im, 1024, 'android-icon-foreground.png')
Image.new('RGBA', (1024, 1024), TEAL).save(f'{OUT}/android-icon-background.png')
im, d = canvas(1024)
draw_mark(d, 512 * SS, 400 * SS, ink=WHITE, u=WHITE, tassel=False)
save(im, 1024, 'android-icon-monochrome.png')

# Splash: bordered tile with the website's hard shadow, on transparent
px = 512
im, d = canvas(px)
s = SS
pad, sh, rad = 40 * s, 22 * s, 110 * s
box = [pad, pad, px * s - pad - sh, px * s - pad - sh]
d.rounded_rectangle([box[0] + sh, box[1] + sh, box[2] + sh, box[3] + sh], rad, fill=INK)
d.rounded_rectangle(box, rad, fill=TEAL, outline=INK, width=8 * s)
mid = (box[0] + box[2]) / 2
tile = Image.new('RGBA', im.size, (0, 0, 0, 0))
td = ImageDraw.Draw(tile)
draw_mark(td, mid, 250 * s)
off = (box[1] + box[3]) / 2 - im.size[1] / 2
im.alpha_composite(tile, (0, int(off)))
save(im, px, 'splash-icon.png')

# Favicon: at small sizes only the U reads clearly
im, d = canvas(64)
d.rounded_rectangle([0, 0, 64 * SS, 64 * SS], 14 * SS, fill=TEAL)
draw_mark(d, 32 * SS, 50 * SS, cap=False)
save(im, 64, 'favicon.png')
print('done')
