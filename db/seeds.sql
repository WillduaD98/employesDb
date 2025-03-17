-- Eliminar datos previos para evitar duplicados al volver a ejecutar los seeds
TRUNCATE TABLE "employee", "role", "department" RESTART IDENTITY CASCADE;

-- Insertar valores en la tabla department
INSERT INTO "department" ("name") VALUES
('Recursos Humanos'),
('Tecnología'),
('Finanzas'),
('Marketing'),
('Ventas');

-- Insertar valores en la tabla role
INSERT INTO "role" ("title", "salary", "department") VALUES
('Desarrollador Backend', 75000, 2),
('Desarrollador Frontend', 72000, 2),
('Gerente de TI', 95000, 2),
('Analista Financiero', 80000, 3),
('Director de Finanzas', 120000, 3),
('Especialista en Marketing Digital', 65000, 4),
('Gerente de Ventas', 85000, 5),
('Asistente de RRHH', 50000, 1),
('Gerente de RRHH', 90000, 1);

-- Insertar valores en la tabla employee
INSERT INTO "employee" ("first_name", "last_name", "role_id", "manager_id") VALUES
('Juan', 'Pérez', 1, NULL), -- No tiene manager
('María', 'García', 2, 1),  -- Reporta a Juan
('Carlos', 'López', 3, 1),  -- Reporta a Juan
('Ana', 'Martínez', 4, NULL),
('Luis', 'Hernández', 5, 4), -- Reporta a Ana
('Sofía', 'Torres', 6, NULL),
('Diego', 'Ramos', 7, 6), -- Reporta a Sofía
('Elena', 'Navarro', 8, NULL),
('Roberto', 'Castillo', 9, 8); -- Reporta a Elena
