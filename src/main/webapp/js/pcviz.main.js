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
            ":type/:terms": "gene",
            "*actions": "home"
        },

        home: function(actions) {
            (new HomeView({ model: { terms: "BRCA2" }})).render();
            (new SettingsView({ model: { networkType: "neighborhood" } })).render();
            (new NetworkView({ el: "#main-network-view" })).render();
        },

        gene: function(type, terms) {
            (new HomeView({ model: { terms: terms }})).render();
            (new SettingsView({ model: { networkType: type } })).render();
            (new NetworkView({ el: "#main-network-view" })).render();
        }
    });

    $(function(){
        new AppRouter();
        Backbone.history.start();
    });

}(window.jQuery);