package org.pathwaycommons.pcviz.model;

import java.util.ArrayList;
import java.util.List;

public class GeneValidation {
    private String query;
    private List<String> matches = new ArrayList<String>();

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<String> getMatches() {
        return matches;
    }

    public void setMatches(List<String> matches) {
        this.matches = matches;
    }
}
