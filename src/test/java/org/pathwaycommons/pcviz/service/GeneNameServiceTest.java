package org.pathwaycommons.pcviz.service;

import org.junit.Test;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertTrue;

public class GeneNameServiceTest {
    protected ClassPathXmlApplicationContext context
            = new ClassPathXmlApplicationContext("classpath*:META-INF/spring/testContext.xml");

    @Test
    public void testValidation() {
        GeneNameService geneNameService = (GeneNameService) context.getBean("geneNameService");
        assertEquals(1, geneNameService.validate("A2M").getMatches().size());
        assertEquals(1, geneNameService.validate("AADAC").getMatches().size());
        assertEquals(1, geneNameService.validate("CES5A1").getMatches().size());
        assertEquals(1, geneNameService.validate("SNAT").getMatches().size());
        assertEquals("AANAT", geneNameService.validate("SNAT").getMatches().iterator().next());
        assertTrue(geneNameService.validate("BLABLA").getMatches().isEmpty());
    }
}
