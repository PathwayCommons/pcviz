/*
 * Copyright 2013 Memorial-Sloan Kettering Cancer Center.
 *
 * This file is part of PCViz.
 *
 * PCViz is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PCViz is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with PCViz. If not, see <http://www.gnu.org/licenses/>.
 */

package org.pathwaycommons.pcviz.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/testContext.xml")
public class GeneNameServiceTest {

    @Autowired
    protected GeneNameService geneNameService;

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
