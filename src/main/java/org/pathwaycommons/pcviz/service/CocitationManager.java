package org.pathwaycommons.pcviz.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
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

	public CocitationManager() {}

	@Value("${cache.folder}")
	public void setResourceDir(String cacheDir) throws IOException {
		Path dir = Paths.get(cacheDir,"cocitations");
		if (!Files.exists(dir))
			Files.createDirectories(dir);

		resourceDir = dir.toString();
	}

	/**
	 * Gets co-citations for the given gene from pre-populated cache.
	 * @param symbol gene symbol
	 * @return co-citation counts
	 */
	public Map<String, Integer> getCocitations(String symbol)
	{
		if(cacheExists(symbol)) {
			Map<String, Integer> map = new HashMap();
			try {
				BufferedReader reader = Files.newBufferedReader(Paths.get(resourceDir, symbol));
				reader.readLine();
				for (String line = reader.readLine(); line != null; line = reader.readLine()) {
					String[] token = line.split("\t");
					map.put(token[0], Integer.parseInt(token[1]));
				}
			} catch (IOException e) {
				log.debug("No co-citations found in the cache for: " + symbol);
			}
			return map;
		} else {
			return Collections.emptyMap();
		}
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
}
