-- backend/db/schema.sql
CREATE TABLE IF NOT EXISTS lecturas (
  id                  BIGSERIAL PRIMARY KEY,
  device_id           VARCHAR(64)   NOT NULL,
  temperatura_agua    NUMERIC(5,2),
  temperatura_ambiente NUMERIC(5,2),
  humedad_ambiente    NUMERIC(5,2),
  humedad_suelo       NUMERIC(5,2),
  ph                  NUMERIC(4,2),
  tds_ppm             NUMERIC(7,1),
  fecha               TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
-- Índices optimizados para consultas por rango temporal y por dispositivo
CREATE INDEX IF NOT EXISTS idx_lecturas_fecha        ON lecturas (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_lecturas_device_fecha ON lecturas (device_id, fecha DESC);
-- BRIN es muy barato para tablas append-only de series de tiempo grandes
CREATE INDEX IF NOT EXISTS idx_lecturas_fecha_brin   ON lecturas USING BRIN (fecha);

CREATE TABLE IF NOT EXISTS recetas (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(80) NOT NULL,
  es_predefinida  BOOLEAN NOT NULL DEFAULT FALSE,
  ph_min NUMERIC(4,2) NOT NULL,  ph_max NUMERIC(4,2) NOT NULL,
  ec_min NUMERIC(4,2) NOT NULL,  ec_max NUMERIC(4,2) NOT NULL,   -- mS/cm
  temp_agua_min NUMERIC(5,2) NOT NULL, temp_agua_max NUMERIC(5,2) NOT NULL,
  temp_amb_min  NUMERIC(5,2) NOT NULL, temp_amb_max  NUMERIC(5,2) NOT NULL,
  hum_min NUMERIC(5,2) NOT NULL, hum_max NUMERIC(5,2) NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un único cultivo activo por dispositivo
CREATE TABLE IF NOT EXISTS cultivo_activo (
  device_id   VARCHAR(64) PRIMARY KEY,
  receta_id   INT NOT NULL REFERENCES recetas(id) ON DELETE RESTRICT,
  activado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alertas (
  id            BIGSERIAL PRIMARY KEY,
  device_id     VARCHAR(64) NOT NULL,
  variable      VARCHAR(20) NOT NULL,   -- 'ph' | 'ec'
  valor         NUMERIC(7,2) NOT NULL,
  limite_min    NUMERIC(7,2) NOT NULL,
  limite_max    NUMERIC(7,2) NOT NULL,
  severidad     VARCHAR(10) NOT NULL DEFAULT 'critica',
  mensaje       TEXT NOT NULL,
  recomendacion TEXT NOT NULL,
  leida         BOOLEAN NOT NULL DEFAULT FALSE,
  creada_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alertas_device_fecha ON alertas (device_id, creada_en DESC);

CREATE TABLE IF NOT EXISTS dispositivos_push (
  token      TEXT PRIMARY KEY,
  device_id  VARCHAR(64) NOT NULL,
  plataforma VARCHAR(16),
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catálogo preconfigurado (idempotente)
INSERT INTO recetas (nombre, es_predefinida, ph_min, ph_max, ec_min, ec_max,
  temp_agua_min, temp_agua_max, temp_amb_min, temp_amb_max, hum_min, hum_max)
SELECT * FROM (VALUES
  ('Lechuga',               TRUE, 5.5, 6.5, 0.8, 1.2, 18.0, 22.0, 15.0, 24.0, 50.0, 70.0),
  ('Tomate (Vegetativo)',   TRUE, 5.8, 6.3, 2.0, 2.5, 20.0, 24.0, 21.0, 27.0, 60.0, 70.0),
  ('Tomate (Floración)',    TRUE, 5.8, 6.3, 2.5, 3.5, 20.0, 24.0, 18.0, 26.0, 55.0, 65.0),
  ('Fresa',                 TRUE, 5.5, 6.2, 1.4, 1.8, 18.0, 22.0, 18.0, 25.0, 60.0, 75.0),
  ('Albahaca',              TRUE, 5.5, 6.5, 1.0, 1.6, 20.0, 25.0, 20.0, 28.0, 50.0, 65.0),
  ('Menta',                 TRUE, 5.5, 6.5, 1.8, 2.4, 18.0, 24.0, 18.0, 26.0, 55.0, 75.0)
) AS v(nombre, es_predefinida, ph_min, ph_max, ec_min, ec_max,
       temp_agua_min, temp_agua_max, temp_amb_min, temp_amb_max, hum_min, hum_max)
WHERE NOT EXISTS (SELECT 1 FROM recetas WHERE es_predefinida = TRUE);
