package org.pathwaycommons.pcviz.cbioportal;

import org.biopax.paxtools.model.level3.Xref;

import java.util.Map;

/**
 * Some common function for alteration providers.
 * 
 * @author Ozgun Babur
 */
public abstract class AlterationProviderAdaptor implements AlterationProvider
{
	protected Map<String, AlterationPack> memory;

	protected void memorize(String id, AlterationPack pack)
	{
		memory.put(id, pack);
	}
	
	protected AlterationPack getFromMemory(String id)
	{
		return memory.get(id);
	}
	
	protected String getEntrezGeneID(Node node)
	{
		if (node instanceof PhysicalEntityWrapper)
		{
			PhysicalEntityWrapper pew = (PhysicalEntityWrapper) node;
			for (Xref xref : pew.getXRefs())
			{
				if (xref.getDb().equalsIgnoreCase("Entrez Gene"))
				{
					return xref.getId();
				}
			}
		}
		return null;
	}
}
