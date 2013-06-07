package org.pathwaycommons.pcviz.model;

/**
 * @author Ozgun Babur
 */
public enum PropertyKey
{
	ID,
	SOURCE,
	TARGET,
	CITED,
    ISVALID,
    ISSEED,
    ISDIRECTED,
    TYPE,
    IMPORTANCE,
	PUBMED;

	@Override
	public String toString()
	{
		return super.toString().toLowerCase();
	}
}
