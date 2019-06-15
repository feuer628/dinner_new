package com.cheremnov.bd;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;

public class Connector {

    /**
     * Получение соединения с БД.
     * НЕОБХОДИМО ЗАКРЫВАТЬ ПОСЛЕ ИСПОЛЬЗОВАНИЯ!!!
     * @return соединение с БД
     */
    public static Connection getConnection() {
        String jsonConnections;
        try {
            List<String> strings = Files.readAllLines(new File(
                    System.getProperty("catalina.home") + "/conf/connection.json").toPath());
            jsonConnections = String.join("", strings);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка загрузки файла 'connection.json'", e);
        }
        try {
            JSONObject jsonObject = new JSONObject(jsonConnections);

            String host = jsonObject.getString("host");
            String username = jsonObject.getString("username");
            String password = jsonObject.getString("password");
            String driver = jsonObject.getString("driver");

            try {
                Class.forName(driver);
            } catch (ClassNotFoundException e) {
                throw new RuntimeException("Ошибка загрузки драйвера", e);
            }
            Connection connection;
            try {
                connection = DriverManager.getConnection(host, username, password);
                return connection;
            } catch (SQLException e) {
                throw new RuntimeException("Ошибка при подключении к БД" + e.toString());
            }
        } catch (JSONException e) {
            throw new RuntimeException("Ошибка при чтении файла 'connection.json'", e);
        }
    }
}
