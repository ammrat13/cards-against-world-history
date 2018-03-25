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

	// The array of all the games we are playing
	public static HashMap<String,Game> games = new HashMap<String,Game>();

	public static void main(String[] args){
		try {
			// Listen on port 80 for HTTP connections (requires root)
			ServerSocket serv = new ServerSocket(80);

			// Do this as long as the program is running
			while(true){
				Socket conn = serv.accept();
				connCount = (connCount + 1) % 1000000;

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

			// Special files and handling

			// Create a game
			if(req.page.equals("/create_game.html")){
				String pin = String.format("%06d", connID);
				games.put(pin, new Game());
				out.print(pin);
			}

			// Join a game
			if(req.page.equals("/join_game.html")){
				if(games.get(req.params.get("pin")) != null){
					String pid = games.get(req.params.get("pin")).join();
					out.print(pid);
				} else {
					out.print("INVALID");
				}
			}

			// Leave a game
			if(req.page.equals("/leave_game.html")){
				if(games.get(req.params.get("pin")) != null){
					try {
						games.get(req.params.get("pin")).leave(req.params.get("pid"));
						out.print("DONE");
					} catch (NumberFormatException e){
						e.printStackTrace();
						out.print("FAIL");
					}
				} else {
					out.print("FAIL");
				}
			}

			// Get dealt
			if(req.page.equals("/get_dealt.html")){
				if(games.get(req.params.get("pin")) != null){
					String ret = "";
					for(String s : games.get(req.params.get("pin")).dealt)
						ret += s + "\n";

					if(ret.length() != 0)
						out.print(ret.substring(0, ret.length()-1));
					else
						out.print("DONE");
				} else {
					out.print("INVALID");
				}
			}

			// Get field
			if(req.page.equals("/get_field.html")){
				if(games.get(req.params.get("pin")) != null){
					String ret = "";
					for(Map.Entry<String,String> se : games.get(req.params.get("pin")).field)
						ret += se.getValue() + "\n";

					if(ret.length() != 0)
						out.print(ret.substring(0, ret.length()-1));
					else
						out.print("DONE");
				} else {
					out.print("INVALID");
				}
			}

			// Get hand
			if(req.page.equals("/get_hand.html")){
				if(games.get(req.params.get("pin")) != null){
					String ret = "";
					for(String s : games.get(req.params.get("pin")).playerHands.get(
					games.get(req.params.get("pin")).pids.indexOf(req.params.get("pid"))))
						ret += s + "\n";

					if(ret.length() != 0)
						out.print(ret.substring(0, ret.length()-1));
					else
						out.print("DONE");
				} else {
					out.print("INVALID");
				}
			}

			// Play a card
			if(req.page.equals("/play_card.html")){
				if(games.get(req.params.get("pin")) != null){
					games.get(req.params.get("pin")).play(req.params.get("pid"), URLDecoder.decode(req.params.get("card")));
					out.print("DONE");
				} else {
					out.print("FAIL");
				}
			}

			// Select a card
			if(req.page.equals("/select_card.html")){
				if(games.get(req.params.get("pin")) != null){
					games.get(req.params.get("pin")).select(URLDecoder.decode(req.params.get("card")));
					out.print("DONE");
				} else {
					out.print("FAIL");
				}
			}

			// Is card czar
			if(req.page.equals("/is_card_czar.html")){
				if(games.get(req.params.get("pin")) != null){
					out.print(games.get(req.params.get("pin")).cardCzar == games.get(req.params.get("pin")).pids.indexOf(req.params.get("pid")));
				} else {
					out.print("INVALID");
				}
			}

			// Get Score
			if(req.page.equals("/get_score.html")){
				if(games.get(req.params.get("pin")) != null){
					out.print(games.get(req.params.get("pin")).playerScores.get(games.get(req.params.get("pin")).pids.indexOf(req.params.get("pid"))));
				} else {
					out.print("INVALID");
				}
			}
		}

	}

}