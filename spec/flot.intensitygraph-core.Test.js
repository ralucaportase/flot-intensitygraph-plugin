
import * as IntensityGraphCoreModule from 'intensitygraph/jquery.flot.intensitygraph-core';

describe('An Intensity graph', function () {
    var $ = jQuery || NationalInstruments.Globals.jQuery;

    var plot, placeholder,
        IntensityGraph = IntensityGraphCoreModule.IntensityGraph;

    describe('legend', function () {

        var intensityGraph = new IntensityGraph();

        it('should add all the colors to the gradient according to the values of the markers', function () {
            var addColorStop = jasmine.createSpy(),
                ctx = {
                fillRect: jasmine.createSpy(),
                strokeRect: jasmine.createSpy(),
                createLinearGradient: function () {
                    return {
                        addColorStop: addColorStop
                    };
                }
            };

            var marker1 = { value: 0, color: 'red' },
                marker2 = { value: 40, color: 'yellow' },
                marker3 = { value: 100, color: 'green' };
            intensityGraph.drawLegend(ctx, 1, 1, 10, 50, [marker1, marker2, marker3], 'black', 'white');

            expect(addColorStop.calls.count()).toBe(3);
            expect(addColorStop.calls.argsFor(0)).toEqual([0.0, 'red']);
            expect(addColorStop.calls.argsFor(1)).toEqual([0.4, 'yellow']);
            expect(addColorStop.calls.argsFor(2)).toEqual([1.0, 'green']);
        });

        it('should use a gradient that perfectly fills the hole rectangle upside down', function () {
            var ctx = {
                fillRect: jasmine.createSpy(),
                strokeRect: jasmine.createSpy(),
                createLinearGradient: function () {
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
            intensityGraph.drawLegend(ctx, x, y, w, h, [{ value: 0, color: 'red' }, { value: 100, color: 'green' }], 'black', 'white');

            expect(ctx.createLinearGradient.calls.first().args).toEqual([0, y + h, 0, y]);
        });

    });
});
