from PIL import Image, ImageDraw, ImageFont
import os

# Resoluções Android
resolutions = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

# Criar imagem base com gradiente e estilo tech
base_size = 512
img = Image.new('RGB', (base_size, base_size), color='#2a2a2a')
draw = ImageDraw.Draw(img, 'RGBA')

# Desenhar círculo externo (estilo engrenagem)
circle_color = (100, 150, 180, 255)
draw.ellipse([20, 20, 492, 492], outline=circle_color, width=15)

# Desenhar padrão de circuito/tech no lado direito
circuit_color = (50, 200, 150, 255)
draw.line([256, 100, 380, 100], fill=circuit_color, width=3)
draw.line([380, 100, 380, 150], fill=circuit_color, width=3)
draw.ellipse([375, 145, 385, 155], fill=circuit_color)

draw.line([256, 150, 380, 150], fill=circuit_color, width=3)
draw.line([256, 150, 256, 200], fill=circuit_color, width=3)
draw.ellipse([251, 195, 261, 205], fill=circuit_color)

draw.line([256, 250, 350, 250], fill=circuit_color, width=3)
draw.ellipse([345, 245, 355, 255], fill=circuit_color)

# Lado esquerdo com padrão de anéis
ring_color = (140, 120, 100, 200)
for i in range(3):
    r = 150 - (i * 40)
    draw.ellipse([256-r, 256-r, 256+r, 256+r], outline=ring_color, width=8)

# Letra A no centro
try:
    font = ImageFont.truetype("arial.ttf", 180)
except:
    font = ImageFont.load_default()

draw.text((256, 256), "A", fill=(70, 180, 220, 255), font=font, anchor="mm")

# Salvar em assets
img.save('frontend/assets/icon.png')
print("✓ Icon base criado em frontend/assets/icon.png")

# Reabrir e redimensionar
source_img = Image.open('frontend/assets/icon.png').convert('RGBA')

for folder, size in resolutions.items():
    dir_path = f'frontend/android/app/src/main/res/{folder}'
    os.makedirs(dir_path, exist_ok=True)
    
    resized = source_img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(f'{dir_path}/ic_launcher.png')
    print(f"✓ {folder} ({size}x{size}px)")

# Versões rounded
for folder, size in resolutions.items():
    dir_path = f'frontend/android/app/src/main/res/{folder}'
    
    resized = source_img.resize((size, size), Image.Resampling.LANCZOS)
    
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([0, 0, size, size], fill=255)
    
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(resized, (0, 0))
    output.putalpha(mask)
    
    output.save(f'{dir_path}/ic_launcher_round.png')

print("\n✅ Todos os icons criados!")
print("   - ic_launcher.png (quadrado)")
print("   - ic_launcher_round.png (circular)")
