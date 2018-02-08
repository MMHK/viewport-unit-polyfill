var CSSParser = require("css");
require('core-js/fn/array/map');
require('core-js/fn/array/is-array');
require('core-js/fn/array/for-each');
require('core-js/fn/object/define-property');

var supportViewportUnit = function () {
    var div = document.createElement('div'),
        flag = false;
    div.id = 'checkVw';
    div.setAttribute("style", "width:50vw");
    document.body.appendChild(div);
    elemWidth = parseInt(div.clientWidth, 10);
    halfWidth = parseInt(window.innerWidth / 2, 10);
    flag = (elemWidth == halfWidth);
    document.body.removeChild(div);

    return flag;
}

var XMLHttpFactories = [
    function () {
        return new XMLHttpRequest();
    },
    function () {
        return new ActiveXObject("Msxml2.XMLHTTP");
    },
    function () {
        return new ActiveXObject("Msxml3.XMLHTTP");
    },
    function () {
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
];

var createXMLHTTPObject = function () {
    var e, i, xmlhttp;
    xmlhttp = false;
    i = 0;
    while (i < XMLHttpFactories.length) {
        try {
            xmlhttp = XMLHttpFactories[i++]();
        } catch (_error) {
            e = _error;
            continue;
        }
        break;
    }
    return xmlhttp;
};

var ajax = function (url, onload) {
    var e, xmlhttp;
    xmlhttp = createXMLHTTPObject();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState !== 4) {
            return;
        }
        if (!(xmlhttp.status === 200 || url.match(/^file:\/\/\//))) {
            throw "Error!";
        }
        console.log("INFO: processing " + url);
        onload(xmlhttp.responseText);
    };
    try {
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    } catch (_error) {
        e = _error;
        console.log("ERROR: " + e.message + " (" + e.type + ") when accessing " + url);
    }
};

var getViewportSize = function () {
    var x, y;
    x = 0;
    y = 0;
    if (window.innerHeight) {
        x = window.innerWidth;
        y = window.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
        x = document.documentElement.clientWidth;
        y = document.documentElement.clientHeight;
    } else if (document.body) {
        x = document.body.clientWidth;
        y = document.body.clientHeight;
    }
    return {
        width: x,
        height: y
    };
};

var CSSFilter = function (src) {
    var out = "",
        reg = /(vw|vh)/i;
    if (src && src.type) {
        if (src.type == "stylesheet") {
            out += CSSFilter(src.stylesheet.rules);
        }
        if (src.type == "media") {
            var sub_out = CSSFilter(src.rules);
            if (sub_out.length > 0) {
                out += "@media " + src.media + " {\n";
                out += sub_out;
                out += "}\n";
            }
        }
        if (src.type == "rule") {
            var sub_out = CSSFilter(src.declarations);
            if (sub_out.length > 0) {
                out += src.selectors.join(",") + " {";
                out += sub_out;
                out += "}\n";
            }
        }
        if (src.type == "declaration") {
            if (reg.test(src.value)) {
                out += src.property + ": " + src.value + ";";
            }
        }
    }
    if (src && src.constructor === Array) {
        for (var i in src) {
            var sub = CSSFilter(src[i]);
            if (sub.length > 0) {
                out += sub;
            }
        }
    }

    return out;
};

var initLayoutEngine = function () {
    var allSheet = '';
    var onresize = function () {
        var css, dims, generateRuleCode, generateSheetCode, map, sheet, url, vpAspectRatio, vpDims;
        vpDims = getViewportSize();
        dims = {
            vh: vpDims.height / 100,
            vw: vpDims.width / 100
        };
        dims.vmin = Math.min(dims.vh, dims.vw);
        vpAspectRatio = vpDims.width / vpDims.height;


        var reg = /([0-9]{0,}[\.]{0,}[0-9]{0,})vw/g
        var css = allSheet.replace(reg, function (matche, arg1) {
            var p = parseFloat(arg1) || 0;
            p = Math.round(p / 100 * vpDims.width);
            return p + "px";
        });
        reg = /([0-9]{0,}[\.]{0,}[0-9]{0,})vh/g
        css = css.replace(reg, function (matche, arg1) {
            var p = parseFloat(arg1) || 0;
            p = Math.round(p / 100 * vpDims.height);
            return p + "px";
        });

        if (styleElement.styleSheet != null) {
            return styleElement.styleSheet.cssText = css;
        } else {
            return styleElement.innerHTML = css;
        }
    };

    var styleElement = document.createElement('style'),
        head = document.getElementsByTagName('head')[0];
    head.appendChild(styleElement);

    var links = document.getElementsByTagName('link'),
        innerSheetCount = 0,
        cssLink = [];

    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (link.rel !== 'stylesheet') {
            continue;
        }
        cssLink.push(link);
    }
    for (var i = 0; i < cssLink.length; i++) {
        var link = cssLink[i];
        ajax(link.href, function (cssSource) {
            allSheet += CSSFilter(CSSParser.parse(cssSource, {
                silent: true
            }));
            innerSheetCount++;
            if (innerSheetCount == cssLink.length) {
                onresize();
            }
        });
    }
    window.onresize = onresize;
};

if (!supportViewportUnit()) {
    initLayoutEngine();
}

module.exports = {
    support: supportViewportUnit,
    render: initLayoutEngine
};