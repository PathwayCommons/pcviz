package org.pathwaycommons.pcviz.model;

import org.cbio.causality.data.portal.CancerStudy;

public class CancerStudyDetails {
    private CancerStudy cancerStudy;
    private boolean hasMutation = false;
    private boolean hasCNA = false;
    private boolean hasExpression = false;
    private int numberOfCases = 0;

    public CancerStudy getCancerStudy() {
        return cancerStudy;
    }

    public void setCancerStudy(CancerStudy cancerStudy) {
        this.cancerStudy = cancerStudy;
    }

    public boolean isHasMutation() {
        return hasMutation;
    }

    public void setHasMutation(boolean hasMutation) {
        this.hasMutation = hasMutation;
    }

    public boolean isHasCNA() {
        return hasCNA;
    }

    public void setHasCNA(boolean hasCNA) {
        this.hasCNA = hasCNA;
    }

    public boolean isHasExpression() {
        return hasExpression;
    }

    public void setHasExpression(boolean hasExpression) {
        this.hasExpression = hasExpression;
    }

    public int getNumberOfCases() {
        return numberOfCases;
    }

    public void setNumberOfCases(int numberOfCases) {
        this.numberOfCases = numberOfCases;
    }
}
