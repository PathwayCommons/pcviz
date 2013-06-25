var NotyView = Backbone.View.extend({
    render: function() {
        this.model["theme"] = "pcvizTheme";
        this.model["layout"] = "bottomRight";

        if(this.options.timeout != undefined)
            this.model["timeout"] = this.options.timeout;
        else
            this.model["timeout"] = 8000;

        this.model["text"] = _.template($(this.options.template).html(), this.model);

        if(this.options.warning != undefined && this.options.warning)
            this.model["type"] = "warning";

        if(this.options.error != undefined && this.options.error)
            this.model["type"] = "error";


        noty(this.model);
        return this;
    }
});
