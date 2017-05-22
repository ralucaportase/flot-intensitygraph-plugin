/* global setFixtures */
/* brackets-xunit: includes=../lib/cbuffer.js,../jquery.flot.historybuffer.js*,../jquery.flot.js,../jquery.flot.charting.js */

describe('An Intensity graph', function() {
    'use strict';
    var $ = jQuery || NationalInstruments.Globals.jQuery;

    var fixture, placeholder, plot;

    beforeEach(function() {
        fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 150px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
    });

    it('should draw nothing when the graph is empty', function () {
        plot = $.plot(placeholder, [[[]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c = getPixelColor(ctx, ctx.canvas.width/2, ctx.canvas.height/2);
        expect(isClose(c, rgba(0,0,0,0))).toBeTruthy();
    });

    it('should draw using the coresponding colors of the gradient', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c0 = getPixelColor(ctx, 1*ctx.canvas.width/8, ctx.canvas.height/2),
            c1 = getPixelColor(ctx, 4*ctx.canvas.width/8, ctx.canvas.height/2),
            c2 = getPixelColor(ctx, 7*ctx.canvas.width/8, ctx.canvas.height/2);
        expect(isClose(c0, rgba(255,0,0,1))).toBeTruthy();
        expect(isClose(c1, rgba(127,0,127,1))).toBeTruthy();
        expect(isClose(c2, rgba(0,0,255,1))).toBeTruthy();
    });

    it('should draw using the low and high colors', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0.25,
                    max: 0.75,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: 0.25, color: 'red' },
                        { value: 0.75, color: 'red' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c1 = getPixelColor(ctx, 1*ctx.canvas.width/8, ctx.canvas.height/2),
            c2 = getPixelColor(ctx, 4*ctx.canvas.width/8, ctx.canvas.height/2),
            c3 = getPixelColor(ctx, 7*ctx.canvas.width/8, ctx.canvas.height/2);
        expect(isClose(c1, rgba(0,0,0,1))).toBeTruthy();
        expect(isClose(c2, rgba(255,0,0,1))).toBeTruthy();
        expect(isClose(c3, rgba(255,255,255,1))).toBeTruthy();
    });

    it('should draw using the low color when there are more points per pixel', function () {
        plot = $.plot(placeholder, [createTestMatrix(1000, 1000, 0)], {
            grid: {show: false},
            xaxis: {show: false, autoscale: 'exact'},
            yaxis: {show: false, autoscale: 'exact'},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0.25,
                    max: 0.75,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: 0.25, color: 'red' },
                        { value: 0.75, color: 'red' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c = getPixelColor(ctx, ctx.canvas.width/2, ctx.canvas.height/2);
        expect(isClose(c, rgba(0,0,0,1))).toBeTruthy();
    });

    it('should draw using the high color when there are more points per pixel', function () {
        plot = $.plot(placeholder, [createTestMatrix(1000, 1000, 1)], {
            grid: {show: false},
            xaxis: {show: false, autoscale: 'exact'},
            yaxis: {show: false, autoscale: 'exact'},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0.25,
                    max: 0.75,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: 0.25, color: 'red' },
                        { value: 0.75, color: 'red' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c = getPixelColor(ctx, ctx.canvas.width/2, ctx.canvas.height/2);
        expect(isClose(c, rgba(255,255,255,1))).toBeTruthy();
    });

    it('should draw using the only color of the gradien when only one is specified', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0,
                    max: 1,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: 0.25, color: 'red' },
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c1 = getPixelColor(ctx, 1*ctx.canvas.width/8, ctx.canvas.height/2),
            c2 = getPixelColor(ctx, 4*ctx.canvas.width/8, ctx.canvas.height/2),
            c3 = getPixelColor(ctx, 7*ctx.canvas.width/8, ctx.canvas.height/2);
        expect(isClose(c1, rgba(255,0,0,1))).toBeTruthy();
        expect(isClose(c2, rgba(255,0,0,1))).toBeTruthy();
        expect(isClose(c3, rgba(255,0,0,1))).toBeTruthy();
    });

    it('should work with a gradient of a arbitrary limits', function () {
        plot = $.plot(placeholder, [[[-0.5], [0], [0.5], [1], [1.5]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0,
                    max: 1,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: -0.5, color: 'red' },
                        { value:  0.5, color: 'yellow' },
                        { value:  1.5, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c1 = getPixelColor(ctx, 1*ctx.canvas.width/10, ctx.canvas.height/2),
            c2 = getPixelColor(ctx, 3*ctx.canvas.width/10, ctx.canvas.height/2),
            c3 = getPixelColor(ctx, 5*ctx.canvas.width/10, ctx.canvas.height/2),
            c4 = getPixelColor(ctx, 7*ctx.canvas.width/10, ctx.canvas.height/2),
            c5 = getPixelColor(ctx, 9*ctx.canvas.width/10, ctx.canvas.height/2);
        expect(isClose(c1, rgba(0,0,0,1))).toBeTruthy();
        expect(isClose(c2, rgba(255,0,0,1))).toBeTruthy();
        expect(isClose(c3, rgba(255,255,0,1))).toBeTruthy();
        expect(isClose(c4, rgba(0,0,255,1))).toBeTruthy();
        expect(isClose(c5, rgba(255,255,255,1))).toBeTruthy();
    });

    it('should ignore the values of the gradient outside the minimum and maximum limits', function () {
        plot = $.plot(placeholder, [[[-0.5], [0], [0.5], [1], [1.5]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0,
                    max: 1,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: -0.5, color: 'red' },
                        { value:  2.5, color: 'yellow' },
                        { value:  1.5, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c1 = getPixelColor(ctx, 1*ctx.canvas.width/10, ctx.canvas.height/2),
            c2 = getPixelColor(ctx, 3*ctx.canvas.width/10, ctx.canvas.height/2),
            c3 = getPixelColor(ctx, 5*ctx.canvas.width/10, ctx.canvas.height/2),
            c4 = getPixelColor(ctx, 7*ctx.canvas.width/10, ctx.canvas.height/2),
            c5 = getPixelColor(ctx, 9*ctx.canvas.width/10, ctx.canvas.height/2);
        expect(isClose(c1, rgba(0,0,0,1))).toBeTruthy();
        expect(isClose(c2, rgba(255,0,0,1))).toBeTruthy();
        expect(isClose(c3, rgba(127,0,127,1))).toBeTruthy();
        expect(isClose(c4, rgba(0,0,255,1))).toBeTruthy();
        expect(isClose(c5, rgba(255,255,255,1))).toBeTruthy();
    });

    it('should draw nothing when the limits of the x axis are negative', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false, min: -10, max: -5, autoscale: 'none'},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c0 = getPixelColor(ctx, 1*ctx.canvas.width/8, ctx.canvas.height/2),
            c1 = getPixelColor(ctx, 4*ctx.canvas.width/8, ctx.canvas.height/2),
            c2 = getPixelColor(ctx, 7*ctx.canvas.width/8, ctx.canvas.height/2);
        expect(isClose(c0, rgba(0,0,0,0))).toBeTruthy();
        expect(isClose(c1, rgba(0,0,0,0))).toBeTruthy();
        expect(isClose(c2, rgba(0,0,0,0))).toBeTruthy();
    });

    it('should draw nothing when the limits of the x axis are above the data width', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false, min: 5, max: 10, autoscale: 'none'},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c0 = getPixelColor(ctx, 1*ctx.canvas.width/8, ctx.canvas.height/2),
            c1 = getPixelColor(ctx, 4*ctx.canvas.width/8, ctx.canvas.height/2),
            c2 = getPixelColor(ctx, 7*ctx.canvas.width/8, ctx.canvas.height/2);
        expect(isClose(c0, rgba(0,0,0,0))).toBeTruthy();
        expect(isClose(c1, rgba(0,0,0,0))).toBeTruthy();
        expect(isClose(c2, rgba(0,0,0,0))).toBeTruthy();
    });

    it('should draw nothing when the limits of the y axis are negative', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false, min: -10, max: -5, autoscale: 'none'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c0 = getPixelColor(ctx, 1*ctx.canvas.width/8, ctx.canvas.height/2),
            c1 = getPixelColor(ctx, 4*ctx.canvas.width/8, ctx.canvas.height/2),
            c2 = getPixelColor(ctx, 7*ctx.canvas.width/8, ctx.canvas.height/2);
        expect(isClose(c0, rgba(0,0,0,0))).toBeTruthy();
        expect(isClose(c1, rgba(0,0,0,0))).toBeTruthy();
        expect(isClose(c2, rgba(0,0,0,0))).toBeTruthy();
    });

    it('should draw nothing when the limits of the y axis are above the data height', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false, min: 5, max: 10, autoscale: 'none'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c0 = getPixelColor(ctx, 1*ctx.canvas.width/8, ctx.canvas.height/2),
            c1 = getPixelColor(ctx, 4*ctx.canvas.width/8, ctx.canvas.height/2),
            c2 = getPixelColor(ctx, 7*ctx.canvas.width/8, ctx.canvas.height/2);
        expect(isClose(c0, rgba(0,0,0,0))).toBeTruthy();
        expect(isClose(c1, rgba(0,0,0,0))).toBeTruthy();
        expect(isClose(c2, rgba(0,0,0,0))).toBeTruthy();
    });

    it('should draw a piece of data when the axis limits are not perfectly matching the data width and height 1', function () {
        /*
                        y  +--------------------------------+
                           |                                |
                           |                   view         |
                           |                                |
                +--------------------------------+          |
                |          |          |          |          |
                |          |          |   blue   |          |
                |          |   c00    |   c01    |   c02    |
                +----------O--------------------------------+
                |          |          |          |
                |   red    |          |          |          x
                |          |          |          |
                +--------------------------------+
        */
        plot = $.plot(placeholder, [[[0.0, 0.6],
                                     [0.2, 0.8],
                                     [0.4, 1.0]]], {
            grid: {show: true},
            xaxis: {show: true, min: 1, max: 4, autoscale: 'none'},
            yaxis: {show: true, min: 1, max: 3, autoscale: 'none'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c00 = getPixelColor(ctx, 1*ctx.canvas.width/8, 2*ctx.canvas.height/3),
            c01 = getPixelColor(ctx, 4*ctx.canvas.width/8, 2*ctx.canvas.height/3),
            c02 = getPixelColor(ctx, 7*ctx.canvas.width/8, 2*ctx.canvas.height/3);
        expect(isClose(c00, rgba(1*255/5,0,4*255/5,1))).toBeTruthy();
        expect(isClose(c01, rgba(0*255/5,0,5*255/5,1))).toBeTruthy();
        expect(isClose(c02, rgba(0,0,0,0))).toBeTruthy();
    });

    it('should draw a piece of data when the axis limits are not perfectly matching the data width and height 2', function () {
        /*
                           +--------------------------------+
                           |          |          |          |
                           |          |          |   blue   |
                           |          |          |          |
            y   +-------------------------------------------+
                |          |          |          |          |
                |          |   red    |          |          |
                |   c10    |   c11    |   c12    |          |
                |          +--------------------------------+
                |                                |
                |      view                      |
                |                                |
                O--------------------------------+

                                                 x
        */
        plot = $.plot(placeholder, [[[0.0, 0.6],
                                     [0.2, 0.8],
                                     [0.4, 1.0]]], {
            grid: {show: true},
            xaxis: {show: true, min: -1, max: 2, autoscale: 'none'},
            yaxis: {show: true, min: -1, max: 1, autoscale: 'none'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c10 = getPixelColor(ctx, 1*ctx.canvas.width/8, 1*ctx.canvas.height/3),
            c11 = getPixelColor(ctx, 4*ctx.canvas.width/8, 1*ctx.canvas.height/3),
            c12 = getPixelColor(ctx, 7*ctx.canvas.width/8, 1*ctx.canvas.height/3);
        expect(isClose(c10, rgba(0,0,0,0))).toBeTruthy();
        expect(isClose(c11, rgba(5*255/5,0,0*255/5,1))).toBeTruthy();
        expect(isClose(c12, rgba(4*255/5,0,1*255/5,1))).toBeTruthy();
    });

    it('should not throw when the size of the plot is not an integer value', function (){
        $(placeholder).css('padding', '10%');
        $(placeholder).css('width', '89.43px');
        $(placeholder).css('height', '98.76px');

        var run = function() {
            plot = $.plot(placeholder, [createTestMatrix(60, 80)], {
                series: {
                    intensitygraph: {
                        show: true
                    }
                },
                xaxes: [{
                    show: false,
                    min: -100,
                    max: 1000,
                    autoscale: 'none'
                }],
                yaxes: [{
                    show: false,
                    min: -9.3,
                    max: 1000,
                    autoscale: 'none'
                }],
                plotWidth: 123.45,
                plotHeight: 234.56
            });
            plot.draw();
        };
        expect(run).not.toThrow();
    });

    [false, true].forEach(function(onlyData, index) {
        it('should fill the entire area when the axes limits are non integers and the data is zoomed in ' + (index+1), function () {
            plot = $.plot(placeholder, [createTestMatrix(40, 60)], {
                grid: {show: !onlyData},
                xaxis: {show: !onlyData, min: 1.123, max: 3.456, autoscale: 'none'},
                yaxis: {show: !onlyData, min: 2.345, max: 5.678, autoscale: 'none'},
                series: {
                    intensitygraph: {
                        show: true,
                        gradient: [
                            { value: 0, color: 'rgba(255,0,0,0.5)' },
                            { value: 1, color: 'rgba(0,0,255,0.5)' }
                        ]
                    }
                }
            });
            plot.draw();

            // check the color of random pixels not to be empty
            // avoid the border and axes when they are visible
            var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
                steps = 10, start = !onlyData ? 2 : 0, stop = !onlyData ? steps - 2 : 0;
            for (var i = start; i < stop; i++) {
                for (var j = start; j < stop; j++) {
                    var c = getPixelColor(ctx, i * ctx.canvas.width / steps, j * ctx.canvas.height / steps);
                    expect(isClose(c, rgba(0,0,0,0))).toBeFalsy();
                }
            }
        });
    });

    it('should draw using the higher color when there are more points per pixel', function () {
        /*
            0101010101
            1010101010              11111
            0101010101      =>      11111
            1010101010              11111
            0101010101
        */
        plot = $.plot(placeholder, [createPatternTestMatrix(500, 300)], {
            grid: {show: true},
            xaxis: {show: true, min: -100, max: 600, autoscale: 'none'},
            yaxis: {show: true, min: -100, max: 400, autoscale: 'none'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');

        // check the color of random sequence of pixels in the center of the canvas
        // there are so many points squeezed per pixel that the drawing area should be blue
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                var c = getPixelColor(ctx, ctx.canvas.width / 2 + i, ctx.canvas.height / 2 + j);
                expect(isClose(c, rgba(0,0,255,1))).toBeTruthy();
            }
        }
    });

    it('should draw using the higher color when there are more points per pixel 2', function () {
        /*
            000000000000
            011111111110              1xxxxx
            010000000010              10000x
            010000000010      =>      10000x
            010000000010              10000x
            011111111110              111111
            000000000000

            0 = red, 1 = blue, x = unknown
        */
        plot = $.plot(placeholder, [createBorderTestMatrix(1000, 1000)], {
            grid: {show: false},
            xaxis: {show: false, autoscale: 'exact'},
            yaxis: {show: false, autoscale: 'exact'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            insideColor = getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2),
            leftBorderColor = getPixelColor(ctx, 0, ctx.canvas.height / 2),
            bottomBorderColor = getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height - 1);
        expect(isClose(insideColor, rgba(255,0,0,1))).toBeTruthy();
        expect(isClose(leftBorderColor, rgba(0,0,255,1))).toBeTruthy();
        expect(isClose(bottomBorderColor, rgba(0,0,255,1))).toBeTruthy();
    });

    function getPixelColor(ctx, x, y) {
        return ctx.getImageData(x, y, 1, 1).data;
    }

    function rgba(r, g, b, a) {
        return [r, g, b, a * 255];
    }

    function isClose(c1, c2) {
        var tolerance = 2,
            close = c2
                .map(function(v, i) { return Math.abs(v - c1[i]); })
                .every(function(d) { return d <= tolerance; });
        return close;
    }

    function createTestMatrix(columns, rows, value) {
        var data = [];
        for (var i = 0; i < columns; i++) {
            data[i] = [];
            for (var j = 0; j < rows; j++) {
                data[i][j] = value != null ? value : Math.random();
            }
        }
        return data;
    }

    function createPatternTestMatrix(columns, rows) {
        var data = [];
        for(var i = 0; i < columns; i++) {
            data[i] = [];
            for(var j = 0; j < rows; j++) {
                data[i][j] = (i + j) % 2;
            }
        }
        return data;
    }

    function createBorderTestMatrix(columns, rows) {
        var data = [], d = 1;
        for(var i = 0; i < columns; i++) {
            data[i] = [];
            for(var j = 0; j < rows; j++) {
                if (i === d || i === columns - 1 - d || j === d || j === rows - 1 - d) {
                    data[i][j] = 1;
                } else {
                    data[i][j] = 0;
                }
            }
        }
        return data;
    }

    describe('legend', function() {

        var intensityGraph = new window.IntensityGraph();

        it('should add all the colors to the gradient according to the values of the markers', function() {
            var addColorStop = jasmine.createSpy(),
                ctx = {
                    fillRect: jasmine.createSpy(),
                    strokeRect: jasmine.createSpy(),
                    createLinearGradient: function() {
                        return {
                            addColorStop: addColorStop
                        };
                    }
                };

            var marker1 = {
                    value: 0,
                    color: 'red'
                },
                marker2 = {
                    value: 40,
                    color: 'yellow'
                },
                marker3 = {
                    value: 100,
                    color: 'green'
                };
            intensityGraph.drawLegend(ctx, 1, 1, 10, 50, [marker1, marker2, marker3], 'black', 'white');

            expect(addColorStop.calls.count()).toBe(3);
            expect(addColorStop.calls.argsFor(0)).toEqual([0.0, 'red']);
            expect(addColorStop.calls.argsFor(1)).toEqual([0.4, 'yellow']);
            expect(addColorStop.calls.argsFor(2)).toEqual([1.0, 'green']);
        });

        it('should use a gradient that perfectly fills the whole rectangle upside down', function() {
            var ctx = {
                fillRect: jasmine.createSpy(),
                strokeRect: jasmine.createSpy(),
                createLinearGradient: function() {
                    return {
                        addColorStop: jasmine.createSpy()
                    };
                }
            };
            spyOn(ctx, 'createLinearGradient').and.callThrough();

            var x = 1,
                y = 1,
                w = 10,
                h = 50;
            intensityGraph.drawLegend(ctx, x, y, w, h, [{
                value: 0,
                color: 'red'
            }, {
                value: 100,
                color: 'green'
            }], 'black', 'white');

            expect(ctx.createLinearGradient.calls.first().args).toEqual([0, y + h, 0, y]);
        });
    });

    describe('colorscale', function() {
        it('should not overlap yaxis when axis position is right', function() {
            plot = $.plot(placeholder, [createTestMatrix(40, 60)], {
                series: {
                    intensitygraph: {
                        show: true
                    }
                },
                yaxes: [{
                    position: 'right',
                    show: true,
                    min: 0,
                    max: 50,
                    autoscale: 'none'
                }, {
                    position: 'right',
                    show: true,
                    min: 0,
                    max: 50,
                    type: 'colorScale'
                }],
            });

            var yaxes = plot.getYAxes(),
                rightAxisBox = yaxes[0].box,
                colorscaleBox = yaxes[1].box;
            expect(rightAxisBox.left + rightAxisBox.width).toBeLessThan(colorscaleBox.left);
        });

        it('should not overlap yaxes when multiple yaxes exist', function() {
            ['left', 'right'].forEach(function(position) {
                plot = $.plot(placeholder, [createTestMatrix(40, 60)], {
                    series: {
                        intensitygraph: {
                            show: true
                        }
                    },
                    yaxes: [{
                            position: position,
                            show: true,
                            min: 0,
                            max: 50,
                            autoscale: 'none'
                        }, {
                            position: 'right',
                            show: true,
                            min: 0,
                            max: 50,
                            autoscale: 'none'
                        }, {
                            position: 'right',
                            show: true,
                            min: 0,
                            max: 50,
                            type: 'colorScale'
                        },
                        {
                            position: position,
                            show: true,
                            min: 0,
                            max: 50,
                            autoscale: 'none'
                        }
                    ],
                });

                var yaxes = plot.getYAxes(),
                    rightAxisBox1 = yaxes[0].box,
                    rightAxisBox2 = yaxes[1].box,
                    colorscaleBox = yaxes[2].box;
                expect(rightAxisBox1.left + rightAxisBox1.width).toBeLessThan(colorscaleBox.left);
                expect(rightAxisBox2.left + rightAxisBox2.width).toBeLessThan(colorscaleBox.left);
            });
        });

        it('should call drawLegend when a visible colorScale is attached', function() {
            var spy = spyOn(window.IntensityGraph.prototype, 'drawLegend').and.callThrough();
            plot = $.plot(placeholder, [createTestMatrix(1, 1)], {
                series: {
                    intensitygraph: {
                        show: true
                    }
                },
                yaxes: [{
                    position: 'right',
                    show: true,
                    min: 0,
                    max: 50,
                    type: 'colorScale'
                }]
            });

            expect(spy).toHaveBeenCalled();
        });

        it('should not call drawLegend when a hidden colorScale is attached', function() {
            var spy = spyOn(window.IntensityGraph.prototype, 'drawLegend').and.callThrough();
            plot = $.plot(placeholder, [createTestMatrix(1, 1)], {
                series: {
                    intensitygraph: {
                        show: true
                    }
                },
                yaxes: [{
                    position: 'right',
                    show: false,
                    min: 0,
                    max: 50,
                    type: 'colorScale'
                }]
            });

            expect(spy).not.toHaveBeenCalled();
        });


        it('should not call drawLegend when a colorScale isn\'t attached', function() {
            var spy = spyOn(window.IntensityGraph.prototype, 'drawLegend').and.callThrough();
            plot = $.plot(placeholder, [createTestMatrix(1, 1)], {
                series: {
                    intensitygraph: {
                        show: true
                    }
                },
                yaxes: []
            });

            expect(spy).not.toHaveBeenCalled();
        });

    });
});
