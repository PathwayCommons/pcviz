!function ($) {
    // This is for the moustache-like templates
    // prevents collisions with JSP tags
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
    };

    /* Routers */
    AppRouter = Backbone.Router.extend({
        routes: {
            "genes/:terms": "gene",
            "*actions": "home"
        },

        home: function(actions) {
            (new HomeView({ model: { terms: "BRCA2" }})).render();
            (new SettingsView()).render();
            (new NetworkView({ el: "#main-network-view" })).render();
        },

        gene: function(terms) {
            (new HomeView({ model: { terms: terms }})).render();
            (new SettingsView()).render();
            (new NetworkView({ el: "#main-network-view" })).render();
        }
    });

    $(function(){
        new AppRouter();
        Backbone.history.start();
    });

}(window.jQuery);