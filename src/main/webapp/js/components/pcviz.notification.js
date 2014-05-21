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
