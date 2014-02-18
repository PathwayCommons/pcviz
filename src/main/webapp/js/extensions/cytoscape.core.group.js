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

;
(function ($$)
{
	function GroupNodes()
	{
		var cy = this;

		var Set = js_cols.HashSet;
		var Map = js_cols.HashMap;
		var visibleNodes;
		var visibleEdges;

		function convert()
		{
			visibleNodes = cy.$("node:visible");
			visibleEdges = cy.$("edge:visible");
			var groups = groupSimilarNodes();
			return prepareNewGraph(groups);
		}

		function prepareNewGraph(groups)
		{
			var graph = {nodes: [], edges: []};

			var node2group = new Map();

			// find grouped nodes
			groups.forEach(function (group)
			{
				group.forEach(function(node)
				{
					node2group.insert(node.id(), group);
				});
			});

			// directly copy ungrouped nodes
			visibleNodes.each(function (i, node)
			{
				if (!node2group.contains(node.id()))
				{
					var data = $$.util.extend(true, {}, node.data());
					graph.nodes.push({"data": data});
				}
			});

			var group2node = new Map();

			// create group nodes for cy graph
			groups.forEach(function (group)
			{
				var groupID = generateGroupID(group);
				var data = {id: groupID, label: ""};
				var node = {"data": data};
				graph.nodes.push(node);
				group2node.insert(group, node);

				group.forEach(function(node)
				{
					var data = $$.util.extend(true, {}, node.data());
					data.parent = groupID;
					graph.nodes.push({"data": data});
				});
			});

			var edgeMemo = new Set();
			var group2labels = new Map();

			visibleEdges.each(function (i, edge)
			{
				var data = $$.util.extend(true, {}, edge.data());
				var source = node2group.get(edge.source().id());
				var target = node2group.get(edge.target().id());

				// copy edges from simple node to simple node
				if (source == null && target == null)
				{
					graph.edges.push({"data": data});
				}
				// if source or target is in a group (but not same group), redirect edge.
				else if (source != target)
				{
					if (source != null)
					{
						data.source = group2node.get(source).data.id;
					}
					if (target != null)
					{
						data.target = group2node.get(target).data.id;
					}

					data.id = data.source + "-" + data.type + "-" + data.target;

					var key = data.source + data.type + data.target;

					if (!edgeMemo.contains(key))
					{
						graph.edges.push({"data": data});
						edgeMemo.insert(key);
					}
				}
				else // source and target are same
				{
					if (!group2labels.contains(source))
					{
						group2labels.insert(source, new Set());
					}

					group2labels.get(source).insert(data.type);
				}
			});

			// write compound node labels
			group2labels.forEach(function(group, labels)
			{
				labels.forEach(function(label)
				{
					if (group2node.get(group).data.label == "")
					{
						group2node.get(group).data.label += label;
					}
					else
					{
						group2node.get(group).data.label += ", " + label;
					}
				});
			});

			return graph;
		}

		function generateGroupID(group)
		{
			var names = [];

			group.forEach(function (node)
			{
				names.push(node.id());
			});

			names.sort();
			var id = names.join("");
			return id;
		}

		function groupSimilarNodes()
		{
			var incomingMap = new Map();
			var outgoingMap = new Map();

			visibleNodes.each(function (i, node)
			{
				if (!incomingMap.contains(node)) incomingMap.insert(node, new Set());
				if (!outgoingMap.contains(node)) outgoingMap.insert(node, new Set());

				node.neighborhood("edge").each(function (i, edge)
				{
					if (edge.visible() && edge.data().target == node.id())
					{
						var key = edge.data().type + " " + edge.source().id();
						incomingMap.get(node).insert(key);
						if (!edge.data().isdirected) outgoingMap.get(node).insert(key);
					}
				});

				node.neighborhood("edge").each(function (i, edge)
				{
					if (edge.visible()  && edge.data().source == node.id())
					{
						var key = edge.data().type + " " + edge.target().id();
						outgoingMap.get(node).insert(key);
						if (!edge.data().isdirected) incomingMap.get(node).insert(key);
					}
				});
			});

			return findGroups(visibleNodes, incomingMap, outgoingMap);
		}

		function findGroups(nodes, incomingMap, outgoingMap)
		{
			var groups = new Set();

			nodes.each(function (i, node)
			{
				var group = getSimilarNodes(node, nodes, incomingMap, outgoingMap);
				if (!group.isEmpty() && !contains(groups, group)) groups.insert(group);
			});
			return groups;
		}

		/**
		 *
		 * @param groups Set<Set<node>>
		 * @param group  Set<node>
		 * @return {boolean}
		 */
		function contains(groups, group)
		{
			var contains = false;

			groups.forEach(function (g)
			{
				if (!contains)
				{
					if (g.getCount() == group.getCount() && g.containsAll(group))
					{
						contains = true;
						return false;
					}
				}
			});
			return contains;
		}

		function getSimilarNodes(node, nodes, incomingMap, outgoingMap)
		{
			if (incomingMap.get(node).isEmpty() && outgoingMap.get(node).isEmpty())
				return new Set();

			sim = new Set();

			nodes.each(function (i, n)
			{
				if (similar(n, node, incomingMap, outgoingMap)) sim.insert(n);
			});
			if (sim.getCount() > 1) return sim;
			else return new Set();
		}

		function similar(n1, n2, incomingMap, outgoingMap)
		{
			if (incomingMap.get(n1).getCount() != incomingMap.get(n2).getCount() ||
				outgoingMap.get(n1).getCount() != outgoingMap.get(n2).getCount())
			{
				return false;
			}
			if (incomingMap.get(n1).containsAll(incomingMap.get(n2)) &&
				outgoingMap.get(n1).containsAll(outgoingMap.get(n2)))
			{
				return true;
			}

			var n1_in = new Set();
			n1_in.insertAll(incomingMap.get(n1));
			var n2_in = new Set();
			n2_in.insertAll(incomingMap.get(n2));
			var n1_out = new Set();
			n1_out.insertAll(outgoingMap.get(n1));
			var n2_out = new Set();
			n2_out.insertAll(outgoingMap.get(n2));

			removeCommon(n1_in, n2_in);
			removeCommon(n1_out, n2_out);

			return containssOnlyInterEdges(n1.id(), n2.id(), getParsed(n1_in), getParsed(n2_in)) &&
				containssOnlyInterEdges(n1.id(), n2.id(), getParsed(n1_out), getParsed(n2_out));
		}

		function removeCommon(set1, set2)
		{
			var temp = new Set();
			temp.insertAll(set1);
			set1.removeAll(set2);
			set2.removeAll(temp);
		}

		function containssOnlyInterEdges(name1, name2, edges1, edges2)
		{
			var result = true;

			edges1.forEach(function (type, value)
			{
				if (!edges2.contains(type) ||
					value.getCount() != 1 ||
					!value.getValues()[0] == name2)
				{
					result = false;
					return false;
				}
			});

			edges2.forEach(function (type, value)
			{
				if (!edges1.contains(type) ||
					value.getCount() != 1 ||
					!value.getValues()[0] == name1)
				{
					result = false;
					return false;
				}
			});

			return true;
		}

		function getParsed(edges)
		{
			var parsed = new Map();

			edges.forEach(function (edge)
			{
				var tok = edge.split(" ");
				if (!parsed.contains(tok[0])) parsed.insert(tok[0], new Set());
				parsed.get(tok[0]).insert(tok[1]);
			});
			return parsed;
		}

		return convert();
	}

	$$("core", "groupNodes", GroupNodes);
})(cytoscape);