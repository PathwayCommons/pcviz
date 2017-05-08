package org.pathwaycommons.pcviz.cbioportal;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.util.*;

/**
 * @author Arman Aksoy
 * @author Ozgun Babur
 */
public class CBioPortalManager
{
	private static Log log = LogFactory.getLog(CBioPortalManager.class);

	private static String cacheDir = "portal-cache";
	private static String portalURL = "http://www.cbioportal.org/public-portal/webservice.do?";

	protected final static String COMMAND = "cmd=";
	protected final static String DELIMITER = "\t";
	protected final static String NOT_FOUND_FILENAME = "NOTFOUND";

	private Map<String, Set<String>> notFoundMap;

	private Set<CaseList> validatedCaseLists;
	private boolean useCacheOnly = false;

	public CBioPortalManager()
	{
		validatedCaseLists = new HashSet<CaseList>();
	}

	public static void setCacheDir(String cacheDir)
	{
		CBioPortalManager.cacheDir = cacheDir;
	}

	protected String[] downloadDataForGene(String symbol, GeneticProfile geneticProfile, CaseList caseList)
		throws IOException
	{
		String geneid = EntrezGene.getID(symbol);
		String url = "getProfileData&case_set_id=" + caseList.getId() + "&"
			+ "genetic_profile_id=" + geneticProfile.getId() + "&"
			+ "gene_list=" + geneid;

		List<String[]> results = parseURL(url, false);

		if (results.size() < 2)
		{
			log.warn("Cannot get data for " + symbol);
			return null;
		}

		String firstCase = caseList.getCases()[0];
		int startIndex = 0;
		while (!firstCase.equals(results.get(0)[startIndex])) startIndex++;

		// DEBUG CODE
		String[] cases = results.get(0);
		for (int i = 0; i < caseList.getCases().length; i++)
		{
			assert cases[i+startIndex].equals(caseList.getCases()[i]);
		}
		// END OF DEBUG CODE


		String[] data = results.get(1);

		assert data.length > 2;

		String[] result = new String[data.length - startIndex];
		System.arraycopy(data, startIndex, result, 0, result.length);
		return result;
	}

	public List<CaseList> getCaseListsForStudy(CancerStudy study) throws IOException
	{
		List<CaseList> caseLists = new ArrayList<CaseList>();

		String url = "getCaseLists&cancer_study_id=" + study.getStudyId();
		for (String[] results : parseURL(url))
		{
			assert results.length == 5;
			String[] cases = results[4].split(" ");
			assert cases.length > 0;

			int startIndex = 0;
			while (cases[startIndex].equals("Hybridization") || cases[startIndex].equals("REF") ||
				cases[startIndex].equals("Composite.Element.REF")) startIndex++;

			if (startIndex > 0)
			{
				cases = Arrays.asList(cases).subList(startIndex, cases.length)
					.toArray(new String[cases.length - startIndex]);
			}

			CaseList caseList = new CaseList(results[0], results[1], cases);
			caseLists.add(caseList);
		}

		return caseLists;
	}

	private List<String[]> parseURL(String urlPostFix) throws IOException
	{
		return parseURL(urlPostFix, true);
	}

	private List<String[]> parseURL(String urlPostFix, boolean skipHeader) throws IOException
	{
		List<String[]> list = new ArrayList<String[]>();

		String urlStr = portalURL + COMMAND + urlPostFix;
		URL url = new URL(urlStr);
		URLConnection urlConnection = url.openConnection();
		Scanner scanner = new Scanner(urlConnection.getInputStream());

		int lineNum = 0;
		while (scanner.hasNextLine())
		{
			String line = scanner.nextLine();
			lineNum++;

			if (line.startsWith("#") || line.length() == 0 || (skipHeader && lineNum == 1))
				continue;

			list.add(line.split(DELIMITER));
		}

		return list;
	}

	public List<GeneticProfile> getGeneticProfilesForStudy(CancerStudy study) throws IOException
	{
		List<GeneticProfile> geneticProfiles = new ArrayList<GeneticProfile>();

		String url = "getGeneticProfiles" + "&cancer_study_id=" + study.getStudyId();
		for (String[] results : parseURL(url))
		{
			assert results.length == 6;
			GeneticProfile geneticProfile = new GeneticProfile(results[0], results[1], results[2], results[4]);
			geneticProfiles.add(geneticProfile);
		}

		assert !geneticProfiles.isEmpty();
		return geneticProfiles;
	}

	public List<CancerStudy> getCancerStudies() throws IOException
	{
		List<CancerStudy> studies = new ArrayList<CancerStudy>();
		String urlStr = "getCancerStudies";
		for (String[] result : parseURL(urlStr))
		{
			assert result.length == 3;
			CancerStudy cancerStudy = new CancerStudy(result[0], result[1], result[2]);
			studies.add(cancerStudy);
		}
		return studies;
	}

	public void cacheData(String[] data, String symbol, GeneticProfile geneticProfile,
		CaseList caseList)
	{
		String dir = cacheDir + File.separator + geneticProfile.getId() + File.separator +
			caseList.getId() + File.separator;

		File f = new File(dir);
		if (!f.exists()) f.mkdirs();

		String casefile = dir + "cases.txt";
		if (!(new File(casefile).exists()))
		{
			try
			{
				BufferedWriter writer = new BufferedWriter(new FileWriter(casefile));
				StringBuilder sb = new StringBuilder();
				for (String aCase : caseList.getCases())
				{
					sb.append(aCase).append("\t");
				}
				writer.write(sb.toString().trim());
				writer.close();
			}
			catch (IOException e)
			{
				e.printStackTrace();
			}
		}

		String url = dir  + symbol;
		try
		{
			BufferedWriter writer = new BufferedWriter(new FileWriter(url));

			for (int i = 0; i < data.length; i++)
			{
				writer.write(data[i]);
				if (i < data.length - 1) writer.write(DELIMITER);
			}

			writer.close();
		}
		catch (IOException e)
		{
			log.error("Cannot cache data for " + symbol, e);
		}
	}

	public String[] readDataInCache(String symbol, GeneticProfile geneticProfile, CaseList caseList)
	{
		String url = cacheDir + File.separator + geneticProfile.getId() + File.separator +
			caseList.getId() + File.separator + symbol;

		if (new File(url).exists())
		{
			try
			{
				if (!validatedCaseLists.contains(caseList))
					checkCaseListValidity(geneticProfile, caseList);

				BufferedReader reader = new BufferedReader(new FileReader(url));
				String line = reader.readLine();
				reader.close();
				return line.split(DELIMITER);
			}
			catch (IOException e)
			{
				log.error("Cannot read an existing file", e);
			}
		}
		return null;
	}

	private void checkCaseListValidity(GeneticProfile geneticProfile, CaseList caseList) throws IOException
	{
		String file = cacheDir + File.separator + geneticProfile.getId() + File.separator +
			caseList.getId() + File.separator + "cases.txt";

		if (new File(file).exists())
		{
			Scanner sc = new Scanner(new File(file));
			String[] token = sc.nextLine().split("\t");

			String[] cases = caseList.getCases();

			if (cases.length != token.length)
			{
				System.err.println("CaseList in a different length! Previous: " + token.length +
					", new: " + cases.length);
			}
			else
			{
				for (int i = 0; i < cases.length; i++)
				{
					if (!cases[i].equals(token[i])) System.err.println(
						"Caselist mismatch at pos " + i + "! prev: " + token[i] + ", new:" +
							cases[i]);
				}
			}
		}

		validatedCaseLists.add(caseList);
	}

	protected void readNotFoundInCache(GeneticProfile geneticProfile, CaseList caseList)
	{
		if (notFoundMap == null)
		{
			notFoundMap = new HashMap<String, Set<String>>();
		}

		String key = geneticProfile.getId() + caseList.getId();
		notFoundMap.put(key, new HashSet<String>());

		String url = cacheDir + File.separator + geneticProfile.getId() + File.separator +
			caseList.getId() + File.separator + NOT_FOUND_FILENAME;

		if (new File(url).exists())
		{
			try
			{
				BufferedReader reader = new BufferedReader(new FileReader(url));
				for (String line = reader.readLine(); line != null; line = reader.readLine())
				{
					if (!line.isEmpty()) notFoundMap.get(key).add(line);
				}
				reader.close();
			}
			catch (IOException e)
			{
				log.error("Cannot read an existing not-found file", e);
			}
		}
	}

	protected void addToNotFound(String symbol, GeneticProfile geneticProfile, CaseList caseList)
	{
		String key = geneticProfile.getId() + caseList.getId();
		notFoundMap.get(key).add(symbol);

		String url = cacheDir + File.separator + geneticProfile.getId() + File.separator +
			caseList.getId() + File.separator + NOT_FOUND_FILENAME;

		if (new File(url).exists())
		{
			try
			{
				BufferedWriter writer = new BufferedWriter(new FileWriter(url, true));
				writer.write("\n" + symbol);
				writer.close();
			}
			catch (IOException e)
			{
				log.error("Cannot append to not-found file", e);
			}
		}
		else
		{
			try
			{
				BufferedWriter writer = new BufferedWriter(new FileWriter(url));
				writer.write(symbol);
				writer.close();
			}
			catch (IOException e)
			{
				log.error("Cannot create not-found file", e);
			}
		}
	}

	protected boolean isNotFound(String symbol, GeneticProfile geneticProfile, CaseList caseList)
	{
		String key = geneticProfile.getId() + caseList.getId();
		if (notFoundMap == null || !notFoundMap.containsKey(key))
		{
			readNotFoundInCache(geneticProfile, caseList);
		}
		return notFoundMap.get(key).contains(symbol);
	}

	public String[] getDataForGene(String symbol, GeneticProfile geneticProfile, CaseList caseList)
	{
		assert symbol != null && !symbol.isEmpty();

		try
		{
			if (!useCacheOnly && isNotFound(symbol, geneticProfile, caseList)) return null;

			String[] data = readDataInCache(symbol, geneticProfile, caseList);
			if (data != null) return data;
			else if (useCacheOnly) return null;

			data = downloadDataForGene(symbol, geneticProfile, caseList);

			if (data != null)
			{
				cacheData(data, symbol, geneticProfile, caseList);
			}
			else
			{
				addToNotFound(symbol, geneticProfile, caseList);
			}
			return data;
		}
		catch (IOException e)
		{
			log.error("Cannot access to the data of " + symbol, e);
			return null;
		}
	}

}
