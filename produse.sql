DROP TYPE IF EXISTS categ_produs;
DROP TYPE IF EXISTS categorie_generala;

CREATE TYPE categorie_generala AS ENUM(
    'schi_si_clapari',
    'snowboard_si_boots',
    'imbracaminte_tehnica',
    'accesorii'
);

CREATE TYPE categ_produs AS ENUM (
    'echipament_principal',
    'imbracaminte_layer',
    'imbracaminte_outer',
    'protectie',
    'accesoriu_utilitar'
);

CREATE TABLE IF NOT EXISTS produse (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) UNIQUE NOT NULL,
    descriere TEXT,
    imagine VARCHAR(300),
    categorie categorie_generala NOT NULL,
    categ categ_produs NOT NULL,
    pret NUMERIC(8,2) NOT NULL CHECK (pret >= 0),
    greutate NUMERIC(5,2) NOT NULL,
    data_adaugare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gen VARCHAR(30),
    culoare VARCHAR(30),
    materiale VARCHAR[],    
    livrare_gratuita BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO produse 
(nume, descriere, imagine, categorie, categ, pret, greutate, gen, culoare, materiale, livrare_gratuita) 
VALUES

-- Schi & Clăpari
('Schiuri Atomic', 'Schiuri de competiție pentru avansați', 'schi-atomic.png', 
 'schi_si_clapari', 'echipament_principal', 2799.99, 7.2, 'unisex', 'albastru', '{"metal", "carbon", "plastic"}', TRUE),

('Clăpari Noir', 'Clăpari confortabili, potriviți pentru schiori intermediari', 'clapari-noir.png', 
 'schi_si_clapari', 'echipament_principal', 1249.00, 4.3, 'bărbați', 'negru', '{"plastic", "spumă", "metal"}'),

('Schiuri Rossa', 'Schiuri all-mountain pentru începători și intermediari. Construcție Air Tip pentru manevrabilitate ușoară și stabilitate crescută.',
 'rossa.png', 'schi_si_clapari', 'echipament_principal', 379.99, 6.5, 'unisex', 'roz', '{"lemn", "fibră de sticlă"}', TRUE),

('Clăpari Nordica', 'Clapari cu fit mediu, flexibilitate moderată și tehnologie 3D Cork Fit pentru personalizare și izolare termică.',
 'nordica.png', 'schi_si_clapari', 'echipament_principal', 399.99, 3.8, 'femei', 'gri', '{"poliuretan", "plută"}', FALSE),

-- Snowboard & Boots
('Snowboard Sky', 'All-mountain board pentru orice condiții', 'snowboard-sky.png',
 'snowboard_si_boots', 'echipament_principal', 2499.90, 8.7, 'unisex', 'verde', '{"lemn", "fibră de sticlă"}', FALSE),

('Boots Ready', 'Boots cu sistem Boa pentru control excelent', 'boots-ready.png',
 'snowboard_si_boots', 'echipament_principal', 999.50, 4.5, 'femei', 'alb', '{"piele", "spumă"}', TRUE),

('Snowboard Vortex', 'Snowboard versatil. Perfect pentru freestyle și all-mountain.', 'snowboard-vortex.png',
 'snowboard_si_boots', 'echipament_principal', 599.99, 5.8, 'unisex', 'albastru', '{"lemn", "fibră de carbon","fibră de sticlă"}', TRUE),

('Boots X100', 'Boots confortabili și flexibili cu sistem de închidere BOA pentru ajustare rapidă și precisă. Căptușeală termică Imprint.',
 'boots-x100.png', 'snowboard_si_boots', 'echipament_principal', 299.99, 2.8, 'bărbați', 'negru', '{"poliuretan", "EVA","neopren"}', FALSE),

('Snowboard Nitro', 'Snowboard all-mountain pentru începători și intermediari. Construcție Power Core II pentru durabilitate și flex progresiv.',
 'snowboard-nitro.png', 'snowboard_si_boots', 'echipament_principal', 349.99, 5.4, 'unisex', 'portocaliu','{"lemn","fibră de sticlă"}', FALSE),

-- Îmbrăcăminte tehnică – Layer
('Tricou tehnic SnowRider', 'Tricou de bază, respirabil și antibacterian', 'tricou1.png',
 'imbracaminte_tehnica', 'imbracaminte_layer', 199.00, 0.1, 'bărbați', 'galben', '{"poliester", "elastan"}', TRUE),

('Bluzon termic Polartech', 'Ideal sub jachetă în zilele geroase', 'bluzon-polartech.png',
 'imbracaminte_tehnica', 'imbracaminte_layer', 289.99, 0.25, 'femei', 'rosu', '{"poliester", "lână"}', FALSE),

('Pulover tehnic Icebreaker', 'Pulover din lână merino, respirabil și călduros', 'pulover-icebreaker.png',
 'imbracaminte_tehnica', 'imbracaminte_layer', 349.50, 0.3, 'unisex', 'verde', '{"lână"}', TRUE),

-- Îmbrăcăminte tehnică – Outer
('Geacă izolantă SnowRider', 'Geacă impermeabilă cu umplutură termică', 'geaca1.png',
 'imbracaminte_tehnica', 'imbracaminte_outer', 799.90, 0.8, 'bărbați', 'alb', '{"poliester", "termoreflectiv"}', TRUE),

('Geacă izolantă SnowRider X', 'Geacă impermeabilă cu umplutură termică', 'geaca2.png',
 'imbracaminte_tehnica', 'imbracaminte_outer', 790.90, 0.8, 'femei', 'alb', '{"poliester", "termoreflectiv"}', TRUE),

('Costum one-piece', 'Costum complet pentru snowboard și schi freeride', 'onepiece.png',
 'imbracaminte_tehnica', 'imbracaminte_outer', 1549.00, 0.9, 'femei', 'negru', '{"poliester", "nailon"}', FALSE),

('Jachetă impermeabilă', 'Jachetă ușoară pentru ski de tură', 'jacheta.png',
 'imbracaminte_tehnica', 'imbracaminte_outer', 399.00, 0.4, 'femei', 'mov', '{"poliester", "teflon"}', FALSE),

('Pantaloni SnowRider', 'Pantaloni impermeabili cu multiple buzunare și ventilație laterală. Izolație Thermolite pentru zile friguroase și cusături impermeabile.', 
'pantaloni.png', 'imbracaminte_tehnica', 'imbracaminte_outer', 249.99, 0.9, 'bărbați', 'negru', '{"thermolite", "poliester"}', FALSE),

-- Accesorii – Protecție
('Cască Rocket', 'Cască ușoară cu ventilație activă', 'casca.png',
 'accesorii', 'protectie', 549.00, 1.3, 'bărbați', 'negru', '{"plastic", "spumă"}', TRUE),

('Ochelari UVEX anti-ceata', 'Ochelari cu lentile duble și protecție UV', 'ochelari.png',
 'accesorii', 'protectie', 269.00, 0.4, 'unisex', 'portocaliu', '{"plastic", "sticlă"}', TRUE),

-- Accesorii – Utilitare

('Mănuși Titan', 'Mănuși impermeabile cu interior detașabil', 'manusi.png',
 'accesorii', 'accesoriu_utilitar', 179.00, 0.2, 'bărbați', 'negru', '{"piele", "lână"}', TRUE),

('Mitene copii', 'Mitene ușor de îmbrăcat pentru copii', 'mitene.png',
 'accesorii', 'accesoriu_utilitar', 129.00, 0.1, 'copii', 'gri', '{"poliester"}', TRUE),

ALTER TABLE produse ADD COLUMN tara_origine VARCHAR(100);

-- CREATE USER andra WITH ENCRYPTED PASSWORD 'andra';
-- GRANT ALL PRIVILEGES ON DATABASE snowrider TO andra ;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO andra;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO andra;


CREATE TABLE seturi (
    id SERIAL PRIMARY KEY,
    nume_set TEXT NOT NULL,
    descriere_set TEXT
);

CREATE TABLE asociere_set (
    id_set INTEGER REFERENCES seturi(id) ON DELETE CASCADE,
    id_produs INTEGER REFERENCES produse(id) ON DELETE CASCADE,
    PRIMARY KEY (id_set, id_produs)
);

INSERT INTO seturi (nume_set, descriere_set) VALUES
('Schi Start', 'Set ideal pentru schiatori: schiuri și clăpari compatibili.'),
('Vision & Safety', 'Protecție completă pentru ochi și cap.'),
('Ride Ready', 'Pachet complet pentru snowboarderi.'),
('Layer Pro', 'Echipament pentru temperaturi scăzute.'),
('Cold Control Kit', 'Accesorii indispensabile pentru iarnă.');
('SnowRider Feminine KIT', 'Set ideal pentru aventuri de neuitat.')


INSERT INTO asociere_set (id_set, id_produs) VALUES (1, 1), (1, 2);
INSERT INTO asociere_set (id_set, id_produs) VALUES (2, 18), (2, 19);
INSERT INTO asociere_set (id_set, id_produs) VALUES (3, 5), (3, 6);
INSERT INTO asociere_set (id_set, id_produs) VALUES (4, 12), (4, 17);
INSERT INTO asociere_set (id_set, id_produs) VALUES (5, 19), (5, 20);
INSERT INTO asociere_set (id_set, id_produs) VALUES (6, 15), (6, 3), (6,2);

GRANT ALL PRIVILEGES ON seturi TO andra;
GRANT ALL PRIVILEGES ON asociere_set TO andra;