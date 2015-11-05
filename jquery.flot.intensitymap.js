/* * The MIT License

Copyright (c) 2010, 2011, 2012, 2013 by Juergen Marsch
Copyright (c) 2015 by Ciprian Ceteras (cipix2000@gmail.com)


Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function ($){
    //"use strict";
    var pluginName = "intensitymap", pluginVersion = "0.1";
    var defaultOptions ={
        series:{
            intensitymap:{
                active: false,
                show: false,
                radius : 20,
                max : 1
            }
        }
    };

    var defaultGradient = { 0.45: "rgb(0,0,255)", 0.55: "rgb(0,255,255)", 0.65: "rgb(0,255,0)", 0.95: "yellow", 1.0: "rgb(255,0,0)"};

    function extendEmpty(org,ext){
        for(var i in ext){
            if(!org[i]){ org[i] = ext[i];}
            else{
                if(typeof ext[i] === "object"){
                    extendEmpty(org[i],ext[i]);
                }
            }
        }
    }

    function init(plot){
        var opt = null, offset = "7", acanvas = null, actx = null, series = null;
        plot.hooks.processOptions.push(processOptions);
        function processOptions(plot,options){
            if(options.series.intensitymap.active){
                extendEmpty(options,defaultOptions);
                if (!options.series.intensitymap.gradient) {
                    options.series.intensitymap.gradient = defaultGradient;
                }
                opt = options;
                plot.hooks.drawSeries.push(drawSeries);
                initColorPalette();
            }
        }

        function initColorPalette(){
            var canvas = document.createElement("canvas");
            canvas.width = "1";
            canvas.height = "256";
            var ctx = canvas.getContext("2d"),
                grad = ctx.createLinearGradient(0,0,1,256),
                gradient = opt.series.intensitymap.gradient;
            for(var x in gradient){
                grad.addColorStop(x, gradient[x]);
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,1,256);
            opt.series.intensitymap.gradient = ctx.getImageData(0,0,1,256).data;
            //delete canvas; delete grad; delete ctx;
        }

        function drawSeries(plot, ctx, serie){
            var r2 = serie.intensitymap.radius,
                mul = mul = 2*r2;
            var palette = opt.series.intensitymap.gradient;

            if(opt.series.intensitymap.debug === true) { series = serie;}
            var offset = plot.getPlotOffset();
            for(var i = serie.data.length - 1; i >= 0 ;i--){
                var pt = serie.data[i];
                drawRectangle(ctx,serie.xaxis.p2c(pt[0]) + offset.left ,serie.yaxis.p2c(pt[1]) + offset.top ,pt[2]);
            }

            function drawRectangle(ctx,x, y, value){
                // storing the variables because they will be often used
                var xb = Math.round(x-r2),
                    yb = Math.round(y-r2);
                var index = Math.round( value/serie.intensitymap.max * 255) * 4;
                ctx.fillStyle = 'rgb(' + palette[index] + ',' + palette[index + 1] + ',' + palette[index + 2] + ')';
                ctx.fillRect(xb,yb,mul,mul);
            }
        }
    }

    $.plot.plugins.push({
        init: init,
        options: defaultOptions,
        name: pluginName,
        version: pluginVersion
    });
})(jQuery);
