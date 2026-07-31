CREATE DATABASE IF NOT EXISTS Catalogo;

USE Catalogo;

CREATE TABLE menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(2) NOT NULL,
  descripcion VARCHAR(25) NOT NULL
);

CREATE TABLE opciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cod_menu VARCHAR(2),
  cod_opcion VARCHAR(2),
  descrip_opcion VARCHAR(25) NOT NULL,
  UNIQUE KEY uq_menu_opcion (cod_menu, cod_opcion),
  FOREIGN KEY (cod_menu) REFERENCES menu(codigo) ON DELETE CASCADE
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(25) UNIQUE NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  menu VARCHAR(2) NOT NULL,
  opcion VARCHAR(2) NOT NULL,
  imagen_url VARCHAR(255) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  precio INT NOT NULL DEFAULT 0
);


INSERT INTO menu (codigo, descripcion) VALUES
('01', 'Luces led'),
('02', 'Artículos eléctricos'),
('03', 'Accesorios'),
('04', 'Niples y mangueras'),
('05', 'Frenos de aire'),
('06', 'Válvulas'),
('07', 'Suspensión');

INSERT INTO opciones (cod_menu, cod_opcion, descrip_opcion) VALUES
('01', '01', 'Delanteros'),
('01', '02', 'Balizas'),
('01', '03', 'Traseros'),
('01', '04', 'Bases metálicas'),
('01', '05', 'Laterales'),
('01', '06', 'Estroboscópicos'),
('01', '07', 'Faeneros'),
('01', '08', 'Micas'),
('02', '01', 'Cables'),
('02', '02', 'Terminal baterías'),
('02', '03', 'Enchufes'),
('02', '04', 'Fusibles'),
('02', '05', 'Ampolletas'),
('02', '06', 'Varios'),
('03', '01', 'Adornos'),
('03', '02', 'Plumillas'),
('03', '03', 'Antenas'),
('03', '04', 'Tapas y cubretuercas'),
('03', '05', 'Bocinas'),
('03', '06', 'Tubos de escape'),
('03', '07', 'Espejos'),
('03', '08', 'Piezas de arrastre'),
('03', '09', 'Guardafangos'),
('03', '10', 'Eslingas y accesorios'),
('03', '11', 'Herramientas'),
('03', '12', 'Varios'),
('04', '11', 'Unión tubos plast.'),
('04', '12', 'Conectores c/hilo plast.'),
('04', '13', 'Tee  e  Y plast.'),
('04', '21', 'Unión tubos bronce'),
('04', '22', 'Conectores c/hilo bronce'),
('04', '23', 'Tee bronce'),
('04', '31', 'Unión mangueras'),
('04', '32', 'Conectores c/hilo mangueras'),
('04', '33', 'Tee  e  Y mangueras'),
('04', '41', 'Tubos (tecalan y poliuretano)'),
('04', '42', 'Mangueras aire/agua'),
('04', '43', 'Espirales'),
('04', '51', 'Hilo HI-HI'),
('04', '52', 'Hilo HE-HE'),
('04', '53', 'Hilo HE-HI'),
('04', '54', 'Tee HI'),
('04', '61', 'Racor y Banjo'),
('04', '62', 'Tapones'),
('04', '63', 'Pasamuros'),
('05', '01', 'Pulmones de frenos'),
('05', '02', 'Tambores, masas y accesorios'),
('05', '03', 'Chicharras'),
('05', '04', 'Ejes de leva y bujes'),
('05', '05', 'Reparación de frenos'),
('05', '06', 'Manos de acople'),
('06', '01', 'Gobernadores'),
('06', '02', 'Relay'),
('06', '03', 'Pedaleras'),
('06', '04', 'Seguridad'),
('06', '05', 'Solenoides'),
('06', '06', 'Acción Maxi'),
('06', '07', 'Retención y Check'),
('06', '08', 'Descargas rápidas'),
('07', '01', 'Balancines'),
('07', '02', 'Tensores'),
('07', '03', 'Torres'),
('07', '04', 'Manos'),
('07', '05', 'Fuelles'),
('07', '06', 'Bujes'),
('07', '07', 'Válvulas');
  
