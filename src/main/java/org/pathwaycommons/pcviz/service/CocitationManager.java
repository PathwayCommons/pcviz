package org.pathwaycommons.pcviz.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.*;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Ozgun Babur
 * @Igor Rodchenkov (upgraded)
 */
@Service
public class CocitationManager
{
	private static final Log log = LogFactory.getLog(CocitationManager.class);

	/*
	 * Directory for co-citation files. todo use more fancy resource management
	 */
	private String resourceDir;

	/*
	 * Life of cached co-citation data in milliseconds.
	 */
	private long shelfLife;

    /*
     * For crawling the iHop web site and caching the results
     */
    private IHOPSpider ihopSpider;

	public CocitationManager() {
	}

	@Value("${cache.folder}")
	public void setResourceDir(String cacheDir) throws IOException {
		Path dir = Paths.get(cacheDir,"cocitations");
		if (!Files.exists(dir))
			Files.createDirectories(dir);

		resourceDir = dir.toString();
	}

	public IHOPSpider getIhopSpider() {
		return ihopSpider;
	}

	@Autowired
	public void setIhopSpider(IHOPSpider ihopSpider) {
		this.ihopSpider = ihopSpider;
	}

	/**
	 * Sets the shelf life of cached co-citations using the pcviz properties.
	 * @param days shelf life in days
	 * @deprecated have no effect anymore (cache never expires)
	 */
	@Value("${cocitation.shelflife:30}")
	public void setShelfLife(Long days)
	{
		// convert to milliseconds
		this.shelfLife = days * 1000 * 60 * 60 * 24;
	}

	/*
	 * Refreshes cache with the given co-citations of the given gene.
	 * @param symbol symbol of the gene of interest
	 * @param map co-citations
	 * @return true if caching is successful
	 */
	private boolean cacheCocitations(String symbol, Map<String, Integer> map)
	{
		try
		{
			Path f = Paths.get(resourceDir, symbol);
			BufferedWriter writer = Files.newBufferedWriter(f, StandardOpenOption.CREATE);
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
		Map<String, Integer> map = Collections.emptyMap();

		try
		{
			if(cacheExists(symbol)) {
				//TODO: as iHope is old and down, we gotta built a permanent co-citations cache
				map = readCache(symbol);
			} else {
				map = spiderAndCache(symbol); //empty map is ihop is unavailable
			}
		} catch (IOException e) {
			log.error("Failed reading co-citations from cache for " + symbol + "; " + e);
		}

		return map;
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
		Map<String, Integer> map = new HashMap<String, Integer>();

		BufferedReader reader = Files.newBufferedReader(Paths.get(resourceDir, symbol));
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
		Map<String, Integer> map = getIhopSpider().parseCocitations(symbol);
		if (!map.isEmpty()) {
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
		return Files.exists(Paths.get(resourceDir, symbol));
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
			BufferedReader reader = Files.newBufferedReader(Paths.get(resourceDir, symbol));
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
	 * Clears all cached co-citation data
	 * (but not the directory and sub-dirs).
	 */
	protected void clearCache()
	{
		Path dir = Paths.get(resourceDir);
		if(Files.exists(dir)) {
			try {
				DirectoryStream<Path> dirStream = Files.newDirectoryStream(dir);
				for(Path f : dirStream) {
					Files.delete(f);
				}
			} catch (IOException e) {
				log.error("Failed cleaning up the cache dir: " + e);
			}
		}
	}
}
