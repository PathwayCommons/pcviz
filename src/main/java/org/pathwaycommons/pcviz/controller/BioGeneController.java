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

import org.pathwaycommons.pcviz.service.BioGeneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.IOException;

/**
 * Controller class to request BioGene information from BioGene web service.
 *
 * @author Selcuk Onur Sumer
 */
@Controller
@RequestMapping("/biogene")
public class BioGeneController
{
    @Autowired
    private BioGeneService bioGeneService;

    public BioGeneService getBioGeneService() {
        return bioGeneService;
    }

    public void setBioGeneService(BioGeneService bioGeneService) {
        this.bioGeneService = bioGeneService;
    }

    @RequestMapping(value = "{organism}/{gene}",
	                method = {RequestMethod.GET, RequestMethod.POST},
	                headers = "Accept=application/json")
	public ResponseEntity<String> getEntityInJson(@PathVariable String organism,
			@PathVariable String gene)
	{
		HttpStatus status;
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/json; charset=utf-8");

		String data = "";
		try
		{
			data = getBioGeneService().getData(gene, organism);
			status = HttpStatus.OK;
		}
		catch (IOException e)
		{
			status = HttpStatus.SERVICE_UNAVAILABLE;
		}

		return new ResponseEntity<String>(data, headers, status);
	}
}
