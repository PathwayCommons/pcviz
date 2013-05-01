package org.pathwaycommons.pcviz.controller;

import flexjson.JSONSerializer;
import org.biopax.paxtools.io.SimpleIOHandler;
import org.biopax.paxtools.model.Model;
import org.biopax.paxtools.model.level3.XReferrable;
import org.biopax.paxtools.model.level3.Xref;
import org.biopax.paxtools.pattern.miner.*;
import org.pathwaycommons.pcviz.cocitation.CocitationManager;
import org.pathwaycommons.pcviz.model.CytoscapeJsEdge;
import org.pathwaycommons.pcviz.model.CytoscapeJsGraph;
import org.pathwaycommons.pcviz.model.CytoscapeJsNode;
import org.pathwaycommons.pcviz.model.PropertyKey;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.net.URL;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

@Controller
@RequestMapping("/graph")
public class NetworkController
{
	// This should be put in the application context, this is for testing purposes
	private static String PC2URL = "http://webservice.baderlab.org:48080/graph?";

	/**
	 * Cache for co-citations.
	 */
	private static Map<String, Map<String, Integer>> cocitationMap =
		new HashMap<String, Map<String, Integer>>();

	/**
	 * Accessor for new co-citations.
	 */
	private static CocitationManager cocitMan = new CocitationManager(30);

	@RequestMapping(value = "{type}/{genes}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
	public ResponseEntity<String> getEntityInJson(@PathVariable String type, @PathVariable String genes)
	{
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/json; charset=utf-8");

		JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");
		CytoscapeJsGraph graph = new CytoscapeJsGraph();

		// TODO: Use cpath2 client for this
		String biopaxUrl = PC2URL;
		for (String gene : genes.split(","))
		{
			biopaxUrl += "source=" + gene + "&";
		}
		biopaxUrl += "kind=neighborhood";

		HashSet<String> nodeNames = new HashSet<String>();

		SimpleIOHandler ioHandler = new SimpleIOHandler();
		try
		{
			URL url = new URL(biopaxUrl);
			URLConnection urlConnection = url.openConnection();
			Model model = ioHandler.convertFromOWL(urlConnection.getInputStream());

			// the Pattern framework can generate SIF too
			SIFSearcher searcher = new SIFSearcher(
				new ControlsStateChangeMiner(),
				new ControlsStateChangeButIsParticipantMiner(),
				new ConsecutiveCatalysisMiner(null), // todo pass black list here
//				new InSameComplexMiner(), // add this line after implementing ranking
				new DegradesMiner()
			);

			for (SIFInteraction sif : searcher.searchSIF(model))
			{
				String srcName = sif.source;
				String targetName = sif.target;

					nodeNames.add(srcName);
					nodeNames.add(targetName);

					CytoscapeJsEdge edge = new CytoscapeJsEdge();
					edge.getData().put(PropertyKey.ID.toString(), srcName + targetName);
					edge.getData().put(PropertyKey.SOURCE.toString(), srcName);
					edge.getData().put(PropertyKey.TARGET.toString(), targetName);


					edge.getData().put(PropertyKey.CITED.toString(), getCocitations(srcName, targetName));
					graph.getEdges().add(edge);
//				}
			}

			for (String nodeName : nodeNames)
			{
				CytoscapeJsNode node = new CytoscapeJsNode();
				node.getData().put(PropertyKey.ID.toString(), nodeName);
				node.getData().put(PropertyKey.CITED.toString(), getTotalCocitations(nodeName));
				graph.getNodes().add(node);
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}

		return new ResponseEntity<String>(
			jsonSerializer.deepSerialize(graph),
			headers,
			HttpStatus.OK
		);
	}

	private String extractName(XReferrable referrable)
	{
		for (Xref xref : referrable.getXref())
		{
			if (xref.getDb().equalsIgnoreCase("HGNC Symbol"))
			{
				return xref.getId();
			}
		}

		return null;
	}

	/**
	 * Gets co-citations of the given gene. Uses local cache if accessed in this run.
	 *
	 * @param gene gene symbol
	 * @return co-citations
	 */
	private Map<String, Integer> getCocitationMap(String gene)
	{
		if (!cocitationMap.containsKey(gene))
		{
			cocitationMap.put(gene, cocitMan.getCocitations(gene));
		}

		return cocitationMap.get(gene);
	}

	/**
	 * Gets the co-citations of two genes.
	 *
	 * @param gene1 first gene
	 * @param gene2 second gene
	 * @return co-citations
	 */
	private int getCocitations(String gene1, String gene2)
	{
		Map<String, Integer> map = getCocitationMap(gene1);
		if (map != null && map.containsKey(gene2))
		{
			return map.get(gene2);
		} else return 0;
	}

	/**
	 * Calculates the total co-citations of a given gene. This value is useful for co-citation count
	 * normalizations purposes.
	 *
	 * @param gene gene symbol
	 * @return total co-citations
	 */
	private int getTotalCocitations(String gene)
	{
		Map<String, Integer> map = getCocitationMap(gene);
		if (map == null) return 0;

		int cnt = 0;
		for (Integer i : map.values())
		{
			cnt += i;
		}
		return cnt;
	}
}
