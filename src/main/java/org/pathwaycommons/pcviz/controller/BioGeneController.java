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
