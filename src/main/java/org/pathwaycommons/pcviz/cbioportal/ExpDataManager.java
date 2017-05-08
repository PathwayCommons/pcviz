package org.pathwaycommons.pcviz.cbioportal;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Reads and caches expression data from cBioPortal.
 *
 * @author Ozgun Babur
 */
public class ExpDataManager
{
	private GeneticProfile profile;
	private CaseList caseList;

	private Map<String, double[]> cache;
	private CBioPortalManager cman;
	private Set<String> notFound;

	private boolean takeLog = false;

	/**
	 * This constructor can be used if the accessor have only one profile, or the first one is the
	 * desired profile.
	 */
	public ExpDataManager(CBioPortalAccessor acc)
	{
		this(acc.getCurrentGeneticProfiles().get(0), acc.getCurrentCaseList());
	}

	public ExpDataManager(GeneticProfile profile, CaseList caseList)
	{
		this.profile = profile;
		this.caseList = caseList;

		cache = new HashMap<String, double[]>();
		cman = new CBioPortalManager();
		notFound = new HashSet<String>();
	}

	public CaseList getCaseList()
	{
		return caseList;
	}

	public void setTakeLog(boolean takeLog)
	{
		this.takeLog = takeLog;
	}

	public double[] get(String symbol)
	{
		if (notFound.contains(symbol)) return null;

		if (!cache.containsKey(symbol))
		{
			String[] data = cman.getDataForGene(symbol, profile, caseList);

			if (data != null) cache.put(symbol, stringToDouble(data));
		}

		if (cache.containsKey(symbol))
		{
			return cache.get(symbol);
		}
		else
		{
			notFound.add(symbol);
			return null;
		}
	}

	public boolean contains(String gene)
	{
		return get(gene) != null;
	}

	public double getNonZeroRatio(String gene)
	{
		if (!contains(gene)) return 0;
		double[] vals = get(gene);

		int zero = 0;
		for (double v : vals)
		{
			if (v == 0 || Double.isNaN(v)) zero++;
		}

		return 1 - zero / (double) vals.length;
	}

	private double[] stringToDouble(String[] data)
	{
		double[] d = new double[data.length];

		for (int i = 0; i < data.length; i++)
		{
			try
			{
				double val = Double.parseDouble(data[i]);
				d[i] = val;

				if (takeLog && !Double.isNaN(d[i]))
				{
					if (d[i] < 1) d[i] = 1;
					d[i] = log2(d[i]);
				}
			}
			catch (NumberFormatException e)
			{
				d[i] = Double.NaN;
			}
		}
		return d;
	}

	public static final double LOG2 = Math.log(2);
	private double log2(double val)
	{
		return Math.log(val) / LOG2;
	}
}
