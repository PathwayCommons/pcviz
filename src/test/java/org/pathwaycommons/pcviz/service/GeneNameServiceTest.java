package org.pathwaycommons.pcviz.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class GeneNameServiceTest {

    @Autowired
    GeneNameService geneNameService;

    @Test
    public void testValidation() {
        assertEquals(1, geneNameService.validate("A2M").getMatches().size());
        assertEquals(1, geneNameService.validate("AADAC").getMatches().size());
        assertEquals(1, geneNameService.validate("CES5A1").getMatches().size());
        assertEquals(1, geneNameService.validate("SNAT").getMatches().size());
        assertEquals("AANAT", geneNameService.validate("SNAT").getMatches().iterator().next());
        assertTrue(geneNameService.validate("BLABLA").getMatches().isEmpty());
    }

    @Test
    public void testAutocomplete() {
        assertEquals(1, geneNameService.autoComplete("SNA").size());
        assertEquals(2, geneNameService.autoComplete("A2").size());
        assertTrue(geneNameService.autoComplete("BLABLA").isEmpty());
    }
}
