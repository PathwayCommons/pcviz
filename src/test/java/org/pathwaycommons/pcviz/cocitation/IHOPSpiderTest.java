package org.pathwaycommons.pcviz.cocitation;

import org.junit.Test;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import static org.junit.Assert.*;

import java.util.Map;

/**
 * @author Ozgun Babur
 */
public class IHOPSpiderTest
{
    protected ClassPathXmlApplicationContext context
            = new ClassPathXmlApplicationContext("classpath*:META-INF/spring/testContext.xml");

	@Test
	public void spiderTest()
	{
        IHOPSpider ihopSpider = (IHOPSpider) context.getBean("iHopSpider");
        Map<String,Integer> map = ihopSpider.parseCocitations("KRAS");
		assertFalse(map.isEmpty());
		map = ihopSpider.parseCocitations("CDK1");
		assertFalse(map.isEmpty());
		map = ihopSpider.parseCocitations("MTOR");
		assertFalse(map.isEmpty());
	}
}
