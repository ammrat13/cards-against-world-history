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
		"/create_game.html",
		"/join_game.html",
		"/leave_game.html",
		"/get_dealt.html",
		"/get_field.html",
		"/get_hand.html",
		"/play_card.html",
		"/select_card.html",
		"/is_card_czar.html",
		"/get_score.html",
		"/get_leaderboard.html"
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
				handleRequest(req);
				out.flush();

				System.out.println("Closing connection to " + conn.getRemoteSocketAddress());
				conn.close();
			} catch (IOException e){
				e.printStackTrace();
			}
		}

		public void handleRequest(Request req){

			// Headers
			if(	Arrays.asList(files).contains(req.page)
			||	Arrays.asList(imageFiles).contains(req.page)
			||	Arrays.asList(specFiles).contains(req.page)){
				out.println("HTTP/1.1 200 OK");
				out.println("Connection: close");
				out.println("Cache-Control: no-cache");

				// MIME Type
				if(Arrays.asList(files).contains(req.page)){
					if(req.page.endsWith(".html"))
						out.println("Content-Type: text/html");
					if(req.page.endsWith(".css"))
						out.println("Content-Type: text/css");
					if(req.page.endsWith(".js"))
						out.println("Content-Type: text/javascript");
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
			if(req.page.equals("/create_game.html")){
				gameCount = (gameCount + 1) % 1000000;
				String pin = String.format("%06d", gameCount);
				games.put(pin, new Game());
				out.print(pin);
			}

			// Join a game
			if(req.page.equals("/join_game.html")){
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
					games.get(req.params.get("pin")).play(req.params.get("pid"), req.params.get("card"));
					out.print("DONE");
				} else {
					out.print("FAIL");
				}
			}

			// Select a card
			if(req.page.equals("/select_card.html")){
				if(games.get(req.params.get("pin")) != null){
					games.get(req.params.get("pin")).select(req.params.get("card"));
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

			// Get leaderboard
			if(req.page.equals("/get_leaderboard.html")){
				if(games.get(req.params.get("pin")) != null){
					//out.print(games.get(req.params.get("pin")).getLeaderboard());
					out.print("a,0;b,1;c,2;d,3;e,4;f,5;g,6;h,7;i,8;j,10");
				} else {
					out.print("INVALID");
				}
			}
		}

	}

}