/*
 * Copyright 2013 Memorial-Sloan Kettering Cancer Center.
 *
 * This file is part of PCViz.
 *
 * PCViz is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PCViz is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with PCViz. If not, see <http://www.gnu.org/licenses/>.
 */

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
            var networkType = "neighborhood";
            (new HomeView({ model: { terms: "MDM2", networkType: networkType }})).render();
            (new SettingsView({ model: { networkType: "neighborhood" } })).render();
            (new NetworkView({ el: "#main-network-view" })).render();
        },

        gene: function(type, terms) {
            (new ContainerView({ model: true })).render();
            (new HeaderView({})).render();
            (new FooterView({})).render();
            (new HomeView({ model: {
                terms: this.cleanInput(terms),
                networkType: type
            }})).render();
            (new SettingsView({ model: { networkType: type } })).render();
            (new NetworkView({ el: "#main-network-view" })).render();
        },

        emptyGene: function(type) {
            this.gene(type, "");
        },

        cleanInput: function(input) {
            return input
                .replace(new RegExp("<", "g"), "")
                .replace(new RegExp(">", "g"), "")
                .toUpperCase();
        }
    });

    $(function(){
        new AppRouter();
        Backbone.history.start();
    });

}(window.jQuery);