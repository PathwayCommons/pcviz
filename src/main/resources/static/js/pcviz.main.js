!function ($) {
    // This is for the moustache-like templates
    // prevents collisions with JSP tags
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
    };

    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    /* Routers */
    AppRouter = Backbone.Router.extend({
        routes: {
            "embed/:type/:terms": "embed",
            ":type/:terms": "gene",
            ":type/": "emptyGene",
            "*actions": "home"
        },

        embed: function(type, terms) {
            var networkModel = {
                networkType: type,
                genes: this.cleanInput(terms)
            };

            (new ContainerView({ model: false })).render();
            (new EmbedHeaderView({})).render();
            (new EmbedFooterView({ model: networkModel })).render();
            (new EmbedHomeView({})).render();
            (new EmbedNetworkView({
                el: "#embed-network-view",
                model: networkModel
            })).render();
        },

        home: function(actions) {
            (new ContainerView({ model: true })).render();
            (new HeaderView({})).render();
            (new FooterView({})).render();
            var genes = ["MDM2", "RB1", "BRCA1", "SMAD3"];
            var randomGene = genes[Math.floor(Math.random()*genes.length)];
            (new HomeView({ model: { terms: randomGene, networkType: "neighborhood" }})).render();
            (new SettingsView({ model: { networkType: "neighborhood" } })).render();
            (new NetworkView({ el: "#main-network-view" })).render();
            this.trackClicks();
        },

        gene: function(type, terms) {
            (new ContainerView({ model: true })).render();
            (new HeaderView({})).render();
            (new FooterView({})).render();
            (new HomeView({ model: {terms: this.cleanInput(terms), networkType: type }})).render();
            (new SettingsView({ model: { networkType: type } })).render();
            (new NetworkView({ el: "#main-network-view" })).render();
            this.trackClicks();
        },

        emptyGene: function(type) {
            this.gene(type, "");
        },

        cleanInput: function(input) {
            return input
                .replace(new RegExp("<", "g"), "")
                .replace(new RegExp(">", "g"), "")
                .replace(new RegExp("\\s+", "g"), ",")
                .toUpperCase();
        },

        trackClicks: function() {
            $("a, button").on('click', function(e) {
                ga('send', 'event', 'link', window.location.href, $(this).attr("href"));
            });
        }
    });

    $(function(){
        new AppRouter();
        Backbone.history.start();
    });

    // Load the metadata about PC data sources
    $.getJSON("metadata/datasources", function(datasources) {
        var dataSourcesMap = {};
        _.each(datasources, function(ds) {
            dataSourcesMap[ds.id] = ds;
            _.each(ds.name, function(aName) {
                dataSourcesMap[aName] = ds;
            });
        });
        window.metadata = dataSourcesMap;
    });

}(window.jQuery);