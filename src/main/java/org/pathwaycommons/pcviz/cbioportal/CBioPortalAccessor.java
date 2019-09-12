package org.pathwaycommons.pcviz.cbioportal;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pathwaycommons.pcviz.service.GeneNameService;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;

/**
 * @author Arman Aksoy
 * @author Ozgun Babur
 * @author Igor Rodchenkov (merged together the accessor and manager, refactored)
 */
public class CBioPortalAccessor extends AlterationProviderAdaptor
{
	private static Log log = LogFactory.getLog(CBioPortalAccessor.class);

	protected final static String COMMAND = "cmd=";
	protected final static String DELIMITER = "\t";
	protected final static String NOT_FOUND_FILENAME = "NOTFOUND";

	private final List<CancerStudy> cancerStudies;
	private final Map<String, CancerStudy> cancerStudiesById;
	private final Map<String, GeneticProfile> geneticProfilesById;
	private final Map<String, CaseList> caseListsById;
	private final Map<CancerStudy, List<GeneticProfile>> geneticProfilesCache;
	private final Map<CancerStudy, List<CaseList>> caseListCache;
	private final Set<CaseList> validatedCaseLists;

	private List<GeneticProfile> currentGeneticProfiles;
	private GeneNameService geneNameService;
	private CBioPortalOptions options;
	private String cacheDir;

	private Map<String, Set<String>> notFoundMap;

	static String portalURL = "https://www.cbioportal.org/webservice.do?";

	private CancerStudy currentCancerStudy;
	private CaseList currentCaseList;

	public void setCacheDir(String cacheDir)
	{
		this.cacheDir = cacheDir;
	}

	public void setGeneNameService(GeneNameService geneNameService) {
		this.geneNameService = geneNameService;
	}

	public CBioPortalAccessor()
	{
		cancerStudies = new ArrayList<CancerStudy>();
		geneticProfilesCache = new HashMap<CancerStudy, List<GeneticProfile>>();
		caseListCache = new HashMap<CancerStudy, List<CaseList>>();
		currentGeneticProfiles = new ArrayList<GeneticProfile>();
		memory = new HashMap<String, AlterationPack>();
		validatedCaseLists = new HashSet<CaseList>();
		cancerStudiesById = new HashMap<String, CancerStudy>();
		caseListsById = new HashMap<String, CaseList>();
		geneticProfilesById = new HashMap<String, GeneticProfile>();
		setOptions(new CBioPortalOptions());
	}

	public CBioPortalAccessor(PortalDataset dataset) throws IOException
	{
		this();

		CancerStudy selectStudy = null;
		for (CancerStudy study : cancerStudies)
		{
			if (study.getStudyId().equals(dataset.getCancerStudyID()))
			{
				selectStudy = study;
				break;
			}
		}
		if (selectStudy != null) setCurrentCancerStudy(selectStudy);
		else throw new IllegalArgumentException("study not found: " + dataset.getCancerStudyID());

		CaseList selectList = null;
		for (CaseList list : getCaseListsForCurrentStudy())
		{
			if (list.getId().equals(dataset.getCaseListID()))
			{
				selectList = list;
				break;
			}
		}

		if (selectList != null) setCurrentCaseList(selectList);
		else throw new IllegalArgumentException("case list not found: " + dataset.getCaseListID());

		List<GeneticProfile> profiles = new ArrayList<GeneticProfile>(dataset.getProfileID().length);
		List<GeneticProfile> available = getGeneticProfilesForCurrentStudy();
		for (String profID : dataset.getProfileID())
		{
			GeneticProfile selectProf = null;
			for (GeneticProfile prof : available)
			{
				if (prof.getId().equals(profID))
				{
					selectProf = prof;
					break;
				}
			}

			if (selectProf != null) profiles.add(selectProf);
			else throw new IllegalArgumentException("profile not found: " + profID);
		}
		assert profiles.size() == dataset.getProfileID().length;

		setCurrentGeneticProfiles(profiles);
	}

	public void initializeStudies() throws IOException
	{
		for (CancerStudy study : getAllCancerStudies())
		{
			cancerStudies.add(study);
			cancerStudiesById.put(study.getStudyId(), study);
		}
		assert !cancerStudies.isEmpty();
	}

	public void setOptions(CBioPortalOptions cBioPortalOptions)
	{
		this.options = cBioPortalOptions;
	}

	public CBioPortalOptions getOptions()
	{
		return options;
	}

	public CaseList getCaseListById(String id)
	{
		return caseListsById.get(id);
	}

	public CancerStudy getCancerStudyById(String id)
	{
		return cancerStudiesById.get(id);
	}

	private Change[] mergeChanges(Change[] changes1, Change[] changes2)
	{
		assert changes1.length == changes2.length;

		Change[] consChanges = new Change[changes1.length];

		for (int i = 0; i < changes1.length; i++)
		{
			Change c1 = changes1[i];
			Change c2 = changes2[i];
			Change consensus;

			if (c1.equals(c2))
				consensus = c1;
			else if (c1.equals(Change.NO_DATA))
				consensus = c2;
			else if (c2.equals(Change.NO_DATA))
				consensus = c1;
			else if (c1.equals(Change.NO_CHANGE))
				consensus = c2;
			else if (c2.equals(Change.NO_CHANGE))
				consensus = c1;
			else
			{
				log.warn("Conflicting values on sample " + i + ": " + c1 + " vs " + c2
					+ ". Accepting the first value.");
				consensus = c1;
			}

			consChanges[i] = consensus;
		}

		return consChanges;
	}

	private Change[] getDataForCurrentStudy(GeneticProfile geneticProfile, String symbol, CaseList caseList)
		throws IOException
	{
		assert symbol != null && !symbol.isEmpty();

		String s = geneNameService.getSymbol(symbol);
		if (s != null) symbol = s;

		Map<String, Change> changesMap = new HashMap<String, Change>();

		String[] data = getDataForGene(symbol, geneticProfile, caseList);
		if (data == null) return null;

		if (data.length != caseList.getCases().length)
		{
			log.error("Data length and caselist length " +
				"do not match. Data: " + data.length + "  " + "caselist: " +
				caseList.getCases().length + "\nTime to delete the cache!");
			return null;
		}

		for (int j = 0; j < data.length; j++)
		{
			Change ch = inferChange(geneticProfile, data[j]);
			changesMap.put(caseList.getCases()[j], ch);
		}

		Change[] changes = new Change[caseList.getCases().length];
		int counter = 0;
		for (String aCase : caseList.getCases())
		{
			Change change = changesMap.get(aCase);
			changes[counter++] = change == null ? Change.NO_DATA : change;
		}

		return changes;
	}

	private Change inferChange(GeneticProfile geneticProfile, String dataPoint)
	{
		// TODO: Discuss these steps further
		switch (ProfileType.convertToAlteration(geneticProfile.getType()))
		{
			case MUTATION:
				return isNaN(dataPoint) ? Change.NO_CHANGE :
					dataPoint.contains("fs") || dataPoint.contains("splice") ||
						dataPoint.contains(">") || dataPoint.contains("del") ||
						dataPoint.contains("-") || dataPoint.contains("+") ||
						dataPoint.contains("*") ? Change.INHIBITING :
						Change.UNKNOWN_CHANGE;
			case METHYLATION:
				Double methylationThreshold = options.get(CBioPortalOptions.PORTAL_OPTIONS.METHYLATION_THRESHOLD);
				return isNaN(dataPoint) ? Change.NO_DATA :
					(Double.parseDouble(dataPoint) > methylationThreshold ? Change.INHIBITING : Change.NO_CHANGE);
			case COPY_NUMBER:
				if (isNaN(dataPoint)) return Change.NO_DATA;
				else
				{
					Double value = Double.parseDouble(dataPoint);
					if (value <= options.get(CBioPortalOptions.PORTAL_OPTIONS.CNA_LOWER_THRESHOLD))
						return Change.INHIBITING;
					else if (value >= options.get(CBioPortalOptions.PORTAL_OPTIONS.CNA_UPPER_THRESHOLD))
						return Change.ACTIVATING;
					else
						return Change.NO_CHANGE;
				}
			case EXPRESSION:
				if (isNaN(dataPoint)) return Change.NO_DATA;
				else
				{
					Double value = Double.parseDouble(dataPoint);

					if (value > options.get(CBioPortalOptions.PORTAL_OPTIONS.EXP_UPPER_THRESHOLD))
						return Change.ACTIVATING;
					else if (value < options.get(CBioPortalOptions.PORTAL_OPTIONS.EXP_LOWER_THRESHOLD))
						return Change.INHIBITING;
					else
						return Change.NO_CHANGE;
				}
			case PROTEIN_LEVEL:
				if (isNaN(dataPoint))
					return Change.NO_DATA;
				else
				{
					Double value = Double.parseDouble(dataPoint);

					if (value > options.get(CBioPortalOptions.PORTAL_OPTIONS.RPPA_UPPER_THRESHOLD))
						return Change.ACTIVATING;
					else if (value < options.get(CBioPortalOptions.PORTAL_OPTIONS.RPPA_LOWER_THRESHOLD))
						return Change.INHIBITING;
					else
						return Change.NO_CHANGE;
				}
				// TODO: How to analyze?
			case NON_GENOMIC:
			case ANY:
		}

		return Change.NO_CHANGE;
	}

	final String[] NULLS = new String[]{"", "NaN", "NA", "null"};

	private boolean isNaN(String s)
	{
		if (s == null) return true;
		s = s.trim();
		for (String val : NULLS)
		{
			if (s.equalsIgnoreCase(val)) return true;
		}
		return false;
	}

	@Override
	public AlterationPack getAlterations(Node node)
	{
		String symbol = getGeneSymbol(node);
		if (symbol != null)
		{
			return getAlterations(symbol);
		}

		return null;
	}

	public AlterationPack getAlterations(String symbol)
	{
		if (symbol == null || symbol.isEmpty()) throw new IllegalArgumentException(
			"symbol cannot be null or empty. symbol = " + symbol);

		// Use cached value if there is any
		AlterationPack alterationPack = getFromMemory(symbol);
		if (alterationPack != null) return alterationPack;

		alterationPack = new AlterationPack(symbol);

		// A few sanity checks
		CancerStudy cancerStudy = currentCancerStudy;
		if (!getCancerStudies().contains(cancerStudy))
		{
			String message = "Current cancer study is not valid: "
				+ (cancerStudy == null ? "null" : cancerStudy.getName());
			log.error(message);
			throw new IllegalArgumentException(message);
		} else try
		{
			if (!getCaseListsForCurrentStudy().contains(getCurrentCaseList()))
			{
				CaseList caseList = getCurrentCaseList();
				String message = "Current case list is not valid :"
					+ (caseList == null ? "null" : caseList.getDescription());
				log.error(message);
				throw new IllegalArgumentException(message);
			} else if (getCurrentGeneticProfiles().isEmpty())
			{
				log.warn("Current genetic profiles do not have any elements in it!");
			}
		} catch (IOException e)
		{
			throw new IllegalArgumentException(e.getMessage());
		}

		// Now to the genetic profile analyses
		for (GeneticProfile geneticProfile : currentGeneticProfiles)
		{
			if (!getCurrentGeneticProfiles().contains(geneticProfile))
			{
				log.warn("the genetic profile "
					+ geneticProfile.getId() + " is not in the available profiles list. Skipping.");
				continue;
			}

			Change[] changes;
			try
			{
				changes = getDataForCurrentStudy(geneticProfile, symbol, currentCaseList);
			} catch (IOException e)
			{
				log.error("Could not get data for genetic profile " + geneticProfile.getId()
					+ ". Skipping...");
				continue;
			}

			if (changes == null)
			{
				if (log.isInfoEnabled()) log.info("Could not get data for symbol " + symbol +
					" and genetic profile " + geneticProfile.getId() + ". Skipping...");

				continue;
			}

			Alteration alteration = ProfileType.convertToAlteration(geneticProfile.getType());
			if (alteration == null)
			{
				System.err.println("Unsupported alteration = " + geneticProfile.getType());
			}

			Change[] altChanges = alterationPack.get(alteration);
			if (altChanges == null)
				alterationPack.put(alteration, changes);
			else
				alterationPack.put(alteration, mergeChanges(altChanges, changes));
		}

		if (alterationPack.getAlterationTypes().isEmpty())
		{
			return null;
		}

		memorize(symbol, alterationPack);

		if (alterationPack.getSize() != currentCaseList.getCases().length)
		{
			System.err.println("Time to clear cache!");
			System.err.println("Cached sample size = " + alterationPack.getSize());
			System.err.println("Current sample size = " + currentCaseList.getCases().length);
		}

		return alterationPack;
	}

	public List<CaseList> getCaseListsForCurrentStudy() throws IOException
	{
		List<CaseList> caseLists = caseListCache.get(getCurrentCancerStudy());
		if (caseLists != null)
		{
			for (CaseList caseList : caseLists)
				caseListsById.put(caseList.getId(), caseList);
			return caseLists;
		}

		caseLists = getCaseListsForStudy(getCurrentCancerStudy());
		for (CaseList caseList : caseLists)
		{
			caseListsById.put(caseList.getId(), caseList);
		}

		caseListCache.put(getCurrentCancerStudy(), caseLists);
		return caseLists;
	}

	public List<CancerStudy> getCancerStudies()
	{
		return cancerStudies;
	}

	public CancerStudy getCurrentCancerStudy()
	{
		return currentCancerStudy;
	}

	public void setCurrentCancerStudy(CancerStudy currentCancerStudy)
	{
		if (!cancerStudies.contains(currentCancerStudy))
			throw new IllegalArgumentException("This cancer study is not available through the initialized list.");

		this.currentCancerStudy = currentCancerStudy;
		setCurrentCaseList(null);
		if (caseListsById != null)
			caseListsById.clear();
		getCurrentGeneticProfiles().clear();
		if (geneticProfilesById != null)
			geneticProfilesById.clear();

		memory.clear();

		// Try to load the associated genetic profiles and case lists for fast loading.
		try
		{
			getCaseListsForCurrentStudy();
			getGeneticProfilesForCurrentStudy();
		} catch (IOException e)
		{
			log.warn("Could not buffer case lists/genetic profiles for the current study:"
				+ currentCancerStudy.getStudyId());
		}
	}

	public List<GeneticProfile> getGeneticProfilesForCurrentStudy() throws IOException
	{
		List<GeneticProfile> geneticProfiles = geneticProfilesCache.get(getCurrentCancerStudy());
		if (geneticProfiles != null)
		{
			for (GeneticProfile geneticProfile : geneticProfiles)
				geneticProfilesById.put(geneticProfile.getId(), geneticProfile);
			return geneticProfiles;
		}

		geneticProfiles = getGeneticProfilesForStudy(getCurrentCancerStudy());
		for (GeneticProfile geneticProfile : geneticProfiles)
		{
			geneticProfilesById.put(geneticProfile.getId(), geneticProfile);
		}

		assert !geneticProfiles.isEmpty();
		geneticProfilesCache.put(getCurrentCancerStudy(), geneticProfiles);
		return geneticProfiles;
	}

	public void setCurrentCaseList(CaseList caseList)
	{
		try
		{
			List<CaseList> caseListsForCurrentStudy = getCaseListsForCurrentStudy();
			if (caseList == null || caseListsForCurrentStudy.contains(caseList))
			{
				currentCaseList = caseList;
			} else
			{
				throw new IllegalArgumentException("The case list is not available for current cancer study.");
			}
		} catch (IOException e)
		{
			throw new IllegalArgumentException("Cannot obtain the case lists for the current study.");
		}
	}

	public CaseList getCurrentCaseList()
	{
		return currentCaseList;
	}

	public List<GeneticProfile> getCurrentGeneticProfiles()
	{
		return currentGeneticProfiles;
	}

	public GeneticProfile getGeneticProfileContainingName(String name)
	{
		for (GeneticProfile gp : currentGeneticProfiles)
		{
			if (gp.getName().toLowerCase().contains(name)) return gp;
		}
		return null;
	}

	protected String getGeneSymbol(Node node)
	{
		String egid = getEntrezGeneID(node);
		if (egid != null)
			return geneNameService.getSymbol(egid);
		else
			return null;
	}

	public void clearAlterationCache()
	{
		memory.clear();
	}

	public void setCurrentGeneticProfiles(List<GeneticProfile> currentGeneticProfiles) {
		this.currentGeneticProfiles = currentGeneticProfiles;
		memory.clear();
	}


	// merged from used to be CBioPortalManager
	protected String[] downloadDataForGene(String symbol, GeneticProfile geneticProfile, CaseList caseList)
			throws IOException
	{
		String geneid = geneNameService.getID(symbol);
		String url = "getProfileData&case_set_id=" + caseList.getId() + "&"
				+ "genetic_profile_id=" + geneticProfile.getId() + "&"
				+ "gene_list=" + geneid;

		List<String[]> results = queryAndParseURL(url, false);

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
		for (String[] results : queryAndParseURL(url))
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

	private List<String[]> queryAndParseURL(String urlPostFix) throws IOException
	{
		return queryAndParseURL(urlPostFix, true);
	}

	private List<String[]> queryAndParseURL(String urlPostFix, boolean skipHeader) throws IOException
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
		for (String[] results : queryAndParseURL(url))
		{
			assert results.length == 6;
			GeneticProfile geneticProfile = new GeneticProfile(results[0], results[1], results[2], results[4]);
			geneticProfiles.add(geneticProfile);
		}

		assert !geneticProfiles.isEmpty();
		return geneticProfiles;
	}

	public List<CancerStudy> getAllCancerStudies() throws IOException
	{
		List<CancerStudy> studies = new ArrayList<CancerStudy>();
		String urlStr = "getCancerStudies";
		for (String[] result : queryAndParseURL(urlStr))
		{
//			assert result.length == 3;
			String sid = result[0];
			String sname = (result.length>1) ? result[1] : null;
			String sdsc = (result.length>2) ? result[2] : null;
			CancerStudy cancerStudy = new CancerStudy(sid,sname,sdsc);
			studies.add(cancerStudy);
		}
		return studies;
	}

	public void cacheData(String[] data, String symbol, GeneticProfile geneticProfile, CaseList caseList)
			throws IOException
	{
		Path dir = Paths.get(cacheDir, geneticProfile.getId(), caseList.getId());
		if(!Files.exists(dir)) {
			Files.createDirectories(dir);
		}

		Path casefile = Paths.get(dir.toString(),"cases.txt");
		if (!Files.exists(casefile))
		{
			BufferedWriter writer = Files.newBufferedWriter(casefile);
			StringBuilder sb = new StringBuilder();
			for (String aCase : caseList.getCases())
			{
				sb.append(aCase).append("\t");
			}
			writer.write(sb.toString().trim());
			writer.close();
		}

		Path url = Paths.get(dir.toString(),symbol);
		BufferedWriter writer = Files.newBufferedWriter(url);

		for (int i = 0; i < data.length; i++)
		{
			writer.write(data[i]);
			if (i < data.length - 1) writer.write(DELIMITER);
		}

		writer.close();
	}

	public String[] readDataInCache(String symbol, GeneticProfile geneticProfile, CaseList caseList)
	{
		Path url = Paths.get(cacheDir, geneticProfile.getId(), caseList.getId(), symbol);

		if (Files.exists(url))
		{
			try
			{
				if (!validatedCaseLists.contains(caseList))
					checkCaseListValidity(geneticProfile, caseList);

				BufferedReader reader = Files.newBufferedReader(url);
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
		Path file = Paths.get(cacheDir, geneticProfile.getId(),
				caseList.getId(), "cases.txt");

		if (Files.exists(file))
		{
			Scanner sc = new Scanner(Files.newInputStream(file));
			String[] token = sc.nextLine().split("\t");
			sc.close();
			String[] cases = caseList.getCases();

			if (cases.length != token.length)
			{
				log.error("CaseList in a different length! Previous: " + token.length + ", new: " + cases.length);
			}
			else
			{
				for (int i = 0; i < cases.length; i++)
				{
					if (!cases[i].equals(token[i]))
						log.error("Caselist mismatch at pos " + i + "! prev: " + token[i] + ", new:" + cases[i]);
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

		Path url = Paths.get(cacheDir, geneticProfile.getId(), caseList.getId(), NOT_FOUND_FILENAME);

		if (Files.exists(url))
		{
			try
			{
				BufferedReader reader = Files.newBufferedReader(url);
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
			throws IOException
	{
		String key = geneticProfile.getId() + caseList.getId();
		notFoundMap.get(key).add(symbol);

		Path dir = Paths.get(cacheDir, geneticProfile.getId(), caseList.getId());
		if(!Files.exists(dir)) {
			Files.createDirectories(dir);
		}

		Path url = Paths.get(cacheDir, geneticProfile.getId(),
				caseList.getId(), NOT_FOUND_FILENAME);

		if (Files.exists(url))
		{
			BufferedWriter writer = Files.newBufferedWriter(url, StandardOpenOption.APPEND);
			writer.write("\n" + symbol);
			writer.close();
		}
		else
		{
			BufferedWriter writer = Files.newBufferedWriter(url);
			writer.write(symbol);
			writer.close();
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
			if (isNotFound(symbol, geneticProfile, caseList))
				return null;

			String[] data = readDataInCache(symbol, geneticProfile, caseList);
			if(data != null)
				return data;

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
