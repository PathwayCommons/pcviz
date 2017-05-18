package org.pathwaycommons.pcviz.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Map;

import static org.junit.Assert.*;

/**
 * @author Ozgun Babur
 */

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/testContext.xml")
public class CocitationManagerTest
{

	@Autowired
	CocitationManager man;

    /**
	 * Beware! This test first clears the co-citation cache.
	 */
	@Test
	public void testManager() throws InterruptedException {
		man.clearCache();

		String gene = "FOXA1";

		assertFalse(man.cacheExists(gene));

		Map<String,Integer> map = man.getCocitations(gene);

		assertFalse(map.isEmpty());

		assertTrue(man.cacheExists(gene));

		//set shelf life to 0
		man.setShelfLife(0L);

		// re-getting citations should download and stamp again
		long stamp1 = man.getCacheTimestamp(gene);

        // If these were run really quick, then the timestamps won't change
        // so adding a delay between these two calls.
        Thread.sleep(250);

		man.getCocitations(gene);
		long stamp2 = man.getCacheTimestamp(gene);

//		assertFalse(stamp1 == stamp2);
		// from now, cache never expires!
		assertTrue(stamp1 == stamp2);
	}
}
