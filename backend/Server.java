import java.io.*;
import java.net.*;
import java.util.*;

public class Server {

	// The path to all the frontend files
	public final static String FRONTENDPATH = "../frontend";

	// The array of all the pure files
	public final static String[] files = {
		"/index.html",
		"/game.html",
		"/js/index.js",
		"/js/game.js",
		"/css/style.css"
	};

	// How many connections we have had
	public static int connCount = 0;

	public static void main(String[] args){
		try {
			// Listen on port 80 for HTTP connections (requires root)
			ServerSocket serv = new ServerSocket(80);

			// Do this as long as the program is running
			while(true){
				Socket conn = serv.accept();
				connCount++;

				System.out.println("Connected to " + conn.getRemoteSocketAddress());
				System.out.println("Connection ID: " + connCount);

				new Thread(new ConnectionHandler(connCount, conn)).start();
			}
		} catch (IOException e){
			e.printStackTrace();
		}
	}

	public static class ConnectionHandler implements Runnable {

		public int connID = -1;
		public Socket conn = null;
		public BufferedReader in = null;
		public PrintWriter out = null;

		public ConnectionHandler(int connID, Socket conn){
			try {
				this.connID = connID;
				this.conn = conn;
				in = new BufferedReader(new InputStreamReader(this.conn.getInputStream()));
				out = new PrintWriter(new OutputStreamWriter(this.conn.getOutputStream()));
			} catch (IOException e){
				e.printStackTrace();
			}
		}

		@Override
		public void run(){
			try {
				// We only need the first line without the GET or the HTTP/1.1
				Request req = new Request(in.readLine().split(" ")[1]);
				System.out.println(req);
				handleRequest(req);
				out.flush();

				System.out.println("Closing connection to " + conn.getRemoteSocketAddress());
				conn.close();
			} catch (IOException e){
				e.printStackTrace();
			}
		}

		public void handleRequest(Request req){
			// Check if it is a file being requested
			for(String s : files){
				if(s.equals(req.page)){
					try {
						Scanner file = new Scanner(new File(FRONTENDPATH + s));
						String ret = "";
						while(file.hasNextLine())
							ret += file.nextLine() + "\n";
						out.println(ret);
					} catch (IOException e){
						e.printStackTrace();
					}
				}
			}
		}

	}

}