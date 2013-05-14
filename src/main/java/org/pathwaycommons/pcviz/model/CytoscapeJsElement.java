package org.pathwaycommons.pcviz.model;

import java.util.HashMap;
import java.util.Map;

public class CytoscapeJsElement {
    private Map<String, Object> data = new HashMap<String, Object>();

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
