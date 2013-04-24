package org.pathwaycommons.pcviz.cocitation;

import org.junit.Test;

import java.util.Map;

import static org.junit.Assert.*;

/**
 * @author Ozgun Babur
 */
public class CocitationManagerTest
{
	/**
	 * Beware! This test first clears the co-citation cache.
	 */
	@Test
	public void testManager() throws InterruptedException {
		CocitationManager man = new CocitationManager(1);
		man.clearCache();

		String gene = "FOXA1";

		assertFalse(man.cacheExists(gene));

		Map<String,Integer> map = man.getCocitations(gene);

		assertFalse(map.isEmpty());

		assertTrue(man.cacheExists(gene));

		// a manager with a cache that has no shelf life
		man = new CocitationManager(0);

		// re-getting citations should download and stamp again
		long stamp1 = man.getCacheTimestamp(gene);
        // If these were run really quick, then the timestamps won't change
        // so adding a delay between these two calls.
        Thread.sleep(250);
		man.getCocitations(gene);
		long stamp2 = man.getCacheTimestamp(gene);

		assertFalse(stamp1 == stamp2);
	}
}
