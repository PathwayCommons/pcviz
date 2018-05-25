package org.pathwaycommons.pcviz.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.io.*;
import java.util.*;

/**
 * This class parses co-citation information in iHOP database.
 *
 * @author Ozgun Babur
 */
@Service
public class IHOPSpider
{
	private static final String DEFAULT_URL = "http://www.ihop-net.org/UniPub/iHOP/";
	private static final Log log = LogFactory.getLog(IHOPSpider.class);
	private final RestTemplate restTemplate;

	@Value("${ihop.url}")
  private String iHopURL;

	public IHOPSpider() {
		iHopURL = DEFAULT_URL; //for using without a Spring context
		restTemplate = new RestTemplate();
	}

	/**
	 * Gets the co-citation data from the iHOP server.
	 *
	 * @param symbol symbol of the gene of interest
	 * @return map from co-cited to counts
	 */
	public Map<String, Integer> parseCocitations(String symbol)
	{
		Map<String, Integer> ret = Collections.emptyMap();

		try {
			// Find internal ID
			String result = restTemplate.getForObject(getGeneSearchURL(symbol), String.class);
			String ID = getInternalID(result, symbol);
			if (ID == null) {
				log.debug("Cannot find internal ID of " + symbol);
			} else {
				result = restTemplate.getForObject(getGenePageURL(ID), String.class);
				ret = parseCocitationsByID(result);
			}
		}
		catch (ResourceAccessException e) {
			log.error("Cannot assess iHop; " + e);
		}
		catch (Exception e) {
			log.error("Cannot parse co-citations for " + symbol + " - " + e);
		}

		return ret;
	}

	/**
	 * Prepares the URL for searching a gene.
	 * @param symbol gene symbol of the gene
	 * @return url
	 */
	private String getGeneSearchURL(String symbol)
	{
		return  iHopURL + "?field=synonym&ncbi_tax_id=9606&search=" + symbol;
	}

	/**
	 * Prepares the URL for the main gene page with internal ID.
	 * @param internalID internal ID
	 * @return url
	 */
	private String getGenePageURL(String internalID)
	{
		return iHopURL +"/gs/" + internalID + ".html?list=1&page=1";
	}


	private String getInternalID(String result, String symbol) throws IOException
	{
		if(result == null) {
			log.info("Cannot find internal ID of " + symbol);
			return null;
		}

		Scanner scanner = new Scanner(result);

		List<String> ids = new ArrayList<String>();

		while (scanner.hasNextLine())
		{
			String line = scanner.nextLine();
			if (line.startsWith("<TD nowrap=\"1\""))
			{
				int index = line.indexOf("doaction(null, ");
				if (index >= 0)
				{
					ids.add(line.substring(index + 15, line.lastIndexOf(", 1")));
				}
			}

			if (line.equals("<B>" + symbol + "</B>"))
			{
				line = scanner.nextLine();

				if (!line.equals("</SYMBOL>")) continue;

				line = scanner.nextLine();

				int index = line.indexOf("doaction(null, ");

				if (index >= 0)
				{
					return line.substring(index + 15, line.lastIndexOf(", 1"));
				}
			}
		}

		// check the encountered internal IDs to see if they map to given symbol
		for (String id : ids)
		{
			String sym = getSymbolOfID(id);

			if (sym != null && sym.equals(symbol))
			{
				return id;
			}
		}

		// Cannot find
		log.debug("Cannot find internal ID of " + symbol);

		return null;
	}

	/*
	 * Parses the co-citation counts for the given gene page.
	 *
	 * @param reader reader for the content
	 * @return map from the co-cited to their counts
	 */
	private Map<String, Integer> parseCocitationsByID(String result) throws IOException
	{
		Map<String, Integer> map = new HashMap<String, Integer>();
		Scanner scanner = new Scanner(result);
		while (scanner.hasNextLine())
		{
			String line = scanner.nextLine();
			if (line.startsWith("           hstore(new Array(\"type\", \"GENE\""))
			{
				String symbol = line.substring(line.indexOf("symbol\", \"") + 10, line.indexOf("\", \"name"));
				String count = line.substring(line.lastIndexOf(" \"") + 2, line.lastIndexOf("\""));

				map.put(symbol, Integer.parseInt(count));
			}
		}
		return map;
	}

	/**
	 * Extracts the gene symbol of an internal ID.
	 * @param ID internal ID
	 * @return gene symbol
	 */
	private String getSymbolOfID(String ID)
	{
		try {
			String result = restTemplate.getForObject(getGenePageURL(ID), String.class);
            return parseSymbol(result);
		}
		catch (Exception e)
		{
			log.error("Error while extracting gene symbol.", e);
			return null;
		}
	}

	/*
	 * Gets the gene symbol in the title.
	 */
	private String parseSymbol(String result) throws IOException
	{
		Scanner scanner = new Scanner(result);
		while(scanner.hasNextLine())
		{
			String line = scanner.nextLine();
			if (line.startsWith("<title>"))
			{
				int start = line.indexOf("[");
				int end = line.indexOf("]");
				if (start > 0 && end > start) {
					return line.substring(start + 1, end).trim();
				}
			}
		}
		return null;
	}
}
