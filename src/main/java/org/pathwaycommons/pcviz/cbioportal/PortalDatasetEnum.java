package org.pathwaycommons.pcviz.cbioportal;


/**
 * @author Ozgun Babur
 */
public enum PortalDatasetEnum implements PortalDataset
{
	GLIOBLASTOMA_PUB_MUT_CN("gbm_tcga_pub", "gbm_tcga_pub_cnaseq", "gbm_tcga_pub_cna_consensus", "gbm_tcga_pub_mutations"),
	GLIOBLASTOMA_MUT_CNCALL_EXPZ("gbm_tcga", "gbm_tcga_3way_complete", "gbm_tcga_mutations", "gbm_tcga_gistic", "gbm_tcga_rna_seq_v2_mrna_median_Zscores"),
	GLIOBLASTOMA_EXP("gbm_tcga", "gbm_tcga_3way_complete", "gbm_tcga_rna_seq_v2_mrna"),

	ENDOMETRIAL_MUT_CN("ucec_tcga_pub", "ucec_tcga_pub_cnaseq", "ucec_tcga_pub_gistic", "ucec_tcga_pub_mutations"),
	ENDOMETRIAL_MUT("ucec_tcga_pub", "ucec_tcga_pub_sequenced", "ucec_tcga_pub_mutations"),
	ENDOMETRIAL_MUT_HYPER("ucec_tcga_pub", "ucec_tcga_pub_msi", "ucec_tcga_pub_mutations"),
	ENDOMETRIAL_MUT_ULTRA("ucec_tcga_pub", "ucec_tcga_pub_pole", "ucec_tcga_pub_mutations"),

	ENDOMETRIAL_MUT_CNCALL_EXPZ("ucec_tcga_pub", "ucec_tcga_pub_3way_complete", "ucec_tcga_pub_mutations", "ucec_tcga_pub_gistic", "ucec_tcga_pub_rna_seq_v2_mrna_median_Zscores"),
	ENDOMETRIAL_EXP("ucec_tcga_pub", "ucec_tcga_pub_3way_complete", "ucec_tcga_pub_rna_seq_v2_mrna"),
	ENDOMETRIAL_MUT_FOR_RPPA("ucec_tcga_pub", "ucec_tcga_pub_rppa", "ucec_tcga_pub_mutations"),

	BREAST_MUT_CNCALL_EXPZ("brca_tcga", "brca_tcga_3way_complete", "brca_tcga_mutations", "brca_tcga_gistic", "brca_tcga_rna_seq_v2_mrna_median_Zscores"),
	BREAST_EXP("brca_tcga", "brca_tcga_3way_complete", "brca_tcga_rna_seq_v2_mrna"),
	BREAST_MUT_FOR_RPPA("brca_tcga", "brca_tcga_rppa", "brca_tcga_mutations"),

	BREAST_MUT("brca_tcga_pub", "brca_tcga_pub_sequenced", "brca_tcga_pub_mutations"),
	BREAST_MUT_CN("brca_tcga_pub", "brca_tcga_pub_cnaseq", "brca_tcga_pub_mutations", "brca_tcga_pub_gistic"),
	LUNG_ADEN_MUT_CN("luad_tcga", "luad_tcga_cnaseq", "luad_tcga_mutations", "luad_tcga_gistic"),

	COLON_MUT_CN("coadread_tcga_pub", "coadread_tcga_pub_cna_seq", "coadread_tcga_pub_mutations", "coadread_tcga_pub_gistic"),
	COLON_MUT_CNCALL_EXPZ("coadread_tcga_pub", "coadread_tcga_pub_3way_complete", "coadread_tcga_pub_mutations", "coadread_tcga_pub_gistic", "coadread_tcga_pub_rna_seq_mrna_median_Zscores"),
	COLON_EXP("coadread_tcga_pub", "coadread_tcga_pub_3way_complete", "coadread_tcga_pub_rna_seq_mrna"),
	COLON_MUT_FOR_RPPA("coadread_tcga", "coadread_tcga_rppa", "coadread_tcga_mutations"),

	LEUKEMIA_MUT_CNCALL_EXPZ("laml_tcga", "laml_tcga_3way_complete", "laml_tcga_mutations", "laml_tcga_gistic", "laml_tcga_rna_seq_v2_mrna_median_Zscores"),
	LEUKEMIA_EXP("laml_tcga", "laml_tcga_3way_complete", "laml_tcga_rna_seq_v2_mrna"),

	MELANOMA_MUT_CNCALL_EXPZ("skcm_tcga", "skcm_tcga_3way_complete", "skcm_tcga_mutations", "skcm_tcga_gistic", "skcm_tcga_rna_seq_v2_mrna_median_Zscores"),
	MELANOMA_EXP("skcm_tcga", "skcm_tcga_3way_complete", "skcm_tcga_rna_seq_v2_mrna"),

	PROSTATE_MSKCC_MUT_CN("prad_mskcc", "prad_mskcc_cna_seq", "prad_mskcc_mutations", "prad_mskcc_cna"),
	PROSTATE_TCGA_MUT_CN("prad_tcga", "prad_tcga_cnaseq", "prad_tcga_mutations", "prad_tcga_gistic"),
	KIDNEY_MUT_CN("kirc_tcga_pub", "kirc_tcga_pub_cnaseq", "kirc_tcga_pub_mutations", "kirc_tcga_pub_gistic"),

	OVARIAN_MUT_CNCALL_EXPZ("ov_tcga_pub", "ov_tcga_pub_3way_complete", "ov_tcga_pub_mutations", "ov_tcga_pub_gistic", "ov_tcga_pub_mrna_median_Zscores"),
	// below is z-scores, i don't know why
	OVARIAN_EXP("ov_tcga_pub", "ov_tcga_pub_3way_complete", "ov_tcga_pub_mrna_median"),

	LUNG_MUT_CNCALL_EXPZ("luad_tcga_pub", "luad_tcga_pub_3way_complete", "luad_tcga_pub_mutations", "luad_tcga_pub_gistic", "luad_tcga_pub_rna_seq_v2_mrna_median_Zscores"),
	LUNG_EXP("luad_tcga_pub", "luad_tcga_pub_3way_complete", "luad_tcga_pub_rna_seq_v2_mrna"),

	THYROID_MUT_CNCALL_EXPZ("thca_tcga", "thca_tcga_3way_complete", "thca_tcga_mutations", "thca_tcga_gistic", "thca_tcga_rna_seq_v2_mrna_median_Zscores"),
	THYROID_EXP("thca_tcga", "thca_tcga_3way_complete", "thca_tcga_rna_seq_v2_mrna"),

	OVARIAN_MUT("ov_tcga_pub", "ov_tcga_pub_sequenced", "ov_tcga_pub_mutations"),
	OVARIAN_MUT_CN("ov_tcga_pub", "ov_tcga_pub_cna_seq", "ov_tcga_pub_mutations", "ov_tcga_pub_gistic");

	public String cancerStudyID;
	public String caseListID;
	public String[] profileID;

	private PortalDatasetEnum(String cancerStudyID, String caseListID, String... profileID)
	{
		this.cancerStudyID = cancerStudyID;
		this.caseListID = caseListID;
		this.profileID = profileID;
	}


	@Override
	public String getCancerStudyID()
	{
		return cancerStudyID;
	}

	@Override
	public String getCaseListID()
	{
		return caseListID;
	}

	@Override
	public String[] getProfileID()
	{
		return profileID;
	}
}
