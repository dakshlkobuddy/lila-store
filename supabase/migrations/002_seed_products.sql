-- ============================================================
-- Lila & Co. — Seed Products
-- Run AFTER 001_initial_schema.sql in Supabase SQL Editor
-- ============================================================
-- image_url is NULL — frontend renders CSS placeholder (gradient + icon)
-- Admin user is NOT seeded here — create via Supabase Auth Dashboard

INSERT INTO products (name, category, price, stock, image_url, sizes, colours, description, badge, is_active) VALUES
(
  'Everyday Cotton Bra',
  'Bra',
  499.00,
  20,
  NULL,
  ARRAY['32B', '34B', '34C', '36C'],
  ARRAY['Black', 'Beige', 'White'],
  'Soft non-wired everyday bra in breathable cotton with full coverage and gentle support.',
  'Best Seller',
  TRUE
),
(
  'Lace Balconette Bra',
  'Bra',
  799.00,
  12,
  NULL,
  ARRAY['32B', '34C', '36C'],
  ARRAY['Black', 'Maroon'],
  'Underwired balconette bra with delicate lace trim and adjustable straps.',
  'New',
  TRUE
),
(
  'High-Impact Sports Bra',
  'Sports Bra',
  899.00,
  15,
  NULL,
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Black', 'Grey', 'Coral'],
  'Moisture-wicking high-support sports bra with a racerback for workouts and running.',
  'New',
  TRUE
),
(
  'Seamless Hipster Panties (Pack of 3)',
  'Panties',
  599.00,
  30,
  NULL,
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Assorted'],
  'No-show seamless hipster briefs in soft microfiber. Comfortable all-day wear.',
  'Best Seller',
  TRUE
),
(
  'Printed Cotton Night Suit',
  'Night Suits',
  1199.00,
  8,
  NULL,
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Blue', 'Pink'],
  'Two-piece cotton night suit with a relaxed top and full-length pants in a soft print.',
  NULL,
  TRUE
),
(
  'Relaxed Crew T-Shirt',
  'T-Shirts',
  449.00,
  0,
  NULL,
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Black', 'White', 'Olive'],
  'Everyday crew-neck tee in combed cotton with a relaxed, true-to-size fit.',
  'Sale',
  TRUE
),
(
  'Floral Kaftan',
  'Kaftan',
  1299.00,
  10,
  NULL,
  ARRAY['Free Size'],
  ARRAY['Floral Blue', 'Floral Red'],
  'Breezy floral kaftan in lightweight rayon — easy loungewear or beach cover-up.',
  'New',
  TRUE
),
(
  'Soft Cotton Pyjama Set',
  'Pyjama',
  899.00,
  4,
  NULL,
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Grey', 'Navy'],
  'Cosy button-down pyjama set in brushed cotton with an elastic drawstring waist.',
  NULL,
  TRUE
),
(
  'Satin Camisole',
  'Camisole',
  699.00,
  18,
  NULL,
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Black', 'White', 'Nude'],
  'Smooth satin camisole with adjustable straps. Layer it or wear it on its own.',
  NULL,
  TRUE
),
(
  'High-Waist Gym Leggings',
  'Gym Leggings',
  1099.00,
  14,
  NULL,
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Black', 'Charcoal', 'Plum'],
  'Squat-proof high-waist leggings with four-way stretch and a hidden waistband pocket.',
  'Best Seller',
  TRUE
);
