package org.pathwaycommons.pcviz.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import static org.junit.Assert.*;

import java.util.Map;

/**
 * @author Ozgun Babur
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/testContext.xml")
public class IHOPSpiderTest
{
	@Autowired
	IHOPSpider ihopSpider;

	@Test
	public void spiderTest()
	{
        Map<String,Integer> map = ihopSpider.parseCocitations("KRAS");
		assertFalse(map.isEmpty());
		map = ihopSpider.parseCocitations("CDK1");
		assertFalse(map.isEmpty());
		map = ihopSpider.parseCocitations("MTOR");
		assertFalse(map.isEmpty());
	}
}
