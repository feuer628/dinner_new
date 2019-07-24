DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE "roles" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(300) NOT NULL
) WITH (OIDS=FALSE);

CREATE TABLE "actions" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "desc" VARCHAR(500) NOT NULL
) WITH (OIDS=FALSE);

CREATE TABLE "role_actions" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "role_id" SERIAL NOT NULL,
    "action_id" SERIAL NOT NULL
) WITH (OIDS=FALSE);

CREATE TABLE "system_properties" (
	"name" VARCHAR(100) NOT NULL PRIMARY KEY,
	"value" VARCHAR(1024) NULL
) WITH (OIDS=FALSE);

CREATE TABLE "providers" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(300) NOT NULL,
	"emails" VARCHAR(255) NOT NULL,
	"description" VARCHAR(1024) NULL,
	"url" VARCHAR(255) NULL,
	"logo" VARCHAR(255) NULL
) WITH (OIDS=FALSE);

CREATE TABLE "org_groups" (
	"id" SERIAL NOT NULL PRIMARY KEY,
    "limit_type" SMALLINT NOT NULL,
	"compensation_flag" BOOLEAN DEFAULT FALSE,
	"limit" INTEGER DEFAULT 0,
	"hard_limit" INTEGER DEFAULT 0,
	"name" VARCHAR(300) NOT NULL,
	"description" VARCHAR(255),
	"provider_id" INTEGER NULL
) WITH (OIDS=FALSE);

CREATE TABLE "organizations" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(300) NOT NULL,
	"to_name" VARCHAR(300),
	"group_id" INTEGER NULL
) WITH (OIDS=FALSE);

CREATE TABLE "provider_reviews" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"provider_id" INTEGER NOT NULL,
	"user_id" INTEGER NOT NULL,
	"review" VARCHAR(255) NOT NULL,
	"rating" INTEGER NOT NULL
) WITH (OIDS=FALSE);

CREATE TABLE "users" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"login" VARCHAR(100) NOT NULL UNIQUE,
	"password" VARCHAR(255) NOT NULL,
	"balance" FLOAT DEFAULT 0,
	"description" VARCHAR(255),
	"birthday" DATE,
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
	"created_at" TIMESTAMP DEFAULT CURRENT_DATE,
	"updated_at" TIMESTAMP DEFAULT CURRENT_DATE
) WITH (OIDS=FALSE);

CREATE TABLE "menu_items" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"provider_id" INTEGER NOT NULL,
	"menu_date" DATE,
	"type" VARCHAR(255) NOT NULL,
	"name" VARCHAR(255) NOT NULL,
    "weight" VARCHAR(100),
	"price" FLOAT(10),
	"description" VARCHAR(1024)
) WITH (OIDS=FALSE);

CREATE TABLE "orders" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"user_id" INTEGER NOT NULL,
	"status" INTEGER NOT NULL DEFAULT 1,
	"order_date" DATE NOT NULL,
	"created_at" TIMESTAMP DEFAULT CURRENT_DATE,
	"updated_at" TIMESTAMP DEFAULT CURRENT_DATE,
    UNIQUE (user_id, order_date)
) WITH (OIDS=FALSE);

CREATE TABLE "order_items" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"order_id" INTEGER NOT NULL,
	"name" VARCHAR(255) NOT NULL,
	"comment" VARCHAR(255),
	"count" INTEGER NOT NULL,
	"price" FLOAT(10) NOT NULL,
	"rating" INTEGER,
	"review" VARCHAR(500)
) WITH (OIDS=FALSE);

CREATE TABLE "balance_history" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"user_id" INTEGER NOT NULL,
	"amount" FLOAT(10) NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	"order_id" INTEGER
) WITH (OIDS=FALSE);

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

INSERT INTO "public"."roles" ("name")VALUES ('администраторы');
INSERT INTO "public"."roles" ("name")VALUES ('модераторы');
INSERT INTO "public"."roles" ("name")VALUES ('операторы');
INSERT INTO "public"."roles" ("name")VALUES ('пользователи');
INSERT INTO "public"."roles" ("name")VALUES ('поставщики');

INSERT INTO "public"."actions" ("desc")VALUES ('Возможность администрирования системы');
INSERT INTO "public"."actions" ("desc")VALUES ('Возможность добавлять обед за другого сотрудника');
INSERT INTO "public"."actions" ("desc")VALUES ('Возможность добавлять организацию');
INSERT INTO "public"."actions" ("desc")VALUES ('Возможность управления группой организаций');
INSERT INTO "public"."actions" ("desc")VALUES ('Возможность подтверждать регистрацию любых пользователей');
INSERT INTO "public"."actions" ("desc")VALUES ('Возможность подтверждать регистрацию пользователей своей организации');
INSERT INTO "public"."actions" ("desc")VALUES ('Возможность настраивать права доступа для сотрудников своей организации');

INSERT INTO "public".role_actions ("role_id", "action_id")VALUES (1, 1);
INSERT INTO "public".role_actions ("role_id", "action_id")VALUES (1, 2);
INSERT INTO "public".role_actions ("role_id", "action_id")VALUES (1, 3);
INSERT INTO "public".role_actions ("role_id", "action_id") VALUES (1, 4);
INSERT INTO "public".role_actions ("role_id", "action_id") VALUES (1, 5);
INSERT INTO "public".role_actions ("role_id", "action_id") VALUES (1, 6);
INSERT INTO "public".role_actions ("role_id", "action_id") VALUES (1, 7);
INSERT INTO "public".role_actions ("role_id", "action_id") VALUES (2, 5);
INSERT INTO "public".role_actions ("role_id", "action_id") VALUES (2, 6);
INSERT INTO "public".role_actions ("role_id", "action_id") VALUES (2, 7);
INSERT INTO "public".role_actions ("role_id", "action_id") VALUES (3, 2);
INSERT INTO "public".role_actions ("role_id", "action_id")VALUES (3, 6);

INSERT INTO providers (name, emails, url) VALUES ('Вкусная почта', 'asdasdw@mail.ru', 'http://obedi.ru');
INSERT INTO providers (name, emails, url) VALUES ('Просто еда', 'eda@mail.ru', 'http://obedi22.ru');
INSERT INTO providers (name, emails, url) VALUES ('Еда для гопников', 'zhrachka@mail.ru', 'http://obedi354.ru');
INSERT INTO providers (name, emails, description, url) VALUES ('Инкогнито', 'pohlebka@mail.ru', '', 'http://obed6574i.ru');
INSERT INTO providers (name, emails, description, url) VALUES ('Супы домашние', 'soup@mail.ru', '', 'http://ob7452edi.ru');

INSERT INTO org_groups (limit_type, name, description) VALUES (0, 'Первая группа', 'Описание первой группы');
INSERT INTO org_groups (limit_type, compensation_flag, "limit", hard_limit, name) VALUES (1, true, 200, 1000, 'СС');
INSERT INTO org_groups (limit_type, compensation_flag, "limit", hard_limit, name, provider_id) VALUES (1, false, 200, 300, 'Финализированная группос', 2);
INSERT INTO org_groups (limit_type, compensation_flag, "limit", hard_limit, name, description) VALUES (1, true, 220, 0, 'ЖЖшечка', 'Акробат');
INSERT INTO org_groups (limit_type, compensation_flag, "limit", hard_limit, name, description, provider_id) VALUES (1, true, 1000, 0, 'Адобе', 'Фтошоп', 1);

INSERT INTO organizations (name, to_name, group_id) VALUES ('ФТОР', 'Судейкису С.', 1);
INSERT INTO organizations (name, to_name, group_id) VALUES ('ХРОМ', 'Муд А.', 2);
INSERT INTO organizations (name, to_name, group_id) VALUES ('СЕЛЕН', 'Гуд М.', 2);
INSERT INTO organizations (name, to_name) VALUES ('БРОМ', 'Дуд Д.');
INSERT INTO organizations (name, to_name) VALUES ('МЕЛЬБДОНИЙ', 'Врачу');
INSERT INTO organizations (name, to_name) VALUES ('НАТРИЙ', 'Натрию');
INSERT INTO organizations (name, to_name) VALUES ('КАЛИЙ', 'Калию Юлию');
INSERT INTO organizations (name, to_name, group_id) VALUES ('ВАЛЕРА!', 'Достану Валеру!', 3);
INSERT INTO organizations (name, to_name) VALUES ('Молибден', 'Молбдену');

-- INSERT INTO provider_reviews (provider_id, user_id, review, rating) VALUES (1, 1, 'Замечательный поставщик, никогда не пересаливает!', 5);

-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'рис', '150 гр', 45, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'картофельное пюре', '150 гр', 24, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'тушеное', 'чечевица с овощами', '150 гр', 40, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'тушеное', 'макароны с томатами пилати', '150 гр', 30, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'тушеное', 'стручковая фасоль с медом и морковью', '150 гр', 40, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'гречка', '200 гр', 38, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'перловара', '200 гр', 38, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '1 day', 'гарниры', 'пюре', '200 гр', 38, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '1 day', 'гарниры', 'печень', '200 гр', 21, 'описание такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '1 day', 'фитнесс', 'печенька', '200 гр', 90, 'описание: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '1 day', 'гарниры', 'фасоль', '200 гр', 8, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '1 day', 'гарниры', 'перловара', '200 гр', 67, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'комильфо', 'перловара', '200 гр', 32, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'комильфо', 'перловара1', '200 гр', 65, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'комильфо', 'перловара2', '200 гр', 98, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'гарниры', 'перловара3', '200 гр', 15, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'фитнесс', 'перловара4', '200 гр', 238, 'описание гарнира: ну такое');
-- INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'фитнесс', 'перловара5', '200 гр', 138, 'описание гарнира: ну такое');

INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'беляши 1/75', 'шт', 42);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Булочка Дуэт', 'кг', 22);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Булочка Забава1/50', 'шт', 19);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Булочка крем/ваниль 1/65', 'шт', 19);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Булочка Невская', 'шт', 28);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Булочка Прима вера', 'шт', 27);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Булочка с корицей', 'шт', 22);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Булочка с черносливом', 'шт', 19);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Ватрушка сдобная творожная', 'шт', 25);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Гамбургер', 'шт', 62);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Гамбургер с ветчиной1/80 ', 'шт', 47);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Кекс Малышок', 'шт', 17);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Кекс морковный 1/75', 'порц', 20);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Кекс Пионер', 'шт', 23);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Кольцо песочное', 'шт', 22);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Корзиночка Вкус детства 1/70', 'шт', 30);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Котлета в тесте1/90', 'шт', 33);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Круассан с вишней', 'шт', 20);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Круассан с кремом', 'шт', 20);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Лепёшка вост/гриб. 1/200гр.', 'шт', 52);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Любава с изюмом', 'шт', 26);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Любава с маком', 'шт', 26);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Мафины с ягодами', 'шт', 21);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Меренги1/100', 'шт', 34);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Мини сэндвич с бужениной', 'порц', 42);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Печенье "Домашнее" 1/150', 'шт', 37);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Печенье мраморное 1/150', 'шт', 56);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Печенье тающий снег 1/150', 'шт', 52);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Печенье Фитнес', 'шт', 37);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Печенье цукатное 1/150', 'шт', 47);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожное "Трюфель" 1/140', 'шт', 62);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожное "Ягодный десерт" 1/140', 'шт', 62);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожное Воздушное1/50', 'шт', 25);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожное Медовое 1/100', 'шт', 37);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожное Наполеон1/100', 'шт', 37);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожное Новинка', 'шт', 21);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожное Школьное', 'шт', 29);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожок грибы/карт1/70', 'шт', 19);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожок курага/хурма70г', 'шт', 19);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожок рис/яйцо 1/70', 'шт', 19);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожок с капустой 1/70 ', 'шт', 19);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожок с курагой1/70', 'шт', 19);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожок с мясом1/70', 'шт', 32);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожок с печенью1/70', 'шт', 22);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожок с повидлом1/70', 'шт', 19);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожок с яблоком1/70', 'шт', 19);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пирожок слоеный с повидлом 1/50', 'порц', 32);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Пицца докторская ', 'порц', 73);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Плюшка Московская', 'шт', 21);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Рогалик с творогом1/70', 'шт', 22);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Ромовая баба', 'шт', 30);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Рулет грушевый 1/80', 'шт', 23);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Рулет с джемом', 'шт', 47);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Рулет с марципаном', 'шт', 23);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Рулетик Мираж', 'кг', 22);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Рулетик сахарный 1/50', 'шт', 17);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Сдоба с вишней', 'шт', 23);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Сладушка с клубникой 1/85', 'шт', 26);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Слойка Бантик1/40', 'шт', 15);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Слойка вет/сыр', 'шт', 32);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Слойка с курицей', 'шт', 27);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Слойка с сыром', 'шт', 25);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Слойка со сгущенкой 1/70', 'шт', 20);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Сосиска аппетитная', 'порц', 44);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Сосиска в тесте', 'шт', 38);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Сочник', 'шт', 30);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Сухари ржаные1/100', 'шт', 25);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Сухари сдобные1/100', 'шт', 14);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Сэндвич с ветчиной 1/120', 'порц', 52);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Сэндвич с курицей 1/120', 'порц', 52);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Сэндвич с семгой 1/120', 'порц', 72);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Тесто дрожжевое 1кг', 'кг', 72);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'торт "Два шоколада" 1/130', 'шт', 87);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Трюфель со сливками ', 'шт', 42);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Улитка курица /грибы', 'кг', 29);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Флан творож/вишня 1/140', 'шт', 47);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Эклер с заварным кремом', 'шт', 22);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Яблочное Чудо1/150', 'шт', 37);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'выпечка', 'Язычок слоёный', 'шт', 16);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'напитки', 'сок Фруктовый сад 0,2 (мультифрукт, апельсиновый, томатный)', '200 мл', 28);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'напитки', 'сок "Плодовое" 0,2 (яблоко-виноград, грушевый, яблочный, Апельсиновый, персиковый, мультифрукт) ', '200 мл', 20);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'напитки', 'вода аква минерале 0,6 газ, б/газ', '600 мл', 50);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'напитки', 'пепси, миринда, сэвен ап 0,5', '500 мл', 58);
INSERT INTO menu_items (provider_id, type, name, weight, price) VALUES(1, 'напитки', 'пепси, миринда, сэвен ап 0,33', '330 мл', 40);


INSERT INTO users (login, password, status, balance, description, birthday, phone, org_id, role_id, key, ip, comp_key, ip_phone, from_text, telegram_id)
    VALUES ('silakov', '$2a$08$Rfr.D6DWJF4yo.Haf8zdxOtimkBojAMslHkyxsJKRnkCY.u5a2DI6', 1, 100, '', MAKE_DATE(1980, 06, 12), '9108786556', 8, 1, '123', '192.168.17.11', 'ADASFS12', '229', 'Туду С. С.', '123456789');
INSERT INTO users (login, password, balance, description, birthday, phone, org_id, role_id, key, ip, comp_key, ip_phone, from_text, telegram_id)
VALUES ('ivanov', '$2a$08$Rfr.D6DWJF4yo.Haf8zdxOtimkBojAMslHkyxsJKRnkCY.u5a2DI6', 0, '', MAKE_DATE(1998, 04, 29), '9105144545', 2, 2, '123', '192.168.17.11', 'ADASFS12', '229', 'Туду С. С.', '123456789');
INSERT INTO users (login, password, balance, description, birthday, phone, org_id, role_id, key, ip, comp_key, ip_phone, from_text, telegram_id)
VALUES ('petrov', '$2a$08$Rfr.D6DWJF4yo.Haf8zdxOtimkBojAMslHkyxsJKRnkCY.u5a2DI6', 200, '', MAKE_DATE(1997, 02, 20), '9085623223', 3, 2, '123', '192.168.17.11', 'ADASFS12', '229', 'Туду С. С.', '123456789');
INSERT INTO users (login, password, balance, description, birthday, phone, org_id, role_id, key, ip, comp_key, ip_phone, from_text, telegram_id)
VALUES ('sidorov', '$2a$08$Rfr.D6DWJF4yo.Haf8zdxOtimkBojAMslHkyxsJKRnkCY.u5a2DI6', 500, '', MAKE_DATE(1996, 09, 29), '9105654854', 2, 2, '123', '192.168.17.11', 'ADASFS12', '229', 'Туду С. С.', '123456789');
INSERT INTO users (login, password, balance, description, birthday, phone, org_id, role_id, key, ip, comp_key, ip_phone, from_text, telegram_id)
VALUES ('egoshin', '$2a$08$Rfr.D6DWJF4yo.Haf8zdxOtimkBojAMslHkyxsJKRnkCY.u5a2DI6', -80, '', MAKE_DATE(1995, 12, 29), '9875642312', 3, 2, '123', '192.168.17.11', 'ADASFS12', '229', 'Туду С. С.', '123456789');