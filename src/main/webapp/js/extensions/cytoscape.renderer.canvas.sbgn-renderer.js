/*
 * Copyright 2014 Memorial-Sloan Kettering Cancer Center.
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


//sbgn shape rendering methods' parameters are different from default shapes.
//a map for sbgn shapes are needed to differentiate the methods.	
//var sbgnShapes = new Object();

document.writeln("<script src='js/extensions/sbgn-functions.js'></script>");
document.writeln("<script src='js/extensions/overrided-functions.js'></script>");

document.writeln("<script src='js/extensions/sbgn-shapes/complex.js'></script>");
document.writeln("<script src='js/extensions/sbgn-shapes/macromolecule.js'></script>");
document.writeln("<script src='js/extensions/sbgn-shapes/nucleic-acid-feature.js'></script>");
document.writeln("<script src='js/extensions/sbgn-shapes/perturbing-agent.js'></script>");
document.writeln("<script src='js/extensions/sbgn-shapes/simple-chemical.js'></script>");
document.writeln("<script src='js/extensions/sbgn-shapes/source-and-sink.js'></script>");
document.writeln("<script src='js/extensions/sbgn-shapes/unspecified-entity.js'></script>");
document.writeln("<script src='js/extensions/sbgn-shapes/process-nodes/dissociation.js'></script>");
document.writeln("<script src='js/extensions/sbgn-shapes/process-nodes/phenotype.js'></script>");
