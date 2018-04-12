import java.io.*;
import java.net.*;
import java.util.*;
import javax.imageio.*;

public class Server {

	// The port we will listen on (<1024 requires root)
	public final static int PORT = 80;

	// The path to all the frontend files
	public final static String FRONTENDPATH = "../frontend";

	// The array of all the pure files
	public final static String[] files = {
		"/robots.txt",
		"/index.html",
		"/game.html",
		"/js/index.js",
		"/js/game.js",
		"/css/style.css"
	};
	// The array of all the image files
	public final static String[] imageFiles = {
		"/favicon.png"
	};
	// The array of all special files
	public final static String[] specFiles = {
		"/create_game.txt",
		"/join_game.txt",
		"/leave_game.txt",
		"/get_dealt.txt",
		"/get_field.txt",
		"/get_hand.txt",
		"/play_card.txt",
		"/select_card.txt",
		"/get_card_czar.txt",
		"/get_score.txt",
		"/get_leaderboard.txt"
	};

	// How many games we have had
	public static int gameCount = 0;

	// The array of all the games we are playing
	public static HashMap<String,Game> games = new HashMap<String,Game>();

	public static void main(String[] args){
		try {
			ServerSocket serv = new ServerSocket(PORT);

			// Do this as long as the program is running
			while(true){
				Socket conn = serv.accept();

				System.out.println("Connected to " + conn.getRemoteSocketAddress());

				new Thread(new ConnectionHandler(conn)).start();
			}
		} catch (IOException e){
			e.printStackTrace();
		}
	}

	public static class ConnectionHandler implements Runnable {

		public Socket conn = null;
		public BufferedReader in = null;
		public PrintWriter out = null;

		public ConnectionHandler(Socket conn){
			try {
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
				Thread.sleep(50);
				handleRequest(req);
				out.flush();
				
				conn.close();
				System.out.println("Closed connection to " + conn.getRemoteSocketAddress());
			} catch (IOException e){
				e.printStackTrace();
			}
		}

		public String genPin(){
			return String.format("%06d", (int) (1000000*Math.random()));
		}

		public void handleRequest(Request req){

			// Headers
			if(	Arrays.asList(files).contains(req.page)
			||	Arrays.asList(imageFiles).contains(req.page)
			||	Arrays.asList(specFiles).contains(req.page)){
				out.println("HTTP/1.1 200 OK");
				out.println("Connection: close");
				out.println("Cache-Control: no-cache, no-store");

				// MIME Type
				if(Arrays.asList(files).contains(req.page)){
					if(req.page.endsWith(".html"))
						out.println("Content-Type: text/html");
					if(req.page.endsWith(".css"))
						out.println("Content-Type: text/css");
					if(req.page.endsWith(".js"))
						out.println("Content-Type: text/javascript");
					if(req.page.endsWith(".txt"))
						out.println("Content-Type: text/plain");
				} else if(Arrays.asList(imageFiles).contains(req.page)){
					out.println("Content-Type: image/png");
				} else if(Arrays.asList(specFiles).contains(req.page)){
					out.println("Content-Type: text/plain");
				}
				out.println();
			} else {
				out.println("HTTP/1.1 404 Not Found");
				out.println();
				return;
			}
			// So that images work properly
			out.flush();

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

			// Check if it is an image file being requested
			for(String s : imageFiles){
				if(s.equals(req.page)){
					try {
						ImageIO.write(ImageIO.read(new File(FRONTENDPATH + s)), "PNG", conn.getOutputStream());
					} catch (IOException e){
						e.printStackTrace();
					}
				}
			}

			// Special files and handling

			// Create a game
			if(req.page.equals("/create_game.txt")){
				String pin = genPin();
				while(games.containsKey(pin))
					pin = genPin();
				games.put(pin, new Game());
				out.print(pin);
			}

			// Join a game
			if(req.page.equals("/join_game.txt")){
				if(games.get(req.params.get("pin")) != null){
					String pid = games.get(req.params.get("pin")).join(req.params.get("pid"));
					if(pid != null)
						out.print(pid);
					else
						out.print("INVALID");
				} else {
					out.print("INVALID");
				}
			}

			// Leave a game
			if(req.page.equals("/leave_game.txt")){
				if(games.get(req.params.get("pin")) != null){
					try {
						games.get(req.params.get("pin")).leave(req.params.get("pid"));
						if(games.get(req.params.get("pin")).playerScores.size() == 0)
							games.remove(req.params.get("pin"));
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
			if(req.page.equals("/get_dealt.txt")){
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
			if(req.page.equals("/get_field.txt")){
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
			if(req.page.equals("/get_hand.txt")){
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
			if(req.page.equals("/play_card.txt")){
				if(games.get(req.params.get("pin")) != null){
					games.get(req.params.get("pin")).play(req.params.get("pid"), req.params.get("card"));
					out.print("DONE");
				} else {
					out.print("FAIL");
				}
			}

			// Select a card
			if(req.page.equals("/select_card.txt")){
				if(games.get(req.params.get("pin")) != null){
					games.get(req.params.get("pin")).select(req.params.get("card"));
					out.print("DONE");
				} else {
					out.print("FAIL");
				}
			}

			// Is card czar
			if(req.page.equals("/get_card_czar.txt")){
				if(games.get(req.params.get("pin")) != null){
					String res = games.get(req.params.get("pin")).pids.get(games.get(req.params.get("pin")).cardCzar);
					if(res != null)
						out.println(res);
					else
						out.println("INVALID");
				} else {
					out.print("INVALID");
				}
			}

			// Get Score
			if(req.page.equals("/get_score.txt")){
				if(games.get(req.params.get("pin")) != null){
					out.print(games.get(req.params.get("pin")).playerScores.get(games.get(req.params.get("pin")).pids.indexOf(req.params.get("pid"))));
				} else {
					out.print("INVALID");
				}
			}

			// Get leaderboard
			if(req.page.equals("/get_leaderboard.txt")){
				if(games.get(req.params.get("pin")) != null){
					out.print(games.get(req.params.get("pin")).getLeaderboard());
				} else {
					out.print("INVALID");
				}
			}
		}

	}

}