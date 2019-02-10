/**
 * vue-class-component v6.1.2
 * (c) 2015-2017 Evan You
 * @license MIT
 */
!function (e, t) {
    "object" == typeof exports && "undefined" != typeof module ? t(exports, require("vue")) : "function" == typeof define && define.amd ? define("vue-class-component", ["exports", "vue"], t) : t(e.VueClassComponent = {}, e.Vue)
}(this, function (e, t) {
    "use strict";

    function r(e) {
        var t = typeof e;
        return null == e || "object" !== t && "function" !== t
    }

    function o(e, t) {
        var r = t.prototype._init;
        t.prototype._init = function () {
            var t = this, r = Object.getOwnPropertyNames(e);
            if (e.$options.props) for (var o in e.$options.props) e.hasOwnProperty(o) || r.push(o);
            r.forEach(function (r) {
                "_" !== r.charAt(0) && Object.defineProperty(t, r, {
                    get: function () {
                        return e[r]
                    }, set: function (t) {
                        return e[r] = t
                    }, configurable: !0
                })
            })
        };
        var o = new t;
        t.prototype._init = r;
        var n = {};
        return Object.keys(o).forEach(function (e) {
            void 0 !== o[e] && (n[e] = o[e])
        }), n
    }

    function n(e, r) {
        void 0 === r && (r = {}), r.name = r.name || e._componentTag || e.name;
        var n = e.prototype;
        Object.getOwnPropertyNames(n).forEach(function (e) {
            if ("constructor" !== e) if (f.indexOf(e) > -1) r[e] = n[e]; else {
                var t = Object.getOwnPropertyDescriptor(n, e);
                "function" == typeof t.value ? (r.methods || (r.methods = {}))[e] = t.value : (t.get || t.set) && ((r.computed || (r.computed = {}))[e] = {
                    get: t.get,
                    set: t.set
                })
            }
        }), (r.mixins || (r.mixins = [])).push({
            data: function () {
                return o(this, e)
            }
        });
        var i = e.__decorators__;
        i && (i.forEach(function (e) {
            return e(r)
        }), delete e.__decorators__);
        var u = Object.getPrototypeOf(e.prototype), a = u instanceof t ? u.constructor : t, p = a.extend(r);
        return c(p, e, a), p
    }

    function c(e, t, o) {
        Object.getOwnPropertyNames(t).forEach(function (n) {
            if ("prototype" !== n) {
                var c = Object.getOwnPropertyDescriptor(e, n);
                if (!c || c.configurable) {
                    var i = Object.getOwnPropertyDescriptor(t, n);
                    if (!u) {
                        if ("cid" === n) return;
                        var f = Object.getOwnPropertyDescriptor(o, n);
                        if (!r(i.value) && f && f.value === i.value) return
                    }
                    Object.defineProperty(e, n, i)
                }
            }
        })
    }

    function i(e) {
        return "function" == typeof e ? n(e) : function (t) {
            return n(t, e)
        }
    }

    t = t && t.hasOwnProperty("default") ? t.default : t;
    var u = {__proto__: []} instanceof Array,
        f = ["data", "beforeCreate", "created", "beforeMount", "mounted", "beforeDestroy", "destroyed", "beforeUpdate", "updated", "activated", "deactivated", "render", "errorCaptured"];
    !function (e) {
        e.registerHooks = function (e) {
            f.push.apply(f, e)
        }
    }(i || (i = {}));
    var a = i;
    e.default = a, e.createDecorator = function (e) {
        return function (t, r, o) {
            var n = "function" == typeof t ? t : t.constructor;
            n.__decorators__ || (n.__decorators__ = []), "number" != typeof o && (o = void 0), n.__decorators__.push(function (t) {
                return e(t, r, o)
            })
        }
    }, Object.defineProperty(e, "__esModule", {value: !0})
});