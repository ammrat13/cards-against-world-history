import java.io.*;
import java.util.*;

public class Game {

	public final ArrayList<String> BDECK;
	public final ArrayList<String> WDECK;

	public ArrayList<String> dealt;
	public ArrayList<Map.Entry<String,String>> field;

	public ArrayList<String> pids;
	public ArrayList<Integer> playerScores;
	public ArrayList<ArrayList<String>> playerHands;
	public ArrayList<Long> playerTimeouts;
	public long gameTimeout;

	public int cardCzar = -1;

	public Game(){
		// Initialize black deck
		BDECK = new ArrayList<String>();
		try {
			Scanner bDeckIn = new Scanner(new File("bdeck.txt"));
			while(bDeckIn.hasNextLine())
				BDECK.add(bDeckIn.nextLine());
		} catch (IOException e){
			e.printStackTrace();
		}

		// Initialize white deck
		WDECK = new ArrayList<String>();
		try {
			Scanner wDeckIn = new Scanner(new File("wdeck.txt"));
			while(wDeckIn.hasNextLine())
				WDECK.add(wDeckIn.nextLine());
		} catch (IOException e){
			e.printStackTrace();
		}

		pids = new ArrayList<String>();
		dealt = new ArrayList<String>();
		field = new ArrayList<Map.Entry<String,String>>();

		playerScores = new ArrayList<Integer>();
		playerHands = new ArrayList<ArrayList<String>>();
		playerTimeouts = new ArrayList<Long>();
		gameTimeout = System.currentTimeMillis();

		dealBlack();
	}

	public boolean ping(String p){
		gameTimeout = System.currentTimeMillis();

		if(pids.indexOf(p) == -1)
			return false;
			
		playerTimeouts.set(pids.indexOf(p), System.currentTimeMillis());
		return true;
	}

	public void prune(){
		for(int i=0; i<pids.size(); i++){
			if(System.currentTimeMillis() - playerTimeouts.get(i) >= 20*1000)
				leave(pids.get(i));
		}
	}

	public String join(String p){
		if(playerScores.size()*10 + 10 <= WDECK.size() && p != null && !pids.contains(p)){
			playerScores.add(0);
			playerHands.add(new ArrayList<String>());
			playerTimeouts.add(System.currentTimeMillis());
			pids.add(p);
			deal();

			if(cardCzar == -1)
				cardCzar = 0;

			// Return player id
			return p;
		} else {
			return null;
		}
	}

	public void leave(String p){
		if(pids.indexOf(p) < 0)
			return;
		int pid = pids.indexOf(p);

		try {
			playerScores.remove(pid);
			playerHands.remove(pid);

			// Remove from field
			Iterator<Map.Entry<String,String>> it = field.iterator();
			while(it.hasNext()){
				if(it.next().getKey().equals(p))
					it.remove();
			}

			pids.remove(pid);

			// If the card czar leaves it will naturally go to the next person
			// Special handling if the card czar leaves and is the last person
			if(cardCzar == playerScores.size())
				cardCzar = 0;
			if(pid < cardCzar)
				cardCzar--;

			deal();
		} catch (IndexOutOfBoundsException e){
			e.printStackTrace();
		}
	}

	public void setCardCzar(){
		// Set it to the next player
		if(playerScores.size() == 0)
			cardCzar = -1;
		else
			cardCzar = (cardCzar + 1) % playerScores.size();
	}

	public void play(String p, String card){
		if(pids.indexOf(p) < 0)
			return;
		int pid = pids.indexOf(p);

		playerHands.get(pid).remove(card);
		field.add(new AbstractMap.SimpleEntry<String,String>(p, card));
	}

	public void select(String card){
		for(Map.Entry<String,String> ce : field){
			if(ce.getValue().equals(card)){
				String p = ce.getKey();
				playerScores.set(pids.indexOf(p), playerScores.get(pids.indexOf(p))+1);
				break;
			}
		}

		field.clear();

		setCardCzar();
		deal();
		dealBlack();
	}

	public String getLeaderboard(){
		ArrayList<Integer> scoreIdxs = new ArrayList<Integer>();

		for(int j=0; j<playerScores.size(); j++){
			int max = Integer.MIN_VALUE;
			int maxIdx = -1;
			for(int i=0; i<playerScores.size(); i++){
				if(!scoreIdxs.contains(i) && playerScores.get(i) > max){
					max = playerScores.get(i);
					maxIdx = i;
				}
			}
			scoreIdxs.add(maxIdx);
		}

		String ret = "";
		for(int i=0; i<scoreIdxs.size(); i++){
			ret += pids.get(scoreIdxs.get(i)) + "," + playerScores.get(scoreIdxs.get(i));
			if(i != scoreIdxs.size()-1)
				ret += ";";
		}
		return ret;
	}

	public void deal(){
		// Deal hands
		for(ArrayList<String> hand : playerHands){
			Collections.shuffle(WDECK);
			int i = 0;
			while(hand.size() < 10 && i < WDECK.size()){
				if(!cardsInPlay().contains(WDECK.get(i)))
					hand.add(WDECK.get(i));
				i++;
			}
		}

		// Deal dealt just in case
		if(dealt.isEmpty())
			dealt.add(BDECK.get((int) (Math.random() * BDECK.size())));
	}

	public void dealBlack(){
		// Deal a new black card
		dealt.clear();
		dealt.add(BDECK.get((int) (Math.random() * BDECK.size())));
	}

	public HashSet<String> cardsInPlay(){
		HashSet<String> ret = new HashSet<String>();

		// On the field
		for(Map.Entry<String,String> fe : field)
			ret.add(fe.getValue());

		// In hands
		for(ArrayList<String> h : playerHands){
			ret.addAll(h);
		}

		return ret;
	}

}