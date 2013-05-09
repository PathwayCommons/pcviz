package org.pathwaycommons.pcviz.controller;

import org.pathwaycommons.pcviz.service.PathwayCommonsGraphService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/graph")
public class NetworkController
{
    @Autowired
    private PathwayCommonsGraphService pathwayCommonsGraphService;

    public PathwayCommonsGraphService getPathwayCommonsGraphService() {
        return pathwayCommonsGraphService;
    }

    public void setPathwayCommonsGraphService(PathwayCommonsGraphService pathwayCommonsGraphService) {
        this.pathwayCommonsGraphService = pathwayCommonsGraphService;
    }

    @RequestMapping(value = "{type}/{genes}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
	public ResponseEntity<String> getEntityInJson(@PathVariable String type, @PathVariable String genes)
	{
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/json; charset=utf-8");

        String networkJson = getPathwayCommonsGraphService().createNetwork(type, genes);

		return new ResponseEntity<String>(
			networkJson,
			headers,
			HttpStatus.OK
		);
	}

}
