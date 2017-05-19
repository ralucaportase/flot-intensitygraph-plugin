/* global setFixtures */
/* brackets-xunit: includes=../lib/cbuffer.js,../jquery.flot.historybuffer.js*,../jquery.flot.js,../jquery.flot.charting.js */

describe('An Intensity graph', function() {
    'use strict';
    var $ = jQuery || NationalInstruments.Globals.jQuery;

    var fixture, placeholder, plot;

    beforeEach(function() {
        fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);

        jasmine.addMatchers({
            toBeGreaterThanOrEqualTo: function() {
                return {
                    compare: function(actual, expected) {
                        return {
                            pass: typeof actual === 'number' && typeof expected === 'number' && actual >= expected
                        };
                    }
                };
            },
            toBeLessThanOrEqualTo: function() {
                return {
                    compare: function(actual, expected) {
                        return {
                            pass: typeof actual === 'number' && typeof expected === 'number' && actual <= expected
                        };
                    }
                };
            }
        });
    });

    it('should draw nothing when the graph is empty', function() {
        plot = $.plot(placeholder, [
            [
                []
            ]
        ], {
            series: {
                intensitygraph: {
                    show: true
                }
            }
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'fillRect');

        plot.draw();

        expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('should perfectly fill the border area when the axis are one point long each and the graph has a single element', function() {
        plot = $.plot(placeholder, [
            [
                [0.5]
            ]
        ], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            xaxes: [{
                min: 0,
                max: 1,
                show: true,
                autoscale: 'none'
            }],
            yaxes: [{
                min: 0,
                max: 1,
                show: true,
                autoscale: 'none'
            }],
            grid: {
                borderWidth: 1
            }
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'fillRect').and.callThrough();

        plot.draw();

        expect(ctx.fillRect.calls.count()).toBe(1);
        var offset = plot.getPlotOffset(),
            x1 = ctx.fillRect.calls.first().args[0],
            y1 = ctx.fillRect.calls.first().args[1],
            x2 = ctx.fillRect.calls.first().args[2],
            y2 = ctx.fillRect.calls.first().args[3];
        expect(x1).toBe(offset.left);
        expect(y1).toBe(offset.top);
        expect(x2).toBe(plot.width());
        expect(y2).toBe(plot.height());
    });

    it('should draw the one element graph inside the border area', function() {
        plot = $.plot(placeholder, [
            [
                [0.5]
            ]
        ], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            xaxes: [{
                min: -1,
                max: 3,
                show: true,
                autoscale: 'none'
            }],
            yaxes: [{
                min: -1,
                max: 3,
                show: true,
                autoscale: 'none'
            }],
            grid: {
                borderWidth: 1
            }
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'fillRect').and.callThrough();

        plot.draw();

        expect(ctx.fillRect.calls.count()).toBe(1);
        var offset = plot.getPlotOffset(),
            x1 = ctx.fillRect.calls.first().args[0],
            y1 = ctx.fillRect.calls.first().args[1],
            x2 = ctx.fillRect.calls.first().args[2],
            y2 = ctx.fillRect.calls.first().args[3];
        expect(x1).toBeGreaterThanOrEqualTo(offset.left);
        expect(y1).toBeGreaterThanOrEqualTo(offset.top);
        expect(x2).toBeLessThanOrEqualTo(plot.width());
        expect(y2).toBeLessThanOrEqualTo(plot.height());
    });

    it('should draw nothing when the max of X axis is negative', function() {
        plot = $.plot(placeholder, [
            [
                [0.5]
            ]
        ], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            xaxes: [{
                min: -2,
                max: -1,
                autoscale: 'none'
            }]
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'fillRect');

        plot.draw();

        expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('should draw nothing when the min of Y axis is larger than the graph height', function() {
        plot = $.plot(placeholder, [
            [
                [0.5]
            ]
        ], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            yaxes: [{
                min: 1000,
                max: 2000,
                autoscale: 'none'
            }]
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'fillRect');

        plot.draw();

        expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('should draw by point when there are more than 1 column and 1 row per pixel', function() {
        plot = $.plot(placeholder, [createTestMatrix(40, 60)], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            xaxes: [{
                min: -100,
                max: 2000,
                autoscale: 'none'
            }],
            yaxes: [{
                min: -9.3,
                max: 3000,
                autoscale: 'none'
            }]
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'putImageData');

        plot.draw();

        expect(ctx.putImageData).toHaveBeenCalled();
    });

    it('should draw by point correctly even when the size of the plot is not an integer value', function() {
        $(placeholder).css('padding', '10%');
        $(placeholder).css('width', '89.43px');
        $(placeholder).css('height', '98.76px');

        plot = $.plot(placeholder, [createTestMatrix(40, 60)], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            xaxes: [{
                min: -100,
                max: 2000,
                autoscale: 'none'
            }],
            yaxes: [{
                min: -9.3,
                max: 3000,
                autoscale: 'none'
            }],
            plotWidth: 123.45,
            plotHeight: 234.56
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'putImageData');

        plot.draw();

        expect(ctx.putImageData).toHaveBeenCalled();
    });

    function createTestMatrix(rows, columns) {
        var data = [];
        for (var i = 0; i < columns; i++) {
            data[i] = [];
            for (var j = 0; j < rows; j++) {
                data[i][j] = Math.random();
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
