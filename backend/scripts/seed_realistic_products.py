"""
Script to update products in MongoDB with high-quality, realistic beauty photography
from Unsplash CDN and authentic beauty brand metadata.
"""
from dotenv import load_dotenv
load_dotenv()

from backend.database import db

REALISTIC_PRODUCTS = [
    {
        'name': 'Velvet Matte Liquid Lipstick',
        'brand': 'Rare Beauty',
        'category': 'makeup',
        'price': 1850,
        'image_url': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
        'description': 'Long-wearing, hydrating velvet matte formula enriched with botanical oils.',
        'rating': 4.9,
        'reviews': 214,
        'shade': 'Berry Grace / Ruby Bold'
    },
    {
        'name': 'Luminous Silk Foundation',
        'brand': 'Armani Beauty',
        'category': 'makeup',
        'price': 4200,
        'image_url': 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=600&q=80',
        'description': 'Lightweight micro-fil technology foundation with natural radiant finish.',
        'rating': 4.8,
        'reviews': 480,
        'shade': 'Adaptive Medium / Light Sand'
    },
    {
        'name': 'Soft Pinch Liquid Blush',
        'brand': 'Rare Beauty',
        'category': 'makeup',
        'price': 1950,
        'image_url': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
        'description': 'Weightless liquid blush that blends seamlessly for a soft, healthy flush.',
        'rating': 4.9,
        'reviews': 328,
        'shade': 'Joy / Rose Petal'
    },
    {
        'name': 'Nude Obsessions Eyeshadow Palette',
        'brand': 'Huda Beauty',
        'category': 'makeup',
        'price': 2750,
        'image_url': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
        'description': 'Nine richly pigmented mattes and shimmers for everyday and evening looks.',
        'rating': 4.7,
        'reviews': 192,
        'shade': 'Rich Warm Nudes'
    },
    {
        'name': 'Micro-Sculpt Precision Brow Pencil',
        'brand': 'Anastasia Beverly Hills',
        'category': 'makeup',
        'price': 1750,
        'image_url': 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80',
        'description': 'Ultra-fine tip pencil that mimics realistic hair strokes with smudge-proof wear.',
        'rating': 4.8,
        'reviews': 165,
        'shade': 'Soft Charcoal / Warm Brown'
    },
    {
        'name': 'Hydrating Facial Cleanser',
        'brand': 'CeraVe',
        'category': 'skincare',
        'price': 950,
        'image_url': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        'description': 'Non-foaming cleanser with 3 essential ceramides and hyaluronic acid for balanced skin.',
        'rating': 4.8,
        'reviews': 890,
        'shade': 'All Skin Types'
    },
    {
        'name': 'Vitamin C 15% + HA Super Brightening Serum',
        'brand': 'The Ordinary',
        'category': 'skincare',
        'price': 1250,
        'image_url': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
        'description': 'Potent antioxidant serum targeting dullness, uneven texture, and dark spots.',
        'rating': 4.7,
        'reviews': 512,
        'shade': 'Pure Radiance'
    },
    {
        'name': 'Hydro-Plump Moisture Surge 100H',
        'brand': 'Clinique',
        'category': 'skincare',
        'price': 2450,
        'image_url': 'https://images.unsplash.com/photo-1608248597359-5975d40a3250?auto=format&fit=crop&w=600&q=80',
        'description': 'Refreshing gel-cream moisturizer with aloe bio-ferment and dual hyaluronic acid.',
        'rating': 4.9,
        'reviews': 430,
        'shade': 'Deep Hydration'
    },
    {
        'name': 'Ultra-Light Invisible Fluid Sunscreen SPF 50+',
        'brand': 'La Roche-Posay',
        'category': 'skincare',
        'price': 1950,
        'image_url': 'https://images.unsplash.com/photo-1556228722-d0b71f3b3922?auto=format&fit=crop&w=600&q=80',
        'description': 'Broad spectrum UV protection with invisible matte finish and zero white cast.',
        'rating': 4.9,
        'reviews': 760,
        'shade': 'Non-Greasy / Invisible'
    },
    {
        'name': 'Overnight Hydrating Rose Glow Mask',
        'brand': 'Fresh Botanicals',
        'category': 'skincare',
        'price': 2250,
        'image_url': 'https://images.unsplash.com/photo-1567928815104-b7980ee5032e?auto=format&fit=crop&w=600&q=80',
        'description': 'Intense overnight recovery mask replenishing barrier lipid levels while you sleep.',
        'rating': 4.6,
        'reviews': 180,
        'shade': 'Calming Rose'
    },
    {
        'name': 'Elixir Ultime L’Huile Original Hair Oil',
        'brand': 'Kérastase',
        'category': 'hair',
        'price': 3450,
        'image_url': 'https://images.unsplash.com/photo-1608248597378-0e86a5a04434?auto=format&fit=crop&w=600&q=80',
        'description': 'Precious marula and camellia oil blend delivering sublime shine and heat protection.',
        'rating': 4.9,
        'reviews': 340,
        'shade': 'Golden Gloss'
    },
    {
        'name': 'No. 7 Bonding Hair Oil',
        'brand': 'Olaplex',
        'category': 'hair',
        'price': 2950,
        'image_url': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        'description': 'Highly concentrated, weightless reparative styling oil for colored and heat-styled hair.',
        'rating': 4.8,
        'reviews': 490,
        'shade': 'Bond Repair'
    },
    {
        'name': 'Caviar Anti-Aging Smoothing Shampoo',
        'brand': 'Alterna Haircare',
        'category': 'hair',
        'price': 2650,
        'image_url': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
        'description': 'Nourishing sulfate-free formula infusing dry strands with botanical hydration.',
        'rating': 4.7,
        'reviews': 145,
        'shade': 'Silky Smooth'
    },
    {
        'name': 'Heat Shield Protective Mist 230°C',
        'brand': 'Moroccanoil',
        'category': 'hair',
        'price': 2250,
        'image_url': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
        'description': 'Infused with argan oil to defend against thermal damage and color fading.',
        'rating': 4.8,
        'reviews': 210,
        'shade': 'Thermal Defense'
    },
    {
        'name': 'Excellence Crème Rich Brown Hair Tint',
        'brand': "L'Oréal Paris",
        'category': 'hair',
        'price': 650,
        'image_url': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80',
        'description': 'Triple care color with pro-keratin and collagen for rich, multidimensional shine.',
        'rating': 4.7,
        'reviews': 630,
        'shade': 'Chocolate Warm Brown'
    },
]

# Wipe old demo products and replace with rich realistic products
db.products.delete_many({})
db.products.insert_many(REALISTIC_PRODUCTS)
print(f"Successfully populated {len(REALISTIC_PRODUCTS)} realistic beauty products into MongoDB Atlas!")

