package org.pathwaycommons.pcviz.cbioportal;

/**
 * @author Ozgun Babur
 */
public enum ProfileType
{
	NOT_KNOWN,
	COPY_NUMBER_ALTERATION,
	MRNA_EXPRESSION,
	METHYLATION,
	METHYLATION_BINARY,
	MUTATION_EXTENDED,
	PROTEIN_ARRAY_PROTEIN_LEVEL,
	PROTEIN_ARRAY_PHOSPHORYLATION;

	public static Alteration convertToAlteration(ProfileType type) {
		switch(type) {
			case COPY_NUMBER_ALTERATION:
				return Alteration.COPY_NUMBER;
			case MRNA_EXPRESSION:
				return Alteration.EXPRESSION;
			case METHYLATION:
				return Alteration.METHYLATION;
			case METHYLATION_BINARY:
				return Alteration.METHYLATION;
			case MUTATION_EXTENDED:
				return Alteration.MUTATION;
			case PROTEIN_ARRAY_PROTEIN_LEVEL:
				return Alteration.PROTEIN_LEVEL;
			case PROTEIN_ARRAY_PHOSPHORYLATION:
				return Alteration.PROTEIN_LEVEL;
			default:
				return null;
		}
	}
}
