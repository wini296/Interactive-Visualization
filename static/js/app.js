function buildGauge(level) {

  // Trig to calc meter point
  var degrees = (9 - level) * 180 / 9;
  var radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: to create a triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ';
  var path = mainPath.concat(String(x), ' ', String(y), ' Z');

  Plotly.newPlot('gauge',
    // data
    [{
      type: 'scatter',
      x: [0], y: [0],
      marker: { size: 28, color: '850000' },
      showlegend: false,
      text: level,
      hoverinfo: 'text'
    },
    {
      values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition: 'inside',
      marker: {
        colors: ['rgba(0, 127, 0, .6)', 'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
          'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)', 'rgba(210, 206, 145, .5)',
          'rgba(232, 226, 202, .7)', 'rgba(238, 232, 222, .6)', 'rgba(244, 240, 230, .5)', 'rgba(255, 255, 255, 0)'
        ]
      },
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'none',
      hole: .5,
      type: 'pie',
      showlegend: false
    }],
    {
      shapes: [{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: { color: '850000' }
      }],
      title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
      height: 500,
      width: 500,
      xaxis: {
        zeroline: false, showticklabels: false,
        showgrid: false, range: [-1, 1]
      },
      yaxis: {
        zeroline: false, showticklabels: false,
        showgrid: false, range: [-1, 1]
      }
    },
    { showSendToCloud: true }
  );
}

function murlError(resp) {
  console.log('Metadata URL Error!')
  console.log(resp);
}

function buildMetadata(sample) {

  murl = `/metadata/${sample}`;
  // Use `d3.json` to fetch the sample data for the plots
  d3.json(murl).then(function (resp) {

    console.log(Object.entries(resp));
    // Select the panel with id of `#sample-metadata`
    var msel = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    msel.html('');

    // Display each key/value pair from the metadata JSON object
    msel.selectAll('p')
      .data(Object.entries(resp))
      .enter()
      .append("p")
      .style("font-weight", 'bold')
      .text(d => `${d[0].toUpperCase()} : ${d[1]}`);

    // BONUS: Build the Gauge Chart
    buildGauge(resp.WFREQ);

  }, murlError);
}

function makePie(vals, ids, labels) {

  Plotly.newPlot('pie',
    // data
    [
      {
        values: vals,
        labels: ids,
        text: labels,
        hoverinfo: 'label+percent+text',
        textinfo: 'percent',
        type: 'pie',
        textfont: { size: 9, color: 'black' }
      }
    ],
    // layout
    {
      height: 400,
      width: 500,
      font: { size: 10 }
    }
  );
}

function makeBubble(data) {

  Plotly.newPlot('bubble',
    [{
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,
      mode: 'markers',
      marker: {
        size: data.sample_values,
        color: data.otu_ids,
        colorscale: 'Earth'
      }
    }],
    {
      showlegend: false,
      height: 600,
      width: 1200,
      xaxis: { title: 'OTU ID' }
    }
  );
}

function surlError(resp) {
  console.log('Sample URL Error!')
  console.log(resp);
}

function buildCharts(sample) {

  surl = `/samples/${sample}`;
  // Use `d3.json` to fetch the sample data for the plots
  d3.json(surl).then(function (resp) {

    // Create a Bubble Chart to display each sample.
    makeBubble(resp);

    // Create a PIE chart to display the top 10 samples.
    makePie(resp.sample_values.slice(0, 10), resp.otu_ids.slice(0, 10), resp.otu_labels.slice(0, 10));

  }, surlError);
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();