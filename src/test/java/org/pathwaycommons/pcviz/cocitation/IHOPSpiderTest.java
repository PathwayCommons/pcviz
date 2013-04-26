package org.pathwaycommons.pcviz.cocitation;

import org.junit.Test;

import static org.junit.Assert.*;

import java.util.Map;

/**
 * @author Ozgun Babur
 */
public class IHOPSpiderTest
{
	@Test
	public void spiderTest()
	{
		Map<String,Integer> map = IHOPSpider.parseCocitations("KRAS");

		assertFalse(map.isEmpty());

		map = IHOPSpider.parseCocitations("CDK1");

		assertFalse(map.isEmpty());

		map = IHOPSpider.parseCocitations("MTOR");

		assertFalse(map.isEmpty());
	}
}
