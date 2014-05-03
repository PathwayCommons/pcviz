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

import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;
import java.io.IOException;
import java.util.Set;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import java.io.IOException;
import java.util.*;

/**
 * @author Mecit Sari
 */
public class BlackListService {
    private static Log log = LogFactory.getLog(GeneNameService.class);

    private Resource blackListResource;
    private Set<String> blackListSet = null;

    public Resource getBlackListResource() {
        return blackListResource;
    }

    public void setBlackListResource(Resource geneResource) {
        this.blackListResource = geneResource;
    }

    private void addToBlackListSet(String s){
        blackListSet.add(s);
    }

    @Cacheable("blackListCache")
    public Set<String> getBlackListSet(){
        if(blackListSet != null) return blackListSet;

        try{
            blackListSet = new HashSet<String>();
            Scanner scanner = new Scanner(getBlackListResource().getInputStream());

            while(scanner.hasNext()) {
                String line = scanner.nextLine();
                addToBlackListSet(line);
            }
        }catch (IOException e){
            log.error("Could not get the blacklist: " + e.getLocalizedMessage());

        }
        return blackListSet;
    }

}
