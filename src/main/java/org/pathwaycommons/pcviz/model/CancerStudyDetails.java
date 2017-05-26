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

package org.pathwaycommons.pcviz.model;

import org.pathwaycommons.pcviz.cbioportal.CancerStudy;

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
