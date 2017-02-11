(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.IntensityGraph = IntensityGraph;
/* * The MIT License
Copyright (c) 2010, 2011, 2012, 2013 by Juergen Marsch
Copyright (c) 2015 by Andrew Dove & Ciprian Ceteras
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

function IntensityGraph() {

    var that = this,
        defaultGradient = [{ value: 0, color: 'rgba(0,0,0,1)' }, { value: 0.50, color: 'rgba(0,0,255,1)' }, { value: 1.0, color: 'rgba(255,255,255,1)' }],
        defaultOptions = {
        series: {
            intensitygraph: {
                data: [],
                show: false,
                lowColor: 'rgba(0,0,0,1)',
                highColor: 'rgba(255,255,255,1)',
                min: 0,
                max: 1
            }
        }
    };

    function extendEmpty(org, ext) {
        for (var i in ext) {
            if (!org[i]) {
                org[i] = ext[i];
            } else {
                if (_typeof(ext[i]) === 'object') {
                    extendEmpty(org[i], ext[i]);
                }
            }
        }
    };

    function createArray(length) {
        var arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while (i--) {
                arr[length - 1 - i] = createArray.apply(this, args);
            }
        }

        return arr;
    };

    function processRawData(plot, s, sData, sDatapoints) {
        var opts = plot.getOptions();
        if (opts.series.intensitygraph.show === true) {
            sDatapoints.pointsize = 2;

            // push two data points, one with xmin, ymin, the other one with xmax, ymax
            // so the autoscale algorithms can determine the draw size.
            sDatapoints.points.length = 0;
            sDatapoints.points.push(0, 0);
            sDatapoints.points.push(sData.length || 0, sData[0] ? sData[0].length : 0);
        }

        // TODO reserve enough space so the map is not drawn outside of the chart.
    }

    function drawLegend(ctx, x, y, w, h, gradient, lowColor, highColor) {
        var highLowColorBoxHeight = 7,
            grad = ctx.createLinearGradient(0, y + h, 0, y),
            first = gradient[0].value,
            last = gradient[gradient.length - 1].value,
            offset,
            i;
        for (i = 0; i < gradient.length; i++) {
            offset = (gradient[i].value - first) / (last - first);
            if (offset >= 0 && offset <= 1.0) {
                grad.addColorStop(offset, gradient[i].color);
            }
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = lowColor;
        ctx.fillRect(x, y + h, w, highLowColorBoxHeight);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 0.5, y + h + 0.5, w + 1, highLowColorBoxHeight);
        ctx.fillStyle = highColor;
        ctx.fillRect(x, y - highLowColorBoxHeight, w, highLowColorBoxHeight);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 0.5, y - highLowColorBoxHeight + 0.5, w + 1, highLowColorBoxHeight);
    };

    function init(plot) {
        var opt = null,
            offset = '7',
            acanvas = null,
            series = null;
        plot.hooks.processOptions.push(processOptions);

        function processOptions(plot, options) {
            if (options.series.intensitygraph.show) {
                extendEmpty(options, that.defaultOptions);
                if (!options.series.intensitygraph.gradient) {
                    options.series.intensitygraph.gradient = defaultGradient;
                }

                opt = options;
                plot.hooks.drawSeries.push(drawSeries);
                plot.hooks.processRawData.push(processRawData);
                initColorPalette();
            }
        };

        function initColorPalette() {
            var i, x;
            var canvas = document.createElement('canvas');
            canvas.width = '1';
            canvas.height = '256';
            var ctx = canvas.getContext('2d'),
                grad = ctx.createLinearGradient(0, 0, 0, 256),
                gradient = opt.series.intensitygraph.gradient,
                first = gradient[0].value,
                last = gradient[gradient.length - 1].value,
                offset;

            if (last === first) {
                grad.addColorStop(0, gradient[0].color);
                grad.addColorStop(1, gradient[0].color);
            } else {
                for (i = 0; i < gradient.length; i++) {
                    x = gradient[i].value;
                    offset = (x - first) / (last - first);
                    if (offset >= 0 && offset <= 1) {
                        grad.addColorStop(offset, gradient[i].color);
                    }
                }
            }

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1, 256);
            opt.series.intensitygraph.palette = [];
            var imgDataPalette = ctx.getImageData(0, 0, 1, 256).data;
            for (var i = 0; i < imgDataPalette.length; i += 4) {
                opt.series.intensitygraph.palette[i / 4] = "rgba(" + imgDataPalette[i] + "," + imgDataPalette[i + 1] + "," + imgDataPalette[i + 2] + "," + imgDataPalette[i + 3] / 255 + ")";
            }
        };

        function drawSeries(plot, ctx, serie) {
            var id = ctx.createImageData(1, 1);
            var halfScaleX, halfScaleY, left, top;
            var i, j, value, x, y;
            var range = serie.intensitygraph.max - serie.intensitygraph.min;

            var colorLow = serie.intensitygraph.lowColor;
            var colorHigh = serie.intensitygraph.highColor;

            var palette = opt.series.intensitygraph.palette;
            var scaleX = Math.abs(plot.width() / (serie.xaxis.max - serie.xaxis.min));
            var scaleY = Math.abs(plot.height() / (serie.yaxis.max - serie.yaxis.min));
            var offset = plot.getPlotOffset();
            ctx.save();
            ctx.beginPath();
            ctx.rect(offset.left, offset.top, plot.width(), plot.height());
            ctx.clip();
            if (scaleX > 1 || scaleY > 1) {
                scaleX = Math.ceil(scaleX);
                scaleY = Math.ceil(scaleY);
                halfScaleX = scaleX / 2;
                halfScaleY = scaleY / 2;
                left = offset.left + halfScaleX;
                top = offset.top - halfScaleY;
                for (i = Math.max(serie.xaxis.min, 0) | 0; i < Math.min(serie.data.length, serie.xaxis.max); i++) {
                    for (j = Math.max(serie.yaxis.min, 0) | 0; j < Math.min(serie.data[0].length, serie.yaxis.max); j++) {
                        if (0 <= i && i < serie.data.length && 0 <= j && j < serie.data[i].length) {
                            value = serie.data[i][j];
                            drawRectangle(ctx, serie.xaxis.p2c(i) + left, serie.yaxis.p2c(j) + top, value);
                        }
                    }
                }
            } else {
                var cache = createArray(plot.width() + 1, plot.height() + 1);
                for (i = Math.max(serie.xaxis.min, 0) | 0; i < Math.min(serie.data.length, serie.xaxis.max); i++) {
                    for (j = Math.max(serie.yaxis.min, 0) | 0; j < Math.min(serie.data[0].length, serie.yaxis.max); j++) {
                        value = serie.data[i][j];
                        x = Math.round(serie.xaxis.p2c(i));
                        y = Math.round(serie.yaxis.p2c(j));
                        var current = cache[x][y];
                        if (current === undefined || value > current) {
                            cache[x][y] = value;
                            drawPixel(ctx, x + offset.left, y + offset.top, value);
                        }
                    }
                }
            }

            ctx.restore();

            if (opt.series.intensitygraph.legend === true) {
                var colorLegendAxis = opt.yaxes.filter(function (axis) {
                    return axis.position === 'right' && axis.reserveSpace && axis.labelWidth;
                })[0],
                    colorLegendWidth = colorLegendAxis ? colorLegendAxis.labelWidth - 10 : 20,
                    yaxisLabelWidth = !isNaN(opt.yaxes[0].labelWidth) ? opt.yaxes[0].labelWidth : 0,
                    x = opt.yaxes[0].position === 'right' && opt.yaxes[0].type !== 'colorScaleGradient' ? offset.left + plot.width() + yaxisLabelWidth + 30 : offset.left + plot.width() + 20,
                    gradient = opt.series.intensitygraph.gradient,
                    lowColor = opt.series.intensitygraph.lowColor,
                    highColor = opt.series.intensitygraph.highColor;
                drawLegend(ctx, x, offset.top, colorLegendWidth, plot.height(), gradient, lowColor, highColor);
            }

            function getColor(value) {
                var index;
                if (range === 0) {
                    index = 127; // 0.5 * 255
                    return palette[index];
                } else if (value < serie.intensitygraph.min) {
                    return colorLow;
                } else if (value > serie.intensitygraph.max) {
                    return colorHigh;
                } else {
                    index = Math.round((value - serie.intensitygraph.min) * 255 / range);
                    return palette[index];
                }
            };

            function drawPixel(ctx, x, y, value) {
                var colorRGBA = getColor(value);

                var colorStr = colorRGBA.slice(colorRGBA.indexOf('(') + 1, colorRGBA.indexOf(')'));
                var colorArr = colorStr.split(',');

                id.data[0] = parseInt(colorArr[0], 10);
                id.data[1] = parseInt(colorArr[1], 10);
                id.data[2] = parseInt(colorArr[2], 10);
                id.data[3] = parseFloat(colorArr[3]) * 255;

                ctx.putImageData(id, x, y);
            };

            function drawRectangle(ctx, x, y, value) {
                // storing the variables because they will be often used
                var xb = Math.floor(x - halfScaleX),
                    yb = Math.floor(y - halfScaleY);

                ctx.fillStyle = getColor(value);
                ctx.fillRect(xb, yb, scaleX, scaleY);
            };
        };
    };

    this.defaultOptions = defaultOptions;
    this.drawLegend = drawLegend;
    this.init = init;
}

},{}],2:[function(require,module,exports){
'use strict';

var _jqueryFlot = require('./jquery.flot.intensitygraph-core');

var IntensityGraphCoreModule = _interopRequireWildcard(_jqueryFlot);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

(function (global, $) {

    var pluginName = 'intensitygraph',
        pluginVersion = '0.2';

    var IntensityGraph = IntensityGraphCoreModule.IntensityGraph,
        intensityGraph = new IntensityGraph();

    $.plot.plugins.push({
        init: intensityGraph.init,
        options: intensityGraph.defaultOptions,
        name: pluginName,
        version: pluginVersion
    });
})(undefined, jQuery); /* * The MIT License
                       Copyright (c) 2010, 2011, 2012, 2013 by Juergen Marsch
                       Copyright (c) 2015 by Andrew Dove & Ciprian Ceteras
                       Permission is hereby granted, free of charge, to any person obtaining a copy
                       of this software and associated documentation files (the 'Software'), to deal
                       in the Software without restriction, including without limitation the rights
                       to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                       copies of the Software, and to permit persons to whom the Software is
                       furnished to do so, subject to the following conditions:
                       The above copyright notice and this permission notice shall be included in
                       all copies or substantial portions of the Software.
                       THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                       IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                       FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                       AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                       LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                       THE SOFTWARE.
                       */

},{"./jquery.flot.intensitygraph-core":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcXVlcnkuZmxvdC5pbnRlbnNpdHlncmFwaC1jb3JlLmpzIiwianF1ZXJ5LmZsb3QuaW50ZW5zaXR5Z3JhcGgtcGx1Z2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7UUNxQmdCLGMsR0FBQSxjO0FBckJoQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQk8sU0FBUyxjQUFULEdBQTBCOztBQUU3QixRQUFJLE9BQU8sSUFBWDtBQUFBLFFBQ0ksa0JBQWtCLENBQ2QsRUFBRSxPQUFPLENBQVQsRUFBWSxPQUFPLGVBQW5CLEVBRGMsRUFFZCxFQUFFLE9BQU8sSUFBVCxFQUFlLE9BQU8saUJBQXRCLEVBRmMsRUFHZCxFQUFFLE9BQU8sR0FBVCxFQUFjLE9BQU8scUJBQXJCLEVBSGMsQ0FEdEI7QUFBQSxRQU1JLGlCQUFpQjtBQUNiLGdCQUFRO0FBQ0osNEJBQWdCO0FBQ1osc0JBQU0sRUFETTtBQUVaLHNCQUFNLEtBRk07QUFHWiwwQkFBVSxlQUhFO0FBSVosMkJBQVcscUJBSkM7QUFLWixxQkFBSyxDQUxPO0FBTVoscUJBQUs7QUFOTztBQURaO0FBREssS0FOckI7O0FBbUJBLGFBQVMsV0FBVCxDQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQjtBQUMzQixhQUFLLElBQUksQ0FBVCxJQUFjLEdBQWQsRUFBbUI7QUFDZixnQkFBSSxDQUFDLElBQUksQ0FBSixDQUFMLEVBQWE7QUFDVCxvQkFBSSxDQUFKLElBQVMsSUFBSSxDQUFKLENBQVQ7QUFDSCxhQUZELE1BRU87QUFDSCxvQkFBSSxRQUFPLElBQUksQ0FBSixDQUFQLE1BQWtCLFFBQXRCLEVBQWdDO0FBQzVCLGdDQUFZLElBQUksQ0FBSixDQUFaLEVBQW9CLElBQUksQ0FBSixDQUFwQjtBQUNIO0FBQ0o7QUFDSjtBQUNKOztBQUVELGFBQVMsV0FBVCxDQUFxQixN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Q0EsbUJBQUcsSUFBSCxDQUFRLENBQVIsSUFBYSxXQUFXLFNBQVMsQ0FBVCxDQUFYLElBQXdCLEdBQXJDOztBQUVBLG9CQUFJLFlBQUosQ0FBaUIsRUFBakIsRUFBcUIsQ0FBckIsRUFBd0IsQ0FBeEI7QUFDSDs7QUFFRCxxQkFBUyxhQUFULENBQXVCLEdBQXZCLEVBQTRCLENBQTVCLEVBQStCLENBQS9CLEVBQWtDLEtBQWxDLEVBQXlDO0FBQ3JDO0FBQ0Esb0JBQUksS0FBSyxLQUFLLEtBQUwsQ0FBVyxJQUFJLFVBQWYsQ0FBVDtBQUFBLG9CQUNFLEtBQUssS0FBSyxLQUFMLENBQVcsSUFBSSxVQUFmLENBRFA7O0FBR0Esb0JBQUksU0FBSixHQUFnQixTQUFTLEtBQVQsQ0FBaEI7QUFDQSxvQkFBSSxRQUFKLENBQWEsRUFBYixFQUFpQixFQUFqQixFQUFxQixNQUFyQixFQUE2QixNQUE3QjtBQUNIO0FBQ0o7QUFDSjs7QUFHRCxTQUFLLGNBQUwsR0FBc0IsY0FBdEI7QUFDQSxTQUFLLFVBQUwsR0FBa0IsVUFBbEI7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0g7Ozs7O0FDN1BEOztJQUFZLHdCOzs7O0FBRVosQ0FBQyxVQUFVLE1BQVYsRUFBa0IsQ0FBbEIsRUFBcUI7O0FBRWxCLFFBQUksYUFBYSxnQkFBakI7QUFBQSxRQUNJLGdCQUFnQixLQURwQjs7QUFHQSxRQUFJLGlCQUFpQix5QkFBeUIsY0FBOUM7QUFBQSxRQUNJLGlCQUFpQixJQUFJLGNBQUosRUFEckI7O0FBR0EsTUFBRSxJQUFGLENBQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0I7QUFDakIsY0FBTSxlQUFlLElBREo7QUFFakIsaUJBQVMsZUFBZSxjQUZQO0FBR2pCLGNBQU0sVUFIVztBQUlqQixpQkFBUztBQUpRLEtBQXBCO0FBT0gsQ0FmRCxhQWVTLE1BZlQsRSxDQXRCQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiAqIFRoZSBNSVQgTGljZW5zZVxyXG5Db3B5cmlnaHQgKGMpIDIwMTAsIDIwMTEsIDIwMTIsIDIwMTMgYnkgSnVlcmdlbiBNYXJzY2hcclxuQ29weXJpZ2h0IChjKSAyMDE1IGJ5IEFuZHJldyBEb3ZlICYgQ2lwcmlhbiBDZXRlcmFzXHJcblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvIGRlYWxcclxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuVEhFIFNPRlRXQVJFLlxyXG4qL1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBJbnRlbnNpdHlHcmFwaCgpIHtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgZGVmYXVsdEdyYWRpZW50ID0gW1xyXG4gICAgICAgICAgICB7IHZhbHVlOiAwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMSknIH0sXHJcbiAgICAgICAgICAgIHsgdmFsdWU6IDAuNTAsIGNvbG9yOiAncmdiYSgwLDAsMjU1LDEpJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAxLjAsIGNvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwxKScgfVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHNlcmllczoge1xyXG4gICAgICAgICAgICAgICAgaW50ZW5zaXR5Z3JhcGg6IHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBsb3dDb2xvcjogJ3JnYmEoMCwwLDAsMSknLFxyXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hDb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMSknLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgICAgICBtYXg6IDFcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZXh0ZW5kRW1wdHkob3JnLCBleHQpIHtcclxuICAgICAgICBmb3IgKHZhciBpIGluIGV4dCkge1xyXG4gICAgICAgICAgICBpZiAoIW9yZ1tpXSkge1xyXG4gICAgICAgICAgICAgICAgb3JnW2ldID0gZXh0W2ldO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBleHRbaV0gPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kRW1wdHkob3JnW2ldLCBleHRbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVBcnJheShsZW5ndGgpIHtcclxuICAgICAgICB2YXIgYXJyID0gbmV3IEFycmF5KGxlbmd0aCB8fCAwKSxcclxuICAgICAgICAgICAgaSA9IGxlbmd0aDtcclxuXHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuICAgICAgICAgICAgd2hpbGUgKGktLSkgYXJyW2xlbmd0aCAtIDEgLSBpXSA9IGNyZWF0ZUFycmF5LmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1Jhd0RhdGEocGxvdCwgcywgc0RhdGEsIHNEYXRhcG9pbnRzKSB7XHJcbiAgICAgICAgdmFyIG9wdHMgPSBwbG90LmdldE9wdGlvbnMoKTtcclxuICAgICAgICBpZiAob3B0cy5zZXJpZXMuaW50ZW5zaXR5Z3JhcGguc2hvdyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBzRGF0YXBvaW50cy5wb2ludHNpemUgPSAyO1xyXG5cclxuICAgICAgICAgICAgLy8gcHVzaCB0d28gZGF0YSBwb2ludHMsIG9uZSB3aXRoIHhtaW4sIHltaW4sIHRoZSBvdGhlciBvbmUgd2l0aCB4bWF4LCB5bWF4XHJcbiAgICAgICAgICAgIC8vIHNvIHRoZSBhdXRvc2NhbGUgYWxnb3JpdGhtcyBjYW4gZGV0ZXJtaW5lIHRoZSBkcmF3IHNpemUuXHJcbiAgICAgICAgICAgIHNEYXRhcG9pbnRzLnBvaW50cy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICBzRGF0YXBvaW50cy5wb2ludHMucHVzaCgwLCAwKTtcclxuICAgICAgICAgICAgc0RhdGFwb2ludHMucG9pbnRzLnB1c2goc0RhdGEubGVuZ3RoIHx8IDAsIHNEYXRhWzBdID8gc0RhdGFbMF0ubGVuZ3RoIDogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPIHJlc2VydmUgZW5vdWdoIHNwYWNlIHNvIHRoZSBtYXAgaXMgbm90IGRyYXduIG91dHNpZGUgb2YgdGhlIGNoYXJ0LlxyXG4gICAgfVxyXG5cclxuICBcdGZ1bmN0aW9uIGRyYXdMZWdlbmQoY3R4LCB4LCB5LCB3LCBoLCBncmFkaWVudCwgbG93Q29sb3IsIGhpZ2hDb2xvcikge1xyXG4gIFx0XHR2YXIgaGlnaExvd0NvbG9yQm94SGVpZ2h0ID0gNyxcclxuICBcdFx0ICBncmFkID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIHkgKyBoLCAwLCB5KSxcclxuICBcdFx0ICBmaXJzdCA9IGdyYWRpZW50WzBdLnZhbHVlLCBsYXN0ID0gZ3JhZGllbnRbZ3JhZGllbnQubGVuZ3RoIC0gMV0udmFsdWUsIG9mZnNldCwgaTtcclxuICBcdFx0Zm9yIChpID0gMDsgaSA8IGdyYWRpZW50Lmxlbmd0aDsgaSsrKSB7XHJcbiAgXHRcdFx0b2Zmc2V0ID0gKGdyYWRpZW50W2ldLnZhbHVlIC0gZmlyc3QpIC8gKGxhc3QgLSBmaXJzdCk7XHJcbiAgXHRcdFx0aWYgKG9mZnNldCA+PSAwICYmIG9mZnNldCA8PSAxLjApIHtcclxuICBcdFx0XHRcdGdyYWQuYWRkQ29sb3JTdG9wKG9mZnNldCwgZ3JhZGllbnRbaV0uY29sb3IpO1xyXG4gIFx0XHRcdH1cclxuICBcdFx0fVxyXG5cclxuICBcdFx0Y3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgXHRcdGN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcclxuICBcdFx0Y3R4LmZpbGxTdHlsZSA9IGxvd0NvbG9yO1xyXG4gIFx0XHRjdHguZmlsbFJlY3QoeCwgeSArIGgsIHcsIGhpZ2hMb3dDb2xvckJveEhlaWdodCk7XHJcbiAgXHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJztcclxuICBcdFx0Y3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgXHRcdGN0eC5zdHJva2VSZWN0KHggLSAwLjUsIHkgKyBoICsgMC41LCB3ICsgMSwgaGlnaExvd0NvbG9yQm94SGVpZ2h0KTtcclxuICBcdFx0Y3R4LmZpbGxTdHlsZSA9IGhpZ2hDb2xvcjtcclxuICBcdFx0Y3R4LmZpbGxSZWN0KHgsIHkgLSBoaWdoTG93Q29sb3JCb3hIZWlnaHQsIHcsIGhpZ2hMb3dDb2xvckJveEhlaWdodCk7XHJcbiAgXHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJztcclxuICBcdFx0Y3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgXHRcdGN0eC5zdHJva2VSZWN0KHggLSAwLjUsIHkgLSBoaWdoTG93Q29sb3JCb3hIZWlnaHQgKyAwLjUsIHcgKyAxLCBoaWdoTG93Q29sb3JCb3hIZWlnaHQpO1xyXG4gIFx0fTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0KHBsb3QpIHtcclxuICAgICAgICB2YXIgb3B0ID0gbnVsbCxcclxuICAgICAgICAgICAgb2Zmc2V0ID0gJzcnLFxyXG4gICAgICAgICAgICBhY2FudmFzID0gbnVsbCxcclxuICAgICAgICAgICAgc2VyaWVzID0gbnVsbDtcclxuICAgICAgICBwbG90Lmhvb2tzLnByb2Nlc3NPcHRpb25zLnB1c2gocHJvY2Vzc09wdGlvbnMpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzT3B0aW9ucyhwbG90LCBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNlcmllcy5pbnRlbnNpdHlncmFwaC5zaG93KSB7XHJcbiAgICAgICAgICAgICAgICBleHRlbmRFbXB0eShvcHRpb25zLCB0aGF0LmRlZmF1bHRPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5zZXJpZXMuaW50ZW5zaXR5Z3JhcGguZ3JhZGllbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnNlcmllcy5pbnRlbnNpdHlncmFwaC5ncmFkaWVudCA9IGRlZmF1bHRHcmFkaWVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvcHQgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICAgICAgcGxvdC5ob29rcy5kcmF3U2VyaWVzLnB1c2goZHJhd1Nlcmllcyk7XHJcbiAgICAgICAgICAgICAgICBwbG90Lmhvb2tzLnByb2Nlc3NSYXdEYXRhLnB1c2gocHJvY2Vzc1Jhd0RhdGEpO1xyXG4gICAgICAgICAgICAgICAgaW5pdENvbG9yUGFsZXR0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdENvbG9yUGFsZXR0ZSgpIHtcclxuICAgICAgICAgICAgdmFyIGksIHg7XHJcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gJzEnO1xyXG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gJzI1Nic7XHJcbiAgICAgICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcclxuICAgICAgICAgICAgICBncmFkID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIDI1NiksXHJcbiAgICAgICAgICAgICAgZ3JhZGllbnQgPSBvcHQuc2VyaWVzLmludGVuc2l0eWdyYXBoLmdyYWRpZW50LFxyXG4gICAgICAgICAgICAgICAgICBmaXJzdCA9IGdyYWRpZW50WzBdLnZhbHVlLCBsYXN0ID0gZ3JhZGllbnRbZ3JhZGllbnQubGVuZ3RoIC0gMV0udmFsdWUsIG9mZnNldDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYXN0ID09PSBmaXJzdCkge1xyXG4gICAgICAgICAgICAgICAgZ3JhZC5hZGRDb2xvclN0b3AoMCwgZ3JhZGllbnRbMF0uY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgZ3JhZC5hZGRDb2xvclN0b3AoMSwgZ3JhZGllbnRbMF0uY29sb3IpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGdyYWRpZW50Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IGdyYWRpZW50W2ldLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9ICh4IC0gZmlyc3QpIC8gKGxhc3QgLSBmaXJzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldCA+PSAwICYmIG9mZnNldCA8PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKG9mZnNldCwgZ3JhZGllbnRbaV0uY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCAxLCAyNTYpO1xyXG4gICAgICAgICAgICBvcHQuc2VyaWVzLmludGVuc2l0eWdyYXBoLnBhbGV0dGUgPSBbXTtcclxuICAgICAgICAgICAgdmFyIGltZ0RhdGFQYWxldHRlID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCAxLCAyNTYpLmRhdGE7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1nRGF0YVBhbGV0dGUubGVuZ3RoOyBpICs9IDQpIHtcclxuICAgICAgICAgICAgICAgIG9wdC5zZXJpZXMuaW50ZW5zaXR5Z3JhcGgucGFsZXR0ZVtpIC8gNF0gPSBcInJnYmEoXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIGltZ0RhdGFQYWxldHRlW2ldICtcclxuICAgICAgICAgICAgICAgICAgICBcIixcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgaW1nRGF0YVBhbGV0dGVbaSArIDFdICtcclxuICAgICAgICAgICAgICAgICAgICBcIixcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgaW1nRGF0YVBhbGV0dGVbaSArIDJdICtcclxuICAgICAgICAgICAgICAgICAgICBcIixcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgaW1nRGF0YVBhbGV0dGVbaSArIDNdIC8gMjU1ICtcclxuICAgICAgICAgICAgICAgICAgICBcIilcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRyYXdTZXJpZXMocGxvdCwgY3R4LCBzZXJpZSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKDEsIDEpO1xyXG4gICAgICAgICAgICB2YXIgaGFsZlNjYWxlWCwgaGFsZlNjYWxlWSwgbGVmdCwgdG9wO1xyXG4gICAgICAgICAgICB2YXIgaSwgaiwgdmFsdWUsIHgsIHk7XHJcbiAgICAgICAgICAgIHZhciByYW5nZSA9IHNlcmllLmludGVuc2l0eWdyYXBoLm1heCAtIHNlcmllLmludGVuc2l0eWdyYXBoLm1pbjtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb2xvckxvdyA9IHNlcmllLmludGVuc2l0eWdyYXBoLmxvd0NvbG9yO1xyXG4gICAgICAgICAgICB2YXIgY29sb3JIaWdoID0gc2VyaWUuaW50ZW5zaXR5Z3JhcGguaGlnaENvbG9yO1xyXG5cclxuICAgICAgICAgICAgdmFyIHBhbGV0dGUgPSBvcHQuc2VyaWVzLmludGVuc2l0eWdyYXBoLnBhbGV0dGU7XHJcbiAgICAgICAgICAgIHZhciBzY2FsZVggPSBNYXRoLmFicyhwbG90LndpZHRoKCkgLyAoc2VyaWUueGF4aXMubWF4IC0gc2VyaWUueGF4aXMubWluKSk7XHJcbiAgICAgICAgICAgIHZhciBzY2FsZVkgPSBNYXRoLmFicyhwbG90LmhlaWdodCgpIC8gKHNlcmllLnlheGlzLm1heCAtIHNlcmllLnlheGlzLm1pbikpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gcGxvdC5nZXRQbG90T2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LnJlY3Qob2Zmc2V0LmxlZnQsb2Zmc2V0LnRvcCwgcGxvdC53aWR0aCgpLHBsb3QuaGVpZ2h0KCkpO1xyXG4gICAgICAgICAgICBjdHguY2xpcCgpO1xyXG4gICAgICAgICAgICBpZiAoc2NhbGVYID4gMSB8fCBzY2FsZVkgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBzY2FsZVggPSBNYXRoLmNlaWwoc2NhbGVYKTtcclxuICAgICAgICAgICAgICAgIHNjYWxlWSA9IE1hdGguY2VpbChzY2FsZVkpO1xyXG4gICAgICAgICAgICAgICAgaGFsZlNjYWxlWCA9IHNjYWxlWCAvIDI7XHJcbiAgICAgICAgICAgICAgICBoYWxmU2NhbGVZID0gc2NhbGVZIC8gMjtcclxuICAgICAgICAgICAgICAgIGxlZnQgPSBvZmZzZXQubGVmdCArIGhhbGZTY2FsZVg7XHJcbiAgICAgICAgICAgICAgICB0b3AgPSBvZmZzZXQudG9wIC0gaGFsZlNjYWxlWTtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IE1hdGgubWF4KHNlcmllLnhheGlzLm1pbiwgMCkgfCAwOyBpIDwgTWF0aC5taW4oc2VyaWUuZGF0YS5sZW5ndGgsIHNlcmllLnhheGlzLm1heCk7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IE1hdGgubWF4KHNlcmllLnlheGlzLm1pbiwgMCkgfCAwOyBqIDwgTWF0aC5taW4oc2VyaWUuZGF0YVswXS5sZW5ndGgsIHNlcmllLnlheGlzLm1heCk7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoMCA8PSBpICYmIGkgPCBzZXJpZS5kYXRhLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMCA8PSBqICYmIGogPCBzZXJpZS5kYXRhW2ldLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBzZXJpZS5kYXRhW2ldW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhd1JlY3RhbmdsZShjdHgsIHNlcmllLnhheGlzLnAyYyhpKSArIGxlZnQsIHNlcmllLnlheGlzLnAyYyhqKSArIHRvcCwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhY2hlID0gY3JlYXRlQXJyYXkocGxvdC53aWR0aCgpICsgMSwgcGxvdC5oZWlnaHQoKSArIDEpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gTWF0aC5tYXgoc2VyaWUueGF4aXMubWluLCAwKSB8IDA7IGkgPCBNYXRoLm1pbihzZXJpZS5kYXRhLmxlbmd0aCwgc2VyaWUueGF4aXMubWF4KTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gTWF0aC5tYXgoc2VyaWUueWF4aXMubWluLCAwKSB8IDA7IGogPCBNYXRoLm1pbihzZXJpZS5kYXRhWzBdLmxlbmd0aCwgc2VyaWUueWF4aXMubWF4KTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gc2VyaWUuZGF0YVtpXVtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IE1hdGgucm91bmQoc2VyaWUueGF4aXMucDJjKGkpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeSA9IE1hdGgucm91bmQoc2VyaWUueWF4aXMucDJjKGopKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSBjYWNoZVt4XVt5XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA+IGN1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlW3hdW3ldID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmF3UGl4ZWwoY3R4LCB4ICsgb2Zmc2V0LmxlZnQsIHkgKyBvZmZzZXQudG9wLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0LnNlcmllcy5pbnRlbnNpdHlncmFwaC5sZWdlbmQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb2xvckxlZ2VuZEF4aXMgPSBvcHQueWF4ZXMuZmlsdGVyKGZ1bmN0aW9uIChheGlzKSB7IHJldHVybiBheGlzLnBvc2l0aW9uID09PSAncmlnaHQnICYmIGF4aXMucmVzZXJ2ZVNwYWNlICYmIGF4aXMubGFiZWxXaWR0aDsgfSlbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3JMZWdlbmRXaWR0aCA9IGNvbG9yTGVnZW5kQXhpcyA/IChjb2xvckxlZ2VuZEF4aXMubGFiZWxXaWR0aCAtIDEwKSA6IDIwLFxyXG5cdFx0XHRcdFx0eWF4aXNMYWJlbFdpZHRoID0gIWlzTmFOKG9wdC55YXhlc1swXS5sYWJlbFdpZHRoKSA/IG9wdC55YXhlc1swXS5sYWJlbFdpZHRoIDogMCxcclxuXHRcdFx0XHRcdHggPSAob3B0LnlheGVzWzBdLnBvc2l0aW9uID09PSAncmlnaHQnICYmIG9wdC55YXhlc1swXS50eXBlICE9PSAnY29sb3JTY2FsZUdyYWRpZW50JykgPyBvZmZzZXQubGVmdCArIHBsb3Qud2lkdGgoKSArIHlheGlzTGFiZWxXaWR0aCArIDMwOiBvZmZzZXQubGVmdCArIHBsb3Qud2lkdGgoKSArIDIwLFxyXG5cdFx0XHRcdCAgICBncmFkaWVudCA9IG9wdC5zZXJpZXMuaW50ZW5zaXR5Z3JhcGguZ3JhZGllbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgbG93Q29sb3IgPSBvcHQuc2VyaWVzLmludGVuc2l0eWdyYXBoLmxvd0NvbG9yLFxyXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hDb2xvciA9IG9wdC5zZXJpZXMuaW50ZW5zaXR5Z3JhcGguaGlnaENvbG9yO1xyXG4gICAgICAgICAgICAgICAgZHJhd0xlZ2VuZChjdHgsIHgsIG9mZnNldC50b3AsIGNvbG9yTGVnZW5kV2lkdGgsIHBsb3QuaGVpZ2h0KCksIGdyYWRpZW50LCBsb3dDb2xvciwgaGlnaENvbG9yKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0Q29sb3IodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleDtcclxuICAgICAgICAgICAgICAgIGlmIChyYW5nZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMTI3OyAvLyAwLjUgKiAyNTVcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFsZXR0ZVtpbmRleF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlIDwgc2VyaWUuaW50ZW5zaXR5Z3JhcGgubWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yTG93XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID4gc2VyaWUuaW50ZW5zaXR5Z3JhcGgubWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9ySGlnaFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IE1hdGgucm91bmQoKHZhbHVlIC0gc2VyaWUuaW50ZW5zaXR5Z3JhcGgubWluKSAqIDI1NSAvIHJhbmdlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFsZXR0ZVtpbmRleF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkcmF3UGl4ZWwoY3R4LCB4LCB5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yUkdCQSA9IGdldENvbG9yKHZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY29sb3JTdHIgPSBjb2xvclJHQkEuc2xpY2UoY29sb3JSR0JBLmluZGV4T2YoJygnKSArIDEsIGNvbG9yUkdCQS5pbmRleE9mKCcpJykpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yQXJyID0gY29sb3JTdHIuc3BsaXQoJywnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZC5kYXRhWzBdID0gcGFyc2VJbnQoY29sb3JBcnJbMF0sIDEwKTtcclxuICAgICAgICAgICAgICAgIGlkLmRhdGFbMV0gPSBwYXJzZUludChjb2xvckFyclsxXSwgMTApO1xyXG4gICAgICAgICAgICAgICAgaWQuZGF0YVsyXSA9IHBhcnNlSW50KGNvbG9yQXJyWzJdLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBpZC5kYXRhWzNdID0gcGFyc2VGbG9hdChjb2xvckFyclszXSkqMjU1O1xyXG5cclxuICAgICAgICAgICAgICAgIGN0eC5wdXRJbWFnZURhdGEoaWQsIHgsIHkpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZHJhd1JlY3RhbmdsZShjdHgsIHgsIHksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBzdG9yaW5nIHRoZSB2YXJpYWJsZXMgYmVjYXVzZSB0aGV5IHdpbGwgYmUgb2Z0ZW4gdXNlZFxyXG4gICAgICAgICAgICAgICAgdmFyIHhiID0gTWF0aC5mbG9vcih4IC0gaGFsZlNjYWxlWCksXHJcbiAgICAgICAgICAgICAgICAgIHliID0gTWF0aC5mbG9vcih5IC0gaGFsZlNjYWxlWSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdldENvbG9yKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCh4YiwgeWIsIHNjYWxlWCwgc2NhbGVZKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdGhpcy5kZWZhdWx0T3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xyXG4gICAgdGhpcy5kcmF3TGVnZW5kID0gZHJhd0xlZ2VuZDtcclxuICAgIHRoaXMuaW5pdCA9IGluaXQ7XHJcbn1cclxuIiwiLyogKiBUaGUgTUlUIExpY2Vuc2VcclxuQ29weXJpZ2h0IChjKSAyMDEwLCAyMDExLCAyMDEyLCAyMDEzIGJ5IEp1ZXJnZW4gTWFyc2NoXHJcbkNvcHlyaWdodCAoYykgMjAxNSBieSBBbmRyZXcgRG92ZSAmIENpcHJpYW4gQ2V0ZXJhc1xyXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcblRIRSBTT0ZUV0FSRS5cclxuKi9cclxuXHJcbmltcG9ydCAqIGFzIEludGVuc2l0eUdyYXBoQ29yZU1vZHVsZSBmcm9tICdpbnRlbnNpdHlncmFwaC9qcXVlcnkuZmxvdC5pbnRlbnNpdHlncmFwaC1jb3JlJztcclxuXHJcbihmdW5jdGlvbiAoZ2xvYmFsLCAkKSB7XHJcblxyXG4gICAgdmFyIHBsdWdpbk5hbWUgPSAnaW50ZW5zaXR5Z3JhcGgnLFxyXG4gICAgICAgIHBsdWdpblZlcnNpb24gPSAnMC4yJztcclxuXHJcbiAgICB2YXIgSW50ZW5zaXR5R3JhcGggPSBJbnRlbnNpdHlHcmFwaENvcmVNb2R1bGUuSW50ZW5zaXR5R3JhcGgsXHJcbiAgICAgICAgaW50ZW5zaXR5R3JhcGggPSBuZXcgSW50ZW5zaXR5R3JhcGgoKTtcclxuXHJcbiAgICAkLnBsb3QucGx1Z2lucy5wdXNoKHtcclxuICAgICAgXHRpbml0OiBpbnRlbnNpdHlHcmFwaC5pbml0LFxyXG4gICAgICBcdG9wdGlvbnM6IGludGVuc2l0eUdyYXBoLmRlZmF1bHRPcHRpb25zLFxyXG4gICAgICBcdG5hbWU6IHBsdWdpbk5hbWUsXHJcbiAgICAgIFx0dmVyc2lvbjogcGx1Z2luVmVyc2lvblxyXG4gICAgfSk7XHJcblxyXG59KSh0aGlzLCBqUXVlcnkpO1xyXG4iXX0=
