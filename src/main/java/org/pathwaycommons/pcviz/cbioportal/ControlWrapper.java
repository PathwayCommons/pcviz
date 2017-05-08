package org.pathwaycommons.pcviz.cbioportal;

import org.biopax.paxtools.model.level3.Control;
import org.biopax.paxtools.model.level3.Conversion;
import org.biopax.paxtools.query.model.AbstractNode;

/**
 * @author Ozgun Babur
 */
public class ControlWrapper extends org.biopax.paxtools.query.wrapperL3.ControlWrapper
	implements Node
{
	protected ControlWrapper(Control ctrl, Graph graph)
	{
		super(ctrl, graph);
	}

	@Override
	public void initDownstream()
	{
		for (org.biopax.paxtools.model.level3.Process prc : ctrl.getControlled())
		{
			if (prc instanceof Conversion || prc instanceof Control)
			{
				AbstractNode node = (AbstractNode) graph.getGraphObject(prc);
				Edge edge = new Edge(this, node, (Graph) graph);
				edge.setSign(this.getSign());
				node.getUpstreamNoInit().add(edge);
				getDownstreamNoInit().add(edge);
			}
		}
	}

	@Override
	public AlterationPack getAlterations()
	{
		return null;
	}
}
