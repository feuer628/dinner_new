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


    fetchStylesheet("css/bootstrap.css", function () {
        fetchStylesheet("css/bootstrap-vue.css", function () {
            fetchStylesheet("css/custom.css", function () {
                fetchScript("lib/lib.js", function () {
                    require(["vue", "vue-router", "bootstrap-vue"], function (vue, vueRouter, bootstrapVue) {
                        // экспорт по умолчанию
                        vue.default = vue;
                        vueRouter.default = vueRouter;
                        bootstrapVue.default = bootstrapVue;

                        fetchScript("lib/frontend.js", function () {
                            require(["application"], function (application) {
                                // TODO сделать отображение ошибки при запуске
                                return application.start();
                            });
                        });
                    });
                });
            });
        });
    });
}());