from backend.database import db

SAMPLES = [
    ('Matte lipstick', 'makeup', 499),
    ('Cushion foundation', 'makeup', 899),
    ('Cream blush', 'makeup', 549),
    ('Eyeshadow palette', 'makeup', 799),
    ('Brow pencil', 'makeup', 299),
    ('Gentle cleanser', 'skincare', 349),
    ('Vitamin C serum', 'skincare', 699),
    ('Daily moisturizer', 'skincare', 449),
    ('Sunscreen SPF 50', 'skincare', 399),
    ('Hydrating face mask', 'skincare', 249),
    ('Nourishing shampoo', 'hair', 399),
    ('Leave-in conditioner', 'hair', 449),
    ('Heat protect spray', 'hair', 499),
    ('Hair oil', 'hair', 349),
    ('Warm brown hair color', 'hair', 599),
]

if db.products.count_documents({}) > 0:
    print('Products already exist. Nothing added.')
else:
    docs = [
        {
            'name': name,
            'brand': 'Demo Brand',
            'category': category,
            'price': price,
            'image_url': '',
            'description': 'Sample product for testing the FaceWise catalog.',
        }
        for name, category, price in SAMPLES
    ]
    db.products.insert_many(docs)
    print('Added', len(docs), 'sample products')
