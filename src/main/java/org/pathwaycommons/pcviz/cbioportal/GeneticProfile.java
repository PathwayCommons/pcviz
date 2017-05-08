package org.pathwaycommons.pcviz.cbioportal;

public class GeneticProfile {
    private String id;
    private String name;
    private ProfileType type;
    private String description;

    public GeneticProfile(String id, String name, String description, String type) {
        this(id, name, description, inferType(type));
    }

    public GeneticProfile(String id, String name, String description, ProfileType type) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;

    }

    private static ProfileType inferType(String type) {
        try {
            return ProfileType.valueOf(type);
        } catch (Exception e) {
            return ProfileType.NOT_KNOWN;
        }
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ProfileType getType() {
        return type;
    }

    public void setType(ProfileType type) {
        this.type = type;
    }

	@Override
	public String toString()
	{
		return id;
	}
}
