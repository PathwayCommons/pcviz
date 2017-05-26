package org.pathwaycommons.pcviz.cbioportal;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.*;

/**
 * Common functions related to arrays.
 *
 * @author Ozgun Babur
 */
public class ArrayUtil
{
	public static boolean[] negate(boolean[] posit)
	{
		boolean[] neg = new boolean[posit.length];
		for (int i = 0; i < posit.length; i++)
		{
			neg[i] = !posit[i];
		}
		return neg;
	}

	public static int countValue(boolean[] b, boolean val)
	{
		int cnt = 0;
		for (boolean v : b)
		{
			if (v == val) cnt++;
		}
		return cnt;
	}

	public static int countValue(int[] b, int val)
	{
		int cnt = 0;
		for (int v : b)
		{
			if (v == val) cnt++;
		}
		return cnt;
	}

	/**
	 * Count of indexes where both arrays have the value.
	 */
	public static int countValue(boolean[] b1, boolean[] b2, boolean val)
	{
		int cnt = 0;
		for (int i = 0; i < b1.length; i++)
		{
			if (b1[i] == val && b2[i] == val) cnt++;
		}
		return cnt;
	}

	public static void ORWith(boolean[] toChange, boolean[] toAdd)
	{
		if (toChange.length != toAdd.length) throw new IllegalArgumentException(
			"Array sizes have to be equal.");

		for (int i = 0; i < toAdd.length; i++)
		{
			if (toAdd[i]) toChange[i] = true;
		}
	}

	public static void ANDWith(boolean[] toChange, boolean[] toAdd)
	{
		if (toChange.length != toAdd.length) throw new IllegalArgumentException(
			"Array sizes have to be equal.");

		for (int i = 0; i < toAdd.length; i++)
		{
			toChange[i] = toAdd[i] && toChange[i];
		}
	}

	public static boolean[] getAND(boolean[] b1, boolean[] b2)
	{
		if (b1.length != b2.length) throw new IllegalArgumentException(
			"Array sizes have to be equal.");

		boolean[] b = new boolean[b1.length];

		for (int i = 0; i < b2.length; i++)
		{
			b[i] = b2[i] && b1[i];
		}
		return b;
	}

	public static double[] subset(double[] vals, boolean[] select)
	{
		assert vals.length == select.length;

		List<Double> list = new ArrayList<Double>();
		for (int i = 0; i < vals.length; i++)
		{
			if (select[i] && !Double.isNaN(vals[i])) list.add(vals[i]);
		}
		double[] sub = new double[list.size()];

		int i = 0;
		for (Double val : list)
		{
			sub[i++] = val;
		}
		return sub;
	}

	public static <T> boolean[] getLocations(T[] array, T query)
	{
		boolean[] loc = new boolean[array.length];
		for (int i = 0; i < array.length; i++)
		{
			loc[i] = array[i].equals(query);
		}
		return loc;
	}

	public static <T> int indexOf(T[] array, T query)
	{
		for (int i = 0; i < array.length; i++)
		{
			if (array[i].equals(query)) return i;
		}
		return -1;
	}

	public static int[] toArray(List<Integer> vals, int dummy)
	{
		int[] array = new int[vals.size()];
		int i = 0;
		for (Integer val : vals)
		{
			array[i++] = val;
		}
		return array;
	}

	public static double[] toArray(List<Double> vals, double dummy)
	{
		double[] array = new double[vals.size()];
		int i = 0;
		for (Double val : vals)
		{
			array[i++] = val;
		}
		return array;
	}

	public static double[] toDouble(String[] s)
	{
		double[] v = new double[s.length];
		for (int i = 0; i < s.length; i++)
		{
			try
			{
				v[i] = Double.parseDouble(s[i]);
			}
			catch (NumberFormatException e)
			{
				v[i] = Double.NaN;
			}
		}
		return v;
	}

	public static double[] toPrimitive(Double[] vals)
	{
		double[] v = new double[vals.length];
		for (int i = 0; i < v.length; i++)
		{
			v[i] = vals[i];
		}
		return v;
	}

	public static void prepareForBoxPlotR(List<double[]> vals, List<String> colNames, String filename) throws IOException
	{
		BufferedWriter writer = new BufferedWriter(new FileWriter(filename));
		String s = "";
		for (String colName : colNames)
		{
			s += colName + "\t";
		}
		writer.write(s.trim());

		int size = 0;
		for (double[] val : vals)
		{
			if (val.length > size) size = val.length;
		}

		for (int i = 0; i < size; i++)
		{
			writer.write("\n");

			s = "";
			for (double[] val : vals)
			{
				if (val.length > i) s += val[i] + "";
				s += "\t";
			}
			s = s.substring(0, s.length() - 1);
			writer.write(s);
		}

		writer.close();
	}

	public static double[] convertToRanks(double[] vals)
	{
		double[] d = new double[vals.length];
		double[] r = new double[vals.length];
		System.arraycopy(vals, 0, d, 0, vals.length);
		Arrays.sort(d);
		for (int i = 0; i < d.length; i++)
		{
			int j = i;
			while (j < d.length - 1 && d[i] == d[j]) j++;

			double rank = 0;

			for (int k = i; k <= j; k++)
			{
				rank += k;
			}

			rank /= j - i + 1;

			for (int k = i; k <= j; k++)
			{
				r[k] = rank;
			}
		}
		Map<Double, Double> rankMap = new HashMap<Double, Double>();
		for (int i = 0; i < d.length; i++)
		{
			rankMap.put(d[i], r[i]);
		}

		for (int i = 0; i < vals.length; i++)
		{
			r[i] = rankMap.get(vals[i]);
		}
		return r;
	}
}
