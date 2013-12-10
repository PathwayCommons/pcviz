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
import java.util.HashMap;
import java.util.Map;

/**
 * @author Ozgun Babur
 */
public class CocitationManager
{
	/**
	 * For logging.
	 */
	private static final Log log = LogFactory.getLog(CocitationManager.class);

	/**
	 * Directory for co-citation files. todo use more fancy resource management
	 */
	private String resourceDir;

	/**
	 * Life of cached co-citation data in milliseconds.
	 */
	private long shelfLife;

    /**
     * For crawling the iHop web site and caching the results
     */
    private IHOPSpider ihopSpider;

	/**
	 * Constructor with cache life (in days).
	 * @param cacheLife life in days
	 */
	public CocitationManager(int cacheLife, String resourceDir)
	{
		setShelfLife(cacheLife);
        setResourceDir(resourceDir);
	}

	/**
	 * Sets the shelf life of cached co-citations.
	 * @param days shelf life in days
	 */
	public void setShelfLife(long days)
	{
		// convert to milliseconds
		this.shelfLife = days * 1000 * 60 * 60 * 24;
	}

	/**
	 * Creates the resource directory if not exists.
	 */
	private void createResourceDir()
	{
		File file = new File(getResourceDir());

		if (!file.exists())
		{
			file.mkdirs();
		}
	}

	/**
	 * Refreshes cache with the given co-citations of the given gene.
	 * @param symbol symbol of the gene of interest
	 * @param map co-citations
	 * @return true if caching is successful
	 */
	private boolean cacheCocitations(String symbol, Map<String, Integer> map)
	{
		BufferedWriter writer;

		try
		{
			writer = new BufferedWriter(new FileWriter(getResourceDir() + File.separator + symbol));

			writer.write("" + System.currentTimeMillis());

			for (String s : map.keySet())
			{
				writer.write("\n" + s + "\t" + map.get(s));
			}
			writer.close();
			return true;
		}
		catch (IOException e)
		{
			log.error("Cannot cache co-citations of gene " + symbol + ".", e);
			return false;
		}
	}

	/**
	 * Gets co-citations for the given gene. Downloads and caches data if does not exist, or
	 * expired.
	 * @param symbol gene symbol
	 * @return co-citation counts
	 */
	public Map<String, Integer> getCocitations(String symbol)
	{
		try
		{
			if (cacheExists(symbol))
			{
				Map<String, Integer> map = null;

				long stamp = getCacheTimestamp(symbol);

				if (System.currentTimeMillis() - stamp > getShelfLife())
				{
					map = spiderAndCache(symbol);
				}

				if (map == null)
				{
					map = readCache(symbol);
				}

				return map;
			}
			else
			{
				return spiderAndCache(symbol);
			}

		}
		catch (IOException e)
		{
			log.error("Error while reading co-citation cache for symbol " + symbol + ".", e);
			return null;
		}
	}

	/**
	 * Reads the cached co-citations for the given gene. Presence of the cache should be checked
	 * before calling this method.
	 * @param symbol gene symbol
	 * @return cached co-citations
	 * @throws IOException
	 */
	private Map<String, Integer> readCache(String symbol) throws IOException
	{
		Map<String, Integer> map;
		map = new HashMap<String, Integer>();
		BufferedReader reader = new BufferedReader(new FileReader(getCachePath(symbol)));

		// skip timestamp
		reader.readLine();

		for (String line = reader.readLine(); line != null; line = reader.readLine())
		{
			String[] token = line.split("\t");
			map.put(token[0], Integer.parseInt(token[1]));
		}
		reader.close();
		return map;
	}

	/**
	 * Downloads and caches co-citations.
	 * @param symbol gene symbol
	 * @return new co-citations
	 */
	private Map<String, Integer> spiderAndCache(String symbol)
	{
		Map<String, Integer> map;
		map = getIhopSpider().parseCocitations(symbol);

		if (map != null)
		{
			cacheCocitations(symbol, map);
		}
		return map;
	}

	/**
	 * Checks if a cache for the given gene exists.
	 * @param symbol gene symbol
	 * @return true if exists
	 */
	protected boolean cacheExists(String symbol)
	{
		return new File(getCachePath(symbol)).exists();
	}

	/**
	 * Reads the timestamp of the current cache for the given gene.
	 * @param symbol gene symbol
	 * @return timestamp, or -1 if cache does not exist
	 */
	protected long getCacheTimestamp(String symbol)
	{
		if (!cacheExists(symbol)) return -1;

		try
		{
			BufferedReader reader = new BufferedReader(new FileReader(getCachePath(symbol)));
			String line = reader.readLine();
			reader.close();
			return Long.parseLong(line);
		}
		catch (IOException e)
		{
			log.error("Cannot read timestamp of cache of " + symbol + ".", e);
			return -1;
		}
	}

	/**
	 * Gets the path of the cache for the given gene.
	 * @param symbol gene symbol
	 * @return path for the cache
	 */
	private String getCachePath(String symbol)
	{
		return getResourceDir() + File.separator + symbol;
	}

	/**
	 * Clears all cached co-citation data.
	 */
	protected void clearCache()
	{
		File dir = new File(getResourceDir());

		if (dir.exists())
		{
			for (File file : dir.listFiles())
			{
				file.delete();
			}
		}
	}

    public String getResourceDir() {
        return resourceDir;
    }

    public void setResourceDir(String resourceDir) {
        this.resourceDir = resourceDir;
        createResourceDir();
    }

    public long getShelfLife() {
        return shelfLife;
    }

    public IHOPSpider getIhopSpider() {
        return ihopSpider;
    }

    public void setIhopSpider(IHOPSpider ihopSpider) {
        this.ihopSpider = ihopSpider;
    }
}
