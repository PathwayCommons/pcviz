package org.pathwaycommons.pcviz.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.*;

import java.util.Map;

/**
 * @author Ozgun Babur
 */
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
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
