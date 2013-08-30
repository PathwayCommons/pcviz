/*
 * Copyright 2013 Memorial-Sloan Kettering Cancer Center.
 *
 * This file is part of PCViz.
 *
 * PCViz is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PCViz is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with PCViz. If not, see <http://www.gnu.org/licenses/>.
 */

package org.pathwaycommons.pcviz.cocitation;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This class parses co-citation information in iHOP database.
 *
 * @author Ozgun Babur
 */
public class IHOPSpider
{
	/**
	 * For logging.
	 */
	private static final Log log = LogFactory.getLog(IHOPSpider.class);

    /**
     * Base URL to the iHop web pages
     */
    private String iHopURL;

    /**
     * Initializes the class and sets the required url property
     * @param iHopURL iHop base URL
     */
    public IHOPSpider(String iHopURL) {
        this.iHopURL = iHopURL;
    }

    /**
	 * Gets the co-citation data from the iHOP server.
	 * @param symbol symbol of the gene of interest
	 * @return map from co-cited to counts
	 */
	public Map<String, Integer> parseCocitations(String symbol)
	{
		// Find internal ID
		String url = getGeneSearchURL(symbol);
		BufferedReader reader = getReader(url);
		try
		{
			String ID = getInternalID(reader, symbol);
			reader.close();

			if (ID == null)
			{
				log.error("Cannot find internal ID of " + symbol + ".");
				return null;
			}

			url = getGenePageURL(ID);
			reader = getReader(url);

            Map<String, Integer> map = parseCocitations(reader);
            reader.close();
            return map;
		}
		catch (IOException e)
		{
			log.error("Cannot parse co-citations for " + symbol + ".", e);
			return null;
		}
	}

	/**
	 * Prepares the URL for searching a gene.
	 * @param symbol gene symbol of the gene
	 * @return url
	 */
	private String getGeneSearchURL(String symbol)
	{
		return  getiHopURL() + "/?field=synonym&ncbi_tax_id=9606&search=" + symbol;
	}

	/**
	 * Prepares the URL for the main gene page with internal ID.
	 * @param internalID internal ID
	 * @return url
	 */
	private String getGenePageURL(String internalID)
	{
		return getiHopURL() +"/gs/" + internalID + ".html?list=1&page=1";
	}

	/**
	 * Gets a BufferedReader for the given URL.
	 * @param url url of the resource
	 * @return buffered reader
	 */
	private static BufferedReader getReader(String url)
	{
		try
		{
			URL u = new URL(url);
			URLConnection con = u.openConnection();
			InputStream is = con.getInputStream();
			return new BufferedReader(new InputStreamReader(is));
		}
		catch (IOException e)
		{
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * Extracts the internal ID of the molecule.
	 * @param reader reader of the resource
	 * @return internal ID
	 * @throws IOException
	 */
	private String getInternalID(BufferedReader reader, String symbol) throws IOException
	{
		List<String> ids = new ArrayList<String>();

		for(String line = reader.readLine(); line != null; line = reader.readLine())
		{
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
				line = reader.readLine();

				if (!line.equals("</SYMBOL>")) continue;

				line = reader.readLine();

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
		if (log.isWarnEnabled()) log.warn("Cannot find internal ID of " + symbol);
		return null;
	}

	/**
	 * Parses the co-citation counts for the given gene page.
	 * @param reader reader for the content
	 * @return map from the co-cited to their counts
	 */
	private Map<String, Integer> parseCocitations(BufferedReader reader) throws IOException
	{
		Map<String, Integer> map = new HashMap<String, Integer>();

		for(String line = reader.readLine(); line != null; line = reader.readLine())
		{
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
		String url = getGenePageURL(ID);
		BufferedReader reader = getReader(url);
		try
		{
			return parseSymbol(reader);
		}
		catch (IOException e)
		{
			log.error("Error while extracting gene symbol.", e);
			return null;
		}
	}

	/**
	 * Gets the gene symbol in the title.
	 * @param reader reader for the content
	 * @return gene symbol
	 */
	private String parseSymbol(BufferedReader reader) throws IOException
	{
		for(String line = reader.readLine(); line != null; line = reader.readLine())
		{
			if (line.startsWith("<title>"))
			{
				String symbol = line.substring(line.indexOf("[ ") + 2, line.indexOf(" ]"));
				return symbol;
			}
		}
		return null;
	}

    public String getiHopURL() {
        return iHopURL;
    }

    public void setiHopURL(String iHopURL) {
        this.iHopURL = iHopURL;
    }
}
