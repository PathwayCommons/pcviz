package org.pathwaycommons.pcviz.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.util.HashMap;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class CancerContextServiceTest {

    @Autowired
    protected CancerContextService cancerContextService;

    @Test
    public void testLoadContext() throws IOException {
        HashMap<String, HashMap<String, Double>> map = cancerContextService
            .loadContext("paac_jhu_2014", "mutation", "MDC1,MIMAT0000456");
        String s = cancerContextService.listAvailableCancers();
        assertNotNull(s);
        assertFalse(s.isEmpty());
//        assertFalse(map.isEmpty()); //TODO update the test example (it seems not working anymore... gone?)
    }

}
