-- Crear tabla de productos para el juego de residuos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  imagen_url TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas por categoría (mejora rendimiento)
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);

-- Insertar algunos productos de ejemplo para comenzar
INSERT INTO productos (nombre, categoria, imagen_url, descripcion) VALUES
-- Orgánico
('Cáscara de Banana', 'organico', 'https://images.pexels.com/photos/5645731/pexels-photo-5645731.jpeg', 'Residuo compostable'),
('Núcleo de Manzana', 'organico', 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg', 'Residuo compostable'),
('Cáscara de Naranja', 'organico', 'https://images.pexels.com/photos/5645737/pexels-photo-5645737.jpeg', 'Residuo compostable'),
('Cáscara de Huevo', 'organico', 'https://images.pexels.com/photos/5645733/pexels-photo-5645733.jpeg', 'Residuo compostable'),
('Hoja Seca', 'organico', 'https://images.pexels.com/photos/1143592/pexels-photo-1143592.jpeg', 'Residuo compostable'),
('Rama de Árbol', 'organico', 'https://images.pexels.com/photos/5645741/pexels-photo-5645741.jpeg', 'Residuo compostable'),
('Cartón Mojado', 'organico', 'https://images.pexels.com/photos/5645748/pexels-photo-5645748.jpeg', 'Residuo compostable'),

-- Reciclable
('Botella de Plástico', 'reciclable', 'https://images.pexels.com/photos/3624458/pexels-photo-3624458.jpeg', 'Plástico reciclable'),
('Bolsa Plástica', 'reciclable', 'https://images.pexels.com/photos/3952632/pexels-photo-3952632.jpeg', 'Plástico reciclable'),
('Envase Plástico', 'reciclable', 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg', 'Plástico reciclable'),
('Tubo de Papel', 'reciclable', 'https://images.pexels.com/photos/2507010/pexels-photo-2507010.jpeg', 'Papel reciclable'),
('Periódico', 'reciclable', 'https://images.pexels.com/photos/3876571/pexels-photo-3876571.jpeg', 'Papel reciclable'),
('Caja de Cartón', 'reciclable', 'https://images.pexels.com/photos/3938292/pexels-photo-3938292.jpeg', 'Cartón reciclable'),

-- Vidrio
('Botella de Vidrio', 'vidrio', 'https://images.pexels.com/photos/3407657/pexels-photo-3407657.jpeg', 'Vidrio reciclable'),
('Frasco de Vidrio', 'vidrio', 'https://images.pexels.com/photos/3573351/pexels-photo-3573351.jpeg', 'Vidrio reciclable'),
('Botella de Vino', 'vidrio', 'https://images.pexels.com/photos/3737292/pexels-photo-3737292.jpeg', 'Vidrio reciclable'),
('Vaso Roto', 'vidrio', 'https://images.pexels.com/photos/3585403/pexels-photo-3585403.jpeg', 'Vidrio reciclable'),

-- Peligroso
('Batería', 'peligroso', 'https://images.pexels.com/photos/12589563/pexels-photo-12589563.jpeg', 'Residuo peligroso'),
('Bombilla Fluorescente', 'peligroso', 'https://images.pexels.com/photos/8632721/pexels-photo-8632721.jpeg', 'Residuo peligroso'),
('Lata de Pintura', 'peligroso', 'https://images.pexels.com/photos/9829571/pexels-photo-9829571.jpeg', 'Residuo peligroso'),
('Medicamento', 'peligroso', 'https://images.pexels.com/photos/3962280/pexels-photo-3962280.jpeg', 'Residuo peligroso'),

-- No Reciclable
('Film Plástico', 'no_reciclable', 'https://images.pexels.com/photos/3945680/pexels-photo-3945680.jpeg', 'Plástico no reciclable'),
('Espuma de Poliestireno', 'no_reciclable', 'https://images.pexels.com/photos/3976424/pexels-photo-3976424.jpeg', 'Material no reciclable'),
('Pañal Usado', 'no_reciclable', 'https://images.pexels.com/photos/8627226/pexels-photo-8627226.jpeg', 'Residuo no reciclable'),
('Cinta Adhesiva', 'no_reciclable', 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg', 'Material no reciclable')
ON CONFLICT DO NOTHING;
