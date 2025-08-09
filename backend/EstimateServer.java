// EstimateServer.java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;

public class EstimateServer {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/estimate", new EstimateHandler());  // 👈 VERY IMPORTANT
        server.setExecutor(null); // creates a default executor
        server.start();
        System.out.println(" Running http://localhost:8080/estimate");
    }
}
