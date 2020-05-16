let htmlPre = `
<!doctype html>
<html>
  <head>
  </head>
  <body>
`

let bounds = function(height, width, padding) {
  return {
    xStart: padding,
    xEnd : width - padding,
    yStart :height - padding,
    yEnd: padding,
  }      
};

let svgStart = function(height, width, padding) {
  return `
  <svg height="${height}" width="${width}">
    <defs>
    <marker id="arrow-x" markerWidth="${padding}" markerHeight="${padding}" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="black" />
    </marker>
    <marker id="arrow-y" markerWidth="${padding}" markerHeight="${padding}" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="black" />
    </marker>
  </defs>
`
}

let svgEnd = function() {
  return `
  </svg>`
}

let x = function(x1, y1, x2, y2) {
  return `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:black;" marker-end="url(#arrow-y)"/>
`
}

let y = function(x1, y1, x2, y2) {
  return `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:black;" marker-end="url(#arrow-x)"/>
`
} 

let xy = function(b) { 
  let xAxis = x(b.xStart, b.yStart, b.xEnd, b.yStart)
  let yAxis = y(b.xStart, b.yStart, b.xStart, b.yEnd)

  return `
` + xAxis + yAxis + `    
`
}

let htmlPost = `
  </body>
</html>
`

let plotCircles = function(data, bounds, graph) {
  let radius = 10;
  let svgCirc = "";
  data.forEach(function(y, x) {
    let graphData = graph.Points(x, y);
    svgCirc += `  <circle cx="${graphData.x}" cy="${graphData.y}" stroke="yellow" r="${radius}" stroke-width="3" fill="green" />
`
  });

  return svgCirc;
}

let plotTicks = function(bounds, graph) {
  let tickSize = 5;
  let noOfTicks = 10;
  let ticks = `
`
  let xTickWidth = (bounds.xEnd - bounds.xStart)/noOfTicks;

  let y = bounds.yStart;
  let y1 = bounds.yStart - tickSize;
  let textY = y1 - tickSize; 
  for(let x=bounds.xStart+xTickWidth; x<bounds.xEnd; x+=xTickWidth) {
    let textX = x - 4;
    let tickVals = graph.Values(x, y)
          
    ticks += `  <line x1="${x}" y1="${y}" x2="${x}" y2="${y1}" style="stroke:black;"/>
  <text x="${textX}" y="${textY}" fill="black"> ${tickVals.x} </text>
`        
  } 

  let yTickWidth = (bounds.yStart - bounds.yEnd)/noOfTicks;

  let x = bounds.xStart;
  let x1 = bounds.xStart + tickSize;
  let textX = x1 + tickSize;

  for(let y=bounds.yEnd+yTickWidth; y<bounds.yStart; y+=yTickWidth) {
    let textY = y + 4;
    let tickVals = graph.Values(x, y);

    ticks += `  <line x1="${x}" y1="${y}" x2="${x1}" y2="${y}" style="stroke:black;"/>
  <text x="${textX}" y="${textY}" fill="black"> ${tickVals.y} </text>
`
  }
  return ticks;
}

let parseUrl = function(url) {
  let def = {
    height: 600,
    width: 600,
    xLabel: "x",
    yLabel: "y",
    data : new Map([
      [3, 10],
      [4, 12],
      [8, 11.5],
      [10, 2],
    ])
  };

  let qSplit = url.split('?');
  if(qSplit.length != 2) {
    return def;
  }

  let ampSplit = qSplit[1].split('&');
  if((!ampSplit) && (ampSplit.length != 2)) {
    return def;
  }

  for(let arg of ampSplit) {
    let eqSplit = arg.split('=');
    if(eqSplit.length != 2) {
      return def;
    }
    if(eqSplit[0] == 'height'){
      def.height = parseInt(eqSplit[1]);
    } 

    if(eqSplit[0] == 'width'){
      def.width = parseInt(eqSplit[1]);
    } 

    if(eqSplit[0] == 'data') {
        def.data =  new Map(JSON.parse(eqSplit[1]));
    }
  } 
  return def
}

let rangeMap = function(data, bounds) {
  let xs = Array.from(data.keys()); 
  let ys = Array.from(data.values());

  let maxX = Math.max.apply(null, xs);
  let minX = Math.min.apply(null, xs);

  let maxY = Math.max.apply(null, ys);
  let minY = Math.min.apply(null, ys);

  let scaleX = bounds.xEnd - bounds.xStart; 
  let scaleY = bounds.yStart - bounds.yEnd;

  let xMultiplier = scaleX/maxX;

  // We know this will be -ve.
  let yMultiplier = scaleY/maxY;

  let maxPrecision = 3;

  let graph = {
    Points : function(x, y) {
      let xFromStart = xMultiplier * x;
      let yFromEnd = yMultiplier * (maxY - y); 

      return {
        x: (bounds.xStart + xFromStart).toPrecision(maxPrecision),
        y: (bounds.yEnd + yFromEnd).toPrecision(maxPrecision)
      }
    },

    Values: function(pointX, pointY) {
      pointX = pointX - bounds.xStart;     
      pointY = pointY - bounds.yEnd; 

      return {
        x: (pointX/xMultiplier).toPrecision(maxPrecision),
        y: (((pointY/yMultiplier) - (maxY)) * -1).toPrecision(maxPrecision) 
      }
    }
  } 

  return graph;
}

let plot = function(data, bounds, type) {     
  switch(type) {
    case 'circles':
      let graph = rangeMap(data, bounds);
      let circ = plotCircles(data, bounds, graph);
      let ticks = plotTicks(bounds, graph);
      return circ + ticks;
    default:
      console.log("unknown type to plot ", type)
  } 
}

let plotLabels = function(xLabel, yLabel, bounds) {
  let lineWidth = 10;
  let x1 = (bounds.xEnd - bounds.xStart)/2;
  let y1 = bounds.yEnd/2 + bounds.yStart;
  let xLine = x(x1, y1, x1 + lineWidth, y1);  

  let xTextStart = x1 - lineWidth;
  y1 = y1 + 5;
  let textX = `<text x="${xTextStart}" y="${y1}" fill="black"> ${xLabel} </text>`

    x1 = bounds.xStart/2;
  y1 = (bounds.yStart - bounds.yEnd)/2;
  let yLine = y(x1, y1, x1, y1 - lineWidth); 

  let yTextStart = y1 + lineWidth;
  x1 = x1 - 5;
  let textY = `<text x="${x1}" y="${yTextStart}" fill="black"> ${yLabel} </text>`

  return `
` + xLine + `
` + textX + `
` + yLine + `    
` + textY + `
`
}

let respBody = function(req) {
  let urlParams = parseUrl(req.url);    
  let data = urlParams.data; 
  let padding = 20;
  let b = bounds(urlParams.height, urlParams.width, padding);
  return svgStart(urlParams.height, urlParams.width, padding) + 
    xy(b) + 
    plot(data, b, "circles") + 
    plotLabels(urlParams.xLabel, urlParams.yLabel, b) + 
    svgEnd();
}

module.exports = {
  respBody: respBody,
}
