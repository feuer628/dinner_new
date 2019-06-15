package com.cheremnov.service;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import com.cheremnov.bd.Connector;
import org.json.JSONException;
import org.json.JSONObject;

import java.sql.Connection;
import java.sql.SQLException;

@Path("/jsonbasedreverser")
public class JSONBasedReverser {


    @GET
    @Produces("application/json")
    public Response defaultReverser() throws JSONException {
        System.out.println("defaultReverser");
        StringBuilder sb = new StringBuilder();
        sb.append("ANKARA");

        try(Connection connection = Connector.getConnection()) {
            System.out.println("connection = " + connection);
        } catch (SQLException e) {
            e.printStackTrace();
        }

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("original", sb.toString());
        jsonObject.put("reversed", sb.reverse().toString());

        String result = "" + jsonObject;
        return Response.status(200).entity(result).build();
    }

    @Path("{word}")
    @GET
    @Produces("application/json")
    public Response reverser(@PathParam("word") String word) throws JSONException {

        StringBuilder sb = new StringBuilder();
        sb.append(word);

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("original", sb.toString());
        jsonObject.put("reversed", sb.reverse().toString());

        String result = "" + jsonObject;
        return Response.status(200).entity(result).build();
    }

}
