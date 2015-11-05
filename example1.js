/*global jQuery, $*/
/*jshint browser: true*/

$(function () {
  'use strict';
  var plot;
  var offset = 0.0;
  var h = 51;
  var w = 101;
  var max = Math.sqrt(h * h + w * w);
  var iMap = [];
  var count = 0;

  function rainbow(i, j, count) {
    var res = count + Math.sqrt(i * i + j * j);

    if (res > max)
      res -= max;

    return res;
  }

  function updateData() {
    iMap = [];
    for (var i = 0; i < w; i++) {
      for (var j = 0; j < h; j++) {
        iMap.push([i, j, rainbow(i, j, count)]);
      }
    }
    count++;
    if (count > max)
      count = 0;
  }

  function updateGraph() {
    //setTimeout(updateGraph, 16);

    if ($('#checkbox').prop('checked')) {
      updateData();

      plot.setData([{
        data: iMap
      }]);

      plot.setupGrid();
      plot.draw();
    }
    requestAnimationFrame(updateGraph);
  }

  updateData();
  plot = $.plot("#placeholder", [{
    data: iMap
  }], {
    series: {
      intensitymap: {
        active: true,
        show: true,
        max: max,
        radius: 4.5,
        gradient: {
          0: 'red',
          0.12: 'orange',
          0.25: 'yellow',
          0.37: 'lightgreen',
          0.5: 'cyan',
          0.62: 'lightblue',
          0.75: 'indigo',
          0.9: 'violet',
          1: 'red'
        },
        legend: true
      }
    },
    /*
        xaxis: {
          min: -10,
          max: 110
      },*/
    yaxes: [{
      min: 0,
      max: 50
    }, {
      position: 'right',
      show: false,
      min: -0,
      max: 50,
      reserveSpace: true,
      labelWidth: 50
    }, {
      position: 'right',
      show: true,
      min: 0,
      max: 100
    }, ],
    grid: {
      aboveData: true
    }
  });

  updateGraph();
});
