package org.pathwaycommons.pcviz.controller;

import org.pathwaycommons.pcviz.service.PathwayCommonsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * @author B. Arman Aksoy
 */
@Controller
@RequestMapping("/metadata")
public class MetaDataController
{
	@Autowired
	private PathwayCommonsService pathwayCommonsService;

	/**
	 * Gets all data sources' metadata from PC
	 * @return
	 */
	@RequestMapping(path = "datasources",
			method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
	public ResponseEntity<String> getEntityInJson()
	{
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/json; charset=utf-8");
		String data = pathwayCommonsService.getMetadataDatasources(); //all info at once
		return new ResponseEntity<String>(data, headers, HttpStatus.OK);
	}
}
