package org.pathwaycommons.pcviz.service;

import org.cbio.causality.data.portal.CBioPortalAccessor;
import org.cbio.causality.data.portal.CancerStudy;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.List;

public class CancerContextService {
    @Autowired
    private CBioPortalAccessor cBioPortalAccessor;

    private String portalUrl;

    public String getPortalUrl() {
        return portalUrl;
    }

    public void setPortalUrl(String portalUrl) {
        this.portalUrl = portalUrl;
    }

    public CBioPortalAccessor getcBioPortalAccessor() {
        return cBioPortalAccessor;
    }

    public void setcBioPortalAccessor(CBioPortalAccessor cBioPortalAccessor) {
        this.cBioPortalAccessor = cBioPortalAccessor;
    }

    public List<CancerStudy> listAvailableCancers() throws IOException {
        CBioPortalAccessor portal = new CBioPortalAccessor();
        return portal.getCancerStudies();
    }
}
