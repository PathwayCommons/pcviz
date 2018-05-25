package org.pathwaycommons.pcviz.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Map;

import static org.junit.Assert.*;

/**
 * @author Ozgun Babur
 */
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class CocitationManagerTest
{

	@Autowired
	CocitationManager man;

	/**
	 * Beware! This test first clears the co-citation cache.
	 */
	@Test
	public void testManager() throws InterruptedException {
		assertFalse(man.cacheExists("FOXA1"));
		//iHope service's gone; our cache is empty during tests, no expiration
		Map<String,Integer> map = man.getCocitations("FOXA1");
		assertTrue(map.isEmpty());
	}
}
