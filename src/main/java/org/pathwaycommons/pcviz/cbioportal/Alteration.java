package org.pathwaycommons.pcviz.cbioportal;

import java.io.Serializable;

/**
 * @author Ozgun Babur
 */
public enum Alteration implements Serializable
{
	ANY(false, true, "All alterations"),
	COPY_NUMBER(true, false, "Copy number change"),
	CONFIRMED_COPY_NUMBER(true, true, "Copy number change confirmed with expression"),
	MUTATION(true, false, "Mutation"),
	METHYLATION(true, false, "Methylation"),
	EXPRESSION(false, false, "Expression change"),
	PROTEIN_LEVEL(false, false, "Protein concentration change"),
	NON_GENOMIC(false, true, "Non-genomic change"),
	GENOMIC(true, true, "Genomic change"),
	ACTIVATING(false, true, "Activating change"),
	INHIBITING(false, true, "Inhibiting change");

	boolean genomic;
	boolean summary;
	String name;

	private Alteration(boolean genomic, boolean summary, String name)
	{
		this.genomic = genomic;
		this.summary = summary;
		this.name = name;
	}

	public boolean isGenomic()
	{
		return genomic;
	}

	public boolean isSummary()
	{
		return summary;
	}

	public String getName()
	{
		return name;
	}
}
