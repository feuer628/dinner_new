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
	"compensation_flag" BOOLEAN DEFAULT FALSE,
	"limit" INTEGER DEFAULT 0,
	"hard_limit" INTEGER DEFAULT 0,
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
	"comp_key" VARCHAR(255),
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

INSERT INTO providers (name, emails, url) VALUES ('Вкусная почта', 'asdasdw@mail.ru', 'http://obedi.ru');
INSERT INTO providers (name, emails, url) VALUES ('Просто еда', 'eda@mail.ru', 'http://obedi22.ru');
INSERT INTO providers (name, emails, url) VALUES ('Еда для гопников', 'zhrachka@mail.ru', 'http://obedi354.ru');
INSERT INTO providers (name, emails, description, url) VALUES ('Инкогнито', 'pohlebka@mail.ru', '', 'http://obed6574i.ru');
INSERT INTO providers (name, emails, description, url) VALUES ('Супы домашние', 'soup@mail.ru', '', 'http://ob7452edi.ru');

INSERT INTO org_groups (limit_type, name, description) VALUES (0, 'Первая группа', 'Описание первой группы');
INSERT INTO org_groups (limit_type, compensation_flag, "limit", hard_limit, name) VALUES (1, true, 200, 1000, 'СС');
INSERT INTO org_groups (limit_type, compensation_flag, "limit", hard_limit, name, provider_id) VALUES (1, false, 0, 0, 'Финализированная группос', 2);
INSERT INTO org_groups (limit_type, compensation_flag, "limit", hard_limit, name, description) VALUES (1, true, 220, 0, 'ЖЖшечка', 'Акробат');
INSERT INTO org_groups (limit_type, compensation_flag, "limit", hard_limit, name, description, provider_id) VALUES (1, true, 1000, 0, 'Адобе', 'Фтошоп', 1);

INSERT INTO organizations (name, to_name, group_id) VALUES ('ФТОР', 'Судейкису С.', 1);
INSERT INTO organizations (name, to_name) VALUES ('ХРОМ', 'Муд А.');
INSERT INTO organizations (name, to_name, group_id) VALUES ('СЕЛЕН', 'Гуд М.', 2);
INSERT INTO organizations (name, to_name) VALUES ('БРОМ', 'Дуд Д.');
INSERT INTO organizations (name, to_name) VALUES ('МЕЛЬБДОНИЙ', 'Врачу');
INSERT INTO organizations (name, to_name) VALUES ('НАТРИЙ', 'Натрию');
INSERT INTO organizations (name, to_name) VALUES ('КАЛИЙ', 'Калию Юлию');
INSERT INTO organizations (name, to_name) VALUES ('БЕРИЛИЙ', 'Берию');
INSERT INTO organizations (name, to_name) VALUES ('Молибден', 'Молбдену');

-- INSERT INTO provider_reviews (provider_id, user_id, review, rating) VALUES (1, 1, 'Замечательный поставщик, никогда не пересаливает!', 5);

INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'рис', 300, 45, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'картофельное пюре', 150, 24, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'чечевица с овощами', 180, 40, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'макароны с томатами пилати', 120, 30, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'стручковая фасоль с медом и морковью', 150, 40, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'гречка', 200, 38, 'описание гарнира: ну такое');

INSERT INTO users (login, password, balance, description, birthday, phone, org_id, role_id, key, ip, comp_key, ip_phone, from_text, telegram_id, created_at, updated_at)
    VALUES ('silakov', '123456', 100, '', MAKE_DATE(1980, 06, 12), '9108786556', 1, 1, '123', '192.168.17.11', 'ADASFS12', '229', 'Туду С. С.', '123456789', CURRENT_DATE, CURRENT_DATE);
INSERT INTO users (login, password, balance, description, birthday, phone, org_id, role_id, key, ip, comp_key, ip_phone, from_text, telegram_id, created_at, updated_at)
VALUES ('ivanov', '123456', 0, '', MAKE_DATE(1998, 04, 29), '9105144545', 2, 2, '123', '192.168.17.11', 'ADASFS12', '229', 'Туду С. С.', '123456789', CURRENT_DATE, CURRENT_DATE);
INSERT INTO users (login, password, balance, description, birthday, phone, org_id, role_id, key, ip, comp_key, ip_phone, from_text, telegram_id, created_at, updated_at)
VALUES ('petrov', '123456', 200, '', MAKE_DATE(1997, 02, 20), '9085623223', 3, 2, '123', '192.168.17.11', 'ADASFS12', '229', 'Туду С. С.', '123456789', CURRENT_DATE, CURRENT_DATE);
INSERT INTO users (login, password, balance, description, birthday, phone, org_id, role_id, key, ip, comp_key, ip_phone, from_text, telegram_id, created_at, updated_at)
VALUES ('sidorov', '123456', 500, '', MAKE_DATE(1996, 09, 29), '9105654854', 2, 2, '123', '192.168.17.11', 'ADASFS12', '229', 'Туду С. С.', '123456789', CURRENT_DATE, CURRENT_DATE);
INSERT INTO users (login, password, balance, description, birthday, phone, org_id, role_id, key, ip, comp_key, ip_phone, from_text, telegram_id, created_at, updated_at)
VALUES ('egoshin', '123456', -80, '', MAKE_DATE(1995, 12, 29), '9875642312', 3, 2, '123', '192.168.17.11', 'ADASFS12', '229', 'Туду С. С.', '123456789', CURRENT_DATE, CURRENT_DATE);