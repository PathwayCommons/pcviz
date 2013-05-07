package org.pathwaycommons.pcviz.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

/**
 * Controller class to request BioGene information from BioGene web service.
 *
 * @author Selcuk Onur Sumer
 */
@Controller
@RequestMapping("/biogene")
public class BioGeneController
{
	public final static String SERVICE_URL = "http://cbio.mskcc.org/biogene/retrieve.do";
	public final static String DEFAULT_DATA_FORMAT = "json";

	/**
	 * Requests data from BioGene server.
	 *
	 * @param gene      query gene
	 * @param organism  organism name
	 * @param format    data format (xml or json)
	 * @return          BioGene data in json format
	 * @throws IOException
	 */
	private static String requestData(String gene,
			String organism,
			String format) throws IOException
	{
		StringBuilder urlBuilder = new StringBuilder();

		urlBuilder.append(SERVICE_URL);
		urlBuilder.append("?query=").append(gene);
		urlBuilder.append("&org=").append(organism);
		urlBuilder.append("&format=").append(format);

		String url = urlBuilder.toString();

		URL bioGene = new URL(url);
		URLConnection bioGeneCxn = bioGene.openConnection();
		BufferedReader in = new BufferedReader(
				new InputStreamReader(bioGeneCxn.getInputStream()));

		String line;
		StringBuilder sb = new StringBuilder();

		// Read all
		while((line = in.readLine()) != null)
		{
			sb.append(line);
		}

		in.close();

		return sb.toString();
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

		String format = DEFAULT_DATA_FORMAT;
		String data = null;

		try
		{
			data = requestData(gene, organism, format);
			status = HttpStatus.OK;
		}
		catch (IOException e)
		{
			status = HttpStatus.SERVICE_UNAVAILABLE;
		}

		return new ResponseEntity<String>(data, headers, status);
	}
}
