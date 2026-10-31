import os
from PIL import Image

BRAIN_DIR = r"C:\Users\atkot\.gemini\antigravity\brain\e9c09a94-fae8-442c-bebc-590d90d52f0c"
DEST_DIR = r"c:\Projects\FaceWise\frontend\public\hairstyles"
os.makedirs(DEST_DIR, exist_ok=True)

MAPPINGS = [
    ("layered_bob_1793423213501.jpg", "layered_bob.png"),
    ("curtain_bangs_1793423231448.jpg", "curtain_bangs.png"),
    ("long_waves_1793423249409.jpg", "long_waves.png"),
    ("pixie_cut_1793423284966.jpg", "pixie_cut.png"),
]

def make_transparent(src_path, dest_path):
    img = Image.open(src_path).convert("RGBA")
    datas = img.getdata()
    newData = []
    
    # White background threshold
    for item in datas:
        # Check if pixel is white / background (r > 230 and g > 230 and b > 230)
        if item[0] > 225 and item[1] > 225 and item[2] > 225:
            # Make transparent
            newData.append((255, 255, 255, 0))
        elif item[0] > 210 and item[1] > 210 and item[2] > 210:
            # Soft feathered edge alpha
            alpha = int(255 * (1.0 - (sum(item[:3]) / 3 - 210) / 15))
            newData.append((item[0], item[1], item[2], max(0, min(255, alpha))))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(dest_path, "PNG")
    print(f"Saved: {dest_path}")

for src_file, dest_file in MAPPINGS:
    src = os.path.join(BRAIN_DIR, src_file)
    dest = os.path.join(DEST_DIR, dest_file)
    if os.path.exists(src):
        make_transparent(src, dest)
    else:
        print(f"File not found: {src}")

print("All hairstyle transparent PNGs prepared successfully!")
