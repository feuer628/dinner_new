DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE TABLE "roles" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(300) NOT NULL
) WITH (
    OIDS=FALSE
);

CREATE TABLE "actions" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "desc" VARCHAR(500) NOT NULL
) WITH (
    OIDS=FALSE
);

CREATE TABLE "role_actions" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "role_id" SERIAL NOT NULL,
    "action_id" SERIAL NOT NULL
) WITH (
    OIDS=FALSE
);

CREATE TABLE "system_properties" (
	"name" VARCHAR(100) NOT NULL PRIMARY KEY,
	"value" VARCHAR(1024) NULL
) WITH (
    OIDS=FALSE
);

CREATE TABLE "providers" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(300) NOT NULL,
	"emails" VARCHAR(255) NOT NULL,
	"description" VARCHAR(1024) NULL,
	"url" VARCHAR(255) NULL,
	"logo" VARCHAR(255) NULL
) WITH (
    OIDS=FALSE
);

CREATE TABLE "org_groups" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"limit_type" SMALLINT NOT NULL,
	"limit" INTEGER,
	"name" VARCHAR(300) NOT NULL,
	"description" VARCHAR(255),
	"provider_id" INTEGER NULL
) WITH (
    OIDS=FALSE
);

CREATE TABLE "organizations" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(300) NOT NULL,
	"to_name" VARCHAR(300),
	"group_id" INTEGER NULL
) WITH (
    OIDS=FALSE
);

CREATE TABLE "provider_reviews" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"provider_id" INTEGER NOT NULL,
	"user_id" INTEGER NOT NULL,
	"review" VARCHAR(255) NOT NULL,
	"rating" INTEGER NOT NULL
) WITH (
    OIDS=FALSE
);

CREATE TABLE "users" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"login" VARCHAR(100) NOT NULL UNIQUE,
	"password" VARCHAR(255) NOT NULL,
	"balance" FLOAT NOT NULL,
	"description" VARCHAR(255) NOT NULL,
	"birthday" DATE NOT NULL,
	"phone" VARCHAR(10) NOT NULL,
	"org_id" INTEGER NOT NULL,
	"role_id" INTEGER NOT NULL,
	"status" SMALLINT DEFAULT 0,
	"key" VARCHAR(255),
	"ip" VARCHAR(255),
	"komp_key" VARCHAR(255),
	"ip_phone" VARCHAR(255),
	"from_text" VARCHAR(255),
	"telegram_id" INTEGER,
	"created_at" TIMESTAMP,
	"updated_at" TIMESTAMP
) WITH (
    OIDS=FALSE
);

CREATE TABLE "menu_items" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"provider_id" INTEGER NOT NULL,
	"menu_date" DATE NOT NULL,
	"type" VARCHAR(255) NOT NULL,
	"name" VARCHAR(255) NOT NULL,
	"weight" INTEGER,
	"price" FLOAT(10),
	"description" VARCHAR(1024)
) WITH (
  OIDS=FALSE
);

CREATE TABLE "orders" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"user_id" INTEGER NOT NULL,
	"status" INTEGER NOT NULL DEFAULT '1',
	"order_date" DATE NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	"updated_at" TIMESTAMP NOT NULL
) WITH (
  OIDS=FALSE
);

CREATE TABLE "order_items" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"order_id" INTEGER NOT NULL,
	"name" VARCHAR(255) NOT NULL,
	"comment" VARCHAR(255),
	"count" INTEGER NOT NULL,
	"price" FLOAT(10) NOT NULL,
	"rating" integer,
	"review" VARCHAR(500)
) WITH (
  OIDS=FALSE
);

CREATE TABLE "balance_history" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"user_id" INTEGER NOT NULL,
	"amount" FLOAT(10) NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	"order_id" INTEGER
) WITH (
  OIDS=FALSE
);

ALTER TABLE "role_actions" ADD CONSTRAINT "role_actions_fk0" FOREIGN KEY ("role_id") REFERENCES "roles"("id");
ALTER TABLE "role_actions" ADD CONSTRAINT "role_actions_fk1" FOREIGN KEY ("action_id") REFERENCES "actions"("id");
ALTER TABLE "org_groups" ADD CONSTRAINT "org_groups_fk0" FOREIGN KEY ("provider_id") REFERENCES "providers"("id");
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_fk0" FOREIGN KEY ("group_id") REFERENCES "org_groups"("id");
ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_fk0" FOREIGN KEY ("provider_id") REFERENCES "providers"("id");
ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_fk1" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "users" ADD CONSTRAINT "users_fk0" FOREIGN KEY ("org_id") REFERENCES "organizations"("id");
ALTER TABLE "users" ADD CONSTRAINT "users_fk1" FOREIGN KEY ("role_id") REFERENCES "roles"("id");
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_fk0" FOREIGN KEY ("provider_id") REFERENCES "providers"("id");
ALTER TABLE "orders" ADD CONSTRAINT "orders_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_fk0" FOREIGN KEY ("order_id") REFERENCES "orders"("id");
ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_fk1" FOREIGN KEY ("order_id") REFERENCES "orders"("id");

INSERT INTO "public"."roles" ("name") VALUES ('администратор');
INSERT INTO "public"."roles" ("name") VALUES ('оператор');
INSERT INTO "public"."roles" ("name") VALUES ('пользователь');
INSERT INTO "public"."roles" ("name") VALUES ('поставщик');

INSERT INTO "public"."actions" ("id", "desc") VALUES (1, 'Возможность администрирования системы');
INSERT INTO "public"."actions" ("id", "desc") VALUES (2, 'Возможность добавлять обед за другого сотрудника');
INSERT INTO "public"."actions" ("id", "desc") VALUES (3, 'Возможность подтверждения регистрации сотрудника');
INSERT INTO "public"."actions" ("id", "desc") VALUES (4, 'Возможность заказывать обед');

INSERT INTO "public".role_actions (role_id, action_id) VALUES (1, 1);
INSERT INTO "public".role_actions (role_id, action_id) VALUES (1, 2);
INSERT INTO "public".role_actions (role_id, action_id) VALUES (1, 4);

INSERT INTO org_groups (limit_type, name, description) VALUES (0, 'Первая группа', 'Описание первой группы');
INSERT INTO org_groups (limit_type, "limit", name) VALUES (1, 200, 'СС');
INSERT INTO org_groups (limit_type, "limit", name, description) VALUES (2, 250, 'Адобе', 'Фтошоп');

INSERT INTO organizations (name, to_name, group_id) VALUES ('ФТОР', 'Судейкису С.', 1);
INSERT INTO organizations (name, to_name) VALUES ('ХРОМ', 'Муд А.');
INSERT INTO organizations (name, to_name, group_id) VALUES ('СЕЛЕН', 'Гуд М.', 2);
INSERT INTO organizations (name, to_name) VALUES ('БРОМ', 'Дуд Д.');