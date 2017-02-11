var tests = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        //console.log('File in window.__karma__.files: ' + file);
        if (/Test\.js$/.test(file)) {
            //console.log('requirejs.conf.js is requesting test file: ' + file);
            tests.push(file);
        }
    }
}

requirejs.config({
    baseUrl: './base',
    paths: {
        "spec": './spec',
        "intensitygraph": '.'
    },
    deps: tests,
    callback: window.__karma__.start
});

requirejs([], function() {
    jQuery = jQuery || $;
});
