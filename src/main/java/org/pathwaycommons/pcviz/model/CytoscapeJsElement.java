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

    public void setProperty(PropertyKey propertyKey, Object value) {
        getData().put(propertyKey.toString(), value);
    }

    public Object getProperty(PropertyKey propertyKey) {
        return getData().get(propertyKey.toString());
    }

}
