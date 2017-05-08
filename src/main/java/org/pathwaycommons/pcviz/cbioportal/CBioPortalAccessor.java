package org.pathwaycommons.pcviz.cbioportal;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.IOException;
import java.util.*;

/**
 * @author Arman Aksoy
 * @author Ozgun Babur
 */
public class CBioPortalAccessor extends AlterationProviderAdaptor
{
	private static Log log = LogFactory.getLog(CBioPortalAccessor.class);

	protected CBioPortalManager man = new CBioPortalManager();
	protected CNVerifier cnVerifier;

	protected final static String DELIMITER = "\t";

	private List<CancerStudy> cancerStudies = new ArrayList<CancerStudy>();
	private CancerStudy currentCancerStudy = null;

	private Map<String, CancerStudy> cancerStudiesById = null;
	private Map<String, GeneticProfile> geneticProfilesById = null;
	private Map<String, CaseList> caseListsById = null;

	private Map<CancerStudy, List<GeneticProfile>> geneticProfilesCache
		= new HashMap<CancerStudy, List<GeneticProfile>>();
	private Map<CancerStudy, List<CaseList>> caseListCache = new HashMap<CancerStudy, List<CaseList>>();
	private CaseList currentCaseList = null;
	private List<GeneticProfile> currentGeneticProfiles = new ArrayList<GeneticProfile>();
	private CBioPortalOptions options;


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

	public CBioPortalAccessor() throws IOException
	{
		memory = new HashMap<String, AlterationPack>();
		setOptions(new CBioPortalOptions());
		initializeStudies();
		assert !cancerStudies.isEmpty();
	}

	private void initializeStudies() throws IOException
	{
		cancerStudiesById = new HashMap<String, CancerStudy>();

		for (CancerStudy study : man.getCancerStudies())
		{
			cancerStudies.add(study);
			cancerStudiesById.put(study.getStudyId(), study);
		}
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

		String s = EntrezGene.getSymbol(symbol);
		if (s != null) symbol = s;

		Map<String, Change> changesMap = new HashMap<String, Change>();

		String[] data = man.getDataForGene(symbol, geneticProfile, caseList);
		if (data == null) return null;

		if (data.length != caseList.getCases().length)
		{
			System.err.println("Data length and caselist length " +
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
//		alterationPack.complete();

		if (cnVerifier != null) cnVerifier.verify(alterationPack);

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
		caseListsById = new HashMap<String, CaseList>();
		List<CaseList> caseLists = caseListCache.get(getCurrentCancerStudy());
		if (caseLists != null)
		{
			for (CaseList caseList : caseLists)
				caseListsById.put(caseList.getId(), caseList);
			return caseLists;
		}

		caseLists = man.getCaseListsForStudy(getCurrentCancerStudy());
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
		geneticProfilesById = new HashMap<String, GeneticProfile>();
		List<GeneticProfile> geneticProfiles = geneticProfilesCache.get(getCurrentCancerStudy());
		if (geneticProfiles != null)
		{
			for (GeneticProfile geneticProfile : geneticProfiles)
				geneticProfilesById.put(geneticProfile.getId(), geneticProfile);
			return geneticProfiles;
		}

		geneticProfiles = man.getGeneticProfilesForStudy(getCurrentCancerStudy());
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

	public void setCurrentGeneticProfiles(List<GeneticProfile> geneticProfiles)
	{
		currentGeneticProfiles = geneticProfiles;
		memory.clear();
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
		if (egid != null) return EntrezGene.getSymbol(egid);
		return null;
	}

	public void clearAlterationCache()
	{
		memory.clear();
	}

	public static void setCacheDir(String cacheDir)
	{
		CBioPortalManager.setCacheDir(cacheDir);
	}
}
