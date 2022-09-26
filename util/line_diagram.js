// Copyright ⓒ Daniel Erhard; all rights reserved.  The use and
// distribution terms for this software are covered by the Eclipse
// Public License 1.0
// (http://opensource.org/licenses/eclipse-1.0.php).  By using this
// software in any fashion, you are agreeing to be bound by the terms
// of this license. You must not remove this notice, or any other,
// from this software.

$(document).ready(function() { 
  $(".concept-lattice-json").each(function() {
    var containerID = $(this).attr("id");
    var sizeModifier = $(this).attr("scale")
    var coordsModifier = $(this).attr("coordsModifier")
    var jsonString = $(this).html();
    $(this).html("");
    var graphinfo = jsonStringToGraphInfo(jsonString);
    var graphElements = generateGraphElements(graphinfo.nodesObject, graphinfo.edgeList,coordsModifier, edgeVals=false, nodeVals=true);
    showLineDiagram(containerID, graphElements, sizeModifier);
  });
} ); 


function jsonStringToGraphInfo(jsonString){   
  var jsonObject = JSON.parse(jsonString)   // create object with all nodes; every node is in an attribute with the node's id (nodes are currently empty objects)
  var nodesObject = {} 
  jsonObject.nodes.forEach(node => {     
    var nodeId = Object.keys(node)[0]
    nodesObject[nodeId] = {}
  })
  // add position information to the nodes  
  jsonObject.positions.forEach(posObj => {
    var nodeId = Object.keys(posObj)[0]  
    nodesObject[nodeId].posX = (posObj[nodeId][0]) 
    nodesObject[nodeId].posY = (posObj[nodeId][1])
  })
  // add information for top & bottom annotations to the nodes  
  jsonObject["shorthand-annotation"].forEach(annoObj => {   
    var nodeId = Object.keys(annoObj)[0]  
    nodesObject[nodeId].annotationTop = annoObj[nodeId][0]   
    nodesObject[nodeId].annotationBottom = annoObj[nodeId][1] 
  }) 
  // add information for right annotations to the nodes  
  jsonObject.valuations.forEach(valObj => {   
    var nodeId = Object.keys(valObj)[0] 
    if (valObj[nodeId] != null){     
      nodesObject[nodeId].annotationRight = valObj[nodeId].toString()    
    } else { 
      nodesObject[nodeId].annotationRight = ""     
    }
  }) 
  // create array with all edges (edges don't have ids, that's why here, an array is used instead of an object)
  var edgeList = []
  jsonObject.edges.forEach(edgeObj => {
    var startId = Object.keys(edgeObj)[0]
    edgeObj[startId].forEach(endId => {
      edgeList.push([startId, endId])
    })
  })

  // return nodesObject and edgeList in an object
  return {nodesObject: nodesObject, edgeList: edgeList}
}


function generateGraphElements(nodesObject, edgeList, coordsModifier = 1, edgeVals=false, nodeVals=true){
  var graphElements = []
  // generate node elements: iterate through attributes(=nodes) of the nodesObject
  Object.entries(nodesObject).forEach(entry => {
    // generate three elements to represent one node with all it's labels
    var nodeId = entry[0].toString()  //the attribute key is the node id
    var nodeInfo = entry[1]  //the attribute value contains the node info
    // create the "normal" node element, that is visible and can be moved
    var nodeElement = {
      group: "nodes",
      // set id, top annotation and reference to direct parent element (which will be created next)
      data: {
        id: nodeId,
        name: nodeInfo.annotationTop.toString(),
        parent: nodeId + "-parent1"
      },
      // set coordinates
      position: { x: (nodeInfo.posX * coordsModifier), y: (nodeInfo.posY * coordsModifier) },
      classes: ["main-node"]  // for identification of inner nodes
    }
    // create the first (direct) parent element. Used to show a second label next to the node (parent is invisible & is moved with child node)
    var parent1Element = {
      group: "nodes",
      // set id, bottom annotation and reference to a parent element (which will be created next)
      data: {
        id: nodeId + "-parent1",
        name: nodeInfo.annotationBottom.toString(),
        parent: nodeId + "-parent2"
      },
      classes: ["invisible-node-parent", "inner-node-parent"],
      grabbable: false  //so it can only be moved by clicking on visible node
    }
    if(nodeVals){
      // create parent element for the valuation label next to the node (parent is invisible & is moved with contained node)
      var parent2Element = {
        group: "nodes",
        // set id and right annotation
        data: {
          id: nodeId + "-parent2",
          name: nodeInfo.annotationRight
        },
        classes: ["invisible-node-parent", "outer-node-parent"],
        grabbable: false  //so it can only be moved by clicking on visible node
      }
      // add elements for this node to graphElements list
      graphElements.push(nodeElement, parent1Element, parent2Element)
    } else {
      // if valuations are hidden, there's no need for the second parent element
      graphElements.push(nodeElement, parent1Element)
    }
  });
  // generate edge elements: iterate through edgeList, every edge is a list: [sourceNodeId, targetNodeId]
  edgeList.forEach(edge =>{
    // create edge element
    var edgeElement = {
      group: "edges",
      data: {
        id: edge[0].toString() + "-" + edge[1].toString(),  //unused so far (necessary?)
        name: edgeVals ? edge[0].toString() + "-" + edge[1].toString() : "",  //True for edge labels
        source: edge[0].toString(),
        target: edge[1].toString()
      },
      selectable: false
    }
    // add edge element to graphElements list
    graphElements.push(edgeElement)
  })
  return graphElements
}



function showLineDiagram(containerId, graphElements, sizeModifier){
  var cytoscapeObject = cytoscape({
    container: document.getElementById(containerId),  //set container to render graph in
    elements: graphElements,  //set list of nodes & edges

    // set stylesheet for the graph
    style: [
      {
        // set style for all nodes, sizes are dependent on the param sizeModifier
        selector: "node",
        style: {
          "label": "data(name)",
          "width": sizeModifier,
          "height": sizeModifier,
          "font-size": ((5*sizeModifier)/8),
          "overlay-padding": (sizeModifier * 1.5),
          "color":  "#fba401",
          "background-color": "#eeeedf", // "#999999",
//          "background-opacity": 0.8,
        }
      },
      {
        // set class style for all invisible node parents
        selector: ".invisible-node-parent",
        style: {
          "padding": 0,  //so the labels are close to the node
          "border-width": 0,  //so the labels are close to the node
          "background-opacity": 0,  //so the parent element is not visible
          "overlay-opacity": 0,  //so no big overlay is visible when parent is selected
          "compound-sizing-wrt-labels": "exclude",  //enables the label of outer parent to be close to node
        }
      },
      {
        // set class style for all inner node parents
        selector: ".inner-node-parent",
        style: {
          // show label below node
          "text-halign": "center",
          "text-valign": "bottom",
          "color": "#01d4fb"
        }
      },
      {
        // set class style for all outer node parents
        selector: ".outer-node-parent",
        style: {
          // show label on right side of node
          "text-halign": "right",
          "text-valign": "center",
          "color": "red"
        }
      },
      {
        selector: ':selected',
        css: {
          'background-color': 'SteelBlue',
        }
      },
      {
        // set style for all edges, sizes are dependent on the param sizeModifier
        selector: "edge",
        style: {
          "label": "data(name)", 
          "width": (3*sizeModifier/16),
          "font-size": (sizeModifier/2),
          "overlay-padding": 0,  //removes overlay
          "line-opacity": 0.5,  //improves edge label visibility
          "line-color": "#fffff9", //"#999999",
        }
      }
    ],

    layout: {
      name: "preset"  //so the given coordinates are used
    },
    
    wheelSensitivity: 0.1  //lower scroll wheel sensitivity when zooming, might not be good for every device; testing pending
    // other default init values: https://js.cytoscape.org/#core/initialisation
  });

  // add event listener for when an element was moved by the user
  cytoscapeObject.elements(".main-node").on("dragfree", this.onNodeMoved)

  return cytoscapeObject
}
