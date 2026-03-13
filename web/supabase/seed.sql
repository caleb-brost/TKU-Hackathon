-- Sample seed data – run after schema.sql
-- Coordinates are around Taipei, Taiwan

insert into tickets (type, latitude, longitude, severity, confidence, status, description) values
  ('pothole', 25.0478, 121.5319, 'high',   0.95, 'new',       'Large pothole near intersection, vehicle damage risk'),
  ('crack',   25.0501, 121.5340, 'medium', 0.82, 'new',       'Longitudinal crack along the centre line'),
  ('pothole', 25.0455, 121.5290, 'low',    0.73, 'new',       'Minor pothole on side lane'),
  ('crack',   25.0523, 121.5375, 'high',   0.91, 'new',       'Severe alligator cracking near bus stop'),
  ('pothole', 25.0490, 121.5310, 'medium', 0.88, 'completed', 'Pothole patched last month – verify'),
  ('crack',   25.0467, 121.5355, 'low',    null, 'new',       null);
