package org.pathwaycommons.pcviz.cbioportal;

import java.util.*;

/**
 * @author Ozgun Babur
 */
public class Summary
{
	public static double mean(double[] x, double[] weight)
	{
		assert x.length == weight.length;

		double totalW = sum(weight);
		double avg = 0;
		for (int i = 0; i < x.length; i++)
		{
			avg += x[i] * weight[i];
		}
		avg /= totalW;
		return avg;
	}

	public static double mean(double[] x)
	{
		if (x.length == 0) return Double.NaN;
		if (x.length == 1) return x[0];

		double total = 0;

		for (double v : x)
		{
			total += v;
		}
		return total / x.length;
	}

	public static double mean(Double[] x)
	{
		if (x.length == 0) return Double.NaN;

		double total = 0;

		for (double v : x)
		{
			total += v;
		}
		return total / x.length;
	}

	public static double absoluteMean(double[] x)
	{
		if (x.length == 0) return Double.NaN;

		double total = 0;

		for (double v : x)
		{
			total += Math.abs(v);
		}
		return total / x.length;
	}

	public static int minIndex(double[] v)
	{
		double min = Double.MAX_VALUE;
		int ind = -1;

		for (int i = 0; i < v.length; i++)
		{
			if (v[i] < min)
			{
				min = v[i];
				ind = i;
			}
		}
		return ind;
	}
	
	public static int maxIndex(double[] v)
	{
		double max = -Double.MAX_VALUE;
		int ind = -1;

		for (int i = 0; i < v.length; i++)
		{
			if (v[i] > max)
			{
				max = v[i];
				ind = i;
			}
		}
		return ind;
	}

	public static double geometricMean(double[] x)
	{
		if (x.length == 0) return Double.NaN;

		double mult = 1;

		for (double v : x)
		{
			mult *= Math.abs(v);
		}
		return Math.pow(mult, 1D / x.length);
	}

	public static double meanOrderWeighted(double[] x)
	{
		if (x.length == 0) return Double.NaN;

		double total = 0;

		for (int i = 0; i < x.length; i++)
		{
			total += x[i] * (x.length - i);
		}
		return total / ((x.length * (x.length + 1)) / 2);
	}

	public static double mean(double[] x, int[] inds)
	{
		assert x != null;
		assert inds != null;

		if (x.length == 0 || inds.length == 0) return Double.NaN;
		assert x.length >= inds.length;

		double total = 0;

		for (int ind : inds)
		{
			total += x[ind];
		}

		return total / inds.length;
	}

	public static double mean(List<Integer> list)
	{
		return sumOfInts(list) / (double) list.size();
	}

	public static double meanOfDoubles(List<Double> list)
	{
		return sum(list) / list.size();
	}

	public static double max(double... x)
	{
		if (x.length == 0) return Double.NaN;

		double max = -Double.MAX_VALUE;

		for (double v : x)
		{
			if (max < v) max = v;
		}
		return max;
	}

	public static int max(int... x)
	{
		if (x.length == 0) return Integer.MIN_VALUE;

		int max = Integer.MIN_VALUE;

		for (int v : x)
		{
			if (max < v) max = v;
		}
		return max;
	}

	public static int max(Collection<Integer> set)
	{
		if (set.isEmpty()) return Integer.MIN_VALUE;

		int max = Integer.MIN_VALUE;

		for (int v : set)
		{
			if (max < v) max = v;
		}
		return max;

	}

	public static int mult(int... x)
	{
		int res = 1;

		for (int i = 0; i < x.length; i++)
		{
			res *= x[i];
		}
		return res;
	}

	public static double min(double[] x)
	{
		if (x.length == 0) return Double.NaN;

		double min = Double.MAX_VALUE;

		for (double v : x)
		{
			if (min > v) min = v;
		}
		return min;
	}

	public static int min(int... x)
	{
		if (x.length == 0) return Integer.MAX_VALUE;

		int min = Integer.MAX_VALUE;

		for (int v : x)
		{
			if (min > v) min = v;
		}
		return min;
	}

	public static int min(Collection<Integer> x)
	{
		int min = Integer.MAX_VALUE;

		for (int v : x)
		{
			if (min > v) min = v;
		}
		return min;
	}

	public static int minButLast(int... x)
	{
		if (x.length == 0) return Integer.MAX_VALUE;

		int min = Integer.MAX_VALUE;

		for (int i = 0; i < x.length - 1; i++)
		{
			if (min > x[i]) min = x[i];
		}
		return min;
	}

	public static double median(double[] x)
	{
		if (x.length == 0) return Double.NaN;

		double[] v = new double[x.length];
		System.arraycopy(x, 0, v, 0, x.length);
		Arrays.sort(v);
		int i = v.length / 2;

		if (v.length % 2 == 1) return v[i];
		else return (v[i] + v[i + 1]) / 2;
	}

	public static double median(int[] x)
	{
		if (x.length == 0) return Double.NaN;

		int[] v = new int[x.length];
		System.arraycopy(x, 0, v, 0, x.length);
		Arrays.sort(v);
		int i = v.length / 2;

		if (v.length % 2 == 1) return v[i];
		else return (v[i] + v[i + 1]) / 2;
	}

	public static double stdev(double[] x)
	{
		return Math.sqrt(variance(x));
	}

	public static double stdev(double[] x, int[] ind)
	{
		return Math.sqrt(variance(x, ind));
	}

	public static double variance(double[] x)
	{
		double mean = Summary.mean(x);
		double var = 0;

		for (double v : x)
		{
			double term = v - mean;
			var += term * term;
		}

		var /= x.length;
		return var;
	}

	public static double variance(double[] x, int[] ind)
	{
		double mean = Summary.mean(x, ind);
		double var = 0;

		for (int i : ind)
		{
			double term = x[i] - mean;
			var += term * term;
		}

		var /= ind.length;
		return var;
	}

	public static double varLog(double[] x)
	{
		double[] loged = log(x);
		return variance(loged);
	}

	public static double[] log(double[] x)
	{
		double[] v = new double[x.length];
		for (int i = 0; i < v.length; i++)
		{
			v[i] = Math.log(x[i]);
		}
		return v;
	}

	public static int sum(int[] x)
	{
		int sum = 0;
		for (int i : x)
		{
			sum += i;
		}
		return sum;
	}

	public static int sumButLast(int[] x)
	{
		int sum = 0;
		for (int i = 0; i < x.length - 1; i++)
		{
			sum += x[i];
		}
		return sum;
	}

	public static double sum(double[] x)
	{
		double sum = 0;
		for (double i : x)
		{
			sum += i;
		}
		return sum;
	}

	public static int[] sum(List<int[]> singles)
	{
		int[] s = new int[singles.get(0).length];

		for (int[] cnt : singles)
		{
			for (int i = 0; i < s.length; i++)
			{
				s[i] += cnt[i];
			}
		}
		return s;
	}

	public static double sum(Collection<Double> vals)
	{
		double sum = 0;

		for (Double val : vals)
		{
			sum += val;
		}
		return sum;
	}

	public static int sumOfInts(Collection<Integer> vals)
	{
		int sum = 0;

		for (Integer val : vals)
		{
			sum += val;
		}
		return sum;
	}

	/**
	 * Gets the number of true values in the given array.
	 * @param b array to count
	 * @return number of true
	 */
	public static int countTrue(boolean[] b)
	{
		int n = 0;
		for (boolean val : b)
		{
			if (val) n++;
		}
		return n;
	}

	/**
	 * This method is accurate only when n is large.
	 */
	public static double calcPval(double dif, double stdev, double n)
	{
		if (dif < 0) dif = -dif;
		double z = dif / (stdev / Math.sqrt(n));
		return calcPvalForZ(z);
	}

	static double calcPvalForZ(double z)
	{
		if (z > 5) return 0;

		double p2 = (((((.000005383*z+.0000488906)*z+.0000380036)*z+
			.0032776263)*z+.0211410061)*z+.049867347)*z+1;

		p2 = Math.pow(p2, -16);

		return p2;
	}

	/**
	 * sampson.byu.edu/courses/zscores.html
	 */
	static double calcZvalForP(double P)
	{
		double SPLIT=0.42;
		double A0=2.50662823884;
		double A1=-18.61500062529;
		double A2=41.39119773534;
		double A3=-25.44106049637;
		double B1=-8.47351093090;
		double B2=23.08336743743;
		double B3=-21.06224101826;
		double B4=3.13082909833;
		double C0=-2.78718931138;
		double C1=-2.29796479134;
		double C2=4.85014127135;
		double C3=2.32121276858;
		double D1=3.54388924762;
		double D2=1.63706781897;
		double ZERO=0;
		double ONE=1;
		double HALF=0.5;

		double Q = P-HALF;
		if (Math.abs(Q) <= SPLIT)
		{
			//
			//      0.08 < P < 0.92
			//
			double R = Q*Q;
			return Q*(((A3*R + A2)*R + A1)*R + A0)/((((B4*R + B3)*R + B2)*R + B1)*R + ONE);
		}
		//
		//      P < 0.08 OR P > 0.92, SET R = MIN(P,1-P)
		//   10
		double R = P;
		if (Q > ZERO) {R = ONE-P;}

		if (R>ZERO)
		{
			R = Math.sqrt(-Math.log(R));
			double PPND = (((C3*R + C2)*R + C1)*R + C0)/((D2*R + D1)*R + ONE);
			if (Q < ZERO) PPND = -PPND;
			return PPND;
		}
		//   20
		return ZERO;
	}

	public static double getIntersectionPoint(double[] vals1, double[] vals2)
	{
		if (vals1.length == 0 || vals2.length == 0) return Double.NaN;

		double m1 = mean(vals1);
		double m2 = mean(vals2);

		if (Double.isNaN(m1) || Double.isNaN(m2)) return Double.NaN;

		if (m1 > m2)
		{
			double[] temp = vals1;
			vals1 = vals2;
			vals2 = temp;
		}

		Arrays.sort(vals1);
		Arrays.sort(vals2);

		int c2 = 0;

		int c1 = vals1.length - 1;
		while(vals1[c1] > vals2[c2] && c1 > 0) c1--;
		if (vals1[c1] < vals2[c2]) c1++;

		double r2 = (c2 + 1) / (double) vals2.length;
		double r1 = (vals1.length - c1) / (double) vals1.length;

		while (r2 <= r1)
		{
			c2++;

			while(c1 < vals1.length && vals1[c1] < vals2[c2]) c1++;

			r2 = (c2 + 1) / (double) vals2.length;
			r1 = (vals1.length - c1) / (double) vals1.length;
		}

		if (c1 < vals1.length) while(c1 > 0 && vals1[c1] >= vals2[c2]) c1--;
		else c1--;

		int cc2 = c2;
		while (vals2[cc2] == vals2[c2] && cc2 > 0) cc2--;

		return (vals2[c2] + (vals2[cc2] == vals2[c2] ? vals1[c1] : Math.max(vals1[c1], vals2[cc2]))) / 2;
	}

	public static double calcChangeOfMean(double[] vals1, double[] vals2)
	{
		double m1 = mean(vals1);
		double m2 = mean(vals2);
		return m2 - m1;
	}

	public static boolean[] markOutliers(double[] vals)
	{
		boolean[] mark = new boolean[vals.length];
		double[] q = getQuartiles(vals);
		double h = (q[2] - q[0]) * 1.5;

		double min = q[0] - h;
		double max = q[2] + h;

		for (int i = 0; i < vals.length; i++)
		{
			mark[i] = vals[i] < min || vals[i] > max;
		}
		return mark;
	}

	public static boolean[] markOutliers(double[] vals, boolean highValues)
	{
		boolean[] mark = new boolean[vals.length];
		double[] q = getQuartiles(vals);
		double h = (q[2] - q[0]) * 1.5;

		double min = q[0] - h;
		double max = q[2] + h;

		for (int i = 0; i < vals.length; i++)
		{
			mark[i] = (!highValues && vals[i] < min) || (highValues && vals[i] > max);
		}
		return mark;
	}

	public static double[] getQuartiles(double[] vals)
	{
		double[] v = new double[vals.length];
		System.arraycopy(vals, 0, v, 0 , v.length);
		Arrays.sort(v);
		if (v.length % 2 == 0)
		{
			int half = v.length / 2;
			if (half % 2 == 0)
			{
				int quart = half / 2;
				return new double[]{(v[quart - 1] + v[quart]) / 2,
					(v[half - 1] + v[half]) / 2,
					(v[half + quart - 1] + v[half + quart]) / 2};
			}
			else
			{
				int quart = half / 2;
				return new double[]{v[quart], (v[half - 1] + v[half]) / 2,
					v[half + quart]};
			}
		}
		else if ((v.length - 1) % 4 == 0)
		{
			int n = (v.length - 1) / 4;
			return new double[]{(0.25 * v[n-1]) + (0.75 * v[n]), v[v.length / 2],
				(0.75 * v[3 * n]) + (0.25 * v[(3 * n) + 1])};
		}
		else
		{
			assert (v.length - 3) % 4 == 0;

			int n = (v.length - 3) / 4;
			return new double[]{(0.75 * v[n]) + (0.75 * v[n+1]), v[v.length / 2],
				(0.25 * v[(3 * n) + 1]) + (0.75 * v[(3 * n) + 2])};
		}
	}
}