var colorMatchers = {
    toFillPixel: function(util, customEqualityTesters) {
        return {
            compare: function() {
                var expected = arguments[0],
                    plot = arguments[1],
                    x = arguments[2], y = arguments[3],
                    ctx = plot.getCanvas().getContext('2d'),
                    plotOffset = plot.getPlotOffset(),
                    pixelRatio = plot.getSurface().pixelRatio,
                    cx = (plotOffset.left + x) * pixelRatio,
                    cy = (plotOffset.top + y) * pixelRatio,
                    actual = getPixelColor(ctx, cx, cy),
                    result = {};
                result.pass = isClose(actual, expected);
                if (!result.pass) {
                    result.message =
                      'Expected ' + printColor(expected) +
                      ' at ' + x + ',' + y +
                      ' / ' + cx + ',' + cy +
                      ' actual ' + printColor(actual);
                }
                return result;
            }
        };
    }
};

function printColor(c) {
    if (c) {
        // Don't use Array.from() because is not working with typed arrays in PhantomJS
        c = (c instanceof Array) ? c : [c[0], c[1], c[2], c[3]];
        return 'rgba(' + c.join() + ')';
    } else {
        return 'undefined';
    }
}

function getPixelColor(ctx, x, y) {
    return ctx.getImageData(x, y, 1, 1).data;
}

function getScaledPixelColor(ctx, r, x, y) {
    return getPixelColor(ctx, x * r, y * r);
}

function rgba(r, g, b, a) {
    return [r, g, b, a * 255];
}

// Always pass to the second argument an Array becuase typed arrays don't have map and every functions
function isClose(c1, c2) {
    var tolerance = 5,
        close = c2
            .map(function(v, i) { return Math.abs(v - c1[i]); })
            .every(function(d) { return d <= tolerance; });
    return close;
}

function setPixelRatio(plot, pixelRatio) {
    plot.getSurface().clear();
    plot.getSurface().pixelRatio = pixelRatio;
    plot.getPlaceholder().find('canvas').each(function(_, canvas) {
        canvas.width = canvas.width * pixelRatio;
        canvas.height = canvas.height * pixelRatio;

        var context = canvas.getContext('2d');
        context.restore();
        context.save();
        context.scale(pixelRatio, pixelRatio);
    });
    plot.draw();
}

function px(str) {
    return parseInt(str.slice(0, -2));
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
