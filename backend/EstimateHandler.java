// EstimateHandler.java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class EstimateHandler implements HttpHandler {
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();

        // Basic CORS support (including preflight)
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(204, -1); // No Content for preflight
            return;
        }

        if (!"POST".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(405, -1); // Method Not Allowed
            return;
        }

        // Read JSON body
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
        }

        try {
            Estimate input = gson.fromJson(sb.toString(), Estimate.class);
            if (input == null) {
                sendJson(exchange, 400, error("Invalid JSON body."));
                return;
            }

            // Simple calculation logic
            int price =
                    parseIntSafe(input.bedroom) * 10_000_000 +
                    parseIntSafe(input.bathroom) * 5_000_000 +
                    parseIntSafe(input.toilet) * 3_000_000 +
                    parseIntSafe(input.parkingSpace) * 2_000_000;

            String address = (input.town == null ? "" : input.town) + (input.state == null ? "" : (input.town == null || input.town.isEmpty() ? "" : ", ") + input.state);
            String description = "A " + nv(input.bedroom) + "-bedroom, " + nv(input.bathroom) + "-bathroom " +
                    nv(input.type) + " located in " + (address.isEmpty() ? "N/A" : address) +
                    ", suitable for " + nv(input.usage).toLowerCase() + " use.";

            Map<String, Object> resp = new HashMap<>();
            resp.put("type", nv(input.type));
            resp.put("state", nv(input.state));
            resp.put("town", nv(input.town));
            resp.put("address", address.isEmpty() ? "N/A" : address);
            resp.put("price", price);
            resp.put("description", description);

            sendJson(exchange, 200, resp);
        } catch (Exception ex) {
            sendJson(exchange, 500, error("Server error: " + ex.getMessage()));
        }
    }

    private int parseIntSafe(String s) {
        try {
            return Integer.parseInt(s);
        } catch (Exception e) {
            return 0;
        }
    }

    private String nv(String s) {
        return s == null ? "0" : s;
    }

    private void sendJson(HttpExchange exchange, int status, Object payload) throws IOException {
        String json = gson.toJson(payload);
        byte[] out = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, out.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(out);
        }
    }

    private Map<String, Object> error(String msg) {
        Map<String, Object> m = new HashMap<>();
        m.put("error", msg);
        return m;
    }
}
