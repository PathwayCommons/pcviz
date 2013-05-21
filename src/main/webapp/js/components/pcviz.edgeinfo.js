var EdgeInfoView = Backbone.View.extend({
    template: _.template($("#edgeinfo-template").html()),
    render: function() {
        var model = this.model;
        model["summary"] = _.template($("#edge-" + model.type + "-template").html(), model);
        this.$el.append(this.template(model));

        var pmidCont = this.$el.find("ul.pubmed-list");
        _.each(model.pubmed, function(pmid) {
            (new PubMedView({
                el: pmidCont,
                model: { pmid: pmid }
            })).render();
        });

        return this;
    }
});

var PubMedView = Backbone.View.extend({
    template: _.template($("#pubmed-id-template").html()),

    render: function() {
        this.$el.append(this.template(this.model));
    }
});
