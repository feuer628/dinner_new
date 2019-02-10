(function () {
    "use strict";

    function fetchStylesheet(url, callback) {
        liveFetch("link", {
            "rel": "stylesheet",
            "href": url
        }, callback);
    }

    function fetchScript(url, callback) {
        liveFetch("script", {
            "type": "text/javascript",
            "src": url
        }, callback);
    }

    function liveFetch(element, attrs, callback) {
        var elem = document.createElement(element);
        for (var key in attrs) {
            elem.setAttribute(key, attrs[key]);
        }
        if (callback) {
            elem.onreadystatechange = function () {
                if (elem.readyState === "loaded" || elem.readyState === "complete") {
                    elem.onreadystatechange = null;
                    callback();
                }
            };
            elem.onload = callback;
        }
        document.head.appendChild(elem);
    }

    var version = "${application.version}";
    fetchStylesheet("css/webliteStyle.css?version=" + version, function () {
        fetchScript("lib/lib.js?version=" + version, function () {
            require(["vue", "vue-router", "qr-code"], function (vue, vueRouter, qrCode) {
                // экспорт по умолчанию
                vue.default = vue;
                vueRouter.default = vueRouter;
                qrCode.default = qrCode;

                fetchScript("weblite.js?version=" + version, function () {
                    require(["weblite/application"], function (application) {
                        // TODO сделать отображение ошибки при запуске
                        return application.start();
                    });
                });
            });
        });
    });
}());