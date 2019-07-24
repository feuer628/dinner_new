INSERT INTO providers (name, emails, url) VALUES ('Вкусная почта', 'asdasdw@mail.ru', 'http://obedi.ru');
INSERT INTO providers (name, emails, url) VALUES ('Просто еда', 'eda@mail.ru', 'http://obedi22.ru');
INSERT INTO providers (name, emails, url) VALUES ('Еда для гопников', 'zhrachka@mail.ru', 'http://obedi354.ru');
INSERT INTO providers (name, emails, description, url) VALUES ('Инкогнито', 'pohlebka@mail.ru', '', 'http://obed6574i.ru');
INSERT INTO providers (name, emails, description, url) VALUES ('Супы домашние', 'soup@mail.ru', '', 'http://ob7452edi.ru');

INSERT INTO org_groups (limit_type, name, description) VALUES (0, 'Первая группа', 'Описание первой группы');
INSERT INTO org_groups (limit_type, compensation_flag, "limit", hard_limit, name) VALUES (1, true, 200, 1000, 'СС');
INSERT INTO org_groups (limit_type, compensation_flag, "limit", hard_limit, name, provider_id) VALUES (1, false, 200, 300, 'Финализированная группос', 1);
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

-- Добавление отзывов о блюдах
INSERT INTO menu_item_reviews (provider_id, user_id, menu_item_name, review, rating) VALUES (1, 1, 'картофельное пюре', 'норм', 5);
INSERT INTO menu_item_reviews (provider_id, user_id, menu_item_name, review, rating) VALUES (1, 1, 'Булочка Дуэт', 'норм Булочка Дуэт', 7);
INSERT INTO menu_item_reviews (provider_id, user_id, menu_item_name, review, rating) VALUES (1, 1, 'Сдоба с вишней', 'норм Сдоба с вишней', 8);
INSERT INTO menu_item_reviews (provider_id, user_id, menu_item_name, review, rating) VALUES (1, 1, 'Сухари ржаные', 'Ну ваще сухарики', 9);
INSERT INTO menu_item_reviews (provider_id, user_id, menu_item_name, review, rating) VALUES (1, 1, 'Флан творож/вишня', 'Какаято хрень', 3);
INSERT INTO menu_item_reviews (provider_id, user_id, menu_item_name, review, rating) VALUES (1, 1, 'Улитка курица /грибы', 'Это блюдо показалось мне очень даже вкусным. Посмотрев на него я понял что это верх совершенства кулинарного исскуства... Нужно брать. Советую всем', 10);
INSERT INTO menu_item_reviews (provider_id, user_id, menu_item_name, review, rating) VALUES (1, 1, 'Яблочное Чудо', 'ну хз', 5);
INSERT INTO menu_item_reviews (provider_id, user_id, menu_item_name, review, rating) VALUES (1, 1, 'Язычок слоёный', 'таксебе', 5);
INSERT INTO menu_item_reviews (provider_id, user_id, menu_item_name, review, rating) VALUES (1, 1, 'вода аква минерале', 'водица, так не годиться', 1);
INSERT INTO menu_item_reviews (provider_id, user_id, menu_item_name, review, rating) VALUES (1, 1, 'пепси, миринда, сэвен ап', 'норм', 5);

-- INSERT INTO provider_reviews (provider_id, user_id, review, rating) VALUES (1, 1, 'Замечательный поставщик, никогда не пересаливает!', 5);

INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'рис', '150 гр', 45, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'картофельное пюре', '150 гр', 24, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'тушеное', 'чечевица с овощами', '150 гр', 40, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'тушеное', 'макароны с томатами пилати', '150 гр', 30, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'тушеное', 'стручковая фасоль с медом и морковью', '150 гр', 40, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'гречка', '200 гр', 38, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE, 'гарниры', 'перловара', '200 гр', 38, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '1 day', 'гарниры', 'пюре', '200 гр', 38, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '1 day', 'гарниры', 'печень', '200 гр', 21, 'описание такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '1 day', 'фитнесс', 'печенька', '200 гр', 90, 'описание: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '1 day', 'гарниры', 'фасоль', '200 гр', 8, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '1 day', 'гарниры', 'перловара', '200 гр', 67, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'комильфо', 'перловара', '200 гр', 32, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'комильфо', 'перловара1', '200 гр', 65, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'комильфо', 'перловара2', '200 гр', 98, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'гарниры', 'перловара3', '200 гр', 15, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'фитнесс', 'перловара4', '200 гр', 238, 'описание гарнира: ну такое');
INSERT INTO menu_items (provider_id, menu_date, type, name, weight, price, description) VALUES (1, CURRENT_DATE + INTERVAL '2 days', 'фитнесс', 'перловара5', '200 гр', 138, 'описание гарнира: ну такое');
