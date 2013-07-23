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

package org.pathwaycommons.pcviz.controller;

import flexjson.JSONSerializer;
import org.pathwaycommons.pcviz.model.GeneValidation;
import org.pathwaycommons.pcviz.service.GeneNameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.ArrayList;

@Controller
@RequestMapping("/validate")
public class ValidationController {
    @Autowired
    private GeneNameService geneNameService;

    public GeneNameService getGeneNameService() {
        return geneNameService;
    }

    public void setGeneNameService(GeneNameService geneNameService) {
        this.geneNameService = geneNameService;
    }

    @RequestMapping(value = "{genes}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> getEntityInJson(@PathVariable String genes)
    {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        ArrayList<GeneValidation> validations = new ArrayList<GeneValidation>();
        String[] geneTokens = genes.toUpperCase().split(",", -1);
        for (String geneToken : geneTokens) {
            if(geneToken.isEmpty()) continue;

            GeneValidation geneValidation = getGeneNameService().validate(geneToken);
            validations.add(geneValidation);
        }

        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");

        return new ResponseEntity<String>(
                jsonSerializer.deepSerialize(validations),
                headers,
                HttpStatus.OK
        );
    }
}
