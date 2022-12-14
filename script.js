// 0 = uniform spline; 0.5 = centripetal spline; 1 = chordal spline
const SPLINE_POWER = 0;

const sampleData = [
  [1, 12.3],
  [2, 12.3],
  [3, 12.3],
  [4, 12.7],
  [5, 12.6],
  [6, 12.5],
  [7, 12.6],
  [8, 12.2],
  [9, 11.8],
  [10, 11.9],
  [11, 11.8],
  [12, 11.6],
  [13, 11.3],
  [14, 11.4],
  [15, 11.5],
  [16, 11.5],
  [17, 11.4],
  [18, 11.2],
  [19, 11.0],
  [20, 11.1],
  [21, 10.6],
  [22, 10.4],
  [23, 10.5],
  [24, 10.4],
  [25, 10.4],
  [26, 10.2],
  [27, 10.1],
  [28, 10.5],
  [29, 10.1],
  [30, 10.2],
  [31, 10.2],
  [32, 10.1],
  [33, 10.0],
  [34, 10.2],
  [35, 10.2],
  [36, 10.2],
  [37, 10.0],
  [38, 10.0],
  [39, 10.2],
  [40, 9.8],
  [41, 9.4],
  [42, 9.5],
  [43, 9.7],
  [44, 9.7],
  [45, 9.6],
  [46, 9.4],
  [47, 9.3],
  [48, 9.2],
  [49, 9.5],
  [50, 9.4],
  [51, 9.7],
  [52, 9.7],
  [53, 9.6],
  [54, 9.3],
  [55, 9.7],
  [56, 9.5],
  [57, 9.5],
  [58, 9.2],
  [59, 9.0],
  [60, 9.0],
  [61, 8.7],
  [62, 8.6],
  [63, 8.6],
  [64, 8.7],
  [65, 8.6],
  [66, 8.4],
  [67, 8.5],
  [68, 8.4],
  [69, 8.1],
  [70, 8.1],
  [71, 7.6],
  [72, 7.6],
  [73, 7.4],
  [74, 7.5],
  [75, 7.4],
  [76, 7.2],
  [77, 7.3],
  [78, 7.4],
  [79, 7.2],
  [80, 7.2],
  [81, 6.9],
  [82, 7.2],
  [83, 7.3],
  [84, 6.5],
  [85, 6.3],
  [86, 6.2],
  [87, 6.5],
  [88, 6.1],
];

function addSVGElement(parent, tag, attributes = {}, content) {
  const ns = 'http://www.w3.org/2000/svg';
  const element = document.createElementNS(ns, tag);
  parent.appendChild(element);

  for (const attr in attributes) {
    element.setAttribute(attr, attributes[attr]);
  }

  if (content !== undefined) {
    const txtNode = document.createTextNode(content);
    element.appendChild(txtNode);
  }

  return element;
}

function createElement(tag) {
  const element = document.createElement(tag);

  const obj = {
      element,
      attr: (attributes) => {
          for (const key in attributes) {
              element.setAttribute(key, attributes[key]);
          }
          return obj;
      },
      addClass: (className) => {
        element.classList.add(className);
        return obj;
      },
      addElement(tag) {
          const childElement = createElement(tag).addTo(this);
          return childElement;
      },
      addEventListener: (type, func) => {
          element.addEventListener(type, func);
          return obj;
      },
      text: (text) => {
          element.innerHTML = text;
          return obj;
      },
      css: (styles) => {
          let cssString = ''
          for (const key in styles) {
              cssString += `${key}: ${styles[key]};`;
          }
          element.style.cssText = cssString;
          return obj;
      },
      addTo: (parent) => {
          parent.appendChild(element);
          return obj;
      },
      appendChild: (child) => {
          element.appendChild(child);
          return obj;
      }
  };

  return obj;
}

function getT(t, p1, p2) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.pow(Math.sqrt(dx * dx + dy * dy), SPLINE_POWER) + t;
};

// Calculate the bezier control points for a Catmull-Rom spline given 4 control points
function getBezierControlPoints(p0, p1, p2, p3) {
  const t0 = 0;
  const t1 = getT(t0, p0, p1);
  const t2 = getT(t1, p1, p2);
  const t3 = getT(t2, p2, p3);
  const dt = t2 - t1;
  
  const c1 = (t2 - t1) / ((t2 - t0) * (t1 - t0));
  const c2 = (t1 - t0) / ((t2 - t0) * (t2 - t1));
  const d1 = (t3 - t2) / ((t3 - t1) * (t2 - t1));
  const d2 = (t2 - t1) / ((t3 - t1) * (t3 - t2));

  return [
    [
      p1[0] + dt * (c1 * (p1[0] - p0[0]) + c2 * (p2[0] - p1[0])) / 3,
      p1[1] + dt * (c1 * (p1[1] - p0[1]) + c2 * (p2[1] - p1[1])) / 3
    ], [
      p2[0] - dt * (d1 * (p2[0] - p1[0]) + d2 * (p3[0] - p2[0])) / 3,
      p2[1] - dt * (d1 * (p2[1] - p1[1]) + d2 * (p3[1] - p2[1])) / 3
    ]
  ];
};

function getPointOnBezier(t, p0, p1, p2, p3) {
  const s = 1 - t;
  const a = s * s * s;
  const b = s * s * t * 3;
  const c = s * t * t * 3;
  const d = t * t * t;

  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]
  ];
}

// Given an x-value find the y value for a point on a bezier curve
function findValueOnBezier(x, p0, p1, p2, p3) {
  let t = 0.5;
  let step = 0.5;
  let p = getPointOnBezier(t, p0, p1, p2, p3);

  let count = 0;
  // Keep trying until we get close to the x value
  while (Math.abs(p[0] - x) > 0.1) {
    if (count++ > 12) { break; }

    step *= 0.5;
    if (x < p[0]) {
      t -= step;
    } else {
      t += step;
    }
    p = getPointOnBezier(t, p0, p1, p2, p3);
  }

  // Return y value for this point
  return p[1];
} 

// Given an x-value find the y value for a point on a spline consisting of multiple bezier curves
function findValueOnMultiBezier(x, bezierPoints) {
  // Get spline section where x lies
  for (let i = 0; i < 5; i++) {
    const bezierPoint = bezierPoints[i * 4];
    if (Math.abs(x - bezierPoint[0]) < 0.1) {
      return bezierPoint[1]
    } else if (x < bezierPoint[0]) {
      return findValueOnBezier(
        x,
        bezierPoints[i * 4 - 4],
        bezierPoints[i * 4 - 3],
        bezierPoints[i * 4 - 2],
        bezierPoints[i * 4 - 1],
      );
    }
  }
}

function createChart(id) {
  const GRID_X = 30;
  const GRID_Y = 30;
  const TICK_SIZE = 4;

  const splinePoints = [
    [1, 11.5],
    [22, 11.1],
    [44, 10.21],
    [66, 8.27],
    [88, 5.77]
  ];
  const SPLINE_R = 6;

  // Padding around chart
  const x1 = 40;
  let x2 = 40;
  const y1 = 15;
  let y2 = 40;

  const width = x1 + x2 + 18 * GRID_X;
  const height = y1 + y2 + 13 * GRID_Y;

  x2 = width - x2;
  y2 = height - y2;

  // Convert x-coordinate (note) into an x-position on the SVG
  const getX = x => x1 + x * GRID_X * 0.2;

  // Convert an x-position on the SVG into a note value
  const getNote = x => (x - x1) * 5 / GRID_X;

  // Convert y-coordinate (strike weight) into a y-position on the SVG
  const getY = y => y1 + (16 - y) * GRID_Y;

  const getStrikeWeight = y => 16 - (y - y1) / GRID_Y;

  const svg = document.getElementById(id);
  svg.setAttributeNS(null, 'width', width);
  svg.setAttributeNS(null, 'height', height);

  // Left, right, bottom axes
  const d = `M${x1} ${y1}V${y2}H${x2}V${y1}`;
  addSVGElement(svg, 'path', { class: 'axis', d });

  // Gridlines
  const gridlineGroup = addSVGElement(svg, 'g', { class: 'gridlines' });
  const gridTickGroup = addSVGElement(svg, 'g', { class: 'grid-tick' });
  const axisUnitGroup1 = addSVGElement(svg, 'g', { class: 'axis-unit axis-lower' });
  const axisUnitGroup2 = addSVGElement(svg, 'g', { class: 'axis-unit axis-left' });
  const axisUnitGroup3 = addSVGElement(svg, 'g', { class: 'axis-unit axis-right' });

  for (let i = 0; i <= 18; i++) {
    const x = x1 + i * GRID_X;
    if (i > 0 && i < 18) {
      addSVGElement(gridlineGroup, 'line', { x1: x, x2: x, y1, y2 });
    }
    if (i % 2 === 0) {
      addSVGElement(axisUnitGroup1, 'text', { x: x, y: y2 + 7 }, i * 5);
      addSVGElement(gridTickGroup, 'line', { x1: x, x2: x, y1: y2 + TICK_SIZE, y2 });
    }
  }

  for (let i = 0; i < 14; i++) {
    const y = y1 + i * GRID_Y;
    if (i < 13) {
      addSVGElement(gridlineGroup, 'line', { x1: x1, x2: x2, y1: y, y2: y });
    }
    addSVGElement(gridTickGroup, 'line', { x1, x2: x1 - TICK_SIZE, y1: y, y2: y });
    addSVGElement(gridTickGroup, 'line', { x1: x2 + TICK_SIZE, x2, y1: y, y2: y });
    addSVGElement(axisUnitGroup2, 'text', { x: x1 - 7, y }, 16 - i);
    addSVGElement(axisUnitGroup3, 'text', { x: x2 + 7, y }, 16 - i);
  }

  // Adding measured points
  const inputGroup = addSVGElement(svg, 'g', { class: 'input-points' });

  // Spline line
  const splineLine = addSVGElement(svg, 'path', { class: 'spline' });

  // Create draggable points
  let dragBoundary = false;
  let selectedPoint = false;
  let selectedSplinePoint = false;
  let offsetX;
  let offsetY;
  
  const splineGroup = addSVGElement(svg, 'g', { class: 'spline-points' });

  splinePoints.forEach((p, index) => {
    const x = getX(p[0]);
    const y = getY(p[1]);

    // Convert spline point coordinates from graph space to SVG space
    p[0] = x;
    p[1] = y;

    const draggablePoint = addSVGElement(splineGroup, 'circle', {
      class: 'draggable-point',
      cx: x,
      cy: y,
      r: SPLINE_R,
    });

    draggablePoint.addEventListener('mousedown', (evt) => {
      if (index === 0 || index === 4) {
        dragBoundary = false;
      } else {
        // Limit horizontal point movement to between its neighbours
        dragBoundary = [
          splinePoints[index - 1][0] + GRID_X,
          splinePoints[index + 1][0] - GRID_X,
        ];
      }
      selectedPoint = draggablePoint;
      selectedSplinePoint = splinePoints[index];
      offsetX = draggablePoint.getAttribute('cx') - evt.offsetX;
      offsetY = draggablePoint.getAttribute('cy') - evt.offsetY;
    });

    return draggablePoint;
  });

  const output = { update: () => {} };

  // Update spline line
  function updateSpline() {
    // Project back to find inferred control points
    const p1 = splinePoints[0];
    const p2 = splinePoints[1];
    const p3 = splinePoints[2];
    const p4 = splinePoints[3];
    const p5 = splinePoints[4];
    const p0 = [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]];
    const p6 = [2 * p5[0] - p4[0], 2 * p5[1] - p4[1]];
    const p = [p0, p1, p2, p3, p4, p5, p6];

    let allSpinePoints = [p1];
    let d = `M${p1[0]} ${p1[1]}`;

    // Calculate control points for multi-bezier spline
    for (let i = 1; i <5; i++) {
      const [c1, c2] = getBezierControlPoints(p[i - 1], p[i], p[i + 1], p[i + 2]);
      allSpinePoints = allSpinePoints.concat([c1, c2, p[i + 1]]);
      d += `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p[i + 1][0]} ${p[i + 1][1]}`
    }

    // Calculate values along bezier multi-bezier spline
    for (let note = 1; note <= 88; note++) {
      const x = getX(note);
      const y = findValueOnMultiBezier(x, allSpinePoints);
      const strikeWeight = getStrikeWeight(y);
      output.update(note, strikeWeight);
    }

    return d;
  }

  splineLine.setAttribute('d', updateSpline());

  // Drag controls
  svg.addEventListener('mousemove', (evt) => {
    if (selectedPoint) {
      // Move spline point when dragged
      if (dragBoundary) {
        let px = evt.offsetX + offsetX;

        if (px < dragBoundary[0]) {
          px = dragBoundary[0];
        } else if (px > dragBoundary[1]) {
          px = dragBoundary[1];
        }
        selectedPoint.setAttribute('cx', px);
        selectedSplinePoint[0] = px;

      }

      let py = evt.offsetY + offsetY;

      // Limit vertical movement to chart top and bottom
      if (py < y1) {
        py = y1;
      } else if (py > y2) {
        py = y2;
      }

      selectedPoint.setAttribute('cy', py);
      selectedSplinePoint[1] = py;

      // Update spline
      splineLine.setAttribute('d', updateSpline());
    }
  });

  svg.addEventListener('mouseup', (evt) => {
    selectedPoint = false;
  });

  return { getX, getY, inputGroup, output, updateSpline };
}

function createNoteInput(id) {
  const container = document.getElementById(id);
  const table = createElement('table').addClass('spline-table');
  container.appendChild(table.element);

  const tHead = table.addElement('thead');
  const tHeadRow = tHead.addElement('tr');
  tHeadRow.addElement('th').text('Note');
  tHeadRow.addElement('th').text('SW');
  tHeadRow.addElement('th').text('SW Spec');

  const tBody = table.addElement('tbody');

  const swInputs = [];
  const swOutputs = [];

  for (let i = 1; i <= 88; i++) {
    // Get sample value
    const value = sampleData[i - 1][1];

    const tBodyRow = tBody.addElement('tr');
    tBodyRow.addElement('td').text(i);

    const input = createElement('td')
      .text(value)
      .addClass('editable')
      .attr({ contenteditable: true })
      .addTo(tBodyRow);
    swInputs.push(input);
    
    const output = createElement('td').text('-').addTo(tBodyRow);
    swOutputs.push(output);
  }

  return [swInputs, swOutputs];
}

// Add crosses on the chart to indicate where measured points are
// Update when inputs are updated
function addMarkedPoints(inputs, inputGroup, getX, getY) {
  const points = {};

  function addPoint(x, y) {
    const px = getX(x);
    const py = getY(y);
    const d = `M${px - 3} ${py - 3}l7 7m0-7l-7 7`;

    if (points[x]) {
      points[x].setAttribute('d', d);
    } else {
      points[x] = addSVGElement(inputGroup, 'path', { d });
    }
  }

  for (let i = 0; i < inputs.length; i++) {
    const value = sampleData[i][1];

    inputs[i].addEventListener('blur', (evt) => {
      const value = parseFloat(evt.target.innerText);
      addPoint(i, value);
    });

    addPoint(i + 1, value);
  }

}

function insertOutputFunc(output, outputComponents) {
  output.update = (note, strikeWeight) => {
    outputComponents[note - 1].text(strikeWeight.toFixed(1));
  }
}

const { getX, getY, inputGroup, output, updateSpline } = createChart('spline-chart');
const [swInputs, swOutputs] = createNoteInput('note-wrapper');

addMarkedPoints(swInputs, inputGroup, getX, getY);
insertOutputFunc(output, swOutputs);
updateSpline();
