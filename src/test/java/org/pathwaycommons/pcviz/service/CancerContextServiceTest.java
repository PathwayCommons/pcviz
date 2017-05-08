package org.pathwaycommons.pcviz.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.io.IOException;
import java.util.HashMap;

import static org.junit.Assert.*;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/testContext.xml")
public class CancerContextServiceTest {

    @Autowired
    protected CancerContextService cancerContextService;

    @Test
    public void testLoadContext() throws IOException {

        HashMap<String, HashMap<String, Double>> map = cancerContextService
            .loadContext("paac_jhu_2014", "mutation", "MDC1,MIMAT0000456");
        assertFalse(map.isEmpty());
    }

}
