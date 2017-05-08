package org.pathwaycommons.pcviz.cbioportal;

import org.biopax.paxtools.query.model.Node;
import org.biopax.paxtools.query.wrapperL3.EdgeL3;

/**
 * @author Ozgun Babur
 */
public class Edge extends EdgeL3
{
	private int sign;
	
	public Edge(org.biopax.paxtools.query.model.Node source, Node target, Graph graph)
	{
		super(source, target, graph);
		this.sign = 1;
	}

	@Override
	public int getSign()
	{
		return sign;
	}

	public void setSign(int sign)
	{
		this.sign = sign;
	}
}
