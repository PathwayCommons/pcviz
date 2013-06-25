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
            (new EmbedHomeView({})).render();
            (new EmbedNetworkView({
                el: "#embed-network-view",
                model: {
                    networkType: type,
                    genes: terms
                }
            })).render();
        },

        home: function(actions) {
            (new HeaderView({})).render();
            (new FooterView({})).render();
            var networkType = "neighborhood";
            (new HomeView({ model: { terms: "MDM2", networkType: networkType }})).render();
            (new SettingsView({ model: { networkType: "neighborhood" } })).render();
            (new NetworkView({ el: "#main-network-view" })).render();
        },

        gene: function(type, terms) {
            (new HeaderView({})).render();
            (new FooterView({})).render();
            (new HomeView({ model: { terms: terms, networkType: type }})).render();
            (new SettingsView({ model: { networkType: type } })).render();
            (new NetworkView({ el: "#main-network-view" })).render();
        },

        emptyGene: function(type) {
            this.gene(type, "");
        }
    });

    $(function(){
        new AppRouter();
        Backbone.history.start();
    });

}(window.jQuery);