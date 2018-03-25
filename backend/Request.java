import java.util.*;

public class Request {

	public String page = null;
	public Map<String, String> params = null;

	public Request(String path){
		String[] toks = path.split("[?&]");
		
		page = toks[0];
		// Root is index.html
		if(page.equals("/"))
			page = "/index.html";

		params = new HashMap<String, String>();
		for(int i=1; i<toks.length; i++)
			params.put(toks[i].split("=")[0], toks[i].split("=")[1]);
	}

	@Override
	public String toString(){
		String ret = "";
		ret += "Page: " + page;
		if(!params.isEmpty()){
			ret += "\nParameters: \n";
			for(String k : params.keySet())
				ret += k + "=" + params.get(k);
		}
		return ret;
	}

}