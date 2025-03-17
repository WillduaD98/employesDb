-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- Link to schema: https://app.quickdatabasediagrams.com/#/d/0IzAS1
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


CREATE TABLE "department" (
    "id" serial   NOT NULL,
    "name" varchar(30)   NOT NULL,
    CONSTRAINT "pk_department" PRIMARY KEY (
        "id"
     )
);

CREATE TABLE "role" (
    "id" serial   NOT NULL,
    "title" varchar(100)   NOT NULL,
    "salary" decimal   NOT NULL,
    "department" integer   NOT NULL,
    CONSTRAINT "pk_role" PRIMARY KEY (
        "id"
     )
);

CREATE TABLE "employee" (
    "id" serial   NOT NULL,
    "first_name" varchar(30)   NOT NULL,
    "last_name" varchar(30)   NOT NULL,
    "role_id" integer   NOT NULL,
    "manager_id" integer   NOT NULL,
    CONSTRAINT "pk_employee" PRIMARY KEY (
        "id"
     )
);

ALTER TABLE "role" ADD CONSTRAINT "fk_role_department" FOREIGN KEY("department")
REFERENCES "department" ("id");

ALTER TABLE "employee" ADD CONSTRAINT "fk_employee_role_id" FOREIGN KEY("role_id")
REFERENCES "role" ("id");

ALTER TABLE "employee" ADD CONSTRAINT "fk_employee_manager_id" FOREIGN KEY("manager_id")
REFERENCES "employee" ("id");
