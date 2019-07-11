CREATE TABLE "roles" (
	"id" serial NOT NULL,
	"name" VARCHAR(300) NOT NULL,
	CONSTRAINT "roles_pk" PRIMARY KEY ("id")
) WITH (
    OIDS=FALSE
);

CREATE TABLE "actions" (
    "id" serial NOT NULL,
    "desc" VARCHAR(500) NOT NULL,
    CONSTRAINT "actions_pk" PRIMARY KEY ("id")
) WITH (
    OIDS=FALSE
);

CREATE TABLE "role_actions" (
    "id" serial NOT NULL,
    "role_id" serial NOT NULL,
    "action_id" serial NOT NULL ,
    CONSTRAINT "role_actions_pk" PRIMARY KEY ("id")
) WITH (
    OIDS=FALSE
);



/*
CREATE TABLE "menu" (
	"id" serial,
	"provider_id" integer NOT NULL,
	"menu_date" DATE NOT NULL,
	"type" VARCHAR(255) NOT NULL,
	"name" VARCHAR(255) NOT NULL,
	"weight" integer,
	"price" FLOAT(10) NOT NULL,
	"description" VARCHAR(1024),
	CONSTRAINT "menu_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "organizations" (
	"id" serial,
	"name" VARCHAR(300) NOT NULL,
	"to_name" VARCHAR(300),
	"group_id" integer NOT NULL,
	CONSTRAINT "organizations_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "orders" (
	"id" serial,
	"user_id" integer NOT NULL,
	"status" integer NOT NULL DEFAULT '1',
	"order_date" DATE NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	"updated_at" TIMESTAMP NOT NULL,
	CONSTRAINT "orders_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "users" (
	"id" serial NOT NULL,
	"login" VARCHAR(100) NOT NULL UNIQUE,
	"password" VARCHAR(255) NOT NULL,
	"balance" FLOAT NOT NULL,
	"description" VARCHAR(255) NOT NULL,
	"birthday" DATE NOT NULL,
	"phone" VARCHAR(10) NOT NULL,
	"org_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"status" integer NOT NULL,
	"key" VARCHAR(255),
	"ip" VARCHAR(255),
	"komp_key" VARCHAR(255),
	"ip_phone" VARCHAR(255),
	"from_text" VARCHAR(255),
	"telegram_id" integer,
	"created_at" TIMESTAMP,
	"updated_at" TIMESTAMP,
	CONSTRAINT "users_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "org_groups" (
	"id" serial NOT NULL,
	"limit_type" integer NOT NULL,
	"name" VARCHAR(300) NOT NULL,
	"oper_id" integer,
	"description" VARCHAR(255),
	CONSTRAINT "org_groups_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "providers" (
	"id" serial NOT NULL,
	"name" VARCHAR(300) NOT NULL,
	"emails" VARCHAR(255) NOT NULL,
	"description" VARCHAR(1024),
	CONSTRAINT "providers_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "order_items" (
	"id" serial NOT NULL,
	"order_id" integer NOT NULL,
	"name" VARCHAR(255) NOT NULL,
	"comment" VARCHAR(255),
	"count" integer NOT NULL,
	"price" FLOAT NOT NULL,
	"rating" integer,
	"review" VARCHAR(500),
	CONSTRAINT "order_items_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "provider_reviews" (
	"id" serial NOT NULL,
	"provider_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"review" VARCHAR(255) NOT NULL,
	"rating" integer NOT NULL,
	CONSTRAINT "provider_reviews_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "balance_history" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"amount" FLOAT NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	"order_id" integer,
	CONSTRAINT "balance_history_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "system_properties" (
	"name" VARCHAR(100) NOT NULL,
	"value" VARCHAR(1024),
	CONSTRAINT "system_properties_pk" PRIMARY KEY ("name")
) WITH (
  OIDS=FALSE
);



ALTER TABLE "menu" ADD CONSTRAINT "menu_fk0" FOREIGN KEY ("provider_id") REFERENCES "providers"("id");

ALTER TABLE "organizations" ADD CONSTRAINT "organizations_fk0" FOREIGN KEY ("group_id") REFERENCES "org_groups"("id");

ALTER TABLE "orders" ADD CONSTRAINT "orders_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "users" ADD CONSTRAINT "users_fk0" FOREIGN KEY ("org_id") REFERENCES "organizations"("id");
ALTER TABLE "users" ADD CONSTRAINT "users_fk1" FOREIGN KEY ("role_id") REFERENCES "roles"("id");

ALTER TABLE "org_groups" ADD CONSTRAINT "org_groups_fk0" FOREIGN KEY ("oper_id") REFERENCES "users"("id");



ALTER TABLE "order_items" ADD CONSTRAINT "order_items_fk0" FOREIGN KEY ("order_id") REFERENCES "orders"("id");

ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_fk0" FOREIGN KEY ("provider_id") REFERENCES "providers"("id");
ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_fk1" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_fk1" FOREIGN KEY ("order_id") REFERENCES "orders"("id");
*/

/*
 Проливка начальных данных!
 */

INSERT INTO "public"."roles" ("id", "name") VALUES (1, 'администратор');
INSERT INTO "public"."roles" ("id", "name") VALUES (2, 'оператор');
INSERT INTO "public"."roles" ("id", "name") VALUES (3, 'пользователь');
INSERT INTO "public"."roles" ("id", "name") VALUES (4, 'поставщик');

INSERT INTO "public"."actions" ("id", "desc") VALUES (1, 'Возможность администрирования системы');
INSERT INTO "public"."actions" ("id", "desc") VALUES (2, 'Возможность добавлять обед за другого сотрудника');
INSERT INTO "public"."actions" ("id", "desc") VALUES (3, 'Возможность подтверждения регистрации сотрудника');
INSERT INTO "public"."actions" ("id", "desc") VALUES (4, 'Возможность заказывать обед');
