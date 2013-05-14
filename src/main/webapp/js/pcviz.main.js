!function ($) {
    // This is for the moustache-like templates
    // prevents collisions with JSP tags
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
    };

    /* Routers */
    AppRouter = Backbone.Router.extend({
        routes: {
            "*actions": "home"
        },

        home: function(actions) {
            (new HomeView()).render();
            (new SettingsView()).render();
            (new NetworkView({ el: "#main-network-view" })).render();
        }
    });

    $(function(){
        new AppRouter();
        Backbone.history.start();
    });

}(window.jQuery);