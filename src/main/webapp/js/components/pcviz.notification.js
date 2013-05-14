var NotyView = Backbone.View.extend({
    render: function() {
        this.model["theme"] = "pcvizTheme";
        this.model["layout"] = "bottomRight";
        this.model["timeout"] = 6000;
        this.model["text"] = _.template($(this.options.template).html(), this.model);

        if(this.options.error != undefined && this.options.error)
            this.model["type"] = "error";

        noty(this.model);
        return this;
    }
});
