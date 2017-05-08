package org.pathwaycommons.pcviz.cbioportal;

import java.util.Collection;

/**
 * @author Ozgun Babur
 */
public class CNVerifier
{
	private ExpDataManager expMan;
	private double pvalThr;

	public CNVerifier(ExpDataManager expMan, double pvalThr)
	{
		this.expMan = expMan;
		this.pvalThr = pvalThr;
	}

	public void verify(Collection<AlterationPack> packs)
	{
		for (AlterationPack alt : packs)
		{
			verify(alt);
		}
	}

	public void verify(AlterationPack alt)
	{
		if (alt != null && alt.get(Alteration.COPY_NUMBER) != null)
		{
			boolean[] select = getVerified(alt, Change.ACTIVATING);
			boolean[] other  = getVerified(alt, Change.INHIBITING);

			if (select == null) select = other;
			else if (other != null) ArrayUtil.ORWith(select, other);

			if (select == null) select = new boolean[alt.getSize()];

			Change[] cn = alt.get(Alteration.COPY_NUMBER);
			assert cn != null && cn.length == select.length : "alt id = " + alt.getId();
			for (int i = 0; i < cn.length; i++)
			{
				if (cn[i].isAltered() && !select[i]) cn[i] = Change.NO_CHANGE;
			}
		}
	}

	private boolean[] getVerified(AlterationPack alt, Change type)
	{
		Change[] cn = alt.get(Alteration.COPY_NUMBER);

		if (cn == null) return null;

		double[] exp = expMan.get(alt.getId());

		if (exp == null) return null;

		boolean[] noChLoc = ArrayUtil.getLocations(cn, Change.NO_CHANGE);
		boolean[] chLoc = ArrayUtil.getLocations(cn, type);

		double[] noChVals = ArrayUtil.subset(exp, noChLoc);
		double[] chVals = ArrayUtil.subset(exp, chLoc);

		if (noChVals.length == 0 || chVals.length == 0) return null;

		double change = Summary.calcChangeOfMean(noChVals, chVals);
		if ((type == Change.ACTIVATING && change < 0) ||
			(type == Change.INHIBITING && change > 0))
		{
			return null;
		}

		double p = StudentsT.getPValOfMeanDifference(noChVals, chVals);
		if (Double.isNaN(p) || p > pvalThr) return null;

		double val = Summary.getIntersectionPoint(chVals, noChVals);

		return select(chLoc, exp, val, type == Change.ACTIVATING);
	}

	private static boolean[] select(boolean[] considerLoc, double[] exp, double thr, boolean greaterThan)
	{
		boolean[] select = new boolean[exp.length];

		for (int i = 0; i < select.length; i++)
		{
			select[i] = considerLoc[i] && (greaterThan ? exp[i] > thr : exp[i] < thr);
		}
		return select;
	}
}
