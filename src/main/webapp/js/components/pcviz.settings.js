var SettingsView = Backbone.View.extend({
    render: function() {
        $(".ui-slider").each(function() {
            var sliderVal = Math.floor(Math.random()*5) + 1;

            $(this).slider({
                min: 1,
                max: 5,
                value: sliderVal,
                orientation: "horizontal",
                range: "min"
            });
        });

        $('#rightMenuControls a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        return this;
    }
});