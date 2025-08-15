// EstimateServer.java
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;

public class EstimateServer {
    public static void main(String[] args) throws IOException {
        // Use Render's PORT env var, fallback to 8080 locally
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/estimate", new EstimateHandler());
        server.setExecutor(null);
        System.out.println("Server running on port " + port + " at /estimate");
        server.start();
    }
}
