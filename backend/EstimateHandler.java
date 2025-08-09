// EstimateHandler.java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.google.gson.Gson;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class EstimateHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {

            // Read request body
            InputStreamReader reader = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8);
            BufferedReader br = new BufferedReader(reader);
            StringBuilder jsonInput = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                jsonInput.append(line);
            }

            // Convert JSON to Estimate object
            Gson gson = new Gson();
            Estimate input = gson.fromJson(jsonInput.toString(), Estimate.class);

            // Ensure state and town never return "null"
            String state = (input.state != null) ? input.state : "";
            String town = (input.town != null) ? input.town : "";
            String address = town + (town.isEmpty() || state.isEmpty() ? "" : ", ") + state;

            // Price calculation
            int price = (Integer.parseInt(input.bedroom) * 10000000)
                      + (Integer.parseInt(input.bathroom) * 5000000)
                      + (Integer.parseInt(input.toilet) * 3000000)
                      + (Integer.parseInt(input.parkingSpace) * 2000000);

            String description = "A " + input.bedroom + "-bedroom, " + input.bathroom + "-bathroom "
                    + input.type + " located in " + address + ", suitable for " + input.usage.toLowerCase() + " use.";

            // JSON response with state and town included
            String response = "{"
                    + "\"type\":\"" + input.type + "\","
                    + "\"state\":\"" + state + "\","
                    + "\"town\":\"" + town + "\","
                    + "\"address\":\"" + address + "\","
                    + "\"price\":" + price + ","
                    + "\"description\":\"" + description + "\""
                    + "}";

            // Send response
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*"); // Allow CORS
            exchange.sendResponseHeaders(200, response.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();

        } else {
            exchange.sendResponseHeaders(405, -1); // Method Not Allowed
        }
    }
}
