-- Sample seed data – run after schema.sql
-- Coordinates are around Taipei, Taiwan

insert into tickets (type, latitude, longitude, severity, confidence, status, description, image_url) values
  ('pothole', 53.54262, -113.49375, 'high',   0.95, 'new',       'Large pothole near intersection, vehicle damage risk', 'absolute-cinema.gif'),
  ('crack',   53.546206, -113.501528, 'medium', 0.82, 'new',       'Longitudinal crack along the centre line', 'monkey-thinking-meme-monkey-thinking-sticker.gif'),
  ('pothole', 53.544964, -113.502893, 'low',    0.73, 'new',       'Minor pothole on side lane', 'Always_has_been.jpg'),
  ('crack',   53.549177, -113.49181, 'high',   0.91, 'new',       'Severe alligator cracking near bus stop', 'diamond-mining-diamond-mining-meme.jpg'),
  ('pothole', 53.541881, -113.486117, 'medium', 0.88, 'completed', 'Pothole patched last month verify', 'screaming-baby-made-of-ash-v0-qp2wo44efu1c1.webp')





