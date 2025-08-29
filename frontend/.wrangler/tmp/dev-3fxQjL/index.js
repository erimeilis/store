var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// dist/worker/index.js
function Hc(o, i) {
  for (var c = 0; c < i.length; c++) {
    const d = i[c];
    if (typeof d != "string" && !Array.isArray(d)) {
      for (const l in d)
        if (l !== "default" && !(l in o)) {
          const S = Object.getOwnPropertyDescriptor(d, l);
          S && Object.defineProperty(o, l, S.get ? S : {
            enumerable: true,
            get: /* @__PURE__ */ __name(() => d[l], "get")
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(o, Symbol.toStringTag, { value: "Module" }));
}
__name(Hc, "Hc");
function $c(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
__name($c, "$c");
var Us = { exports: {} };
var Bs = { exports: {} };
var Ji = { exports: {} };
Ji.exports;
var gu;
function Vc() {
  return gu || (gu = 1, function(o, i) {
    (function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var c = "18.3.1", d = Symbol.for("react.element"), l = Symbol.for("react.portal"), S = Symbol.for("react.fragment"), E = Symbol.for("react.strict_mode"), P = Symbol.for("react.profiler"), g = Symbol.for("react.provider"), x = Symbol.for("react.context"), M = Symbol.for("react.forward_ref"), I = Symbol.for("react.suspense"), $ = Symbol.for("react.suspense_list"), te = Symbol.for("react.memo"), G = Symbol.for("react.lazy"), se = Symbol.for("react.offscreen"), H = Symbol.iterator, B = "@@iterator";
      function he(m) {
        if (m === null || typeof m != "object")
          return null;
        var _ = H && m[H] || m[B];
        return typeof _ == "function" ? _ : null;
      }
      __name(he, "he");
      var ye = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, Pe = {
        transition: null
      }, pe = {
        current: null,
        // Used to reproduce behavior of `batchedUpdates` in legacy mode.
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false
      }, Ce = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, le = {}, ue = null;
      function xe(m) {
        ue = m;
      }
      __name(xe, "xe");
      le.setExtraStackFrame = function(m) {
        ue = m;
      }, le.getCurrentStack = null, le.getStackAddendum = function() {
        var m = "";
        ue && (m += ue);
        var _ = le.getCurrentStack;
        return _ && (m += _() || ""), m;
      };
      var Ge = false, ft = false, Je = false, Ze = false, $e = false, We = {
        ReactCurrentDispatcher: ye,
        ReactCurrentBatchConfig: Pe,
        ReactCurrentOwner: Ce
      };
      We.ReactDebugCurrentFrame = le, We.ReactCurrentActQueue = pe;
      function rt(m) {
        {
          for (var _ = arguments.length, U = new Array(_ > 1 ? _ - 1 : 0), z = 1; z < _; z++)
            U[z - 1] = arguments[z];
          oe("warn", m, U);
        }
      }
      __name(rt, "rt");
      function ce(m) {
        {
          for (var _ = arguments.length, U = new Array(_ > 1 ? _ - 1 : 0), z = 1; z < _; z++)
            U[z - 1] = arguments[z];
          oe("error", m, U);
        }
      }
      __name(ce, "ce");
      function oe(m, _, U) {
        {
          var z = We.ReactDebugCurrentFrame, ee = z.getStackAddendum();
          ee !== "" && (_ += "%s", U = U.concat([ee]));
          var ke = U.map(function(fe) {
            return String(fe);
          });
          ke.unshift("Warning: " + _), Function.prototype.apply.call(console[m], console, ke);
        }
      }
      __name(oe, "oe");
      var nt = {};
      function St(m, _) {
        {
          var U = m.constructor, z = U && (U.displayName || U.name) || "ReactClass", ee = z + "." + _;
          if (nt[ee])
            return;
          ce("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", _, z), nt[ee] = true;
        }
      }
      __name(St, "St");
      var A = {
        /**
         * Checks whether or not this composite component is mounted.
         * @param {ReactClass} publicInstance The instance we want to test.
         * @return {boolean} True if mounted, false otherwise.
         * @protected
         * @final
         */
        isMounted: /* @__PURE__ */ __name(function(m) {
          return false;
        }, "isMounted"),
        /**
         * Forces an update. This should only be invoked when it is known with
         * certainty that we are **not** in a DOM transaction.
         *
         * You may want to call this when you know that some deeper aspect of the
         * component's state has changed but `setState` was not called.
         *
         * This will not invoke `shouldComponentUpdate`, but it will invoke
         * `componentWillUpdate` and `componentDidUpdate`.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueForceUpdate: /* @__PURE__ */ __name(function(m, _, U) {
          St(m, "forceUpdate");
        }, "enqueueForceUpdate"),
        /**
         * Replaces all of the state. Always use this or `setState` to mutate state.
         * You should treat `this.state` as immutable.
         *
         * There is no guarantee that `this.state` will be immediately updated, so
         * accessing `this.state` after calling this method may return the old value.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} completeState Next state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueReplaceState: /* @__PURE__ */ __name(function(m, _, U, z) {
          St(m, "replaceState");
        }, "enqueueReplaceState"),
        /**
         * Sets a subset of the state. This only exists because _pendingState is
         * internal. This provides a merging strategy that is not available to deep
         * properties which is confusing. TODO: Expose pendingState or don't use it
         * during the merge.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} partialState Next partial state to be merged with state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} Name of the calling function in the public API.
         * @internal
         */
        enqueueSetState: /* @__PURE__ */ __name(function(m, _, U, z) {
          St(m, "setState");
        }, "enqueueSetState")
      }, V = Object.assign, ae = {};
      Object.freeze(ae);
      function ve(m, _, U) {
        this.props = m, this.context = _, this.refs = ae, this.updater = U || A;
      }
      __name(ve, "ve");
      ve.prototype.isReactComponent = {}, ve.prototype.setState = function(m, _) {
        if (typeof m != "object" && typeof m != "function" && m != null)
          throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, m, _, "setState");
      }, ve.prototype.forceUpdate = function(m) {
        this.updater.enqueueForceUpdate(this, m, "forceUpdate");
      };
      {
        var de = {
          isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
          replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
        }, Re = /* @__PURE__ */ __name(function(m, _) {
          Object.defineProperty(ve.prototype, m, {
            get: /* @__PURE__ */ __name(function() {
              rt("%s(...) is deprecated in plain JavaScript React classes. %s", _[0], _[1]);
            }, "get")
          });
        }, "Re");
        for (var Se in de)
          de.hasOwnProperty(Se) && Re(Se, de[Se]);
      }
      function De() {
      }
      __name(De, "De");
      De.prototype = ve.prototype;
      function Ee(m, _, U) {
        this.props = m, this.context = _, this.refs = ae, this.updater = U || A;
      }
      __name(Ee, "Ee");
      var ze = Ee.prototype = new De();
      ze.constructor = Ee, V(ze, ve.prototype), ze.isPureReactComponent = true;
      function bt() {
        var m = {
          current: null
        };
        return Object.seal(m), m;
      }
      __name(bt, "bt");
      var Ut = Array.isArray;
      function dt(m) {
        return Ut(m);
      }
      __name(dt, "dt");
      function Pt(m) {
        {
          var _ = typeof Symbol == "function" && Symbol.toStringTag, U = _ && m[Symbol.toStringTag] || m.constructor.name || "Object";
          return U;
        }
      }
      __name(Pt, "Pt");
      function ar(m) {
        try {
          return Bt(m), false;
        } catch {
          return true;
        }
      }
      __name(ar, "ar");
      function Bt(m) {
        return "" + m;
      }
      __name(Bt, "Bt");
      function mr(m) {
        if (ar(m))
          return ce("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Pt(m)), Bt(m);
      }
      __name(mr, "mr");
      function Nt(m, _, U) {
        var z = m.displayName;
        if (z)
          return z;
        var ee = _.displayName || _.name || "";
        return ee !== "" ? U + "(" + ee + ")" : U;
      }
      __name(Nt, "Nt");
      function $t(m) {
        return m.displayName || "Context";
      }
      __name($t, "$t");
      function At(m) {
        if (m == null)
          return null;
        if (typeof m.tag == "number" && ce("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof m == "function")
          return m.displayName || m.name || null;
        if (typeof m == "string")
          return m;
        switch (m) {
          case S:
            return "Fragment";
          case l:
            return "Portal";
          case P:
            return "Profiler";
          case E:
            return "StrictMode";
          case I:
            return "Suspense";
          case $:
            return "SuspenseList";
        }
        if (typeof m == "object")
          switch (m.$$typeof) {
            case x:
              var _ = m;
              return $t(_) + ".Consumer";
            case g:
              var U = m;
              return $t(U._context) + ".Provider";
            case M:
              return Nt(m, m.render, "ForwardRef");
            case te:
              var z = m.displayName || null;
              return z !== null ? z : At(m.type) || "Memo";
            case G: {
              var ee = m, ke = ee._payload, fe = ee._init;
              try {
                return At(fe(ke));
              } catch {
                return null;
              }
            }
          }
        return null;
      }
      __name(At, "At");
      var gr = Object.prototype.hasOwnProperty, Ot = {
        key: true,
        ref: true,
        __self: true,
        __source: true
      }, Ct, vt, yr;
      yr = {};
      function Tr(m) {
        if (gr.call(m, "ref")) {
          var _ = Object.getOwnPropertyDescriptor(m, "ref").get;
          if (_ && _.isReactWarning)
            return false;
        }
        return m.ref !== void 0;
      }
      __name(Tr, "Tr");
      function _r(m) {
        if (gr.call(m, "key")) {
          var _ = Object.getOwnPropertyDescriptor(m, "key").get;
          if (_ && _.isReactWarning)
            return false;
        }
        return m.key !== void 0;
      }
      __name(_r, "_r");
      function mt(m, _) {
        var U = /* @__PURE__ */ __name(function() {
          Ct || (Ct = true, ce("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", _));
        }, "U");
        U.isReactWarning = true, Object.defineProperty(m, "key", {
          get: U,
          configurable: true
        });
      }
      __name(mt, "mt");
      function Br(m, _) {
        var U = /* @__PURE__ */ __name(function() {
          vt || (vt = true, ce("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", _));
        }, "U");
        U.isReactWarning = true, Object.defineProperty(m, "ref", {
          get: U,
          configurable: true
        });
      }
      __name(Br, "Br");
      function Qr(m) {
        if (typeof m.ref == "string" && Ce.current && m.__self && Ce.current.stateNode !== m.__self) {
          var _ = At(Ce.current.type);
          yr[_] || (ce('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', _, m.ref), yr[_] = true);
        }
      }
      __name(Qr, "Qr");
      var Nr = /* @__PURE__ */ __name(function(m, _, U, z, ee, ke, fe) {
        var Oe = {
          // This tag allows us to uniquely identify this as a React Element
          $$typeof: d,
          // Built-in properties that belong on the element
          type: m,
          key: _,
          ref: U,
          props: fe,
          // Record the component responsible for creating this element.
          _owner: ke
        };
        return Oe._store = {}, Object.defineProperty(Oe._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: false
        }), Object.defineProperty(Oe, "_self", {
          configurable: false,
          enumerable: false,
          writable: false,
          value: z
        }), Object.defineProperty(Oe, "_source", {
          configurable: false,
          enumerable: false,
          writable: false,
          value: ee
        }), Object.freeze && (Object.freeze(Oe.props), Object.freeze(Oe)), Oe;
      }, "Nr");
      function Kr(m, _, U) {
        var z, ee = {}, ke = null, fe = null, Oe = null, je = null;
        if (_ != null) {
          Tr(_) && (fe = _.ref, Qr(_)), _r(_) && (mr(_.key), ke = "" + _.key), Oe = _.__self === void 0 ? null : _.__self, je = _.__source === void 0 ? null : _.__source;
          for (z in _)
            gr.call(_, z) && !Ot.hasOwnProperty(z) && (ee[z] = _[z]);
        }
        var Ke = arguments.length - 2;
        if (Ke === 1)
          ee.children = U;
        else if (Ke > 1) {
          for (var st = Array(Ke), qe = 0; qe < Ke; qe++)
            st[qe] = arguments[qe + 2];
          Object.freeze && Object.freeze(st), ee.children = st;
        }
        if (m && m.defaultProps) {
          var ot = m.defaultProps;
          for (z in ot)
            ee[z] === void 0 && (ee[z] = ot[z]);
        }
        if (ke || fe) {
          var pt = typeof m == "function" ? m.displayName || m.name || "Unknown" : m;
          ke && mt(ee, pt), fe && Br(ee, pt);
        }
        return Nr(m, ke, fe, Oe, je, Ce.current, ee);
      }
      __name(Kr, "Kr");
      function zr(m, _) {
        var U = Nr(m.type, _, m.ref, m._self, m._source, m._owner, m.props);
        return U;
      }
      __name(zr, "zr");
      function dn(m, _, U) {
        if (m == null)
          throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + m + ".");
        var z, ee = V({}, m.props), ke = m.key, fe = m.ref, Oe = m._self, je = m._source, Ke = m._owner;
        if (_ != null) {
          Tr(_) && (fe = _.ref, Ke = Ce.current), _r(_) && (mr(_.key), ke = "" + _.key);
          var st;
          m.type && m.type.defaultProps && (st = m.type.defaultProps);
          for (z in _)
            gr.call(_, z) && !Ot.hasOwnProperty(z) && (_[z] === void 0 && st !== void 0 ? ee[z] = st[z] : ee[z] = _[z]);
        }
        var qe = arguments.length - 2;
        if (qe === 1)
          ee.children = U;
        else if (qe > 1) {
          for (var ot = Array(qe), pt = 0; pt < qe; pt++)
            ot[pt] = arguments[pt + 2];
          ee.children = ot;
        }
        return Nr(m.type, ke, fe, Oe, je, Ke, ee);
      }
      __name(dn, "dn");
      function Qt(m) {
        return typeof m == "object" && m !== null && m.$$typeof === d;
      }
      __name(Qt, "Qt");
      var ir = ".", qr = ":";
      function Hr(m) {
        var _ = /[=:]/g, U = {
          "=": "=0",
          ":": "=2"
        }, z = m.replace(_, function(ee) {
          return U[ee];
        });
        return "$" + z;
      }
      __name(Hr, "Hr");
      var Tt = false, It = /\/+/g;
      function Wt(m) {
        return m.replace(It, "$&/");
      }
      __name(Wt, "Wt");
      function Ne(m, _) {
        return typeof m == "object" && m !== null && m.key != null ? (mr(m.key), Hr("" + m.key)) : _.toString(36);
      }
      __name(Ne, "Ne");
      function zt(m, _, U, z, ee) {
        var ke = typeof m;
        (ke === "undefined" || ke === "boolean") && (m = null);
        var fe = false;
        if (m === null)
          fe = true;
        else
          switch (ke) {
            case "string":
            case "number":
              fe = true;
              break;
            case "object":
              switch (m.$$typeof) {
                case d:
                case l:
                  fe = true;
              }
          }
        if (fe) {
          var Oe = m, je = ee(Oe), Ke = z === "" ? ir + Ne(Oe, 0) : z;
          if (dt(je)) {
            var st = "";
            Ke != null && (st = Wt(Ke) + "/"), zt(je, _, st, "", function(qn) {
              return qn;
            });
          } else je != null && (Qt(je) && (je.key && (!Oe || Oe.key !== je.key) && mr(je.key), je = zr(
            je,
            // Keep both the (mapped) and old keys if they differ, just as
            // traverseAllChildren used to do for objects as children
            U + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
            (je.key && (!Oe || Oe.key !== je.key) ? (
              // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
              // eslint-disable-next-line react-internal/safe-string-coercion
              Wt("" + je.key) + "/"
            ) : "") + Ke
          )), _.push(je));
          return 1;
        }
        var qe, ot, pt = 0, _t = z === "" ? ir : z + qr;
        if (dt(m))
          for (var yn = 0; yn < m.length; yn++)
            qe = m[yn], ot = _t + Ne(qe, yn), pt += zt(qe, _, U, ot, ee);
        else {
          var Tn = he(m);
          if (typeof Tn == "function") {
            var bn = m;
            Tn === bn.entries && (Tt || rt("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Tt = true);
            for (var Gt = Tn.call(bn), Mn, _n = 0; !(Mn = Gt.next()).done; )
              qe = Mn.value, ot = _t + Ne(qe, _n++), pt += zt(qe, _, U, ot, ee);
          } else if (ke === "object") {
            var Kn = String(m);
            throw new Error("Objects are not valid as a React child (found: " + (Kn === "[object Object]" ? "object with keys {" + Object.keys(m).join(", ") + "}" : Kn) + "). If you meant to render a collection of children, use an array instead.");
          }
        }
        return pt;
      }
      __name(zt, "zt");
      function sr(m, _, U) {
        if (m == null)
          return m;
        var z = [], ee = 0;
        return zt(m, z, "", "", function(ke) {
          return _.call(U, ke, ee++);
        }), z;
      }
      __name(sr, "sr");
      function br(m) {
        var _ = 0;
        return sr(m, function() {
          _++;
        }), _;
      }
      __name(br, "br");
      function Kt(m, _, U) {
        sr(m, function() {
          _.apply(this, arguments);
        }, U);
      }
      __name(Kt, "Kt");
      function Pr(m) {
        return sr(m, function(_) {
          return _;
        }) || [];
      }
      __name(Pr, "Pr");
      function qt(m) {
        if (!Qt(m))
          throw new Error("React.Children.only expected to receive a single React element child.");
        return m;
      }
      __name(qt, "qt");
      function xt(m) {
        var _ = {
          $$typeof: x,
          // As a workaround to support multiple concurrent renderers, we categorize
          // some renderers as primary and others as secondary. We only expect
          // there to be two concurrent renderers at most: React Native (primary) and
          // Fabric (secondary); React DOM (primary) and React ART (secondary).
          // Secondary renderers store their context values on separate fields.
          _currentValue: m,
          _currentValue2: m,
          // Used to track how many concurrent renderers this context currently
          // supports within in a single renderer. Such as parallel server rendering.
          _threadCount: 0,
          // These are circular
          Provider: null,
          Consumer: null,
          // Add these to use same hidden class in VM as ServerContext
          _defaultValue: null,
          _globalName: null
        };
        _.Provider = {
          $$typeof: g,
          _context: _
        };
        var U = false, z = false, ee = false;
        {
          var ke = {
            $$typeof: x,
            _context: _
          };
          Object.defineProperties(ke, {
            Provider: {
              get: /* @__PURE__ */ __name(function() {
                return z || (z = true, ce("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?")), _.Provider;
              }, "get"),
              set: /* @__PURE__ */ __name(function(fe) {
                _.Provider = fe;
              }, "set")
            },
            _currentValue: {
              get: /* @__PURE__ */ __name(function() {
                return _._currentValue;
              }, "get"),
              set: /* @__PURE__ */ __name(function(fe) {
                _._currentValue = fe;
              }, "set")
            },
            _currentValue2: {
              get: /* @__PURE__ */ __name(function() {
                return _._currentValue2;
              }, "get"),
              set: /* @__PURE__ */ __name(function(fe) {
                _._currentValue2 = fe;
              }, "set")
            },
            _threadCount: {
              get: /* @__PURE__ */ __name(function() {
                return _._threadCount;
              }, "get"),
              set: /* @__PURE__ */ __name(function(fe) {
                _._threadCount = fe;
              }, "set")
            },
            Consumer: {
              get: /* @__PURE__ */ __name(function() {
                return U || (U = true, ce("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?")), _.Consumer;
              }, "get")
            },
            displayName: {
              get: /* @__PURE__ */ __name(function() {
                return _.displayName;
              }, "get"),
              set: /* @__PURE__ */ __name(function(fe) {
                ee || (rt("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", fe), ee = true);
              }, "set")
            }
          }), _.Consumer = ke;
        }
        return _._currentRenderer = null, _._currentRenderer2 = null, _;
      }
      __name(xt, "xt");
      var lr = -1, wr = 0, $r = 1, gt = 2;
      function en(m) {
        if (m._status === lr) {
          var _ = m._result, U = _();
          if (U.then(function(ke) {
            if (m._status === wr || m._status === lr) {
              var fe = m;
              fe._status = $r, fe._result = ke;
            }
          }, function(ke) {
            if (m._status === wr || m._status === lr) {
              var fe = m;
              fe._status = gt, fe._result = ke;
            }
          }), m._status === lr) {
            var z = m;
            z._status = wr, z._result = U;
          }
        }
        if (m._status === $r) {
          var ee = m._result;
          return ee === void 0 && ce(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`, ee), "default" in ee || ce(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))`, ee), ee.default;
        } else
          throw m._result;
      }
      __name(en, "en");
      function pn(m) {
        var _ = {
          // We use these fields to store the result.
          _status: lr,
          _result: m
        }, U = {
          $$typeof: G,
          _payload: _,
          _init: en
        };
        {
          var z, ee;
          Object.defineProperties(U, {
            defaultProps: {
              configurable: true,
              get: /* @__PURE__ */ __name(function() {
                return z;
              }, "get"),
              set: /* @__PURE__ */ __name(function(ke) {
                ce("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), z = ke, Object.defineProperty(U, "defaultProps", {
                  enumerable: true
                });
              }, "set")
            },
            propTypes: {
              configurable: true,
              get: /* @__PURE__ */ __name(function() {
                return ee;
              }, "get"),
              set: /* @__PURE__ */ __name(function(ke) {
                ce("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), ee = ke, Object.defineProperty(U, "propTypes", {
                  enumerable: true
                });
              }, "set")
            }
          });
        }
        return U;
      }
      __name(pn, "pn");
      function hn(m) {
        m != null && m.$$typeof === te ? ce("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof m != "function" ? ce("forwardRef requires a render function but was given %s.", m === null ? "null" : typeof m) : m.length !== 0 && m.length !== 2 && ce("forwardRef render functions accept exactly two parameters: props and ref. %s", m.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."), m != null && (m.defaultProps != null || m.propTypes != null) && ce("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
        var _ = {
          $$typeof: M,
          render: m
        };
        {
          var U;
          Object.defineProperty(_, "displayName", {
            enumerable: false,
            configurable: true,
            get: /* @__PURE__ */ __name(function() {
              return U;
            }, "get"),
            set: /* @__PURE__ */ __name(function(z) {
              U = z, !m.name && !m.displayName && (m.displayName = z);
            }, "set")
          });
        }
        return _;
      }
      __name(hn, "hn");
      var T;
      T = Symbol.for("react.module.reference");
      function X(m) {
        return !!(typeof m == "string" || typeof m == "function" || m === S || m === P || $e || m === E || m === I || m === $ || Ze || m === se || Ge || ft || Je || typeof m == "object" && m !== null && (m.$$typeof === G || m.$$typeof === te || m.$$typeof === g || m.$$typeof === x || m.$$typeof === M || // This needs to include all possible module reference object
        // types supported by any Flight configuration anywhere since
        // we don't know which Flight build this will end up being used
        // with.
        m.$$typeof === T || m.getModuleId !== void 0));
      }
      __name(X, "X");
      function re(m, _) {
        X(m) || ce("memo: The first argument must be a component. Instead received: %s", m === null ? "null" : typeof m);
        var U = {
          $$typeof: te,
          type: m,
          compare: _ === void 0 ? null : _
        };
        {
          var z;
          Object.defineProperty(U, "displayName", {
            enumerable: false,
            configurable: true,
            get: /* @__PURE__ */ __name(function() {
              return z;
            }, "get"),
            set: /* @__PURE__ */ __name(function(ee) {
              z = ee, !m.name && !m.displayName && (m.displayName = ee);
            }, "set")
          });
        }
        return U;
      }
      __name(re, "re");
      function ie() {
        var m = ye.current;
        return m === null && ce(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`), m;
      }
      __name(ie, "ie");
      function Ae(m) {
        var _ = ie();
        if (m._context !== void 0) {
          var U = m._context;
          U.Consumer === m ? ce("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?") : U.Provider === m && ce("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
        }
        return _.useContext(m);
      }
      __name(Ae, "Ae");
      function Ue(m) {
        var _ = ie();
        return _.useState(m);
      }
      __name(Ue, "Ue");
      function Me(m, _, U) {
        var z = ie();
        return z.useReducer(m, _, U);
      }
      __name(Me, "Me");
      function Ie(m) {
        var _ = ie();
        return _.useRef(m);
      }
      __name(Ie, "Ie");
      function lt(m, _) {
        var U = ie();
        return U.useEffect(m, _);
      }
      __name(lt, "lt");
      function Ve(m, _) {
        var U = ie();
        return U.useInsertionEffect(m, _);
      }
      __name(Ve, "Ve");
      function Qe(m, _) {
        var U = ie();
        return U.useLayoutEffect(m, _);
      }
      __name(Qe, "Qe");
      function at(m, _) {
        var U = ie();
        return U.useCallback(m, _);
      }
      __name(at, "at");
      function ur(m, _) {
        var U = ie();
        return U.useMemo(m, _);
      }
      __name(ur, "ur");
      function er(m, _, U) {
        var z = ie();
        return z.useImperativeHandle(m, _, U);
      }
      __name(er, "er");
      function ut(m, _) {
        {
          var U = ie();
          return U.useDebugValue(m, _);
        }
      }
      __name(ut, "ut");
      function ct() {
        var m = ie();
        return m.useTransition();
      }
      __name(ct, "ct");
      function tr(m) {
        var _ = ie();
        return _.useDeferredValue(m);
      }
      __name(tr, "tr");
      function rr() {
        var m = ie();
        return m.useId();
      }
      __name(rr, "rr");
      function Wr(m, _, U) {
        var z = ie();
        return z.useSyncExternalStore(m, _, U);
      }
      __name(Wr, "Wr");
      var Sr = 0, nr, cr, Mt, Ir, Vr, tn, Vt;
      function fr() {
      }
      __name(fr, "fr");
      fr.__reactDisabledLog = true;
      function Ht() {
        {
          if (Sr === 0) {
            nr = console.log, cr = console.info, Mt = console.warn, Ir = console.error, Vr = console.group, tn = console.groupCollapsed, Vt = console.groupEnd;
            var m = {
              configurable: true,
              enumerable: true,
              value: fr,
              writable: true
            };
            Object.defineProperties(console, {
              info: m,
              log: m,
              warn: m,
              error: m,
              group: m,
              groupCollapsed: m,
              groupEnd: m
            });
          }
          Sr++;
        }
      }
      __name(Ht, "Ht");
      function ln() {
        {
          if (Sr--, Sr === 0) {
            var m = {
              configurable: true,
              enumerable: true,
              writable: true
            };
            Object.defineProperties(console, {
              log: V({}, m, {
                value: nr
              }),
              info: V({}, m, {
                value: cr
              }),
              warn: V({}, m, {
                value: Mt
              }),
              error: V({}, m, {
                value: Ir
              }),
              group: V({}, m, {
                value: Vr
              }),
              groupCollapsed: V({}, m, {
                value: tn
              }),
              groupEnd: V({}, m, {
                value: Vt
              })
            });
          }
          Sr < 0 && ce("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
        }
      }
      __name(ln, "ln");
      var Et = We.ReactCurrentDispatcher, jt;
      function s(m, _, U) {
        {
          if (jt === void 0)
            try {
              throw Error();
            } catch (ee) {
              var z = ee.stack.trim().match(/\n( *(at )?)/);
              jt = z && z[1] || "";
            }
          return `
` + jt + m;
        }
      }
      __name(s, "s");
      var p = false, w;
      {
        var C = typeof WeakMap == "function" ? WeakMap : Map;
        w = new C();
      }
      function j(m, _) {
        if (!m || p)
          return "";
        {
          var U = w.get(m);
          if (U !== void 0)
            return U;
        }
        var z;
        p = true;
        var ee = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var ke;
        ke = Et.current, Et.current = null, Ht();
        try {
          if (_) {
            var fe = /* @__PURE__ */ __name(function() {
              throw Error();
            }, "fe");
            if (Object.defineProperty(fe.prototype, "props", {
              set: /* @__PURE__ */ __name(function() {
                throw Error();
              }, "set")
            }), typeof Reflect == "object" && Reflect.construct) {
              try {
                Reflect.construct(fe, []);
              } catch (_t) {
                z = _t;
              }
              Reflect.construct(m, [], fe);
            } else {
              try {
                fe.call();
              } catch (_t) {
                z = _t;
              }
              m.call(fe.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (_t) {
              z = _t;
            }
            m();
          }
        } catch (_t) {
          if (_t && z && typeof _t.stack == "string") {
            for (var Oe = _t.stack.split(`
`), je = z.stack.split(`
`), Ke = Oe.length - 1, st = je.length - 1; Ke >= 1 && st >= 0 && Oe[Ke] !== je[st]; )
              st--;
            for (; Ke >= 1 && st >= 0; Ke--, st--)
              if (Oe[Ke] !== je[st]) {
                if (Ke !== 1 || st !== 1)
                  do
                    if (Ke--, st--, st < 0 || Oe[Ke] !== je[st]) {
                      var qe = `
` + Oe[Ke].replace(" at new ", " at ");
                      return m.displayName && qe.includes("<anonymous>") && (qe = qe.replace("<anonymous>", m.displayName)), typeof m == "function" && w.set(m, qe), qe;
                    }
                  while (Ke >= 1 && st >= 0);
                break;
              }
          }
        } finally {
          p = false, Et.current = ke, ln(), Error.prepareStackTrace = ee;
        }
        var ot = m ? m.displayName || m.name : "", pt = ot ? s(ot) : "";
        return typeof m == "function" && w.set(m, pt), pt;
      }
      __name(j, "j");
      function O(m, _, U) {
        return j(m, false);
      }
      __name(O, "O");
      function N(m) {
        var _ = m.prototype;
        return !!(_ && _.isReactComponent);
      }
      __name(N, "N");
      function Q(m, _, U) {
        if (m == null)
          return "";
        if (typeof m == "function")
          return j(m, N(m));
        if (typeof m == "string")
          return s(m);
        switch (m) {
          case I:
            return s("Suspense");
          case $:
            return s("SuspenseList");
        }
        if (typeof m == "object")
          switch (m.$$typeof) {
            case M:
              return O(m.render);
            case te:
              return Q(m.type, _, U);
            case G: {
              var z = m, ee = z._payload, ke = z._init;
              try {
                return Q(ke(ee), _, U);
              } catch {
              }
            }
          }
        return "";
      }
      __name(Q, "Q");
      var be = {}, Te = We.ReactDebugCurrentFrame;
      function we(m) {
        if (m) {
          var _ = m._owner, U = Q(m.type, m._source, _ ? _.type : null);
          Te.setExtraStackFrame(U);
        } else
          Te.setExtraStackFrame(null);
      }
      __name(we, "we");
      function Xe(m, _, U, z, ee) {
        {
          var ke = Function.call.bind(gr);
          for (var fe in m)
            if (ke(m, fe)) {
              var Oe = void 0;
              try {
                if (typeof m[fe] != "function") {
                  var je = Error((z || "React class") + ": " + U + " type `" + fe + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof m[fe] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  throw je.name = "Invariant Violation", je;
                }
                Oe = m[fe](_, fe, z, U, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (Ke) {
                Oe = Ke;
              }
              Oe && !(Oe instanceof Error) && (we(ee), ce("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", z || "React class", U, fe, typeof Oe), we(null)), Oe instanceof Error && !(Oe.message in be) && (be[Oe.message] = true, we(ee), ce("Failed %s type: %s", U, Oe.message), we(null));
            }
        }
      }
      __name(Xe, "Xe");
      function Rt(m) {
        if (m) {
          var _ = m._owner, U = Q(m.type, m._source, _ ? _.type : null);
          xe(U);
        } else
          xe(null);
      }
      __name(Rt, "Rt");
      var Ft;
      Ft = false;
      function Lt() {
        if (Ce.current) {
          var m = At(Ce.current.type);
          if (m)
            return `

Check the render method of \`` + m + "`.";
        }
        return "";
      }
      __name(Lt, "Lt");
      function Yr(m) {
        if (m !== void 0) {
          var _ = m.fileName.replace(/^.*[\\\/]/, ""), U = m.lineNumber;
          return `

Check your code at ` + _ + ":" + U + ".";
        }
        return "";
      }
      __name(Yr, "Yr");
      function xr(m) {
        return m != null ? Yr(m.__source) : "";
      }
      __name(xr, "xr");
      var rn = {};
      function Gr(m) {
        var _ = Lt();
        if (!_) {
          var U = typeof m == "string" ? m : m.displayName || m.name;
          U && (_ = `

Check the top-level render call using <` + U + ">.");
        }
        return _;
      }
      __name(Gr, "Gr");
      function Xr(m, _) {
        if (!(!m._store || m._store.validated || m.key != null)) {
          m._store.validated = true;
          var U = Gr(_);
          if (!rn[U]) {
            rn[U] = true;
            var z = "";
            m && m._owner && m._owner !== Ce.current && (z = " It was passed a child from " + At(m._owner.type) + "."), Rt(m), ce('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', U, z), Rt(null);
          }
        }
      }
      __name(Xr, "Xr");
      function kr(m, _) {
        if (typeof m == "object") {
          if (dt(m))
            for (var U = 0; U < m.length; U++) {
              var z = m[U];
              Qt(z) && Xr(z, _);
            }
          else if (Qt(m))
            m._store && (m._store.validated = true);
          else if (m) {
            var ee = he(m);
            if (typeof ee == "function" && ee !== m.entries)
              for (var ke = ee.call(m), fe; !(fe = ke.next()).done; )
                Qt(fe.value) && Xr(fe.value, _);
          }
        }
      }
      __name(kr, "kr");
      function Jr(m) {
        {
          var _ = m.type;
          if (_ == null || typeof _ == "string")
            return;
          var U;
          if (typeof _ == "function")
            U = _.propTypes;
          else if (typeof _ == "object" && (_.$$typeof === M || // Note: Memo only checks outer props here.
          // Inner props are checked in the reconciler.
          _.$$typeof === te))
            U = _.propTypes;
          else
            return;
          if (U) {
            var z = At(_);
            Xe(U, m.props, "prop", z, m);
          } else if (_.PropTypes !== void 0 && !Ft) {
            Ft = true;
            var ee = At(_);
            ce("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", ee || "Unknown");
          }
          typeof _.getDefaultProps == "function" && !_.getDefaultProps.isReactClassApproved && ce("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
        }
      }
      __name(Jr, "Jr");
      function Co(m) {
        {
          for (var _ = Object.keys(m.props), U = 0; U < _.length; U++) {
            var z = _[U];
            if (z !== "children" && z !== "key") {
              Rt(m), ce("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", z), Rt(null);
              break;
            }
          }
          m.ref !== null && (Rt(m), ce("Invalid attribute `ref` supplied to `React.Fragment`."), Rt(null));
        }
      }
      __name(Co, "Co");
      function Zn(m, _, U) {
        var z = X(m);
        if (!z) {
          var ee = "";
          (m === void 0 || typeof m == "object" && m !== null && Object.keys(m).length === 0) && (ee += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var ke = xr(_);
          ke ? ee += ke : ee += Lt();
          var fe;
          m === null ? fe = "null" : dt(m) ? fe = "array" : m !== void 0 && m.$$typeof === d ? (fe = "<" + (At(m.type) || "Unknown") + " />", ee = " Did you accidentally export a JSX literal instead of a component?") : fe = typeof m, ce("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", fe, ee);
        }
        var Oe = Kr.apply(this, arguments);
        if (Oe == null)
          return Oe;
        if (z)
          for (var je = 2; je < arguments.length; je++)
            kr(arguments[je], m);
        return m === S ? Co(Oe) : Jr(Oe), Oe;
      }
      __name(Zn, "Zn");
      var vn = false;
      function Cr(m) {
        var _ = Zn.bind(null, m);
        return _.type = m, vn || (vn = true, rt("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.")), Object.defineProperty(_, "type", {
          enumerable: false,
          get: /* @__PURE__ */ __name(function() {
            return rt("Factory.type is deprecated. Access the class directly before passing it to createFactory."), Object.defineProperty(this, "type", {
              value: m
            }), m;
          }, "get")
        }), _;
      }
      __name(Cr, "Cr");
      function Eo(m, _, U) {
        for (var z = dn.apply(this, arguments), ee = 2; ee < arguments.length; ee++)
          kr(arguments[ee], z.type);
        return Jr(z), z;
      }
      __name(Eo, "Eo");
      function Ar(m, _) {
        var U = Pe.transition;
        Pe.transition = {};
        var z = Pe.transition;
        Pe.transition._updatedFibers = /* @__PURE__ */ new Set();
        try {
          m();
        } finally {
          if (Pe.transition = U, U === null && z._updatedFibers) {
            var ee = z._updatedFibers.size;
            ee > 10 && rt("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), z._updatedFibers.clear();
          }
        }
      }
      __name(Ar, "Ar");
      var En = false, nn = null;
      function it(m) {
        if (nn === null)
          try {
            var _ = ("require" + Math.random()).slice(0, 7), U = o && o[_];
            nn = U.call(o, "timers").setImmediate;
          } catch {
            nn = /* @__PURE__ */ __name(function(ee) {
              En === false && (En = true, typeof MessageChannel > "u" && ce("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
              var ke = new MessageChannel();
              ke.port1.onmessage = ee, ke.port2.postMessage(void 0);
            }, "nn");
          }
        return nn(m);
      }
      __name(it, "it");
      var or = 0, mn = false;
      function Zr(m) {
        {
          var _ = or;
          or++, pe.current === null && (pe.current = []);
          var U = pe.isBatchingLegacy, z;
          try {
            if (pe.isBatchingLegacy = true, z = m(), !U && pe.didScheduleLegacyUpdate) {
              var ee = pe.current;
              ee !== null && (pe.didScheduleLegacyUpdate = false, Yt(ee));
            }
          } catch (ot) {
            throw dr(_), ot;
          } finally {
            pe.isBatchingLegacy = U;
          }
          if (z !== null && typeof z == "object" && typeof z.then == "function") {
            var ke = z, fe = false, Oe = {
              then: /* @__PURE__ */ __name(function(ot, pt) {
                fe = true, ke.then(function(_t) {
                  dr(_), or === 0 ? un(_t, ot, pt) : ot(_t);
                }, function(_t) {
                  dr(_), pt(_t);
                });
              }, "then")
            };
            return !mn && typeof Promise < "u" && Promise.resolve().then(function() {
            }).then(function() {
              fe || (mn = true, ce("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
            }), Oe;
          } else {
            var je = z;
            if (dr(_), or === 0) {
              var Ke = pe.current;
              Ke !== null && (Yt(Ke), pe.current = null);
              var st = {
                then: /* @__PURE__ */ __name(function(ot, pt) {
                  pe.current === null ? (pe.current = [], un(je, ot, pt)) : ot(je);
                }, "then")
              };
              return st;
            } else {
              var qe = {
                then: /* @__PURE__ */ __name(function(ot, pt) {
                  ot(je);
                }, "then")
              };
              return qe;
            }
          }
        }
      }
      __name(Zr, "Zr");
      function dr(m) {
        m !== or - 1 && ce("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), or = m;
      }
      __name(dr, "dr");
      function un(m, _, U) {
        {
          var z = pe.current;
          if (z !== null)
            try {
              Yt(z), it(function() {
                z.length === 0 ? (pe.current = null, _(m)) : un(m, _, U);
              });
            } catch (ee) {
              U(ee);
            }
          else
            _(m);
        }
      }
      __name(un, "un");
      var Er = false;
      function Yt(m) {
        if (!Er) {
          Er = true;
          var _ = 0;
          try {
            for (; _ < m.length; _++) {
              var U = m[_];
              do
                U = U(true);
              while (U !== null);
            }
            m.length = 0;
          } catch (z) {
            throw m = m.slice(_ + 1), z;
          } finally {
            Er = false;
          }
        }
      }
      __name(Yt, "Yt");
      var Dn = Zn, gn = Eo, Qn = Cr, Rn = {
        map: sr,
        forEach: Kt,
        count: br,
        toArray: Pr,
        only: qt
      };
      i.Children = Rn, i.Component = ve, i.Fragment = S, i.Profiler = P, i.PureComponent = Ee, i.StrictMode = E, i.Suspense = I, i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = We, i.act = Zr, i.cloneElement = gn, i.createContext = xt, i.createElement = Dn, i.createFactory = Qn, i.createRef = bt, i.forwardRef = hn, i.isValidElement = Qt, i.lazy = pn, i.memo = re, i.startTransition = Ar, i.unstable_act = Zr, i.useCallback = at, i.useContext = Ae, i.useDebugValue = ut, i.useDeferredValue = tr, i.useEffect = lt, i.useId = rr, i.useImperativeHandle = er, i.useInsertionEffect = Ve, i.useLayoutEffect = Qe, i.useMemo = ur, i.useReducer = Me, i.useRef = Ie, i.useState = Ue, i.useSyncExternalStore = Wr, i.useTransition = ct, i.version = c, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    })();
  }(Ji, Ji.exports)), Ji.exports;
}
__name(Vc, "Vc");
var yu;
function aa() {
  return yu || (yu = 1, false ? Bs.exports = Wc() : Bs.exports = Vc()), Bs.exports;
}
__name(aa, "aa");
var Yi = {};
var wu;
function Gc() {
  return wu || (wu = 1, function() {
    var o = aa(), i = Symbol.for("react.element"), c = Symbol.for("react.portal"), d = Symbol.for("react.fragment"), l = Symbol.for("react.strict_mode"), S = Symbol.for("react.profiler"), E = Symbol.for("react.provider"), P = Symbol.for("react.context"), g = Symbol.for("react.forward_ref"), x = Symbol.for("react.suspense"), M = Symbol.for("react.suspense_list"), I = Symbol.for("react.memo"), $ = Symbol.for("react.lazy"), te = Symbol.for("react.offscreen"), G = Symbol.iterator, se = "@@iterator";
    function H(T) {
      if (T === null || typeof T != "object")
        return null;
      var X = G && T[G] || T[se];
      return typeof X == "function" ? X : null;
    }
    __name(H, "H");
    var B = o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function he(T) {
      {
        for (var X = arguments.length, re = new Array(X > 1 ? X - 1 : 0), ie = 1; ie < X; ie++)
          re[ie - 1] = arguments[ie];
        ye("error", T, re);
      }
    }
    __name(he, "he");
    function ye(T, X, re) {
      {
        var ie = B.ReactDebugCurrentFrame, Ae = ie.getStackAddendum();
        Ae !== "" && (X += "%s", re = re.concat([Ae]));
        var Ue = re.map(function(Me) {
          return String(Me);
        });
        Ue.unshift("Warning: " + X), Function.prototype.apply.call(console[T], console, Ue);
      }
    }
    __name(ye, "ye");
    var Pe = false, pe = false, Ce = false, le = false, ue = false, xe;
    xe = Symbol.for("react.module.reference");
    function Ge(T) {
      return !!(typeof T == "string" || typeof T == "function" || T === d || T === S || ue || T === l || T === x || T === M || le || T === te || Pe || pe || Ce || typeof T == "object" && T !== null && (T.$$typeof === $ || T.$$typeof === I || T.$$typeof === E || T.$$typeof === P || T.$$typeof === g || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      T.$$typeof === xe || T.getModuleId !== void 0));
    }
    __name(Ge, "Ge");
    function ft(T, X, re) {
      var ie = T.displayName;
      if (ie)
        return ie;
      var Ae = X.displayName || X.name || "";
      return Ae !== "" ? re + "(" + Ae + ")" : re;
    }
    __name(ft, "ft");
    function Je(T) {
      return T.displayName || "Context";
    }
    __name(Je, "Je");
    function Ze(T) {
      if (T == null)
        return null;
      if (typeof T.tag == "number" && he("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof T == "function")
        return T.displayName || T.name || null;
      if (typeof T == "string")
        return T;
      switch (T) {
        case d:
          return "Fragment";
        case c:
          return "Portal";
        case S:
          return "Profiler";
        case l:
          return "StrictMode";
        case x:
          return "Suspense";
        case M:
          return "SuspenseList";
      }
      if (typeof T == "object")
        switch (T.$$typeof) {
          case P:
            var X = T;
            return Je(X) + ".Consumer";
          case E:
            var re = T;
            return Je(re._context) + ".Provider";
          case g:
            return ft(T, T.render, "ForwardRef");
          case I:
            var ie = T.displayName || null;
            return ie !== null ? ie : Ze(T.type) || "Memo";
          case $: {
            var Ae = T, Ue = Ae._payload, Me = Ae._init;
            try {
              return Ze(Me(Ue));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    __name(Ze, "Ze");
    var $e = Object.assign, We = 0, rt, ce, oe, nt, St, A, V;
    function ae() {
    }
    __name(ae, "ae");
    ae.__reactDisabledLog = true;
    function ve() {
      {
        if (We === 0) {
          rt = console.log, ce = console.info, oe = console.warn, nt = console.error, St = console.group, A = console.groupCollapsed, V = console.groupEnd;
          var T = {
            configurable: true,
            enumerable: true,
            value: ae,
            writable: true
          };
          Object.defineProperties(console, {
            info: T,
            log: T,
            warn: T,
            error: T,
            group: T,
            groupCollapsed: T,
            groupEnd: T
          });
        }
        We++;
      }
    }
    __name(ve, "ve");
    function de() {
      {
        if (We--, We === 0) {
          var T = {
            configurable: true,
            enumerable: true,
            writable: true
          };
          Object.defineProperties(console, {
            log: $e({}, T, {
              value: rt
            }),
            info: $e({}, T, {
              value: ce
            }),
            warn: $e({}, T, {
              value: oe
            }),
            error: $e({}, T, {
              value: nt
            }),
            group: $e({}, T, {
              value: St
            }),
            groupCollapsed: $e({}, T, {
              value: A
            }),
            groupEnd: $e({}, T, {
              value: V
            })
          });
        }
        We < 0 && he("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    __name(de, "de");
    var Re = B.ReactCurrentDispatcher, Se;
    function De(T, X, re) {
      {
        if (Se === void 0)
          try {
            throw Error();
          } catch (Ae) {
            var ie = Ae.stack.trim().match(/\n( *(at )?)/);
            Se = ie && ie[1] || "";
          }
        return `
` + Se + T;
      }
    }
    __name(De, "De");
    var Ee = false, ze;
    {
      var bt = typeof WeakMap == "function" ? WeakMap : Map;
      ze = new bt();
    }
    function Ut(T, X) {
      if (!T || Ee)
        return "";
      {
        var re = ze.get(T);
        if (re !== void 0)
          return re;
      }
      var ie;
      Ee = true;
      var Ae = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var Ue;
      Ue = Re.current, Re.current = null, ve();
      try {
        if (X) {
          var Me = /* @__PURE__ */ __name(function() {
            throw Error();
          }, "Me");
          if (Object.defineProperty(Me.prototype, "props", {
            set: /* @__PURE__ */ __name(function() {
              throw Error();
            }, "set")
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(Me, []);
            } catch (ut) {
              ie = ut;
            }
            Reflect.construct(T, [], Me);
          } else {
            try {
              Me.call();
            } catch (ut) {
              ie = ut;
            }
            T.call(Me.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (ut) {
            ie = ut;
          }
          T();
        }
      } catch (ut) {
        if (ut && ie && typeof ut.stack == "string") {
          for (var Ie = ut.stack.split(`
`), lt = ie.stack.split(`
`), Ve = Ie.length - 1, Qe = lt.length - 1; Ve >= 1 && Qe >= 0 && Ie[Ve] !== lt[Qe]; )
            Qe--;
          for (; Ve >= 1 && Qe >= 0; Ve--, Qe--)
            if (Ie[Ve] !== lt[Qe]) {
              if (Ve !== 1 || Qe !== 1)
                do
                  if (Ve--, Qe--, Qe < 0 || Ie[Ve] !== lt[Qe]) {
                    var at = `
` + Ie[Ve].replace(" at new ", " at ");
                    return T.displayName && at.includes("<anonymous>") && (at = at.replace("<anonymous>", T.displayName)), typeof T == "function" && ze.set(T, at), at;
                  }
                while (Ve >= 1 && Qe >= 0);
              break;
            }
        }
      } finally {
        Ee = false, Re.current = Ue, de(), Error.prepareStackTrace = Ae;
      }
      var ur = T ? T.displayName || T.name : "", er = ur ? De(ur) : "";
      return typeof T == "function" && ze.set(T, er), er;
    }
    __name(Ut, "Ut");
    function dt(T, X, re) {
      return Ut(T, false);
    }
    __name(dt, "dt");
    function Pt(T) {
      var X = T.prototype;
      return !!(X && X.isReactComponent);
    }
    __name(Pt, "Pt");
    function ar(T, X, re) {
      if (T == null)
        return "";
      if (typeof T == "function")
        return Ut(T, Pt(T));
      if (typeof T == "string")
        return De(T);
      switch (T) {
        case x:
          return De("Suspense");
        case M:
          return De("SuspenseList");
      }
      if (typeof T == "object")
        switch (T.$$typeof) {
          case g:
            return dt(T.render);
          case I:
            return ar(T.type, X, re);
          case $: {
            var ie = T, Ae = ie._payload, Ue = ie._init;
            try {
              return ar(Ue(Ae), X, re);
            } catch {
            }
          }
        }
      return "";
    }
    __name(ar, "ar");
    var Bt = Object.prototype.hasOwnProperty, mr = {}, Nt = B.ReactDebugCurrentFrame;
    function $t(T) {
      if (T) {
        var X = T._owner, re = ar(T.type, T._source, X ? X.type : null);
        Nt.setExtraStackFrame(re);
      } else
        Nt.setExtraStackFrame(null);
    }
    __name($t, "$t");
    function At(T, X, re, ie, Ae) {
      {
        var Ue = Function.call.bind(Bt);
        for (var Me in T)
          if (Ue(T, Me)) {
            var Ie = void 0;
            try {
              if (typeof T[Me] != "function") {
                var lt = Error((ie || "React class") + ": " + re + " type `" + Me + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof T[Me] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw lt.name = "Invariant Violation", lt;
              }
              Ie = T[Me](X, Me, ie, re, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (Ve) {
              Ie = Ve;
            }
            Ie && !(Ie instanceof Error) && ($t(Ae), he("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", ie || "React class", re, Me, typeof Ie), $t(null)), Ie instanceof Error && !(Ie.message in mr) && (mr[Ie.message] = true, $t(Ae), he("Failed %s type: %s", re, Ie.message), $t(null));
          }
      }
    }
    __name(At, "At");
    var gr = Array.isArray;
    function Ot(T) {
      return gr(T);
    }
    __name(Ot, "Ot");
    function Ct(T) {
      {
        var X = typeof Symbol == "function" && Symbol.toStringTag, re = X && T[Symbol.toStringTag] || T.constructor.name || "Object";
        return re;
      }
    }
    __name(Ct, "Ct");
    function vt(T) {
      try {
        return yr(T), false;
      } catch {
        return true;
      }
    }
    __name(vt, "vt");
    function yr(T) {
      return "" + T;
    }
    __name(yr, "yr");
    function Tr(T) {
      if (vt(T))
        return he("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ct(T)), yr(T);
    }
    __name(Tr, "Tr");
    var _r = B.ReactCurrentOwner, mt = {
      key: true,
      ref: true,
      __self: true,
      __source: true
    }, Br, Qr;
    function Nr(T) {
      if (Bt.call(T, "ref")) {
        var X = Object.getOwnPropertyDescriptor(T, "ref").get;
        if (X && X.isReactWarning)
          return false;
      }
      return T.ref !== void 0;
    }
    __name(Nr, "Nr");
    function Kr(T) {
      if (Bt.call(T, "key")) {
        var X = Object.getOwnPropertyDescriptor(T, "key").get;
        if (X && X.isReactWarning)
          return false;
      }
      return T.key !== void 0;
    }
    __name(Kr, "Kr");
    function zr(T, X) {
      typeof T.ref == "string" && _r.current;
    }
    __name(zr, "zr");
    function dn(T, X) {
      {
        var re = /* @__PURE__ */ __name(function() {
          Br || (Br = true, he("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", X));
        }, "re");
        re.isReactWarning = true, Object.defineProperty(T, "key", {
          get: re,
          configurable: true
        });
      }
    }
    __name(dn, "dn");
    function Qt(T, X) {
      {
        var re = /* @__PURE__ */ __name(function() {
          Qr || (Qr = true, he("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", X));
        }, "re");
        re.isReactWarning = true, Object.defineProperty(T, "ref", {
          get: re,
          configurable: true
        });
      }
    }
    __name(Qt, "Qt");
    var ir = /* @__PURE__ */ __name(function(T, X, re, ie, Ae, Ue, Me) {
      var Ie = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: i,
        // Built-in properties that belong on the element
        type: T,
        key: X,
        ref: re,
        props: Me,
        // Record the component responsible for creating this element.
        _owner: Ue
      };
      return Ie._store = {}, Object.defineProperty(Ie._store, "validated", {
        configurable: false,
        enumerable: false,
        writable: true,
        value: false
      }), Object.defineProperty(Ie, "_self", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: ie
      }), Object.defineProperty(Ie, "_source", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: Ae
      }), Object.freeze && (Object.freeze(Ie.props), Object.freeze(Ie)), Ie;
    }, "ir");
    function qr(T, X, re, ie, Ae) {
      {
        var Ue, Me = {}, Ie = null, lt = null;
        re !== void 0 && (Tr(re), Ie = "" + re), Kr(X) && (Tr(X.key), Ie = "" + X.key), Nr(X) && (lt = X.ref, zr(X, Ae));
        for (Ue in X)
          Bt.call(X, Ue) && !mt.hasOwnProperty(Ue) && (Me[Ue] = X[Ue]);
        if (T && T.defaultProps) {
          var Ve = T.defaultProps;
          for (Ue in Ve)
            Me[Ue] === void 0 && (Me[Ue] = Ve[Ue]);
        }
        if (Ie || lt) {
          var Qe = typeof T == "function" ? T.displayName || T.name || "Unknown" : T;
          Ie && dn(Me, Qe), lt && Qt(Me, Qe);
        }
        return ir(T, Ie, lt, Ae, ie, _r.current, Me);
      }
    }
    __name(qr, "qr");
    var Hr = B.ReactCurrentOwner, Tt = B.ReactDebugCurrentFrame;
    function It(T) {
      if (T) {
        var X = T._owner, re = ar(T.type, T._source, X ? X.type : null);
        Tt.setExtraStackFrame(re);
      } else
        Tt.setExtraStackFrame(null);
    }
    __name(It, "It");
    var Wt;
    Wt = false;
    function Ne(T) {
      return typeof T == "object" && T !== null && T.$$typeof === i;
    }
    __name(Ne, "Ne");
    function zt() {
      {
        if (Hr.current) {
          var T = Ze(Hr.current.type);
          if (T)
            return `

Check the render method of \`` + T + "`.";
        }
        return "";
      }
    }
    __name(zt, "zt");
    function sr(T) {
      return "";
    }
    __name(sr, "sr");
    var br = {};
    function Kt(T) {
      {
        var X = zt();
        if (!X) {
          var re = typeof T == "string" ? T : T.displayName || T.name;
          re && (X = `

Check the top-level render call using <` + re + ">.");
        }
        return X;
      }
    }
    __name(Kt, "Kt");
    function Pr(T, X) {
      {
        if (!T._store || T._store.validated || T.key != null)
          return;
        T._store.validated = true;
        var re = Kt(X);
        if (br[re])
          return;
        br[re] = true;
        var ie = "";
        T && T._owner && T._owner !== Hr.current && (ie = " It was passed a child from " + Ze(T._owner.type) + "."), It(T), he('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', re, ie), It(null);
      }
    }
    __name(Pr, "Pr");
    function qt(T, X) {
      {
        if (typeof T != "object")
          return;
        if (Ot(T))
          for (var re = 0; re < T.length; re++) {
            var ie = T[re];
            Ne(ie) && Pr(ie, X);
          }
        else if (Ne(T))
          T._store && (T._store.validated = true);
        else if (T) {
          var Ae = H(T);
          if (typeof Ae == "function" && Ae !== T.entries)
            for (var Ue = Ae.call(T), Me; !(Me = Ue.next()).done; )
              Ne(Me.value) && Pr(Me.value, X);
        }
      }
    }
    __name(qt, "qt");
    function xt(T) {
      {
        var X = T.type;
        if (X == null || typeof X == "string")
          return;
        var re;
        if (typeof X == "function")
          re = X.propTypes;
        else if (typeof X == "object" && (X.$$typeof === g || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        X.$$typeof === I))
          re = X.propTypes;
        else
          return;
        if (re) {
          var ie = Ze(X);
          At(re, T.props, "prop", ie, T);
        } else if (X.PropTypes !== void 0 && !Wt) {
          Wt = true;
          var Ae = Ze(X);
          he("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", Ae || "Unknown");
        }
        typeof X.getDefaultProps == "function" && !X.getDefaultProps.isReactClassApproved && he("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    __name(xt, "xt");
    function lr(T) {
      {
        for (var X = Object.keys(T.props), re = 0; re < X.length; re++) {
          var ie = X[re];
          if (ie !== "children" && ie !== "key") {
            It(T), he("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", ie), It(null);
            break;
          }
        }
        T.ref !== null && (It(T), he("Invalid attribute `ref` supplied to `React.Fragment`."), It(null));
      }
    }
    __name(lr, "lr");
    var wr = {};
    function $r(T, X, re, ie, Ae, Ue) {
      {
        var Me = Ge(T);
        if (!Me) {
          var Ie = "";
          (T === void 0 || typeof T == "object" && T !== null && Object.keys(T).length === 0) && (Ie += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var lt = sr();
          lt ? Ie += lt : Ie += zt();
          var Ve;
          T === null ? Ve = "null" : Ot(T) ? Ve = "array" : T !== void 0 && T.$$typeof === i ? (Ve = "<" + (Ze(T.type) || "Unknown") + " />", Ie = " Did you accidentally export a JSX literal instead of a component?") : Ve = typeof T, he("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", Ve, Ie);
        }
        var Qe = qr(T, X, re, Ae, Ue);
        if (Qe == null)
          return Qe;
        if (Me) {
          var at = X.children;
          if (at !== void 0)
            if (ie)
              if (Ot(at)) {
                for (var ur = 0; ur < at.length; ur++)
                  qt(at[ur], T);
                Object.freeze && Object.freeze(at);
              } else
                he("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              qt(at, T);
        }
        if (Bt.call(X, "key")) {
          var er = Ze(T), ut = Object.keys(X).filter(function(rr) {
            return rr !== "key";
          }), ct = ut.length > 0 ? "{key: someKey, " + ut.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!wr[er + ct]) {
            var tr = ut.length > 0 ? "{" + ut.join(": ..., ") + ": ...}" : "{}";
            he(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ct, er, tr, er), wr[er + ct] = true;
          }
        }
        return T === d ? lr(Qe) : xt(Qe), Qe;
      }
    }
    __name($r, "$r");
    function gt(T, X, re) {
      return $r(T, X, re, true);
    }
    __name(gt, "gt");
    function en(T, X, re) {
      return $r(T, X, re, false);
    }
    __name(en, "en");
    var pn = en, hn = gt;
    Yi.Fragment = d, Yi.jsx = pn, Yi.jsxs = hn;
  }()), Yi;
}
__name(Gc, "Gc");
var Su;
function Xc() {
  return Su || (Su = 1, false ? Us.exports = Yc() : Us.exports = Gc()), Us.exports;
}
__name(Xc, "Xc");
var J = Xc();
var xu = /* @__PURE__ */ __name((o, i, c) => (d, l) => {
  let S = -1;
  return E(0);
  async function E(P) {
    if (P <= S)
      throw new Error("next() called multiple times");
    S = P;
    let g, x = false, M;
    if (o[P] ? (M = o[P][0][0], d.req.routeIndex = P) : M = P === o.length && l || void 0, M)
      try {
        g = await M(d, () => E(P + 1));
      } catch (I) {
        if (I instanceof Error && i)
          d.error = I, g = await i(I, d), x = true;
        else
          throw I;
      }
    else
      d.finalized === false && c && (g = await c(d));
    return g && (d.finalized === false || x) && (d.res = g), d;
  }
  __name(E, "E");
}, "xu");
var Jc = Symbol();
var Zc = /* @__PURE__ */ __name(async (o, i = /* @__PURE__ */ Object.create(null)) => {
  const { all: c = false, dot: d = false } = i, S = (o instanceof Gu ? o.raw.headers : o.headers).get("Content-Type");
  return S?.startsWith("multipart/form-data") || S?.startsWith("application/x-www-form-urlencoded") ? Qc(o, { all: c, dot: d }) : {};
}, "Zc");
async function Qc(o, i) {
  const c = await o.formData();
  return c ? Kc(c, i) : {};
}
__name(Qc, "Qc");
function Kc(o, i) {
  const c = /* @__PURE__ */ Object.create(null);
  return o.forEach((d, l) => {
    i.all || l.endsWith("[]") ? qc(c, l, d) : c[l] = d;
  }), i.dot && Object.entries(c).forEach(([d, l]) => {
    d.includes(".") && (ef(c, d, l), delete c[d]);
  }), c;
}
__name(Kc, "Kc");
var qc = /* @__PURE__ */ __name((o, i, c) => {
  o[i] !== void 0 ? Array.isArray(o[i]) ? o[i].push(c) : o[i] = [o[i], c] : i.endsWith("[]") ? o[i] = [c] : o[i] = c;
}, "qc");
var ef = /* @__PURE__ */ __name((o, i, c) => {
  let d = o;
  const l = i.split(".");
  l.forEach((S, E) => {
    E === l.length - 1 ? d[S] = c : ((!d[S] || typeof d[S] != "object" || Array.isArray(d[S]) || d[S] instanceof File) && (d[S] = /* @__PURE__ */ Object.create(null)), d = d[S]);
  });
}, "ef");
var $u = /* @__PURE__ */ __name((o) => {
  const i = o.split("/");
  return i[0] === "" && i.shift(), i;
}, "$u");
var tf = /* @__PURE__ */ __name((o) => {
  const { groups: i, path: c } = rf(o), d = $u(c);
  return nf(d, i);
}, "tf");
var rf = /* @__PURE__ */ __name((o) => {
  const i = [];
  return o = o.replace(/\{[^}]+\}/g, (c, d) => {
    const l = `@${d}`;
    return i.push([l, c]), l;
  }), { groups: i, path: o };
}, "rf");
var nf = /* @__PURE__ */ __name((o, i) => {
  for (let c = i.length - 1; c >= 0; c--) {
    const [d] = i[c];
    for (let l = o.length - 1; l >= 0; l--)
      if (o[l].includes(d)) {
        o[l] = o[l].replace(d, i[c][1]);
        break;
      }
  }
  return o;
}, "nf");
var Ns = {};
var of = /* @__PURE__ */ __name((o, i) => {
  if (o === "*")
    return "*";
  const c = o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (c) {
    const d = `${o}#${i}`;
    return Ns[d] || (c[2] ? Ns[d] = i && i[0] !== ":" && i[0] !== "*" ? [d, c[1], new RegExp(`^${c[2]}(?=/${i})`)] : [o, c[1], new RegExp(`^${c[2]}$`)] : Ns[d] = [o, c[1], true]), Ns[d];
  }
  return null;
}, "of");
var Xs = /* @__PURE__ */ __name((o, i) => {
  try {
    return i(o);
  } catch {
    return o.replace(/(?:%[0-9A-Fa-f]{2})+/g, (c) => {
      try {
        return i(c);
      } catch {
        return c;
      }
    });
  }
}, "Xs");
var af = /* @__PURE__ */ __name((o) => Xs(o, decodeURI), "af");
var Wu = /* @__PURE__ */ __name((o) => {
  const i = o.url, c = i.indexOf(
    "/",
    i.charCodeAt(9) === 58 ? 13 : 8
  );
  let d = c;
  for (; d < i.length; d++) {
    const l = i.charCodeAt(d);
    if (l === 37) {
      const S = i.indexOf("?", d), E = i.slice(c, S === -1 ? void 0 : S);
      return af(E.includes("%25") ? E.replace(/%25/g, "%2525") : E);
    } else if (l === 63)
      break;
  }
  return i.slice(c, d);
}, "Wu");
var sf = /* @__PURE__ */ __name((o) => {
  const i = Wu(o);
  return i.length > 1 && i.at(-1) === "/" ? i.slice(0, -1) : i;
}, "sf");
var qa = /* @__PURE__ */ __name((o, i, ...c) => (c.length && (i = qa(i, ...c)), `${o?.[0] === "/" ? "" : "/"}${o}${i === "/" ? "" : `${o?.at(-1) === "/" ? "" : "/"}${i?.[0] === "/" ? i.slice(1) : i}`}`), "qa");
var Vu = /* @__PURE__ */ __name((o) => {
  if (o.charCodeAt(o.length - 1) !== 63 || !o.includes(":"))
    return null;
  const i = o.split("/"), c = [];
  let d = "";
  return i.forEach((l) => {
    if (l !== "" && !/\:/.test(l))
      d += "/" + l;
    else if (/\:/.test(l))
      if (/\?/.test(l)) {
        c.length === 0 && d === "" ? c.push("/") : c.push(d);
        const S = l.replace("?", "");
        d += "/" + S, c.push(d);
      } else
        d += "/" + l;
  }), c.filter((l, S, E) => E.indexOf(l) === S);
}, "Vu");
var Zl = /* @__PURE__ */ __name((o) => /[%+]/.test(o) ? (o.indexOf("+") !== -1 && (o = o.replace(/\+/g, " ")), o.indexOf("%") !== -1 ? Xs(o, cu) : o) : o, "Zl");
var Yu = /* @__PURE__ */ __name((o, i, c) => {
  let d;
  if (!c && i && !/[%+]/.test(i)) {
    let E = o.indexOf(`?${i}`, 8);
    for (E === -1 && (E = o.indexOf(`&${i}`, 8)); E !== -1; ) {
      const P = o.charCodeAt(E + i.length + 1);
      if (P === 61) {
        const g = E + i.length + 2, x = o.indexOf("&", g);
        return Zl(o.slice(g, x === -1 ? void 0 : x));
      } else if (P == 38 || isNaN(P))
        return "";
      E = o.indexOf(`&${i}`, E + 1);
    }
    if (d = /[%+]/.test(o), !d)
      return;
  }
  const l = {};
  d ??= /[%+]/.test(o);
  let S = o.indexOf("?", 8);
  for (; S !== -1; ) {
    const E = o.indexOf("&", S + 1);
    let P = o.indexOf("=", S);
    P > E && E !== -1 && (P = -1);
    let g = o.slice(
      S + 1,
      P === -1 ? E === -1 ? void 0 : E : P
    );
    if (d && (g = Zl(g)), S = E, g === "")
      continue;
    let x;
    P === -1 ? x = "" : (x = o.slice(P + 1, E === -1 ? void 0 : E), d && (x = Zl(x))), c ? (l[g] && Array.isArray(l[g]) || (l[g] = []), l[g].push(x)) : l[g] ??= x;
  }
  return i ? l[i] : l;
}, "Yu");
var lf = Yu;
var uf = /* @__PURE__ */ __name((o, i) => Yu(o, i, true), "uf");
var cu = decodeURIComponent;
var ku = /* @__PURE__ */ __name((o) => Xs(o, cu), "ku");
var Gu = class {
  static {
    __name(this, "Gu");
  }
  raw;
  #t;
  #e;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(o, i = "/", c = [[]]) {
    this.raw = o, this.path = i, this.#e = c, this.#t = {};
  }
  param(o) {
    return o ? this.#r(o) : this.#a();
  }
  #r(o) {
    const i = this.#e[0][this.routeIndex][1][o], c = this.#o(i);
    return c ? /\%/.test(c) ? ku(c) : c : void 0;
  }
  #a() {
    const o = {}, i = Object.keys(this.#e[0][this.routeIndex][1]);
    for (const c of i) {
      const d = this.#o(this.#e[0][this.routeIndex][1][c]);
      d && typeof d == "string" && (o[c] = /\%/.test(d) ? ku(d) : d);
    }
    return o;
  }
  #o(o) {
    return this.#e[1] ? this.#e[1][o] : o;
  }
  query(o) {
    return lf(this.url, o);
  }
  queries(o) {
    return uf(this.url, o);
  }
  header(o) {
    if (o)
      return this.raw.headers.get(o) ?? void 0;
    const i = {};
    return this.raw.headers.forEach((c, d) => {
      i[d] = c;
    }), i;
  }
  async parseBody(o) {
    return this.bodyCache.parsedBody ??= await Zc(this, o);
  }
  #n = /* @__PURE__ */ __name((o) => {
    const { bodyCache: i, raw: c } = this, d = i[o];
    if (d)
      return d;
    const l = Object.keys(i)[0];
    return l ? i[l].then((S) => (l === "json" && (S = JSON.stringify(S)), new Response(S)[o]())) : i[o] = c[o]();
  }, "#n");
  json() {
    return this.#n("text").then((o) => JSON.parse(o));
  }
  text() {
    return this.#n("text");
  }
  arrayBuffer() {
    return this.#n("arrayBuffer");
  }
  blob() {
    return this.#n("blob");
  }
  formData() {
    return this.#n("formData");
  }
  addValidatedData(o, i) {
    this.#t[o] = i;
  }
  valid(o) {
    return this.#t[o];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [Jc]() {
    return this.#e;
  }
  get matchedRoutes() {
    return this.#e[0].map(([[, o]]) => o);
  }
  get routePath() {
    return this.#e[0].map(([[, o]]) => o)[this.routeIndex].path;
  }
};
var cf = {
  Stringify: 1
};
var Xu = /* @__PURE__ */ __name(async (o, i, c, d, l) => {
  typeof o == "object" && !(o instanceof String) && (o instanceof Promise || (o = o.toString()), o instanceof Promise && (o = await o));
  const S = o.callbacks;
  return S?.length ? (l ? l[0] += o : l = [o], Promise.all(S.map((P) => P({ phase: i, buffer: l, context: d }))).then(
    (P) => Promise.all(
      P.filter(Boolean).map((g) => Xu(g, i, false, d, l))
    ).then(() => l[0])
  )) : Promise.resolve(o);
}, "Xu");
var ff = "text/plain; charset=UTF-8";
var Ql = /* @__PURE__ */ __name((o, i) => ({
  "Content-Type": o,
  ...i
}), "Ql");
var df = class {
  static {
    __name(this, "df");
  }
  #t;
  #e;
  env = {};
  #r;
  finalized = false;
  error;
  #a;
  #o;
  #n;
  #c;
  #l;
  #u;
  #s;
  #f;
  #d;
  constructor(o, i) {
    this.#t = o, i && (this.#o = i.executionCtx, this.env = i.env, this.#u = i.notFoundHandler, this.#d = i.path, this.#f = i.matchResult);
  }
  get req() {
    return this.#e ??= new Gu(this.#t, this.#d, this.#f), this.#e;
  }
  get event() {
    if (this.#o && "respondWith" in this.#o)
      return this.#o;
    throw Error("This context has no FetchEvent");
  }
  get executionCtx() {
    if (this.#o)
      return this.#o;
    throw Error("This context has no ExecutionContext");
  }
  get res() {
    return this.#n ||= new Response(null, {
      headers: this.#s ??= new Headers()
    });
  }
  set res(o) {
    if (this.#n && o) {
      o = new Response(o.body, o);
      for (const [i, c] of this.#n.headers.entries())
        if (i !== "content-type")
          if (i === "set-cookie") {
            const d = this.#n.headers.getSetCookie();
            o.headers.delete("set-cookie");
            for (const l of d)
              o.headers.append("set-cookie", l);
          } else
            o.headers.set(i, c);
    }
    this.#n = o, this.finalized = true;
  }
  render = /* @__PURE__ */ __name((...o) => (this.#l ??= (i) => this.html(i), this.#l(...o)), "render");
  setLayout = /* @__PURE__ */ __name((o) => this.#c = o, "setLayout");
  getLayout = /* @__PURE__ */ __name(() => this.#c, "getLayout");
  setRenderer = /* @__PURE__ */ __name((o) => {
    this.#l = o;
  }, "setRenderer");
  header = /* @__PURE__ */ __name((o, i, c) => {
    this.finalized && (this.#n = new Response(this.#n.body, this.#n));
    const d = this.#n ? this.#n.headers : this.#s ??= new Headers();
    i === void 0 ? d.delete(o) : c?.append ? d.append(o, i) : d.set(o, i);
  }, "header");
  status = /* @__PURE__ */ __name((o) => {
    this.#a = o;
  }, "status");
  set = /* @__PURE__ */ __name((o, i) => {
    this.#r ??= /* @__PURE__ */ new Map(), this.#r.set(o, i);
  }, "set");
  get = /* @__PURE__ */ __name((o) => this.#r ? this.#r.get(o) : void 0, "get");
  get var() {
    return this.#r ? Object.fromEntries(this.#r) : {};
  }
  #i(o, i, c) {
    const d = this.#n ? new Headers(this.#n.headers) : this.#s ?? new Headers();
    if (typeof i == "object" && "headers" in i) {
      const S = i.headers instanceof Headers ? i.headers : new Headers(i.headers);
      for (const [E, P] of S)
        E.toLowerCase() === "set-cookie" ? d.append(E, P) : d.set(E, P);
    }
    if (c)
      for (const [S, E] of Object.entries(c))
        if (typeof E == "string")
          d.set(S, E);
        else {
          d.delete(S);
          for (const P of E)
            d.append(S, P);
        }
    const l = typeof i == "number" ? i : i?.status ?? this.#a;
    return new Response(o, { status: l, headers: d });
  }
  newResponse = /* @__PURE__ */ __name((...o) => this.#i(...o), "newResponse");
  body = /* @__PURE__ */ __name((o, i, c) => this.#i(o, i, c), "body");
  text = /* @__PURE__ */ __name((o, i, c) => !this.#s && !this.#a && !i && !c && !this.finalized ? new Response(o) : this.#i(
    o,
    i,
    Ql(ff, c)
  ), "text");
  json = /* @__PURE__ */ __name((o, i, c) => this.#i(
    JSON.stringify(o),
    i,
    Ql("application/json", c)
  ), "json");
  html = /* @__PURE__ */ __name((o, i, c) => {
    const d = /* @__PURE__ */ __name((l) => this.#i(l, i, Ql("text/html; charset=UTF-8", c)), "d");
    return typeof o == "object" ? Xu(o, cf.Stringify, false, {}).then(d) : d(o);
  }, "html");
  redirect = /* @__PURE__ */ __name((o, i) => {
    const c = String(o);
    return this.header(
      "Location",
      /[^\x00-\xFF]/.test(c) ? encodeURI(c) : c
    ), this.newResponse(null, i ?? 302);
  }, "redirect");
  notFound = /* @__PURE__ */ __name(() => (this.#u ??= () => new Response(), this.#u(this)), "notFound");
};
var Zt = "ALL";
var pf = "all";
var hf = ["get", "post", "put", "delete", "options", "patch"];
var Ju = "Can not add a route since the matcher is already built.";
var Zu = class extends Error {
  static {
    __name(this, "Zu");
  }
};
var vf = "__COMPOSED_HANDLER";
var mf = /* @__PURE__ */ __name((o) => o.text("404 Not Found", 404), "mf");
var Cu = /* @__PURE__ */ __name((o, i) => {
  if ("getResponse" in o) {
    const c = o.getResponse();
    return i.newResponse(c.body, c);
  }
  return console.error(o), i.text("Internal Server Error", 500);
}, "Cu");
var Qu = class {
  static {
    __name(this, "Qu");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #t = "/";
  routes = [];
  constructor(i = {}) {
    [...hf, pf].forEach((S) => {
      this[S] = (E, ...P) => (typeof E == "string" ? this.#t = E : this.#a(S, this.#t, E), P.forEach((g) => {
        this.#a(S, this.#t, g);
      }), this);
    }), this.on = (S, E, ...P) => {
      for (const g of [E].flat()) {
        this.#t = g;
        for (const x of [S].flat())
          P.map((M) => {
            this.#a(x.toUpperCase(), this.#t, M);
          });
      }
      return this;
    }, this.use = (S, ...E) => (typeof S == "string" ? this.#t = S : (this.#t = "*", E.unshift(S)), E.forEach((P) => {
      this.#a(Zt, this.#t, P);
    }), this);
    const { strict: d, ...l } = i;
    Object.assign(this, l), this.getPath = d ?? true ? i.getPath ?? Wu : sf;
  }
  #e() {
    const i = new Qu({
      router: this.router,
      getPath: this.getPath
    });
    return i.errorHandler = this.errorHandler, i.#r = this.#r, i.routes = this.routes, i;
  }
  #r = mf;
  errorHandler = Cu;
  route(i, c) {
    const d = this.basePath(i);
    return c.routes.map((l) => {
      let S;
      c.errorHandler === Cu ? S = l.handler : (S = /* @__PURE__ */ __name(async (E, P) => (await xu([], c.errorHandler)(E, () => l.handler(E, P))).res, "S"), S[vf] = l.handler), d.#a(l.method, l.path, S);
    }), this;
  }
  basePath(i) {
    const c = this.#e();
    return c._basePath = qa(this._basePath, i), c;
  }
  onError = /* @__PURE__ */ __name((i) => (this.errorHandler = i, this), "onError");
  notFound = /* @__PURE__ */ __name((i) => (this.#r = i, this), "notFound");
  mount(i, c, d) {
    let l, S;
    d && (typeof d == "function" ? S = d : (S = d.optionHandler, d.replaceRequest === false ? l = /* @__PURE__ */ __name((g) => g, "l") : l = d.replaceRequest));
    const E = S ? (g) => {
      const x = S(g);
      return Array.isArray(x) ? x : [x];
    } : (g) => {
      let x;
      try {
        x = g.executionCtx;
      } catch {
      }
      return [g.env, x];
    };
    l ||= (() => {
      const g = qa(this._basePath, i), x = g === "/" ? 0 : g.length;
      return (M) => {
        const I = new URL(M.url);
        return I.pathname = I.pathname.slice(x) || "/", new Request(I, M);
      };
    })();
    const P = /* @__PURE__ */ __name(async (g, x) => {
      const M = await c(l(g.req.raw), ...E(g));
      if (M)
        return M;
      await x();
    }, "P");
    return this.#a(Zt, qa(i, "*"), P), this;
  }
  #a(i, c, d) {
    i = i.toUpperCase(), c = qa(this._basePath, c);
    const l = { basePath: this._basePath, path: c, method: i, handler: d };
    this.router.add(i, c, [d, l]), this.routes.push(l);
  }
  #o(i, c) {
    if (i instanceof Error)
      return this.errorHandler(i, c);
    throw i;
  }
  #n(i, c, d, l) {
    if (l === "HEAD")
      return (async () => new Response(null, await this.#n(i, c, d, "GET")))();
    const S = this.getPath(i, { env: d }), E = this.router.match(l, S), P = new df(i, {
      path: S,
      matchResult: E,
      env: d,
      executionCtx: c,
      notFoundHandler: this.#r
    });
    if (E[0].length === 1) {
      let x;
      try {
        x = E[0][0][0][0](P, async () => {
          P.res = await this.#r(P);
        });
      } catch (M) {
        return this.#o(M, P);
      }
      return x instanceof Promise ? x.then(
        (M) => M || (P.finalized ? P.res : this.#r(P))
      ).catch((M) => this.#o(M, P)) : x ?? this.#r(P);
    }
    const g = xu(E[0], this.errorHandler, this.#r);
    return (async () => {
      try {
        const x = await g(P);
        if (!x.finalized)
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        return x.res;
      } catch (x) {
        return this.#o(x, P);
      }
    })();
  }
  fetch = /* @__PURE__ */ __name((i, ...c) => this.#n(i, c[1], c[0], i.method), "fetch");
  request = /* @__PURE__ */ __name((i, c, d, l) => i instanceof Request ? this.fetch(c ? new Request(i, c) : i, d, l) : (i = i.toString(), this.fetch(
    new Request(
      /^https?:\/\//.test(i) ? i : `http://localhost${qa("/", i)}`,
      c
    ),
    d,
    l
  )), "request");
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (i) => {
      i.respondWith(this.#n(i.request, i, void 0, i.request.method));
    });
  }, "fire");
};
var Gs = "[^/]+";
var Zi = ".*";
var Qi = "(?:|/.*)";
var ei = Symbol();
var gf = new Set(".\\+*[^]$()");
function yf(o, i) {
  return o.length === 1 ? i.length === 1 ? o < i ? -1 : 1 : -1 : i.length === 1 || o === Zi || o === Qi ? 1 : i === Zi || i === Qi ? -1 : o === Gs ? 1 : i === Gs ? -1 : o.length === i.length ? o < i ? -1 : 1 : i.length - o.length;
}
__name(yf, "yf");
var nu = class {
  static {
    __name(this, "nu");
  }
  #t;
  #e;
  #r = /* @__PURE__ */ Object.create(null);
  insert(i, c, d, l, S) {
    if (i.length === 0) {
      if (this.#t !== void 0)
        throw ei;
      if (S)
        return;
      this.#t = c;
      return;
    }
    const [E, ...P] = i, g = E === "*" ? P.length === 0 ? ["", "", Zi] : ["", "", Gs] : E === "/*" ? ["", "", Qi] : E.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let x;
    if (g) {
      const M = g[1];
      let I = g[2] || Gs;
      if (M && g[2] && (I === ".*" || (I = I.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:"), /\((?!\?:)/.test(I))))
        throw ei;
      if (x = this.#r[I], !x) {
        if (Object.keys(this.#r).some(
          ($) => $ !== Zi && $ !== Qi
        ))
          throw ei;
        if (S)
          return;
        x = this.#r[I] = new nu(), M !== "" && (x.#e = l.varIndex++);
      }
      !S && M !== "" && d.push([M, x.#e]);
    } else if (x = this.#r[E], !x) {
      if (Object.keys(this.#r).some(
        (M) => M.length > 1 && M !== Zi && M !== Qi
      ))
        throw ei;
      if (S)
        return;
      x = this.#r[E] = new nu();
    }
    x.insert(P, c, d, l, S);
  }
  buildRegExpStr() {
    const c = Object.keys(this.#r).sort(yf).map((d) => {
      const l = this.#r[d];
      return (typeof l.#e == "number" ? `(${d})@${l.#e}` : gf.has(d) ? `\\${d}` : d) + l.buildRegExpStr();
    });
    return typeof this.#t == "number" && c.unshift(`#${this.#t}`), c.length === 0 ? "" : c.length === 1 ? c[0] : "(?:" + c.join("|") + ")";
  }
};
var bf = class {
  static {
    __name(this, "bf");
  }
  #t = { varIndex: 0 };
  #e = new nu();
  insert(o, i, c) {
    const d = [], l = [];
    for (let E = 0; ; ) {
      let P = false;
      if (o = o.replace(/\{[^}]+\}/g, (g) => {
        const x = `@\\${E}`;
        return l[E] = [x, g], E++, P = true, x;
      }), !P)
        break;
    }
    const S = o.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let E = l.length - 1; E >= 0; E--) {
      const [P] = l[E];
      for (let g = S.length - 1; g >= 0; g--)
        if (S[g].indexOf(P) !== -1) {
          S[g] = S[g].replace(P, l[E][1]);
          break;
        }
    }
    return this.#e.insert(S, i, d, this.#t, c), d;
  }
  buildRegExp() {
    let o = this.#e.buildRegExpStr();
    if (o === "")
      return [/^$/, [], []];
    let i = 0;
    const c = [], d = [];
    return o = o.replace(/#(\d+)|@(\d+)|\.\*\$/g, (l, S, E) => S !== void 0 ? (c[++i] = Number(S), "$()") : (E !== void 0 && (d[Number(E)] = ++i), "")), [new RegExp(`^${o}`), c, d];
  }
};
var Ku = [];
var wf = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var qu = /* @__PURE__ */ Object.create(null);
function ec(o) {
  return qu[o] ??= new RegExp(
    o === "*" ? "" : `^${o.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (i, c) => c ? `\\${c}` : "(?:|/.*)"
    )}$`
  );
}
__name(ec, "ec");
function Sf() {
  qu = /* @__PURE__ */ Object.create(null);
}
__name(Sf, "Sf");
function xf(o) {
  const i = new bf(), c = [];
  if (o.length === 0)
    return wf;
  const d = o.map(
    (x) => [!/\*|\/:/.test(x[0]), ...x]
  ).sort(
    ([x, M], [I, $]) => x ? 1 : I ? -1 : M.length - $.length
  ), l = /* @__PURE__ */ Object.create(null);
  for (let x = 0, M = -1, I = d.length; x < I; x++) {
    const [$, te, G] = d[x];
    $ ? l[te] = [G.map(([H]) => [H, /* @__PURE__ */ Object.create(null)]), Ku] : M++;
    let se;
    try {
      se = i.insert(te, M, $);
    } catch (H) {
      throw H === ei ? new Zu(te) : H;
    }
    $ || (c[M] = G.map(([H, B]) => {
      const he = /* @__PURE__ */ Object.create(null);
      for (B -= 1; B >= 0; B--) {
        const [ye, Pe] = se[B];
        he[ye] = Pe;
      }
      return [H, he];
    }));
  }
  const [S, E, P] = i.buildRegExp();
  for (let x = 0, M = c.length; x < M; x++)
    for (let I = 0, $ = c[x].length; I < $; I++) {
      const te = c[x][I]?.[1];
      if (!te)
        continue;
      const G = Object.keys(te);
      for (let se = 0, H = G.length; se < H; se++)
        te[G[se]] = P[te[G[se]]];
    }
  const g = [];
  for (const x in E)
    g[x] = c[E[x]];
  return [S, g, l];
}
__name(xf, "xf");
function Qa(o, i) {
  if (o) {
    for (const c of Object.keys(o).sort((d, l) => l.length - d.length))
      if (ec(c).test(i))
        return [...o[c]];
  }
}
__name(Qa, "Qa");
var kf = class {
  static {
    __name(this, "kf");
  }
  name = "RegExpRouter";
  #t;
  #e;
  constructor() {
    this.#t = { [Zt]: /* @__PURE__ */ Object.create(null) }, this.#e = { [Zt]: /* @__PURE__ */ Object.create(null) };
  }
  add(o, i, c) {
    const d = this.#t, l = this.#e;
    if (!d || !l)
      throw new Error(Ju);
    d[o] || [d, l].forEach((P) => {
      P[o] = /* @__PURE__ */ Object.create(null), Object.keys(P[Zt]).forEach((g) => {
        P[o][g] = [...P[Zt][g]];
      });
    }), i === "/*" && (i = "*");
    const S = (i.match(/\/:/g) || []).length;
    if (/\*$/.test(i)) {
      const P = ec(i);
      o === Zt ? Object.keys(d).forEach((g) => {
        d[g][i] ||= Qa(d[g], i) || Qa(d[Zt], i) || [];
      }) : d[o][i] ||= Qa(d[o], i) || Qa(d[Zt], i) || [], Object.keys(d).forEach((g) => {
        (o === Zt || o === g) && Object.keys(d[g]).forEach((x) => {
          P.test(x) && d[g][x].push([c, S]);
        });
      }), Object.keys(l).forEach((g) => {
        (o === Zt || o === g) && Object.keys(l[g]).forEach(
          (x) => P.test(x) && l[g][x].push([c, S])
        );
      });
      return;
    }
    const E = Vu(i) || [i];
    for (let P = 0, g = E.length; P < g; P++) {
      const x = E[P];
      Object.keys(l).forEach((M) => {
        (o === Zt || o === M) && (l[M][x] ||= [
          ...Qa(d[M], x) || Qa(d[Zt], x) || []
        ], l[M][x].push([c, S - g + P + 1]));
      });
    }
  }
  match(o, i) {
    Sf();
    const c = this.#r();
    return this.match = (d, l) => {
      const S = c[d] || c[Zt], E = S[2][l];
      if (E)
        return E;
      const P = l.match(S[0]);
      if (!P)
        return [[], Ku];
      const g = P.indexOf("", 1);
      return [S[1][g], P];
    }, this.match(o, i);
  }
  #r() {
    const o = /* @__PURE__ */ Object.create(null);
    return Object.keys(this.#e).concat(Object.keys(this.#t)).forEach((i) => {
      o[i] ||= this.#a(i);
    }), this.#t = this.#e = void 0, o;
  }
  #a(o) {
    const i = [];
    let c = o === Zt;
    return [this.#t, this.#e].forEach((d) => {
      const l = d[o] ? Object.keys(d[o]).map((S) => [S, d[o][S]]) : [];
      l.length !== 0 ? (c ||= true, i.push(...l)) : o !== Zt && i.push(
        ...Object.keys(d[Zt]).map((S) => [S, d[Zt][S]])
      );
    }), c ? xf(i) : null;
  }
};
var Cf = class {
  static {
    __name(this, "Cf");
  }
  name = "SmartRouter";
  #t = [];
  #e = [];
  constructor(o) {
    this.#t = o.routers;
  }
  add(o, i, c) {
    if (!this.#e)
      throw new Error(Ju);
    this.#e.push([o, i, c]);
  }
  match(o, i) {
    if (!this.#e)
      throw new Error("Fatal error");
    const c = this.#t, d = this.#e, l = c.length;
    let S = 0, E;
    for (; S < l; S++) {
      const P = c[S];
      try {
        for (let g = 0, x = d.length; g < x; g++)
          P.add(...d[g]);
        E = P.match(o, i);
      } catch (g) {
        if (g instanceof Zu)
          continue;
        throw g;
      }
      this.match = P.match.bind(P), this.#t = [P], this.#e = void 0;
      break;
    }
    if (S === l)
      throw new Error("Fatal error");
    return this.name = `SmartRouter + ${this.activeRouter.name}`, E;
  }
  get activeRouter() {
    if (this.#e || this.#t.length !== 1)
      throw new Error("No active router has been determined yet.");
    return this.#t[0];
  }
};
var Gi = /* @__PURE__ */ Object.create(null);
var tc = class {
  static {
    __name(this, "tc");
  }
  #t;
  #e;
  #r;
  #a = 0;
  #o = Gi;
  constructor(o, i, c) {
    if (this.#e = c || /* @__PURE__ */ Object.create(null), this.#t = [], o && i) {
      const d = /* @__PURE__ */ Object.create(null);
      d[o] = { handler: i, possibleKeys: [], score: 0 }, this.#t = [d];
    }
    this.#r = [];
  }
  insert(o, i, c) {
    this.#a = ++this.#a;
    let d = this;
    const l = tf(i), S = [];
    for (let E = 0, P = l.length; E < P; E++) {
      const g = l[E], x = l[E + 1], M = of(g, x), I = Array.isArray(M) ? M[0] : g;
      if (I in d.#e) {
        d = d.#e[I], M && S.push(M[1]);
        continue;
      }
      d.#e[I] = new tc(), M && (d.#r.push(M), S.push(M[1])), d = d.#e[I];
    }
    return d.#t.push({
      [o]: {
        handler: c,
        possibleKeys: S.filter((E, P, g) => g.indexOf(E) === P),
        score: this.#a
      }
    }), d;
  }
  #n(o, i, c, d) {
    const l = [];
    for (let S = 0, E = o.#t.length; S < E; S++) {
      const P = o.#t[S], g = P[i] || P[Zt], x = {};
      if (g !== void 0 && (g.params = /* @__PURE__ */ Object.create(null), l.push(g), c !== Gi || d && d !== Gi))
        for (let M = 0, I = g.possibleKeys.length; M < I; M++) {
          const $ = g.possibleKeys[M], te = x[g.score];
          g.params[$] = d?.[$] && !te ? d[$] : c[$] ?? d?.[$], x[g.score] = true;
        }
    }
    return l;
  }
  search(o, i) {
    const c = [];
    this.#o = Gi;
    let l = [this];
    const S = $u(i), E = [];
    for (let P = 0, g = S.length; P < g; P++) {
      const x = S[P], M = P === g - 1, I = [];
      for (let $ = 0, te = l.length; $ < te; $++) {
        const G = l[$], se = G.#e[x];
        se && (se.#o = G.#o, M ? (se.#e["*"] && c.push(
          ...this.#n(se.#e["*"], o, G.#o)
        ), c.push(...this.#n(se, o, G.#o))) : I.push(se));
        for (let H = 0, B = G.#r.length; H < B; H++) {
          const he = G.#r[H], ye = G.#o === Gi ? {} : { ...G.#o };
          if (he === "*") {
            const xe = G.#e["*"];
            xe && (c.push(...this.#n(xe, o, G.#o)), xe.#o = ye, I.push(xe));
            continue;
          }
          const [Pe, pe, Ce] = he;
          if (!x && !(Ce instanceof RegExp))
            continue;
          const le = G.#e[Pe], ue = S.slice(P).join("/");
          if (Ce instanceof RegExp) {
            const xe = Ce.exec(ue);
            if (xe) {
              if (ye[pe] = xe[0], c.push(...this.#n(le, o, G.#o, ye)), Object.keys(le.#e).length) {
                le.#o = ye;
                const Ge = xe[0].match(/\//)?.length ?? 0;
                (E[Ge] ||= []).push(le);
              }
              continue;
            }
          }
          (Ce === true || Ce.test(x)) && (ye[pe] = x, M ? (c.push(...this.#n(le, o, ye, G.#o)), le.#e["*"] && c.push(
            ...this.#n(le.#e["*"], o, ye, G.#o)
          )) : (le.#o = ye, I.push(le)));
        }
      }
      l = I.concat(E.shift() ?? []);
    }
    return c.length > 1 && c.sort((P, g) => P.score - g.score), [c.map(({ handler: P, params: g }) => [P, g])];
  }
};
var Ef = class {
  static {
    __name(this, "Ef");
  }
  name = "TrieRouter";
  #t;
  constructor() {
    this.#t = new tc();
  }
  add(o, i, c) {
    const d = Vu(i);
    if (d) {
      for (let l = 0, S = d.length; l < S; l++)
        this.#t.insert(o, d[l], c);
      return;
    }
    this.#t.insert(o, i, c);
  }
  match(o, i) {
    return this.#t.search(o, i);
  }
};
var rc = class extends Qu {
  static {
    __name(this, "rc");
  }
  constructor(o = {}) {
    super(o), this.router = o.router ?? new Cf({
      routers: [new kf(), new Ef()]
    });
  }
};
var q = aa();
var vr = /* @__PURE__ */ $c(q);
var Eu = /* @__PURE__ */ Hc({
  __proto__: null,
  default: vr
}, [q]);
var go = {};
var ea = {};
var _u;
function _f() {
  return _u || (_u = 1, function() {
    var o = aa(), i = "18.3.1", c = o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function d(e) {
      {
        for (var t = arguments.length, r = new Array(t > 1 ? t - 1 : 0), a = 1; a < t; a++)
          r[a - 1] = arguments[a];
        S("warn", e, r);
      }
    }
    __name(d, "d");
    function l(e) {
      {
        for (var t = arguments.length, r = new Array(t > 1 ? t - 1 : 0), a = 1; a < t; a++)
          r[a - 1] = arguments[a];
        S("error", e, r);
      }
    }
    __name(l, "l");
    function S(e, t, r) {
      {
        var a = c.ReactDebugCurrentFrame, f = a.getStackAddendum();
        f !== "" && (t += "%s", r = r.concat([f]));
        var v = r.map(function(b) {
          return String(b);
        });
        v.unshift("Warning: " + t), Function.prototype.apply.call(console[e], console, v);
      }
    }
    __name(S, "S");
    function E(e) {
      e();
    }
    __name(E, "E");
    function P(e) {
    }
    __name(P, "P");
    function g(e, t) {
      x(e, t);
    }
    __name(g, "g");
    function x(e, t) {
      return e.push(t);
    }
    __name(x, "x");
    function M(e) {
    }
    __name(M, "M");
    function I(e) {
      e.push(null);
    }
    __name(I, "I");
    function $(e) {
      return e;
    }
    __name($, "$");
    function te(e) {
      return e;
    }
    __name(te, "te");
    function G(e, t) {
      e.destroy(t);
    }
    __name(G, "G");
    function se(e) {
      {
        var t = typeof Symbol == "function" && Symbol.toStringTag, r = t && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return r;
      }
    }
    __name(se, "se");
    function H(e) {
      try {
        return B(e), false;
      } catch {
        return true;
      }
    }
    __name(H, "H");
    function B(e) {
      return "" + e;
    }
    __name(B, "B");
    function he(e, t) {
      if (H(e))
        return l("The provided `%s` attribute is an unsupported type %s. This value must be coerced to a string before before using it here.", t, se(e)), B(e);
    }
    __name(he, "he");
    function ye(e, t) {
      if (H(e))
        return l("The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before before using it here.", t, se(e)), B(e);
    }
    __name(ye, "ye");
    function Pe(e) {
      if (H(e))
        return l("The provided HTML markup uses a value of unsupported type %s. This value must be coerced to a string before before using it here.", se(e)), B(e);
    }
    __name(Pe, "Pe");
    var pe = Object.prototype.hasOwnProperty, Ce = 0, le = 1, ue = 2, xe = 3, Ge = 4, ft = 5, Je = 6, Ze = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD", $e = Ze + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040", We = new RegExp("^[" + Ze + "][" + $e + "]*$"), rt = {}, ce = {};
    function oe(e) {
      return pe.call(ce, e) ? true : pe.call(rt, e) ? false : We.test(e) ? (ce[e] = true, true) : (rt[e] = true, l("Invalid attribute name: `%s`", e), false);
    }
    __name(oe, "oe");
    function nt(e, t, r, a) {
      if (r !== null && r.type === Ce)
        return false;
      switch (typeof t) {
        case "function":
        // $FlowIssue symbol is perfectly valid here
        case "symbol":
          return true;
        case "boolean": {
          if (r !== null)
            return !r.acceptsBooleans;
          var f = e.toLowerCase().slice(0, 5);
          return f !== "data-" && f !== "aria-";
        }
        default:
          return false;
      }
    }
    __name(nt, "nt");
    function St(e) {
      return V.hasOwnProperty(e) ? V[e] : null;
    }
    __name(St, "St");
    function A(e, t, r, a, f, v, b) {
      this.acceptsBooleans = t === ue || t === xe || t === Ge, this.attributeName = a, this.attributeNamespace = f, this.mustUseProperty = r, this.propertyName = e, this.type = t, this.sanitizeURL = v, this.removeEmptyString = b;
    }
    __name(A, "A");
    var V = {}, ae = [
      "children",
      "dangerouslySetInnerHTML",
      // TODO: This prevents the assignment of defaultValue to regular
      // elements (not just inputs). Now that ReactDOMInput assigns to the
      // defaultValue property -- do we need this?
      "defaultValue",
      "defaultChecked",
      "innerHTML",
      "suppressContentEditableWarning",
      "suppressHydrationWarning",
      "style"
    ];
    ae.forEach(function(e) {
      V[e] = new A(
        e,
        Ce,
        false,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
      var t = e[0], r = e[1];
      V[t] = new A(
        t,
        le,
        false,
        // mustUseProperty
        r,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
      V[e] = new A(
        e,
        ue,
        false,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
      V[e] = new A(
        e,
        ue,
        false,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [
      "allowFullScreen",
      "async",
      // Note: there is a special case that prevents it from being written to the DOM
      // on the client side because the browsers are inconsistent. Instead we call focus().
      "autoFocus",
      "autoPlay",
      "controls",
      "default",
      "defer",
      "disabled",
      "disablePictureInPicture",
      "disableRemotePlayback",
      "formNoValidate",
      "hidden",
      "loop",
      "noModule",
      "noValidate",
      "open",
      "playsInline",
      "readOnly",
      "required",
      "reversed",
      "scoped",
      "seamless",
      // Microdata
      "itemScope"
    ].forEach(function(e) {
      V[e] = new A(
        e,
        xe,
        false,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [
      "checked",
      // Note: `option.selected` is not updated if `select.multiple` is
      // disabled with `removeAttribute`. We have special logic for handling this.
      "multiple",
      "muted",
      "selected"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      V[e] = new A(
        e,
        xe,
        true,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [
      "capture",
      "download"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      V[e] = new A(
        e,
        Ge,
        false,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [
      "cols",
      "rows",
      "size",
      "span"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      V[e] = new A(
        e,
        Je,
        false,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), ["rowSpan", "start"].forEach(function(e) {
      V[e] = new A(
        e,
        ft,
        false,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    });
    var ve = /[\-\:]([a-z])/g, de = /* @__PURE__ */ __name(function(e) {
      return e[1].toUpperCase();
    }, "de");
    [
      "accent-height",
      "alignment-baseline",
      "arabic-form",
      "baseline-shift",
      "cap-height",
      "clip-path",
      "clip-rule",
      "color-interpolation",
      "color-interpolation-filters",
      "color-profile",
      "color-rendering",
      "dominant-baseline",
      "enable-background",
      "fill-opacity",
      "fill-rule",
      "flood-color",
      "flood-opacity",
      "font-family",
      "font-size",
      "font-size-adjust",
      "font-stretch",
      "font-style",
      "font-variant",
      "font-weight",
      "glyph-name",
      "glyph-orientation-horizontal",
      "glyph-orientation-vertical",
      "horiz-adv-x",
      "horiz-origin-x",
      "image-rendering",
      "letter-spacing",
      "lighting-color",
      "marker-end",
      "marker-mid",
      "marker-start",
      "overline-position",
      "overline-thickness",
      "paint-order",
      "panose-1",
      "pointer-events",
      "rendering-intent",
      "shape-rendering",
      "stop-color",
      "stop-opacity",
      "strikethrough-position",
      "strikethrough-thickness",
      "stroke-dasharray",
      "stroke-dashoffset",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-miterlimit",
      "stroke-opacity",
      "stroke-width",
      "text-anchor",
      "text-decoration",
      "text-rendering",
      "underline-position",
      "underline-thickness",
      "unicode-bidi",
      "unicode-range",
      "units-per-em",
      "v-alphabetic",
      "v-hanging",
      "v-ideographic",
      "v-mathematical",
      "vector-effect",
      "vert-adv-y",
      "vert-origin-x",
      "vert-origin-y",
      "word-spacing",
      "writing-mode",
      "xmlns:xlink",
      "x-height"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      var t = e.replace(ve, de);
      V[t] = new A(
        t,
        le,
        false,
        // mustUseProperty
        e,
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [
      "xlink:actuate",
      "xlink:arcrole",
      "xlink:role",
      "xlink:show",
      "xlink:title",
      "xlink:type"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      var t = e.replace(ve, de);
      V[t] = new A(
        t,
        le,
        false,
        // mustUseProperty
        e,
        "http://www.w3.org/1999/xlink",
        false,
        // sanitizeURL
        false
      );
    }), [
      "xml:base",
      "xml:lang",
      "xml:space"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      var t = e.replace(ve, de);
      V[t] = new A(
        t,
        le,
        false,
        // mustUseProperty
        e,
        "http://www.w3.org/XML/1998/namespace",
        false,
        // sanitizeURL
        false
      );
    }), ["tabIndex", "crossOrigin"].forEach(function(e) {
      V[e] = new A(
        e,
        le,
        false,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    });
    var Re = "xlinkHref";
    V[Re] = new A(
      "xlinkHref",
      le,
      false,
      // mustUseProperty
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      true,
      // sanitizeURL
      false
    ), ["src", "href", "action", "formAction"].forEach(function(e) {
      V[e] = new A(
        e,
        le,
        false,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        true,
        // sanitizeURL
        true
      );
    });
    var Se = {
      animationIterationCount: true,
      aspectRatio: true,
      borderImageOutset: true,
      borderImageSlice: true,
      borderImageWidth: true,
      boxFlex: true,
      boxFlexGroup: true,
      boxOrdinalGroup: true,
      columnCount: true,
      columns: true,
      flex: true,
      flexGrow: true,
      flexPositive: true,
      flexShrink: true,
      flexNegative: true,
      flexOrder: true,
      gridArea: true,
      gridRow: true,
      gridRowEnd: true,
      gridRowSpan: true,
      gridRowStart: true,
      gridColumn: true,
      gridColumnEnd: true,
      gridColumnSpan: true,
      gridColumnStart: true,
      fontWeight: true,
      lineClamp: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      tabSize: true,
      widows: true,
      zIndex: true,
      zoom: true,
      // SVG-related properties
      fillOpacity: true,
      floodOpacity: true,
      stopOpacity: true,
      strokeDasharray: true,
      strokeDashoffset: true,
      strokeMiterlimit: true,
      strokeOpacity: true,
      strokeWidth: true
    };
    function De(e, t) {
      return e + t.charAt(0).toUpperCase() + t.substring(1);
    }
    __name(De, "De");
    var Ee = ["Webkit", "ms", "Moz", "O"];
    Object.keys(Se).forEach(function(e) {
      Ee.forEach(function(t) {
        Se[De(t, e)] = Se[e];
      });
    });
    var ze = {
      button: true,
      checkbox: true,
      image: true,
      hidden: true,
      radio: true,
      reset: true,
      submit: true
    };
    function bt(e, t) {
      ze[t.type] || t.onChange || t.onInput || t.readOnly || t.disabled || t.value == null || l("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`."), t.onChange || t.readOnly || t.disabled || t.checked == null || l("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.");
    }
    __name(bt, "bt");
    function Ut(e, t) {
      if (e.indexOf("-") === -1)
        return typeof t.is == "string";
      switch (e) {
        // These are reserved SVG and MathML elements.
        // We don't mind this list too much because we expect it to never grow.
        // The alternative is to track the namespace in a few places which is convoluted.
        // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return false;
        default:
          return true;
      }
    }
    __name(Ut, "Ut");
    var dt = {
      "aria-current": 0,
      // state
      "aria-description": 0,
      "aria-details": 0,
      "aria-disabled": 0,
      // state
      "aria-hidden": 0,
      // state
      "aria-invalid": 0,
      // state
      "aria-keyshortcuts": 0,
      "aria-label": 0,
      "aria-roledescription": 0,
      // Widget Attributes
      "aria-autocomplete": 0,
      "aria-checked": 0,
      "aria-expanded": 0,
      "aria-haspopup": 0,
      "aria-level": 0,
      "aria-modal": 0,
      "aria-multiline": 0,
      "aria-multiselectable": 0,
      "aria-orientation": 0,
      "aria-placeholder": 0,
      "aria-pressed": 0,
      "aria-readonly": 0,
      "aria-required": 0,
      "aria-selected": 0,
      "aria-sort": 0,
      "aria-valuemax": 0,
      "aria-valuemin": 0,
      "aria-valuenow": 0,
      "aria-valuetext": 0,
      // Live Region Attributes
      "aria-atomic": 0,
      "aria-busy": 0,
      "aria-live": 0,
      "aria-relevant": 0,
      // Drag-and-Drop Attributes
      "aria-dropeffect": 0,
      "aria-grabbed": 0,
      // Relationship Attributes
      "aria-activedescendant": 0,
      "aria-colcount": 0,
      "aria-colindex": 0,
      "aria-colspan": 0,
      "aria-controls": 0,
      "aria-describedby": 0,
      "aria-errormessage": 0,
      "aria-flowto": 0,
      "aria-labelledby": 0,
      "aria-owns": 0,
      "aria-posinset": 0,
      "aria-rowcount": 0,
      "aria-rowindex": 0,
      "aria-rowspan": 0,
      "aria-setsize": 0
    }, Pt = {}, ar = new RegExp("^(aria)-[" + $e + "]*$"), Bt = new RegExp("^(aria)[A-Z][" + $e + "]*$");
    function mr(e, t) {
      {
        if (pe.call(Pt, t) && Pt[t])
          return true;
        if (Bt.test(t)) {
          var r = "aria-" + t.slice(4).toLowerCase(), a = dt.hasOwnProperty(r) ? r : null;
          if (a == null)
            return l("Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.", t), Pt[t] = true, true;
          if (t !== a)
            return l("Invalid ARIA attribute `%s`. Did you mean `%s`?", t, a), Pt[t] = true, true;
        }
        if (ar.test(t)) {
          var f = t.toLowerCase(), v = dt.hasOwnProperty(f) ? f : null;
          if (v == null)
            return Pt[t] = true, false;
          if (t !== v)
            return l("Unknown ARIA attribute `%s`. Did you mean `%s`?", t, v), Pt[t] = true, true;
        }
      }
      return true;
    }
    __name(mr, "mr");
    function Nt(e, t) {
      {
        var r = [];
        for (var a in t) {
          var f = mr(e, a);
          f || r.push(a);
        }
        var v = r.map(function(b) {
          return "`" + b + "`";
        }).join(", ");
        r.length === 1 ? l("Invalid aria prop %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", v, e) : r.length > 1 && l("Invalid aria props %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", v, e);
      }
    }
    __name(Nt, "Nt");
    function $t(e, t) {
      Ut(e, t) || Nt(e, t);
    }
    __name($t, "$t");
    var At = false;
    function gr(e, t) {
      {
        if (e !== "input" && e !== "textarea" && e !== "select")
          return;
        t != null && t.value === null && !At && (At = true, e === "select" && t.multiple ? l("`value` prop on `%s` should not be null. Consider using an empty array when `multiple` is set to `true` to clear the component or `undefined` for uncontrolled components.", e) : l("`value` prop on `%s` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.", e));
      }
    }
    __name(gr, "gr");
    var Ot = {
      // HTML
      accept: "accept",
      acceptcharset: "acceptCharset",
      "accept-charset": "acceptCharset",
      accesskey: "accessKey",
      action: "action",
      allowfullscreen: "allowFullScreen",
      alt: "alt",
      as: "as",
      async: "async",
      autocapitalize: "autoCapitalize",
      autocomplete: "autoComplete",
      autocorrect: "autoCorrect",
      autofocus: "autoFocus",
      autoplay: "autoPlay",
      autosave: "autoSave",
      capture: "capture",
      cellpadding: "cellPadding",
      cellspacing: "cellSpacing",
      challenge: "challenge",
      charset: "charSet",
      checked: "checked",
      children: "children",
      cite: "cite",
      class: "className",
      classid: "classID",
      classname: "className",
      cols: "cols",
      colspan: "colSpan",
      content: "content",
      contenteditable: "contentEditable",
      contextmenu: "contextMenu",
      controls: "controls",
      controlslist: "controlsList",
      coords: "coords",
      crossorigin: "crossOrigin",
      dangerouslysetinnerhtml: "dangerouslySetInnerHTML",
      data: "data",
      datetime: "dateTime",
      default: "default",
      defaultchecked: "defaultChecked",
      defaultvalue: "defaultValue",
      defer: "defer",
      dir: "dir",
      disabled: "disabled",
      disablepictureinpicture: "disablePictureInPicture",
      disableremoteplayback: "disableRemotePlayback",
      download: "download",
      draggable: "draggable",
      enctype: "encType",
      enterkeyhint: "enterKeyHint",
      for: "htmlFor",
      form: "form",
      formmethod: "formMethod",
      formaction: "formAction",
      formenctype: "formEncType",
      formnovalidate: "formNoValidate",
      formtarget: "formTarget",
      frameborder: "frameBorder",
      headers: "headers",
      height: "height",
      hidden: "hidden",
      high: "high",
      href: "href",
      hreflang: "hrefLang",
      htmlfor: "htmlFor",
      httpequiv: "httpEquiv",
      "http-equiv": "httpEquiv",
      icon: "icon",
      id: "id",
      imagesizes: "imageSizes",
      imagesrcset: "imageSrcSet",
      innerhtml: "innerHTML",
      inputmode: "inputMode",
      integrity: "integrity",
      is: "is",
      itemid: "itemID",
      itemprop: "itemProp",
      itemref: "itemRef",
      itemscope: "itemScope",
      itemtype: "itemType",
      keyparams: "keyParams",
      keytype: "keyType",
      kind: "kind",
      label: "label",
      lang: "lang",
      list: "list",
      loop: "loop",
      low: "low",
      manifest: "manifest",
      marginwidth: "marginWidth",
      marginheight: "marginHeight",
      max: "max",
      maxlength: "maxLength",
      media: "media",
      mediagroup: "mediaGroup",
      method: "method",
      min: "min",
      minlength: "minLength",
      multiple: "multiple",
      muted: "muted",
      name: "name",
      nomodule: "noModule",
      nonce: "nonce",
      novalidate: "noValidate",
      open: "open",
      optimum: "optimum",
      pattern: "pattern",
      placeholder: "placeholder",
      playsinline: "playsInline",
      poster: "poster",
      preload: "preload",
      profile: "profile",
      radiogroup: "radioGroup",
      readonly: "readOnly",
      referrerpolicy: "referrerPolicy",
      rel: "rel",
      required: "required",
      reversed: "reversed",
      role: "role",
      rows: "rows",
      rowspan: "rowSpan",
      sandbox: "sandbox",
      scope: "scope",
      scoped: "scoped",
      scrolling: "scrolling",
      seamless: "seamless",
      selected: "selected",
      shape: "shape",
      size: "size",
      sizes: "sizes",
      span: "span",
      spellcheck: "spellCheck",
      src: "src",
      srcdoc: "srcDoc",
      srclang: "srcLang",
      srcset: "srcSet",
      start: "start",
      step: "step",
      style: "style",
      summary: "summary",
      tabindex: "tabIndex",
      target: "target",
      title: "title",
      type: "type",
      usemap: "useMap",
      value: "value",
      width: "width",
      wmode: "wmode",
      wrap: "wrap",
      // SVG
      about: "about",
      accentheight: "accentHeight",
      "accent-height": "accentHeight",
      accumulate: "accumulate",
      additive: "additive",
      alignmentbaseline: "alignmentBaseline",
      "alignment-baseline": "alignmentBaseline",
      allowreorder: "allowReorder",
      alphabetic: "alphabetic",
      amplitude: "amplitude",
      arabicform: "arabicForm",
      "arabic-form": "arabicForm",
      ascent: "ascent",
      attributename: "attributeName",
      attributetype: "attributeType",
      autoreverse: "autoReverse",
      azimuth: "azimuth",
      basefrequency: "baseFrequency",
      baselineshift: "baselineShift",
      "baseline-shift": "baselineShift",
      baseprofile: "baseProfile",
      bbox: "bbox",
      begin: "begin",
      bias: "bias",
      by: "by",
      calcmode: "calcMode",
      capheight: "capHeight",
      "cap-height": "capHeight",
      clip: "clip",
      clippath: "clipPath",
      "clip-path": "clipPath",
      clippathunits: "clipPathUnits",
      cliprule: "clipRule",
      "clip-rule": "clipRule",
      color: "color",
      colorinterpolation: "colorInterpolation",
      "color-interpolation": "colorInterpolation",
      colorinterpolationfilters: "colorInterpolationFilters",
      "color-interpolation-filters": "colorInterpolationFilters",
      colorprofile: "colorProfile",
      "color-profile": "colorProfile",
      colorrendering: "colorRendering",
      "color-rendering": "colorRendering",
      contentscripttype: "contentScriptType",
      contentstyletype: "contentStyleType",
      cursor: "cursor",
      cx: "cx",
      cy: "cy",
      d: "d",
      datatype: "datatype",
      decelerate: "decelerate",
      descent: "descent",
      diffuseconstant: "diffuseConstant",
      direction: "direction",
      display: "display",
      divisor: "divisor",
      dominantbaseline: "dominantBaseline",
      "dominant-baseline": "dominantBaseline",
      dur: "dur",
      dx: "dx",
      dy: "dy",
      edgemode: "edgeMode",
      elevation: "elevation",
      enablebackground: "enableBackground",
      "enable-background": "enableBackground",
      end: "end",
      exponent: "exponent",
      externalresourcesrequired: "externalResourcesRequired",
      fill: "fill",
      fillopacity: "fillOpacity",
      "fill-opacity": "fillOpacity",
      fillrule: "fillRule",
      "fill-rule": "fillRule",
      filter: "filter",
      filterres: "filterRes",
      filterunits: "filterUnits",
      floodopacity: "floodOpacity",
      "flood-opacity": "floodOpacity",
      floodcolor: "floodColor",
      "flood-color": "floodColor",
      focusable: "focusable",
      fontfamily: "fontFamily",
      "font-family": "fontFamily",
      fontsize: "fontSize",
      "font-size": "fontSize",
      fontsizeadjust: "fontSizeAdjust",
      "font-size-adjust": "fontSizeAdjust",
      fontstretch: "fontStretch",
      "font-stretch": "fontStretch",
      fontstyle: "fontStyle",
      "font-style": "fontStyle",
      fontvariant: "fontVariant",
      "font-variant": "fontVariant",
      fontweight: "fontWeight",
      "font-weight": "fontWeight",
      format: "format",
      from: "from",
      fx: "fx",
      fy: "fy",
      g1: "g1",
      g2: "g2",
      glyphname: "glyphName",
      "glyph-name": "glyphName",
      glyphorientationhorizontal: "glyphOrientationHorizontal",
      "glyph-orientation-horizontal": "glyphOrientationHorizontal",
      glyphorientationvertical: "glyphOrientationVertical",
      "glyph-orientation-vertical": "glyphOrientationVertical",
      glyphref: "glyphRef",
      gradienttransform: "gradientTransform",
      gradientunits: "gradientUnits",
      hanging: "hanging",
      horizadvx: "horizAdvX",
      "horiz-adv-x": "horizAdvX",
      horizoriginx: "horizOriginX",
      "horiz-origin-x": "horizOriginX",
      ideographic: "ideographic",
      imagerendering: "imageRendering",
      "image-rendering": "imageRendering",
      in2: "in2",
      in: "in",
      inlist: "inlist",
      intercept: "intercept",
      k1: "k1",
      k2: "k2",
      k3: "k3",
      k4: "k4",
      k: "k",
      kernelmatrix: "kernelMatrix",
      kernelunitlength: "kernelUnitLength",
      kerning: "kerning",
      keypoints: "keyPoints",
      keysplines: "keySplines",
      keytimes: "keyTimes",
      lengthadjust: "lengthAdjust",
      letterspacing: "letterSpacing",
      "letter-spacing": "letterSpacing",
      lightingcolor: "lightingColor",
      "lighting-color": "lightingColor",
      limitingconeangle: "limitingConeAngle",
      local: "local",
      markerend: "markerEnd",
      "marker-end": "markerEnd",
      markerheight: "markerHeight",
      markermid: "markerMid",
      "marker-mid": "markerMid",
      markerstart: "markerStart",
      "marker-start": "markerStart",
      markerunits: "markerUnits",
      markerwidth: "markerWidth",
      mask: "mask",
      maskcontentunits: "maskContentUnits",
      maskunits: "maskUnits",
      mathematical: "mathematical",
      mode: "mode",
      numoctaves: "numOctaves",
      offset: "offset",
      opacity: "opacity",
      operator: "operator",
      order: "order",
      orient: "orient",
      orientation: "orientation",
      origin: "origin",
      overflow: "overflow",
      overlineposition: "overlinePosition",
      "overline-position": "overlinePosition",
      overlinethickness: "overlineThickness",
      "overline-thickness": "overlineThickness",
      paintorder: "paintOrder",
      "paint-order": "paintOrder",
      panose1: "panose1",
      "panose-1": "panose1",
      pathlength: "pathLength",
      patterncontentunits: "patternContentUnits",
      patterntransform: "patternTransform",
      patternunits: "patternUnits",
      pointerevents: "pointerEvents",
      "pointer-events": "pointerEvents",
      points: "points",
      pointsatx: "pointsAtX",
      pointsaty: "pointsAtY",
      pointsatz: "pointsAtZ",
      prefix: "prefix",
      preservealpha: "preserveAlpha",
      preserveaspectratio: "preserveAspectRatio",
      primitiveunits: "primitiveUnits",
      property: "property",
      r: "r",
      radius: "radius",
      refx: "refX",
      refy: "refY",
      renderingintent: "renderingIntent",
      "rendering-intent": "renderingIntent",
      repeatcount: "repeatCount",
      repeatdur: "repeatDur",
      requiredextensions: "requiredExtensions",
      requiredfeatures: "requiredFeatures",
      resource: "resource",
      restart: "restart",
      result: "result",
      results: "results",
      rotate: "rotate",
      rx: "rx",
      ry: "ry",
      scale: "scale",
      security: "security",
      seed: "seed",
      shaperendering: "shapeRendering",
      "shape-rendering": "shapeRendering",
      slope: "slope",
      spacing: "spacing",
      specularconstant: "specularConstant",
      specularexponent: "specularExponent",
      speed: "speed",
      spreadmethod: "spreadMethod",
      startoffset: "startOffset",
      stddeviation: "stdDeviation",
      stemh: "stemh",
      stemv: "stemv",
      stitchtiles: "stitchTiles",
      stopcolor: "stopColor",
      "stop-color": "stopColor",
      stopopacity: "stopOpacity",
      "stop-opacity": "stopOpacity",
      strikethroughposition: "strikethroughPosition",
      "strikethrough-position": "strikethroughPosition",
      strikethroughthickness: "strikethroughThickness",
      "strikethrough-thickness": "strikethroughThickness",
      string: "string",
      stroke: "stroke",
      strokedasharray: "strokeDasharray",
      "stroke-dasharray": "strokeDasharray",
      strokedashoffset: "strokeDashoffset",
      "stroke-dashoffset": "strokeDashoffset",
      strokelinecap: "strokeLinecap",
      "stroke-linecap": "strokeLinecap",
      strokelinejoin: "strokeLinejoin",
      "stroke-linejoin": "strokeLinejoin",
      strokemiterlimit: "strokeMiterlimit",
      "stroke-miterlimit": "strokeMiterlimit",
      strokewidth: "strokeWidth",
      "stroke-width": "strokeWidth",
      strokeopacity: "strokeOpacity",
      "stroke-opacity": "strokeOpacity",
      suppresscontenteditablewarning: "suppressContentEditableWarning",
      suppresshydrationwarning: "suppressHydrationWarning",
      surfacescale: "surfaceScale",
      systemlanguage: "systemLanguage",
      tablevalues: "tableValues",
      targetx: "targetX",
      targety: "targetY",
      textanchor: "textAnchor",
      "text-anchor": "textAnchor",
      textdecoration: "textDecoration",
      "text-decoration": "textDecoration",
      textlength: "textLength",
      textrendering: "textRendering",
      "text-rendering": "textRendering",
      to: "to",
      transform: "transform",
      typeof: "typeof",
      u1: "u1",
      u2: "u2",
      underlineposition: "underlinePosition",
      "underline-position": "underlinePosition",
      underlinethickness: "underlineThickness",
      "underline-thickness": "underlineThickness",
      unicode: "unicode",
      unicodebidi: "unicodeBidi",
      "unicode-bidi": "unicodeBidi",
      unicoderange: "unicodeRange",
      "unicode-range": "unicodeRange",
      unitsperem: "unitsPerEm",
      "units-per-em": "unitsPerEm",
      unselectable: "unselectable",
      valphabetic: "vAlphabetic",
      "v-alphabetic": "vAlphabetic",
      values: "values",
      vectoreffect: "vectorEffect",
      "vector-effect": "vectorEffect",
      version: "version",
      vertadvy: "vertAdvY",
      "vert-adv-y": "vertAdvY",
      vertoriginx: "vertOriginX",
      "vert-origin-x": "vertOriginX",
      vertoriginy: "vertOriginY",
      "vert-origin-y": "vertOriginY",
      vhanging: "vHanging",
      "v-hanging": "vHanging",
      videographic: "vIdeographic",
      "v-ideographic": "vIdeographic",
      viewbox: "viewBox",
      viewtarget: "viewTarget",
      visibility: "visibility",
      vmathematical: "vMathematical",
      "v-mathematical": "vMathematical",
      vocab: "vocab",
      widths: "widths",
      wordspacing: "wordSpacing",
      "word-spacing": "wordSpacing",
      writingmode: "writingMode",
      "writing-mode": "writingMode",
      x1: "x1",
      x2: "x2",
      x: "x",
      xchannelselector: "xChannelSelector",
      xheight: "xHeight",
      "x-height": "xHeight",
      xlinkactuate: "xlinkActuate",
      "xlink:actuate": "xlinkActuate",
      xlinkarcrole: "xlinkArcrole",
      "xlink:arcrole": "xlinkArcrole",
      xlinkhref: "xlinkHref",
      "xlink:href": "xlinkHref",
      xlinkrole: "xlinkRole",
      "xlink:role": "xlinkRole",
      xlinkshow: "xlinkShow",
      "xlink:show": "xlinkShow",
      xlinktitle: "xlinkTitle",
      "xlink:title": "xlinkTitle",
      xlinktype: "xlinkType",
      "xlink:type": "xlinkType",
      xmlbase: "xmlBase",
      "xml:base": "xmlBase",
      xmllang: "xmlLang",
      "xml:lang": "xmlLang",
      xmlns: "xmlns",
      "xml:space": "xmlSpace",
      xmlnsxlink: "xmlnsXlink",
      "xmlns:xlink": "xmlnsXlink",
      xmlspace: "xmlSpace",
      y1: "y1",
      y2: "y2",
      y: "y",
      ychannelselector: "yChannelSelector",
      z: "z",
      zoomandpan: "zoomAndPan"
    }, Ct = /* @__PURE__ */ __name(function() {
    }, "Ct");
    {
      var vt = {}, yr = /^on./, Tr = /^on[^A-Z]/, _r = new RegExp("^(aria)-[" + $e + "]*$"), mt = new RegExp("^(aria)[A-Z][" + $e + "]*$");
      Ct = /* @__PURE__ */ __name(function(e, t, r, a) {
        if (pe.call(vt, t) && vt[t])
          return true;
        var f = t.toLowerCase();
        if (f === "onfocusin" || f === "onfocusout")
          return l("React uses onFocus and onBlur instead of onFocusIn and onFocusOut. All React events are normalized to bubble, so onFocusIn and onFocusOut are not needed/supported by React."), vt[t] = true, true;
        if (a != null) {
          var v = a.registrationNameDependencies, b = a.possibleRegistrationNames;
          if (v.hasOwnProperty(t))
            return true;
          var R = b.hasOwnProperty(f) ? b[f] : null;
          if (R != null)
            return l("Invalid event handler property `%s`. Did you mean `%s`?", t, R), vt[t] = true, true;
          if (yr.test(t))
            return l("Unknown event handler property `%s`. It will be ignored.", t), vt[t] = true, true;
        } else if (yr.test(t))
          return Tr.test(t) && l("Invalid event handler property `%s`. React events use the camelCase naming convention, for example `onClick`.", t), vt[t] = true, true;
        if (_r.test(t) || mt.test(t))
          return true;
        if (f === "innerhtml")
          return l("Directly setting property `innerHTML` is not permitted. For more information, lookup documentation on `dangerouslySetInnerHTML`."), vt[t] = true, true;
        if (f === "aria")
          return l("The `aria` attribute is reserved for future use in React. Pass individual `aria-` attributes instead."), vt[t] = true, true;
        if (f === "is" && r !== null && r !== void 0 && typeof r != "string")
          return l("Received a `%s` for a string attribute `is`. If this is expected, cast the value to a string.", typeof r), vt[t] = true, true;
        if (typeof r == "number" && isNaN(r))
          return l("Received NaN for the `%s` attribute. If this is expected, cast the value to a string.", t), vt[t] = true, true;
        var F = St(t), Y = F !== null && F.type === Ce;
        if (Ot.hasOwnProperty(f)) {
          var Z = Ot[f];
          if (Z !== t)
            return l("Invalid DOM property `%s`. Did you mean `%s`?", t, Z), vt[t] = true, true;
        } else if (!Y && t !== f)
          return l("React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.", t, f), vt[t] = true, true;
        return typeof r == "boolean" && nt(t, r, F) ? (r ? l('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.', r, t, t, r, t) : l('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.', r, t, t, r, t, t, t), vt[t] = true, true) : Y ? true : nt(t, r, F) ? (vt[t] = true, false) : ((r === "false" || r === "true") && F !== null && F.type === xe && (l("Received the string `%s` for the boolean attribute `%s`. %s Did you mean %s={%s}?", r, t, r === "false" ? "The browser will interpret it as a truthy value." : 'Although this works, it will not work as expected if you pass the string "false".', t, r), vt[t] = true), true);
      }, "Ct");
    }
    var Br = /* @__PURE__ */ __name(function(e, t, r) {
      {
        var a = [];
        for (var f in t) {
          var v = Ct(e, f, t[f], r);
          v || a.push(f);
        }
        var b = a.map(function(R) {
          return "`" + R + "`";
        }).join(", ");
        a.length === 1 ? l("Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", b, e) : a.length > 1 && l("Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", b, e);
      }
    }, "Br");
    function Qr(e, t, r) {
      Ut(e, t) || Br(e, t, r);
    }
    __name(Qr, "Qr");
    var Nr = /* @__PURE__ */ __name(function() {
    }, "Nr");
    {
      var Kr = /^(?:webkit|moz|o)[A-Z]/, zr = /^-ms-/, dn = /-(.)/g, Qt = /;\s*$/, ir = {}, qr = {}, Hr = false, Tt = false, It = /* @__PURE__ */ __name(function(e) {
        return e.replace(dn, function(t, r) {
          return r.toUpperCase();
        });
      }, "It"), Wt = /* @__PURE__ */ __name(function(e) {
        ir.hasOwnProperty(e) && ir[e] || (ir[e] = true, l(
          "Unsupported style property %s. Did you mean %s?",
          e,
          // As Andi Smith suggests
          // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
          // is converted to lowercase `ms`.
          It(e.replace(zr, "ms-"))
        ));
      }, "Wt"), Ne = /* @__PURE__ */ __name(function(e) {
        ir.hasOwnProperty(e) && ir[e] || (ir[e] = true, l("Unsupported vendor-prefixed style property %s. Did you mean %s?", e, e.charAt(0).toUpperCase() + e.slice(1)));
      }, "Ne"), zt = /* @__PURE__ */ __name(function(e, t) {
        qr.hasOwnProperty(t) && qr[t] || (qr[t] = true, l(`Style property values shouldn't contain a semicolon. Try "%s: %s" instead.`, e, t.replace(Qt, "")));
      }, "zt"), sr = /* @__PURE__ */ __name(function(e, t) {
        Hr || (Hr = true, l("`NaN` is an invalid value for the `%s` css style property.", e));
      }, "sr"), br = /* @__PURE__ */ __name(function(e, t) {
        Tt || (Tt = true, l("`Infinity` is an invalid value for the `%s` css style property.", e));
      }, "br");
      Nr = /* @__PURE__ */ __name(function(e, t) {
        e.indexOf("-") > -1 ? Wt(e) : Kr.test(e) ? Ne(e) : Qt.test(t) && zt(e, t), typeof t == "number" && (isNaN(t) ? sr(e, t) : isFinite(t) || br(e, t));
      }, "Nr");
    }
    var Kt = Nr, Pr = /["'&<>]/;
    function qt(e) {
      Pe(e);
      var t = "" + e, r = Pr.exec(t);
      if (!r)
        return t;
      var a, f = "", v, b = 0;
      for (v = r.index; v < t.length; v++) {
        switch (t.charCodeAt(v)) {
          case 34:
            a = "&quot;";
            break;
          case 38:
            a = "&amp;";
            break;
          case 39:
            a = "&#x27;";
            break;
          case 60:
            a = "&lt;";
            break;
          case 62:
            a = "&gt;";
            break;
          default:
            continue;
        }
        b !== v && (f += t.substring(b, v)), b = v + 1, f += a;
      }
      return b !== v ? f + t.substring(b, v) : f;
    }
    __name(qt, "qt");
    function xt(e) {
      return typeof e == "boolean" || typeof e == "number" ? "" + e : qt(e);
    }
    __name(xt, "xt");
    var lr = /([A-Z])/g, wr = /^ms-/;
    function $r(e) {
      return e.replace(lr, "-$1").toLowerCase().replace(wr, "-ms-");
    }
    __name($r, "$r");
    var gt = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i, en = false;
    function pn(e) {
      !en && gt.test(e) && (en = true, l("A future version of React will block javascript: URLs as a security precaution. Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead. React was passed %s.", JSON.stringify(e)));
    }
    __name(pn, "pn");
    var hn = Array.isArray;
    function T(e) {
      return hn(e);
    }
    __name(T, "T");
    var X = "<script>";
    function re(e, t, r, a, f) {
      var v = e === void 0 ? "" : e, b = X, R = [];
      return {
        bootstrapChunks: R,
        startInlineScript: b,
        placeholderPrefix: v + "P:",
        segmentPrefix: v + "S:",
        boundaryPrefix: v + "B:",
        idPrefix: v,
        nextSuspenseID: 0,
        sentCompleteSegmentFunction: false,
        sentCompleteBoundaryFunction: false,
        sentClientRenderFunction: false
      };
    }
    __name(re, "re");
    var ie = 0, Ae = 1, Ue = 2, Me = 3, Ie = 4, lt = 5, Ve = 6, Qe = 7;
    function at(e, t) {
      return {
        insertionMode: e,
        selectedValue: t
      };
    }
    __name(at, "at");
    function ur(e, t, r) {
      switch (t) {
        case "select":
          return at(Ae, r.value != null ? r.value : r.defaultValue);
        case "svg":
          return at(Ue, null);
        case "math":
          return at(Me, null);
        case "foreignObject":
          return at(Ae, null);
        // Table parents are special in that their children can only be created at all if they're
        // wrapped in a table parent. So we need to encode that we're entering this mode.
        case "table":
          return at(Ie, null);
        case "thead":
        case "tbody":
        case "tfoot":
          return at(lt, null);
        case "colgroup":
          return at(Qe, null);
        case "tr":
          return at(Ve, null);
      }
      return e.insertionMode >= Ie || e.insertionMode === ie ? at(Ae, null) : e;
    }
    __name(ur, "ur");
    var er = null;
    function ut(e) {
      var t = e.nextSuspenseID++;
      return e.boundaryPrefix + t.toString(16);
    }
    __name(ut, "ut");
    function ct(e, t, r) {
      var a = e.idPrefix, f = ":" + a + "R" + t;
      return r > 0 && (f += "H" + r.toString(32)), f + ":";
    }
    __name(ct, "ct");
    function tr(e) {
      return xt(e);
    }
    __name(tr, "tr");
    var rr = "<!-- -->";
    function Wr(e, t, r, a) {
      return t === "" ? a : (a && e.push(rr), e.push(tr(t)), true);
    }
    __name(Wr, "Wr");
    function Sr(e, t, r, a) {
      r && a && e.push(rr);
    }
    __name(Sr, "Sr");
    var nr = /* @__PURE__ */ new Map();
    function cr(e) {
      var t = nr.get(e);
      if (t !== void 0)
        return t;
      var r = xt($r(e));
      return nr.set(e, r), r;
    }
    __name(cr, "cr");
    var Mt = ' style="', Ir = ":", Vr = ";";
    function tn(e, t, r) {
      if (typeof r != "object")
        throw new Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
      var a = true;
      for (var f in r)
        if (pe.call(r, f)) {
          var v = r[f];
          if (!(v == null || typeof v == "boolean" || v === "")) {
            var b = void 0, R = void 0, F = f.indexOf("--") === 0;
            F ? (b = xt(f), ye(v, f), R = xt(("" + v).trim())) : (Kt(f, v), b = cr(f), typeof v == "number" ? v !== 0 && !pe.call(Se, f) ? R = v + "px" : R = "" + v : (ye(v, f), R = xt(("" + v).trim()))), a ? (a = false, e.push(Mt, b, Ir, R)) : e.push(Vr, b, Ir, R);
          }
        }
      a || e.push(Ht);
    }
    __name(tn, "tn");
    var Vt = " ", fr = '="', Ht = '"', ln = '=""';
    function Et(e, t, r, a) {
      switch (r) {
        case "style": {
          tn(e, t, a);
          return;
        }
        case "defaultValue":
        case "defaultChecked":
        // These shouldn't be set as attributes on generic HTML elements.
        case "innerHTML":
        // Must use dangerouslySetInnerHTML instead.
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
          return;
      }
      if (
        // shouldIgnoreAttribute
        // We have already filtered out null/undefined and reserved words.
        !(r.length > 2 && (r[0] === "o" || r[0] === "O") && (r[1] === "n" || r[1] === "N"))
      ) {
        var f = St(r);
        if (f !== null) {
          switch (typeof a) {
            case "function":
            // $FlowIssue symbol is perfectly valid here
            case "symbol":
              return;
            case "boolean":
              if (!f.acceptsBooleans)
                return;
          }
          var v = f.attributeName, b = v;
          switch (f.type) {
            case xe:
              a && e.push(Vt, b, ln);
              return;
            case Ge:
              a === true ? e.push(Vt, b, ln) : a === false || e.push(Vt, b, fr, xt(a), Ht);
              return;
            case ft:
              isNaN(a) || e.push(Vt, b, fr, xt(a), Ht);
              break;
            case Je:
              !isNaN(a) && a >= 1 && e.push(Vt, b, fr, xt(a), Ht);
              break;
            default:
              f.sanitizeURL && (he(a, v), a = "" + a, pn(a)), e.push(Vt, b, fr, xt(a), Ht);
          }
        } else if (oe(r)) {
          switch (typeof a) {
            case "function":
            // $FlowIssue symbol is perfectly valid here
            case "symbol":
              return;
            case "boolean": {
              var R = r.toLowerCase().slice(0, 5);
              if (R !== "data-" && R !== "aria-")
                return;
            }
          }
          e.push(Vt, r, fr, xt(a), Ht);
        }
      }
    }
    __name(Et, "Et");
    var jt = ">", s = "/>";
    function p(e, t, r) {
      if (t != null) {
        if (r != null)
          throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        if (typeof t != "object" || !("__html" in t))
          throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
        var a = t.__html;
        a != null && (Pe(a), e.push("" + a));
      }
    }
    __name(p, "p");
    var w = false, C = false, j = false, O = false, N = false, Q = false, be = false;
    function Te(e, t) {
      {
        var r = e[t];
        if (r != null) {
          var a = T(r);
          e.multiple && !a ? l("The `%s` prop supplied to <select> must be an array if `multiple` is true.", t) : !e.multiple && a && l("The `%s` prop supplied to <select> must be a scalar value if `multiple` is false.", t);
        }
      }
    }
    __name(Te, "Te");
    function we(e, t, r) {
      bt("select", t), Te(t, "value"), Te(t, "defaultValue"), t.value !== void 0 && t.defaultValue !== void 0 && !j && (l("Select elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled select element and remove one of these props. More info: https://reactjs.org/link/controlled-components"), j = true), e.push(Cr("select"));
      var a = null, f = null;
      for (var v in t)
        if (pe.call(t, v)) {
          var b = t[v];
          if (b == null)
            continue;
          switch (v) {
            case "children":
              a = b;
              break;
            case "dangerouslySetInnerHTML":
              f = b;
              break;
            case "defaultValue":
            case "value":
              break;
            default:
              Et(e, r, v, b);
              break;
          }
        }
      return e.push(jt), p(e, f, a), a;
    }
    __name(we, "we");
    function Xe(e) {
      var t = "";
      return o.Children.forEach(e, function(r) {
        r != null && (t += r, !N && typeof r != "string" && typeof r != "number" && (N = true, l("Cannot infer the option value of complex children. Pass a `value` prop or use a plain string as children to <option>.")));
      }), t;
    }
    __name(Xe, "Xe");
    var Rt = ' selected=""';
    function Ft(e, t, r, a) {
      var f = a.selectedValue;
      e.push(Cr("option"));
      var v = null, b = null, R = null, F = null;
      for (var Y in t)
        if (pe.call(t, Y)) {
          var Z = t[Y];
          if (Z == null)
            continue;
          switch (Y) {
            case "children":
              v = Z;
              break;
            case "selected":
              R = Z, be || (l("Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>."), be = true);
              break;
            case "dangerouslySetInnerHTML":
              F = Z;
              break;
            // eslint-disable-next-line-no-fallthrough
            case "value":
              b = Z;
            // We intentionally fallthrough to also set the attribute on the node.
            // eslint-disable-next-line-no-fallthrough
            default:
              Et(e, r, Y, Z);
              break;
          }
        }
      if (f != null) {
        var ne;
        if (b !== null ? (he(b, "value"), ne = "" + b) : (F !== null && (Q || (Q = true, l("Pass a `value` prop if you set dangerouslyInnerHTML so React knows which value should be selected."))), ne = Xe(v)), T(f))
          for (var Fe = 0; Fe < f.length; Fe++) {
            he(f[Fe], "value");
            var tt = "" + f[Fe];
            if (tt === ne) {
              e.push(Rt);
              break;
            }
          }
        else
          he(f, "select.value"), "" + f === ne && e.push(Rt);
      } else R && e.push(Rt);
      return e.push(jt), p(e, F, v), v;
    }
    __name(Ft, "Ft");
    function Lt(e, t, r) {
      bt("input", t), t.checked !== void 0 && t.defaultChecked !== void 0 && !C && (l("%s contains an input of type %s with both checked and defaultChecked props. Input elements must be either controlled or uncontrolled (specify either the checked prop, or the defaultChecked prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", "A component", t.type), C = true), t.value !== void 0 && t.defaultValue !== void 0 && !w && (l("%s contains an input of type %s with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", "A component", t.type), w = true), e.push(Cr("input"));
      var a = null, f = null, v = null, b = null;
      for (var R in t)
        if (pe.call(t, R)) {
          var F = t[R];
          if (F == null)
            continue;
          switch (R) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw new Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            // eslint-disable-next-line-no-fallthrough
            case "defaultChecked":
              b = F;
              break;
            case "defaultValue":
              f = F;
              break;
            case "checked":
              v = F;
              break;
            case "value":
              a = F;
              break;
            default:
              Et(e, r, R, F);
              break;
          }
        }
      return v !== null ? Et(e, r, "checked", v) : b !== null && Et(e, r, "checked", b), a !== null ? Et(e, r, "value", a) : f !== null && Et(e, r, "value", f), e.push(s), null;
    }
    __name(Lt, "Lt");
    function Yr(e, t, r) {
      bt("textarea", t), t.value !== void 0 && t.defaultValue !== void 0 && !O && (l("Textarea elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled textarea and remove one of these props. More info: https://reactjs.org/link/controlled-components"), O = true), e.push(Cr("textarea"));
      var a = null, f = null, v = null;
      for (var b in t)
        if (pe.call(t, b)) {
          var R = t[b];
          if (R == null)
            continue;
          switch (b) {
            case "children":
              v = R;
              break;
            case "value":
              a = R;
              break;
            case "defaultValue":
              f = R;
              break;
            case "dangerouslySetInnerHTML":
              throw new Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
            // eslint-disable-next-line-no-fallthrough
            default:
              Et(e, r, b, R);
              break;
          }
        }
      if (a === null && f !== null && (a = f), e.push(jt), v != null) {
        if (l("Use the `defaultValue` or `value` props instead of setting children on <textarea>."), a != null)
          throw new Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
        if (T(v)) {
          if (v.length > 1)
            throw new Error("<textarea> can only have at most one child.");
          Pe(v[0]), a = "" + v[0];
        }
        Pe(v), a = "" + v;
      }
      return typeof a == "string" && a[0] === `
` && e.push(Jr), a !== null && (he(a, "value"), e.push(tr("" + a))), null;
    }
    __name(Yr, "Yr");
    function xr(e, t, r, a) {
      e.push(Cr(r));
      for (var f in t)
        if (pe.call(t, f)) {
          var v = t[f];
          if (v == null)
            continue;
          switch (f) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw new Error(r + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            // eslint-disable-next-line-no-fallthrough
            default:
              Et(e, a, f, v);
              break;
          }
        }
      return e.push(s), null;
    }
    __name(xr, "xr");
    function rn(e, t, r) {
      e.push(Cr("menuitem"));
      for (var a in t)
        if (pe.call(t, a)) {
          var f = t[a];
          if (f == null)
            continue;
          switch (a) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw new Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
            // eslint-disable-next-line-no-fallthrough
            default:
              Et(e, r, a, f);
              break;
          }
        }
      return e.push(jt), null;
    }
    __name(rn, "rn");
    function Gr(e, t, r) {
      e.push(Cr("title"));
      var a = null;
      for (var f in t)
        if (pe.call(t, f)) {
          var v = t[f];
          if (v == null)
            continue;
          switch (f) {
            case "children":
              a = v;
              break;
            case "dangerouslySetInnerHTML":
              throw new Error("`dangerouslySetInnerHTML` does not make sense on <title>.");
            // eslint-disable-next-line-no-fallthrough
            default:
              Et(e, r, f, v);
              break;
          }
        }
      e.push(jt);
      {
        var b = Array.isArray(a) && a.length < 2 ? a[0] || null : a;
        Array.isArray(a) && a.length > 1 ? l("A title element received an array with more than 1 element as children. In browsers title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering") : b != null && b.$$typeof != null ? l("A title element received a React element for children. In the browser title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering") : b != null && typeof b != "string" && typeof b != "number" && l("A title element received a value that was not a string or number for children. In the browser title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering");
      }
      return a;
    }
    __name(Gr, "Gr");
    function Xr(e, t, r, a) {
      e.push(Cr(r));
      var f = null, v = null;
      for (var b in t)
        if (pe.call(t, b)) {
          var R = t[b];
          if (R == null)
            continue;
          switch (b) {
            case "children":
              f = R;
              break;
            case "dangerouslySetInnerHTML":
              v = R;
              break;
            default:
              Et(e, a, b, R);
              break;
          }
        }
      return e.push(jt), p(e, v, f), typeof f == "string" ? (e.push(tr(f)), null) : f;
    }
    __name(Xr, "Xr");
    function kr(e, t, r, a) {
      e.push(Cr(r));
      var f = null, v = null;
      for (var b in t)
        if (pe.call(t, b)) {
          var R = t[b];
          if (R == null)
            continue;
          switch (b) {
            case "children":
              f = R;
              break;
            case "dangerouslySetInnerHTML":
              v = R;
              break;
            case "style":
              tn(e, a, R);
              break;
            case "suppressContentEditableWarning":
            case "suppressHydrationWarning":
              break;
            default:
              oe(b) && typeof R != "function" && typeof R != "symbol" && e.push(Vt, b, fr, xt(R), Ht);
              break;
          }
        }
      return e.push(jt), p(e, v, f), f;
    }
    __name(kr, "kr");
    var Jr = `
`;
    function Co(e, t, r, a) {
      e.push(Cr(r));
      var f = null, v = null;
      for (var b in t)
        if (pe.call(t, b)) {
          var R = t[b];
          if (R == null)
            continue;
          switch (b) {
            case "children":
              f = R;
              break;
            case "dangerouslySetInnerHTML":
              v = R;
              break;
            default:
              Et(e, a, b, R);
              break;
          }
        }
      if (e.push(jt), v != null) {
        if (f != null)
          throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        if (typeof v != "object" || !("__html" in v))
          throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
        var F = v.__html;
        F != null && (typeof F == "string" && F.length > 0 && F[0] === `
` ? e.push(Jr, F) : (Pe(F), e.push("" + F)));
      }
      return typeof f == "string" && f[0] === `
` && e.push(Jr), f;
    }
    __name(Co, "Co");
    var Zn = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/, vn = /* @__PURE__ */ new Map();
    function Cr(e) {
      var t = vn.get(e);
      if (t === void 0) {
        if (!Zn.test(e))
          throw new Error("Invalid tag: " + e);
        t = "<" + e, vn.set(e, t);
      }
      return t;
    }
    __name(Cr, "Cr");
    var Eo = "<!DOCTYPE html>";
    function Ar(e, t, r, a, f) {
      switch ($t(t, r), gr(t, r), Qr(t, r, null), !r.suppressContentEditableWarning && r.contentEditable && r.children != null && l("A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional."), f.insertionMode !== Ue && f.insertionMode !== Me && t.indexOf("-") === -1 && typeof r.is != "string" && t.toLowerCase() !== t && l("<%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.", t), t) {
        // Special tags
        case "select":
          return we(e, r, a);
        case "option":
          return Ft(e, r, a, f);
        case "textarea":
          return Yr(e, r, a);
        case "input":
          return Lt(e, r, a);
        case "menuitem":
          return rn(e, r, a);
        case "title":
          return Gr(e, r, a);
        // Newline eating tags
        case "listing":
        case "pre":
          return Co(e, r, t, a);
        // Omitted close tags
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "img":
        case "keygen":
        case "link":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
          return xr(e, r, t, a);
        // These are reserved SVG and MathML elements, that are never custom elements.
        // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return Xr(e, r, t, a);
        case "html":
          return f.insertionMode === ie && e.push(Eo), Xr(e, r, t, a);
        default:
          return t.indexOf("-") === -1 && typeof r.is != "string" ? Xr(e, r, t, a) : kr(e, r, t, a);
      }
    }
    __name(Ar, "Ar");
    var En = "</", nn = ">";
    function it(e, t, r) {
      switch (t) {
        // Omitted close tags
        // TODO: Instead of repeating this switch we could try to pass a flag from above.
        // That would require returning a tuple. Which might be ok if it gets inlined.
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "img":
        case "input":
        case "keygen":
        case "link":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
          break;
        default:
          e.push(En, t, nn);
      }
    }
    __name(it, "it");
    function or(e, t) {
      for (var r = t.bootstrapChunks, a = 0; a < r.length - 1; a++)
        g(e, r[a]);
      return a < r.length ? x(e, r[a]) : true;
    }
    __name(or, "or");
    var mn = '<template id="', Zr = '"></template>';
    function dr(e, t, r) {
      g(e, mn), g(e, t.placeholderPrefix);
      var a = r.toString(16);
      return g(e, a), x(e, Zr);
    }
    __name(dr, "dr");
    var un = "<!--$-->", Er = '<!--$?--><template id="', Yt = '"></template>', Dn = "<!--$!-->", gn = "<!--/$-->", Qn = "<template", Rn = '"', m = ' data-dgst="', _ = ' data-msg="', U = ' data-stck="', z = "></template>";
    function ee(e, t) {
      return x(e, un);
    }
    __name(ee, "ee");
    function ke(e, t, r) {
      if (g(e, Er), r === null)
        throw new Error("An ID must have been assigned before we can complete the boundary.");
      return g(e, r), x(e, Yt);
    }
    __name(ke, "ke");
    function fe(e, t, r, a, f) {
      var v;
      return v = x(e, Dn), g(e, Qn), r && (g(e, m), g(e, xt(r)), g(e, Rn)), a && (g(e, _), g(e, xt(a)), g(e, Rn)), f && (g(e, U), g(e, xt(f)), g(e, Rn)), v = x(e, z), v;
    }
    __name(fe, "fe");
    function Oe(e, t) {
      return x(e, gn);
    }
    __name(Oe, "Oe");
    function je(e, t) {
      return x(e, gn);
    }
    __name(je, "je");
    function Ke(e, t) {
      return x(e, gn);
    }
    __name(Ke, "Ke");
    var st = '<div hidden id="', qe = '">', ot = "</div>", pt = '<svg aria-hidden="true" style="display:none" id="', _t = '">', yn = "</svg>", Tn = '<math aria-hidden="true" style="display:none" id="', bn = '">', Gt = "</math>", Mn = '<table hidden id="', _n = '">', Kn = "</table>", qn = '<table hidden><tbody id="', eo = '">', sa = "</tbody></table>", la = '<table hidden><tr id="', to = '">', ro = "</tr></table>", ua = '<table hidden><colgroup id="', ca = '">', fa = "</colgroup></table>";
    function Ro(e, t, r, a) {
      switch (r.insertionMode) {
        case ie:
        case Ae:
          return g(e, st), g(e, t.segmentPrefix), g(e, a.toString(16)), x(e, qe);
        case Ue:
          return g(e, pt), g(e, t.segmentPrefix), g(e, a.toString(16)), x(e, _t);
        case Me:
          return g(e, Tn), g(e, t.segmentPrefix), g(e, a.toString(16)), x(e, bn);
        case Ie:
          return g(e, Mn), g(e, t.segmentPrefix), g(e, a.toString(16)), x(e, _n);
        // TODO: For the rest of these, there will be extra wrapper nodes that never
        // get deleted from the document. We need to delete the table too as part
        // of the injected scripts. They are invisible though so it's not too terrible
        // and it's kind of an edge case to suspend in a table. Totally supported though.
        case lt:
          return g(e, qn), g(e, t.segmentPrefix), g(e, a.toString(16)), x(e, eo);
        case Ve:
          return g(e, la), g(e, t.segmentPrefix), g(e, a.toString(16)), x(e, to);
        case Qe:
          return g(e, ua), g(e, t.segmentPrefix), g(e, a.toString(16)), x(e, ca);
        default:
          throw new Error("Unknown insertion mode. This is a bug in React.");
      }
    }
    __name(Ro, "Ro");
    function da(e, t) {
      switch (t.insertionMode) {
        case ie:
        case Ae:
          return x(e, ot);
        case Ue:
          return x(e, yn);
        case Me:
          return x(e, Gt);
        case Ie:
          return x(e, Kn);
        case lt:
          return x(e, sa);
        case Ve:
          return x(e, ro);
        case Qe:
          return x(e, fa);
        default:
          throw new Error("Unknown insertion mode. This is a bug in React.");
      }
    }
    __name(da, "da");
    var u = "function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)}", h = 'function $RC(a,b){a=document.getElementById(a);b=document.getElementById(b);b.parentNode.removeChild(b);if(a){a=a.previousSibling;var f=a.parentNode,c=a.nextSibling,e=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d)if(0===e)break;else e--;else"$"!==d&&"$?"!==d&&"$!"!==d||e++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;b.firstChild;)f.insertBefore(b.firstChild,c);a.data="$";a._reactRetry&&a._reactRetry()}}', y = 'function $RX(b,c,d,e){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),b._reactRetry&&b._reactRetry())}', k = u + ';$RS("', L = '$RS("', D = '","', W = '")<\/script>';
    function K(e, t, r) {
      g(e, t.startInlineScript), t.sentCompleteSegmentFunction ? g(e, L) : (t.sentCompleteSegmentFunction = true, g(e, k)), g(e, t.segmentPrefix);
      var a = r.toString(16);
      return g(e, a), g(e, D), g(e, t.placeholderPrefix), g(e, a), x(e, W);
    }
    __name(K, "K");
    var _e = h + ';$RC("', Be = '$RC("', Le = '","', ht = '")<\/script>';
    function pr(e, t, r, a) {
      if (g(e, t.startInlineScript), t.sentCompleteBoundaryFunction ? g(e, Be) : (t.sentCompleteBoundaryFunction = true, g(e, _e)), r === null)
        throw new Error("An ID must have been assigned before we can complete the boundary.");
      var f = a.toString(16);
      return g(e, r), g(e, Le), g(e, t.segmentPrefix), g(e, f), x(e, ht);
    }
    __name(pr, "pr");
    var Or = y + ';$RX("', Fr = '$RX("', no = '"', pa = ")<\/script>", jn = ",";
    function el(e, t, r, a, f, v) {
      if (g(e, t.startInlineScript), t.sentClientRenderFunction ? g(e, Fr) : (t.sentClientRenderFunction = true, g(e, Or)), r === null)
        throw new Error("An ID must have been assigned before we can complete the boundary.");
      return g(e, r), g(e, no), (a || f || v) && (g(e, jn), g(e, si(a || ""))), (f || v) && (g(e, jn), g(e, si(f || ""))), v && (g(e, jn), g(e, si(v))), x(e, pa);
    }
    __name(el, "el");
    var tl = /[<\u2028\u2029]/g;
    function si(e) {
      var t = JSON.stringify(e);
      return t.replace(tl, function(r) {
        switch (r) {
          // santizing breaking out of strings and script tags
          case "<":
            return "\\u003c";
          case "\u2028":
            return "\\u2028";
          case "\u2029":
            return "\\u2029";
          default:
            throw new Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
        }
      });
    }
    __name(si, "si");
    function rl(e, t) {
      var r = re(t);
      return {
        // Keep this in sync with ReactDOMServerFormatConfig
        bootstrapChunks: r.bootstrapChunks,
        startInlineScript: r.startInlineScript,
        placeholderPrefix: r.placeholderPrefix,
        segmentPrefix: r.segmentPrefix,
        boundaryPrefix: r.boundaryPrefix,
        idPrefix: r.idPrefix,
        nextSuspenseID: r.nextSuspenseID,
        sentCompleteSegmentFunction: r.sentCompleteSegmentFunction,
        sentCompleteBoundaryFunction: r.sentCompleteBoundaryFunction,
        sentClientRenderFunction: r.sentClientRenderFunction,
        // This is an extra field for the legacy renderer
        generateStaticMarkup: e
      };
    }
    __name(rl, "rl");
    function nl() {
      return {
        insertionMode: Ae,
        // We skip the root mode because we don't want to emit the DOCTYPE in legacy mode.
        selectedValue: null
      };
    }
    __name(nl, "nl");
    function Ki(e, t, r, a) {
      return r.generateStaticMarkup ? (e.push(xt(t)), false) : Wr(e, t, r, a);
    }
    __name(Ki, "Ki");
    function qi(e, t, r, a) {
      if (!t.generateStaticMarkup)
        return Sr(e, t, r, a);
    }
    __name(qi, "qi");
    function ol(e, t) {
      return t.generateStaticMarkup ? true : ee(e);
    }
    __name(ol, "ol");
    function al(e, t, r, a, f) {
      return t.generateStaticMarkup ? true : fe(e, t, r, a, f);
    }
    __name(al, "al");
    function il(e, t) {
      return t.generateStaticMarkup ? true : Oe(e);
    }
    __name(il, "il");
    function sl(e, t) {
      return t.generateStaticMarkup ? true : Ke(e);
    }
    __name(sl, "sl");
    var Rr = Object.assign, ll = Symbol.for("react.element"), es = Symbol.for("react.portal"), ha = Symbol.for("react.fragment"), Dr = Symbol.for("react.strict_mode"), ts = Symbol.for("react.profiler"), va = Symbol.for("react.provider"), ma = Symbol.for("react.context"), ga = Symbol.for("react.forward_ref"), ya = Symbol.for("react.suspense"), To = Symbol.for("react.suspense_list"), _o = Symbol.for("react.memo"), oo = Symbol.for("react.lazy"), li = Symbol.for("react.scope"), ui = Symbol.for("react.debug_trace_mode"), ci = Symbol.for("react.legacy_hidden"), ba = Symbol.for("react.default_value"), rs = Symbol.iterator, ul = "@@iterator";
    function cl(e) {
      if (e === null || typeof e != "object")
        return null;
      var t = rs && e[rs] || e[ul];
      return typeof t == "function" ? t : null;
    }
    __name(cl, "cl");
    function fl(e, t, r) {
      var a = e.displayName;
      if (a)
        return a;
      var f = t.displayName || t.name || "";
      return f !== "" ? r + "(" + f + ")" : r;
    }
    __name(fl, "fl");
    function fi(e) {
      return e.displayName || "Context";
    }
    __name(fi, "fi");
    function kt(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && l("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case ha:
          return "Fragment";
        case es:
          return "Portal";
        case ts:
          return "Profiler";
        case Dr:
          return "StrictMode";
        case ya:
          return "Suspense";
        case To:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case ma:
            var t = e;
            return fi(t) + ".Consumer";
          case va:
            var r = e;
            return fi(r._context) + ".Provider";
          case ga:
            return fl(e, e.render, "ForwardRef");
          case _o:
            var a = e.displayName || null;
            return a !== null ? a : kt(e.type) || "Memo";
          case oo: {
            var f = e, v = f._payload, b = f._init;
            try {
              return kt(b(v));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    __name(kt, "kt");
    var Po = 0, ns, di, wt, ao, pi, hi, vi;
    function mi() {
    }
    __name(mi, "mi");
    mi.__reactDisabledLog = true;
    function os() {
      {
        if (Po === 0) {
          ns = console.log, di = console.info, wt = console.warn, ao = console.error, pi = console.group, hi = console.groupCollapsed, vi = console.groupEnd;
          var e = {
            configurable: true,
            enumerable: true,
            value: mi,
            writable: true
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        Po++;
      }
    }
    __name(os, "os");
    function as() {
      {
        if (Po--, Po === 0) {
          var e = {
            configurable: true,
            enumerable: true,
            writable: true
          };
          Object.defineProperties(console, {
            log: Rr({}, e, {
              value: ns
            }),
            info: Rr({}, e, {
              value: di
            }),
            warn: Rr({}, e, {
              value: wt
            }),
            error: Rr({}, e, {
              value: ao
            }),
            group: Rr({}, e, {
              value: pi
            }),
            groupCollapsed: Rr({}, e, {
              value: hi
            }),
            groupEnd: Rr({}, e, {
              value: vi
            })
          });
        }
        Po < 0 && l("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    __name(as, "as");
    var wa = c.ReactCurrentDispatcher, Sa;
    function Io(e, t, r) {
      {
        if (Sa === void 0)
          try {
            throw Error();
          } catch (f) {
            var a = f.stack.trim().match(/\n( *(at )?)/);
            Sa = a && a[1] || "";
          }
        return `
` + Sa + e;
      }
    }
    __name(Io, "Io");
    var gi = false, io;
    {
      var yi = typeof WeakMap == "function" ? WeakMap : Map;
      io = new yi();
    }
    function Ln(e, t) {
      if (!e || gi)
        return "";
      {
        var r = io.get(e);
        if (r !== void 0)
          return r;
      }
      var a;
      gi = true;
      var f = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var v;
      v = wa.current, wa.current = null, os();
      try {
        if (t) {
          var b = /* @__PURE__ */ __name(function() {
            throw Error();
          }, "b");
          if (Object.defineProperty(b.prototype, "props", {
            set: /* @__PURE__ */ __name(function() {
              throw Error();
            }, "set")
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(b, []);
            } catch (Xt) {
              a = Xt;
            }
            Reflect.construct(e, [], b);
          } else {
            try {
              b.call();
            } catch (Xt) {
              a = Xt;
            }
            e.call(b.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (Xt) {
            a = Xt;
          }
          e();
        }
      } catch (Xt) {
        if (Xt && a && typeof Xt.stack == "string") {
          for (var R = Xt.stack.split(`
`), F = a.stack.split(`
`), Y = R.length - 1, Z = F.length - 1; Y >= 1 && Z >= 0 && R[Y] !== F[Z]; )
            Z--;
          for (; Y >= 1 && Z >= 0; Y--, Z--)
            if (R[Y] !== F[Z]) {
              if (Y !== 1 || Z !== 1)
                do
                  if (Y--, Z--, Z < 0 || R[Y] !== F[Z]) {
                    var ne = `
` + R[Y].replace(" at new ", " at ");
                    return e.displayName && ne.includes("<anonymous>") && (ne = ne.replace("<anonymous>", e.displayName)), typeof e == "function" && io.set(e, ne), ne;
                  }
                while (Y >= 1 && Z >= 0);
              break;
            }
        }
      } finally {
        gi = false, wa.current = v, as(), Error.prepareStackTrace = f;
      }
      var Fe = e ? e.displayName || e.name : "", tt = Fe ? Io(Fe) : "";
      return typeof e == "function" && io.set(e, tt), tt;
    }
    __name(Ln, "Ln");
    function bi(e, t, r) {
      return Ln(e, true);
    }
    __name(bi, "bi");
    function Ao(e, t, r) {
      return Ln(e, false);
    }
    __name(Ao, "Ao");
    function dl(e) {
      var t = e.prototype;
      return !!(t && t.isReactComponent);
    }
    __name(dl, "dl");
    function Oo(e, t, r) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return Ln(e, dl(e));
      if (typeof e == "string")
        return Io(e);
      switch (e) {
        case ya:
          return Io("Suspense");
        case To:
          return Io("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case ga:
            return Ao(e.render);
          case _o:
            return Oo(e.type, t, r);
          case oo: {
            var a = e, f = a._payload, v = a._init;
            try {
              return Oo(v(f), t, r);
            } catch {
            }
          }
        }
      return "";
    }
    __name(Oo, "Oo");
    var is = {}, wi = c.ReactDebugCurrentFrame;
    function xa(e) {
      if (e) {
        var t = e._owner, r = Oo(e.type, e._source, t ? t.type : null);
        wi.setExtraStackFrame(r);
      } else
        wi.setExtraStackFrame(null);
    }
    __name(xa, "xa");
    function ka(e, t, r, a, f) {
      {
        var v = Function.call.bind(pe);
        for (var b in e)
          if (v(e, b)) {
            var R = void 0;
            try {
              if (typeof e[b] != "function") {
                var F = Error((a || "React class") + ": " + r + " type `" + b + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[b] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw F.name = "Invariant Violation", F;
              }
              R = e[b](t, b, a, r, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (Y) {
              R = Y;
            }
            R && !(R instanceof Error) && (xa(f), l("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", a || "React class", r, b, typeof R), xa(null)), R instanceof Error && !(R.message in is) && (is[R.message] = true, xa(f), l("Failed %s type: %s", r, R.message), xa(null));
          }
      }
    }
    __name(ka, "ka");
    var Ca;
    Ca = {};
    var Fo = {};
    Object.freeze(Fo);
    function Do(e, t) {
      {
        var r = e.contextTypes;
        if (!r)
          return Fo;
        var a = {};
        for (var f in r)
          a[f] = t[f];
        {
          var v = kt(e) || "Unknown";
          ka(r, a, "context", v);
        }
        return a;
      }
    }
    __name(Do, "Do");
    function ss(e, t, r, a) {
      {
        if (typeof e.getChildContext != "function") {
          {
            var f = kt(t) || "Unknown";
            Ca[f] || (Ca[f] = true, l("%s.childContextTypes is specified but there is no getChildContext() method on the instance. You can either define getChildContext() on %s or remove childContextTypes from it.", f, f));
          }
          return r;
        }
        var v = e.getChildContext();
        for (var b in v)
          if (!(b in a))
            throw new Error((kt(t) || "Unknown") + '.getChildContext(): key "' + b + '" is not defined in childContextTypes.');
        {
          var R = kt(t) || "Unknown";
          ka(a, v, "child context", R);
        }
        return Rr({}, r, v);
      }
    }
    __name(ss, "ss");
    var Un;
    Un = {};
    var Ea = null, Pn = null;
    function Si(e) {
      e.context._currentValue2 = e.parentValue;
    }
    __name(Si, "Si");
    function Bn(e) {
      e.context._currentValue2 = e.value;
    }
    __name(Bn, "Bn");
    function Ra(e, t) {
      if (e !== t) {
        Si(e);
        var r = e.parent, a = t.parent;
        if (r === null) {
          if (a !== null)
            throw new Error("The stacks must reach the root at the same time. This is a bug in React.");
        } else {
          if (a === null)
            throw new Error("The stacks must reach the root at the same time. This is a bug in React.");
          Ra(r, a);
        }
        Bn(t);
      }
    }
    __name(Ra, "Ra");
    function In(e) {
      Si(e);
      var t = e.parent;
      t !== null && In(t);
    }
    __name(In, "In");
    function Ta(e) {
      var t = e.parent;
      t !== null && Ta(t), Bn(e);
    }
    __name(Ta, "Ta");
    function _a(e, t) {
      Si(e);
      var r = e.parent;
      if (r === null)
        throw new Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
      r.depth === t.depth ? Ra(r, t) : _a(r, t);
    }
    __name(_a, "_a");
    function Mo(e, t) {
      var r = t.parent;
      if (r === null)
        throw new Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
      e.depth === r.depth ? Ra(e, r) : Mo(e, r), Bn(t);
    }
    __name(Mo, "Mo");
    function jo(e) {
      var t = Pn, r = e;
      t !== r && (t === null ? Ta(r) : r === null ? In(t) : t.depth === r.depth ? Ra(t, r) : t.depth > r.depth ? _a(t, r) : Mo(t, r), Pn = r);
    }
    __name(jo, "jo");
    function ls(e, t) {
      var r;
      r = e._currentValue2, e._currentValue2 = t, e._currentRenderer2 !== void 0 && e._currentRenderer2 !== null && e._currentRenderer2 !== Un && l("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported."), e._currentRenderer2 = Un;
      var a = Pn, f = {
        parent: a,
        depth: a === null ? 0 : a.depth + 1,
        context: e,
        parentValue: r,
        value: t
      };
      return Pn = f, f;
    }
    __name(ls, "ls");
    function us(e) {
      var t = Pn;
      if (t === null)
        throw new Error("Tried to pop a Context at the root of the app. This is a bug in React.");
      t.context !== e && l("The parent context is not the expected context. This is probably a bug in React.");
      {
        var r = t.parentValue;
        r === ba ? t.context._currentValue2 = t.context._defaultValue : t.context._currentValue2 = r, e._currentRenderer2 !== void 0 && e._currentRenderer2 !== null && e._currentRenderer2 !== Un && l("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported."), e._currentRenderer2 = Un;
      }
      return Pn = t.parent;
    }
    __name(us, "us");
    function cs() {
      return Pn;
    }
    __name(cs, "cs");
    function An(e) {
      var t = e._currentValue2;
      return t;
    }
    __name(An, "An");
    function xi(e) {
      return e._reactInternals;
    }
    __name(xi, "xi");
    function pl(e, t) {
      e._reactInternals = t;
    }
    __name(pl, "pl");
    var fs = {}, so = {}, Lo, ki, Pa, Ia, Aa, lo, Uo, Bo, Oa;
    {
      Lo = /* @__PURE__ */ new Set(), ki = /* @__PURE__ */ new Set(), Pa = /* @__PURE__ */ new Set(), Uo = /* @__PURE__ */ new Set(), Ia = /* @__PURE__ */ new Set(), Bo = /* @__PURE__ */ new Set(), Oa = /* @__PURE__ */ new Set();
      var No = /* @__PURE__ */ new Set();
      lo = /* @__PURE__ */ __name(function(e, t) {
        if (!(e === null || typeof e == "function")) {
          var r = t + "_" + e;
          No.has(r) || (No.add(r), l("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", t, e));
        }
      }, "lo"), Aa = /* @__PURE__ */ __name(function(e, t) {
        if (t === void 0) {
          var r = kt(e) || "Component";
          Ia.has(r) || (Ia.add(r), l("%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. You have returned undefined.", r));
        }
      }, "Aa");
    }
    function Fa(e, t) {
      {
        var r = e.constructor, a = r && kt(r) || "ReactClass", f = a + "." + t;
        if (fs[f])
          return;
        l(`%s(...): Can only update a mounting component. This usually means you called %s() outside componentWillMount() on the server. This is a no-op.

Please check the code for the %s component.`, t, t, a), fs[f] = true;
      }
    }
    __name(Fa, "Fa");
    var Da = {
      isMounted: /* @__PURE__ */ __name(function(e) {
        return false;
      }, "isMounted"),
      enqueueSetState: /* @__PURE__ */ __name(function(e, t, r) {
        var a = xi(e);
        a.queue === null ? Fa(e, "setState") : (a.queue.push(t), r != null && lo(r, "setState"));
      }, "enqueueSetState"),
      enqueueReplaceState: /* @__PURE__ */ __name(function(e, t, r) {
        var a = xi(e);
        a.replace = true, a.queue = [t], r != null && lo(r, "setState");
      }, "enqueueReplaceState"),
      enqueueForceUpdate: /* @__PURE__ */ __name(function(e, t) {
        var r = xi(e);
        r.queue === null ? Fa(e, "forceUpdate") : t != null && lo(t, "setState");
      }, "enqueueForceUpdate")
    };
    function Ci(e, t, r, a, f) {
      var v = r(f, a);
      Aa(t, v);
      var b = v == null ? a : Rr({}, a, v);
      return b;
    }
    __name(Ci, "Ci");
    function ds(e, t, r) {
      var a = Fo, f = e.contextType;
      if ("contextType" in e) {
        var v = (
          // Allow null for conditional declaration
          f === null || f !== void 0 && f.$$typeof === ma && f._context === void 0
        );
        if (!v && !Oa.has(e)) {
          Oa.add(e);
          var b = "";
          f === void 0 ? b = " However, it is set to undefined. This can be caused by a typo or by mixing up named and default imports. This can also happen due to a circular dependency, so try moving the createContext() call to a separate file." : typeof f != "object" ? b = " However, it is set to a " + typeof f + "." : f.$$typeof === va ? b = " Did you accidentally pass the Context.Provider instead?" : f._context !== void 0 ? b = " Did you accidentally pass the Context.Consumer instead?" : b = " However, it is set to an object with keys {" + Object.keys(f).join(", ") + "}.", l("%s defines an invalid contextType. contextType should point to the Context object returned by React.createContext().%s", kt(e) || "Component", b);
        }
      }
      typeof f == "object" && f !== null ? a = An(f) : a = r;
      var R = new e(t, a);
      {
        if (typeof e.getDerivedStateFromProps == "function" && (R.state === null || R.state === void 0)) {
          var F = kt(e) || "Component";
          Lo.has(F) || (Lo.add(F), l("`%s` uses `getDerivedStateFromProps` but its initial state is %s. This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.", F, R.state === null ? "null" : "undefined", F));
        }
        if (typeof e.getDerivedStateFromProps == "function" || typeof R.getSnapshotBeforeUpdate == "function") {
          var Y = null, Z = null, ne = null;
          if (typeof R.componentWillMount == "function" && R.componentWillMount.__suppressDeprecationWarning !== true ? Y = "componentWillMount" : typeof R.UNSAFE_componentWillMount == "function" && (Y = "UNSAFE_componentWillMount"), typeof R.componentWillReceiveProps == "function" && R.componentWillReceiveProps.__suppressDeprecationWarning !== true ? Z = "componentWillReceiveProps" : typeof R.UNSAFE_componentWillReceiveProps == "function" && (Z = "UNSAFE_componentWillReceiveProps"), typeof R.componentWillUpdate == "function" && R.componentWillUpdate.__suppressDeprecationWarning !== true ? ne = "componentWillUpdate" : typeof R.UNSAFE_componentWillUpdate == "function" && (ne = "UNSAFE_componentWillUpdate"), Y !== null || Z !== null || ne !== null) {
            var Fe = kt(e) || "Component", tt = typeof e.getDerivedStateFromProps == "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
            Pa.has(Fe) || (Pa.add(Fe), l(`Unsafe legacy lifecycles will not be called for components using new component APIs.

%s uses %s but also contains the following legacy lifecycles:%s%s%s

The above lifecycles should be removed. Learn more about this warning here:
https://reactjs.org/link/unsafe-component-lifecycles`, Fe, tt, Y !== null ? `
  ` + Y : "", Z !== null ? `
  ` + Z : "", ne !== null ? `
  ` + ne : ""));
          }
        }
      }
      return R;
    }
    __name(ds, "ds");
    function ps(e, t, r) {
      {
        var a = kt(t) || "Component", f = e.render;
        f || (t.prototype && typeof t.prototype.render == "function" ? l("%s(...): No `render` method found on the returned component instance: did you accidentally return an object from the constructor?", a) : l("%s(...): No `render` method found on the returned component instance: you may have forgotten to define `render`.", a)), e.getInitialState && !e.getInitialState.isReactClassApproved && !e.state && l("getInitialState was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Did you mean to define a state property instead?", a), e.getDefaultProps && !e.getDefaultProps.isReactClassApproved && l("getDefaultProps was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Use a static property to define defaultProps instead.", a), e.propTypes && l("propTypes was defined as an instance property on %s. Use a static property to define propTypes instead.", a), e.contextType && l("contextType was defined as an instance property on %s. Use a static property to define contextType instead.", a), e.contextTypes && l("contextTypes was defined as an instance property on %s. Use a static property to define contextTypes instead.", a), t.contextType && t.contextTypes && !Bo.has(t) && (Bo.add(t), l("%s declares both contextTypes and contextType static properties. The legacy contextTypes property will be ignored.", a)), typeof e.componentShouldUpdate == "function" && l("%s has a method called componentShouldUpdate(). Did you mean shouldComponentUpdate()? The name is phrased as a question because the function is expected to return a value.", a), t.prototype && t.prototype.isPureReactComponent && typeof e.shouldComponentUpdate < "u" && l("%s has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.", kt(t) || "A pure component"), typeof e.componentDidUnmount == "function" && l("%s has a method called componentDidUnmount(). But there is no such lifecycle method. Did you mean componentWillUnmount()?", a), typeof e.componentDidReceiveProps == "function" && l("%s has a method called componentDidReceiveProps(). But there is no such lifecycle method. If you meant to update the state in response to changing props, use componentWillReceiveProps(). If you meant to fetch data or run side-effects or mutations after React has updated the UI, use componentDidUpdate().", a), typeof e.componentWillRecieveProps == "function" && l("%s has a method called componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", a), typeof e.UNSAFE_componentWillRecieveProps == "function" && l("%s has a method called UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?", a);
        var v = e.props !== r;
        e.props !== void 0 && v && l("%s(...): When calling super() in `%s`, make sure to pass up the same props that your component's constructor was passed.", a, a), e.defaultProps && l("Setting defaultProps as an instance property on %s is not supported and will be ignored. Instead, define defaultProps as a static property on %s.", a, a), typeof e.getSnapshotBeforeUpdate == "function" && typeof e.componentDidUpdate != "function" && !ki.has(t) && (ki.add(t), l("%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.", kt(t))), typeof e.getDerivedStateFromProps == "function" && l("%s: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.", a), typeof e.getDerivedStateFromError == "function" && l("%s: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.", a), typeof t.getSnapshotBeforeUpdate == "function" && l("%s: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.", a);
        var b = e.state;
        b && (typeof b != "object" || T(b)) && l("%s.state: must be set to an object or null", a), typeof e.getChildContext == "function" && typeof t.childContextTypes != "object" && l("%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().", a);
      }
    }
    __name(ps, "ps");
    function hs(e, t) {
      var r = t.state;
      if (typeof t.componentWillMount == "function") {
        if (t.componentWillMount.__suppressDeprecationWarning !== true) {
          var a = kt(e) || "Unknown";
          so[a] || (d(
            // keep this warning in sync with ReactStrictModeWarning.js
            `componentWillMount has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move code from componentWillMount to componentDidMount (preferred in most cases) or the constructor.

Please update the following components: %s`,
            a
          ), so[a] = true);
        }
        t.componentWillMount();
      }
      typeof t.UNSAFE_componentWillMount == "function" && t.UNSAFE_componentWillMount(), r !== t.state && (l("%s.componentWillMount(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", kt(e) || "Component"), Da.enqueueReplaceState(t, t.state, null));
    }
    __name(hs, "hs");
    function hl(e, t, r, a) {
      if (e.queue !== null && e.queue.length > 0) {
        var f = e.queue, v = e.replace;
        if (e.queue = null, e.replace = false, v && f.length === 1)
          t.state = f[0];
        else {
          for (var b = v ? f[0] : t.state, R = true, F = v ? 1 : 0; F < f.length; F++) {
            var Y = f[F], Z = typeof Y == "function" ? Y.call(t, b, r, a) : Y;
            Z != null && (R ? (R = false, b = Rr({}, b, Z)) : Rr(b, Z));
          }
          t.state = b;
        }
      } else
        e.queue = null;
    }
    __name(hl, "hl");
    function vs(e, t, r, a) {
      ps(e, t, r);
      var f = e.state !== void 0 ? e.state : null;
      e.updater = Da, e.props = r, e.state = f;
      var v = {
        queue: [],
        replace: false
      };
      pl(e, v);
      var b = t.contextType;
      if (typeof b == "object" && b !== null ? e.context = An(b) : e.context = a, e.state === r) {
        var R = kt(t) || "Component";
        Uo.has(R) || (Uo.add(R), l("%s: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.", R));
      }
      var F = t.getDerivedStateFromProps;
      typeof F == "function" && (e.state = Ci(e, t, F, f, r)), typeof t.getDerivedStateFromProps != "function" && typeof e.getSnapshotBeforeUpdate != "function" && (typeof e.UNSAFE_componentWillMount == "function" || typeof e.componentWillMount == "function") && (hs(t, e), hl(v, e, r, a));
    }
    __name(vs, "vs");
    var vl = {
      id: 1,
      overflow: ""
    };
    function ml(e) {
      var t = e.overflow, r = e.id, a = r & ~gl(r);
      return a.toString(32) + t;
    }
    __name(ml, "ml");
    function Ei(e, t, r) {
      var a = e.id, f = e.overflow, v = zo(a) - 1, b = a & ~(1 << v), R = r + 1, F = zo(t) + v;
      if (F > 30) {
        var Y = v - v % 5, Z = (1 << Y) - 1, ne = (b & Z).toString(32), Fe = b >> Y, tt = v - Y, Xt = zo(t) + tt, Yn = R << tt, Gn = Yn | Fe, Cn = ne + f;
        return {
          id: 1 << Xt | Gn,
          overflow: Cn
        };
      } else {
        var mo = R << v, Jl = mo | b, zc = f;
        return {
          id: 1 << F | Jl,
          overflow: zc
        };
      }
    }
    __name(Ei, "Ei");
    function zo(e) {
      return 32 - yl(e);
    }
    __name(zo, "zo");
    function gl(e) {
      return 1 << zo(e) - 1;
    }
    __name(gl, "gl");
    var yl = Math.clz32 ? Math.clz32 : bl, Ri = Math.log, Ma = Math.LN2;
    function bl(e) {
      var t = e >>> 0;
      return t === 0 ? 32 : 31 - (Ri(t) / Ma | 0) | 0;
    }
    __name(bl, "bl");
    function wl(e, t) {
      return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
    }
    __name(wl, "wl");
    var Sl = typeof Object.is == "function" ? Object.is : wl, wn = null, Ti = null, ja = null, yt = null, Mr = false, uo = false, Nn = 0, et = null, On = 0, La = 25, jr = false, Lr;
    function cn() {
      if (wn === null)
        throw new Error(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`);
      return jr && l("Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://reactjs.org/link/rules-of-hooks"), wn;
    }
    __name(cn, "cn");
    function xl(e, t) {
      if (t === null)
        return l("%s received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.", Lr), false;
      e.length !== t.length && l(`The final argument passed to %s changed size between renders. The order and size of this array must remain constant.

Previous: %s
Incoming: %s`, Lr, "[" + e.join(", ") + "]", "[" + t.join(", ") + "]");
      for (var r = 0; r < t.length && r < e.length; r++)
        if (!Sl(e[r], t[r]))
          return false;
      return true;
    }
    __name(xl, "xl");
    function on() {
      if (On > 0)
        throw new Error("Rendered more hooks than during the previous render");
      return {
        memoizedState: null,
        queue: null,
        next: null
      };
    }
    __name(on, "on");
    function Fn() {
      return yt === null ? ja === null ? (Mr = false, ja = yt = on()) : (Mr = true, yt = ja) : yt.next === null ? (Mr = false, yt = yt.next = on()) : (Mr = true, yt = yt.next), yt;
    }
    __name(Fn, "Fn");
    function zn(e, t) {
      wn = t, Ti = e, jr = false, Nn = 0;
    }
    __name(zn, "zn");
    function kl(e, t, r, a) {
      for (; uo; )
        uo = false, Nn = 0, On += 1, yt = null, r = e(t, a);
      return Ho(), r;
    }
    __name(kl, "kl");
    function _i() {
      var e = Nn !== 0;
      return e;
    }
    __name(_i, "_i");
    function Ho() {
      jr = false, wn = null, Ti = null, uo = false, ja = null, On = 0, et = null, yt = null;
    }
    __name(Ho, "Ho");
    function Cl(e) {
      return jr && l("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo()."), An(e);
    }
    __name(Cl, "Cl");
    function El(e) {
      return Lr = "useContext", cn(), An(e);
    }
    __name(El, "El");
    function Ua(e, t) {
      return typeof t == "function" ? t(e) : t;
    }
    __name(Ua, "Ua");
    function Pi(e) {
      return Lr = "useState", ms(
        Ua,
        // useReducer has a special case to support lazy useState initializers
        e
      );
    }
    __name(Pi, "Pi");
    function ms(e, t, r) {
      if (e !== Ua && (Lr = "useReducer"), wn = cn(), yt = Fn(), Mr) {
        var a = yt.queue, f = a.dispatch;
        if (et !== null) {
          var v = et.get(a);
          if (v !== void 0) {
            et.delete(a);
            var b = yt.memoizedState, R = v;
            do {
              var F = R.action;
              jr = true, b = e(b, F), jr = false, R = R.next;
            } while (R !== null);
            return yt.memoizedState = b, [b, f];
          }
        }
        return [yt.memoizedState, f];
      } else {
        jr = true;
        var Y;
        e === Ua ? Y = typeof t == "function" ? t() : t : Y = r !== void 0 ? r(t) : t, jr = false, yt.memoizedState = Y;
        var Z = yt.queue = {
          last: null,
          dispatch: null
        }, ne = Z.dispatch = ys.bind(null, wn, Z);
        return [yt.memoizedState, ne];
      }
    }
    __name(ms, "ms");
    function gs(e, t) {
      wn = cn(), yt = Fn();
      var r = t === void 0 ? null : t;
      if (yt !== null) {
        var a = yt.memoizedState;
        if (a !== null && r !== null) {
          var f = a[1];
          if (xl(r, f))
            return a[0];
        }
      }
      jr = true;
      var v = e();
      return jr = false, yt.memoizedState = [v, r], v;
    }
    __name(gs, "gs");
    function Ii(e) {
      wn = cn(), yt = Fn();
      var t = yt.memoizedState;
      if (t === null) {
        var r = {
          current: e
        };
        return Object.seal(r), yt.memoizedState = r, r;
      } else
        return t;
    }
    __name(Ii, "Ii");
    function Rl(e, t) {
      Lr = "useLayoutEffect", l("useLayoutEffect does nothing on the server, because its effect cannot be encoded into the server renderer's output format. This will lead to a mismatch between the initial, non-hydrated UI and the intended UI. To avoid this, useLayoutEffect should only be used in components that render exclusively on the client. See https://reactjs.org/link/uselayouteffect-ssr for common fixes.");
    }
    __name(Rl, "Rl");
    function ys(e, t, r) {
      if (On >= La)
        throw new Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
      if (e === wn) {
        uo = true;
        var a = {
          action: r,
          next: null
        };
        et === null && (et = /* @__PURE__ */ new Map());
        var f = et.get(t);
        if (f === void 0)
          et.set(t, a);
        else {
          for (var v = f; v.next !== null; )
            v = v.next;
          v.next = a;
        }
      }
    }
    __name(ys, "ys");
    function bs(e, t) {
      return gs(function() {
        return e;
      }, t);
    }
    __name(bs, "bs");
    function Tl(e, t, r) {
      return cn(), t(e._source);
    }
    __name(Tl, "Tl");
    function _l(e, t, r) {
      if (r === void 0)
        throw new Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
      return r();
    }
    __name(_l, "_l");
    function Pl(e) {
      return cn(), e;
    }
    __name(Pl, "Pl");
    function Il() {
      throw new Error("startTransition cannot be called during server rendering.");
    }
    __name(Il, "Il");
    function Al() {
      return cn(), [false, Il];
    }
    __name(Al, "Al");
    function Ol() {
      var e = Ti, t = ml(e.treeContext), r = Ai;
      if (r === null)
        throw new Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
      var a = Nn++;
      return ct(r, t, a);
    }
    __name(Ol, "Ol");
    function Ba() {
    }
    __name(Ba, "Ba");
    var ws = {
      readContext: Cl,
      useContext: El,
      useMemo: gs,
      useReducer: ms,
      useRef: Ii,
      useState: Pi,
      useInsertionEffect: Ba,
      useLayoutEffect: Rl,
      useCallback: bs,
      // useImperativeHandle is not run in the server environment
      useImperativeHandle: Ba,
      // Effects are not run in the server environment.
      useEffect: Ba,
      // Debugging effect
      useDebugValue: Ba,
      useDeferredValue: Pl,
      useTransition: Al,
      useId: Ol,
      // Subscriptions are not setup in a server environment.
      useMutableSource: Tl,
      useSyncExternalStore: _l
    }, Ai = null;
    function Ss(e) {
      Ai = e;
    }
    __name(Ss, "Ss");
    function Na(e) {
      try {
        var t = "", r = e;
        do {
          switch (r.tag) {
            case 0:
              t += Io(r.type, null, null);
              break;
            case 1:
              t += Ao(r.type, null, null);
              break;
            case 2:
              t += bi(r.type, null, null);
              break;
          }
          r = r.parent;
        } while (r);
        return t;
      } catch (a) {
        return `
Error generating stack: ` + a.message + `
` + a.stack;
      }
    }
    __name(Na, "Na");
    var za = c.ReactCurrentDispatcher, $o = c.ReactDebugCurrentFrame, Ha = 0, co = 1, $a = 2, Wa = 3, Va = 4, fo = 0, Oi = 1, Hn = 2, xs = 12800;
    function Fl(e) {
      return console.error(e), null;
    }
    __name(Fl, "Fl");
    function po() {
    }
    __name(po, "po");
    function ho(e, t, r, a, f, v, b, R, F) {
      var Y = [], Z = /* @__PURE__ */ new Set(), ne = {
        destination: null,
        responseState: t,
        progressiveChunkSize: a === void 0 ? xs : a,
        status: fo,
        fatalError: null,
        nextSegmentId: 0,
        allPendingTasks: 0,
        pendingRootTasks: 0,
        completedRootSegment: null,
        abortableTasks: Z,
        pingedTasks: Y,
        clientRenderedBoundaries: [],
        completedBoundaries: [],
        partialBoundaries: [],
        onError: f === void 0 ? Fl : f,
        onAllReady: po,
        onShellReady: b === void 0 ? po : b,
        onShellError: po,
        onFatalError: po
      }, Fe = Ya(
        ne,
        0,
        null,
        r,
        // Root segments are never embedded in Text on either edge
        false,
        false
      );
      Fe.parentFlushed = true;
      var tt = $n(ne, e, null, Fe, Z, Fo, Ea, vl);
      return Y.push(tt), ne;
    }
    __name(ho, "ho");
    function Dl(e, t) {
      var r = e.pingedTasks;
      r.push(t), r.length === 1 && E(function() {
        return Hi(e);
      });
    }
    __name(Dl, "Dl");
    function Ml(e, t) {
      return {
        id: er,
        rootSegmentID: -1,
        parentFlushed: false,
        pendingTasks: 0,
        forceClientRender: false,
        completedSegments: [],
        byteSize: 0,
        fallbackAbortableTasks: t,
        errorDigest: null
      };
    }
    __name(Ml, "Ml");
    function $n(e, t, r, a, f, v, b, R) {
      e.allPendingTasks++, r === null ? e.pendingRootTasks++ : r.pendingTasks++;
      var F = {
        node: t,
        ping: /* @__PURE__ */ __name(function() {
          return Dl(e, F);
        }, "ping"),
        blockedBoundary: r,
        blockedSegment: a,
        abortSet: f,
        legacyContext: v,
        context: b,
        treeContext: R
      };
      return F.componentStack = null, f.add(F), F;
    }
    __name($n, "$n");
    function Ya(e, t, r, a, f, v) {
      return {
        status: Ha,
        id: -1,
        // lazily assigned later
        index: t,
        parentFlushed: false,
        chunks: [],
        children: [],
        formatContext: a,
        boundary: r,
        lastPushedText: f,
        textEmbedded: v
      };
    }
    __name(Ya, "Ya");
    var Sn = null;
    function Fi() {
      return Sn === null || Sn.componentStack === null ? "" : Na(Sn.componentStack);
    }
    __name(Fi, "Fi");
    function Wn(e, t) {
      e.componentStack = {
        tag: 0,
        parent: e.componentStack,
        type: t
      };
    }
    __name(Wn, "Wn");
    function Wo(e, t) {
      e.componentStack = {
        tag: 1,
        parent: e.componentStack,
        type: t
      };
    }
    __name(Wo, "Wo");
    function xn(e, t) {
      e.componentStack = {
        tag: 2,
        parent: e.componentStack,
        type: t
      };
    }
    __name(xn, "xn");
    function fn(e) {
      e.componentStack === null ? l("Unexpectedly popped too many stack frames. This is a bug in React.") : e.componentStack = e.componentStack.parent;
    }
    __name(fn, "fn");
    var kn = null;
    function Ga(e, t) {
      {
        var r;
        typeof t == "string" ? r = t : t && typeof t.message == "string" ? r = t.message : r = String(t);
        var a = kn || Fi();
        kn = null, e.errorMessage = r, e.errorComponentStack = a;
      }
    }
    __name(Ga, "Ga");
    function Vo(e, t) {
      var r = e.onError(t);
      if (r != null && typeof r != "string")
        throw new Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + typeof r + '" instead');
      return r;
    }
    __name(Vo, "Vo");
    function an(e, t) {
      var r = e.onShellError;
      r(t);
      var a = e.onFatalError;
      a(t), e.destination !== null ? (e.status = Hn, G(e.destination, t)) : (e.status = Oi, e.fatalError = t);
    }
    __name(an, "an");
    function Yo(e, t, r) {
      Wn(t, "Suspense");
      var a = t.blockedBoundary, f = t.blockedSegment, v = r.fallback, b = r.children, R = /* @__PURE__ */ new Set(), F = Ml(e, R), Y = f.chunks.length, Z = Ya(
        e,
        Y,
        F,
        f.formatContext,
        // boundaries never require text embedding at their edges because comment nodes bound them
        false,
        false
      );
      f.children.push(Z), f.lastPushedText = false;
      var ne = Ya(
        e,
        0,
        null,
        f.formatContext,
        // boundaries never require text embedding at their edges because comment nodes bound them
        false,
        false
      );
      ne.parentFlushed = true, t.blockedBoundary = F, t.blockedSegment = ne;
      try {
        if (hr(e, t, b), qi(ne.chunks, e.responseState, ne.lastPushedText, ne.textEmbedded), ne.status = co, vo(F, ne), F.pendingTasks === 0) {
          fn(t);
          return;
        }
      } catch (tt) {
        ne.status = Va, F.forceClientRender = true, F.errorDigest = Vo(e, tt), Ga(F, tt);
      } finally {
        t.blockedBoundary = a, t.blockedSegment = f;
      }
      var Fe = $n(e, v, a, Z, R, t.legacyContext, t.context, t.treeContext);
      Fe.componentStack = t.componentStack, e.pingedTasks.push(Fe), fn(t);
    }
    __name(Yo, "Yo");
    function Di(e, t, r, a) {
      Wn(t, r);
      var f = t.blockedSegment, v = Ar(f.chunks, r, a, e.responseState, f.formatContext);
      f.lastPushedText = false;
      var b = f.formatContext;
      f.formatContext = ur(b, r, a), hr(e, t, v), f.formatContext = b, it(f.chunks, r), f.lastPushedText = false, fn(t);
    }
    __name(Di, "Di");
    function Go(e) {
      return e.prototype && e.prototype.isReactComponent;
    }
    __name(Go, "Go");
    function Xo(e, t, r, a, f) {
      var v = {};
      zn(t, v);
      var b = r(a, f);
      return kl(r, a, b, f);
    }
    __name(Xo, "Xo");
    function ks(e, t, r, a, f) {
      var v = r.render();
      r.props !== f && (ji || l("It looks like %s is reassigning its own `this.props` while rendering. This is not supported and can lead to confusing bugs.", kt(a) || "a component"), ji = true);
      {
        var b = a.childContextTypes;
        if (b != null) {
          var R = t.legacyContext, F = ss(r, a, R, b);
          t.legacyContext = F, Ur(e, t, v), t.legacyContext = R;
          return;
        }
      }
      Ur(e, t, v);
    }
    __name(ks, "ks");
    function jl(e, t, r, a) {
      xn(t, r);
      var f = Do(r, t.legacyContext), v = ds(r, a, f);
      vs(v, r, a, f), ks(e, t, v, r, a), fn(t);
    }
    __name(jl, "jl");
    var Cs = {}, Jo = {}, Mi = {}, Es = {}, ji = false, Zo = {}, Li = false, Ui = false, Bi = false;
    function Rs(e, t, r, a) {
      var f;
      if (f = Do(r, t.legacyContext), Wo(t, r), r.prototype && typeof r.prototype.render == "function") {
        var v = kt(r) || "Unknown";
        Cs[v] || (l("The <%s /> component appears to have a render method, but doesn't extend React.Component. This is likely to cause errors. Change %s to extend React.Component instead.", v, v), Cs[v] = true);
      }
      var b = Xo(e, t, r, a, f), R = _i();
      if (typeof b == "object" && b !== null && typeof b.render == "function" && b.$$typeof === void 0) {
        var F = kt(r) || "Unknown";
        Jo[F] || (l("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", F, F, F), Jo[F] = true);
      }
      if (
        // Run these checks in production only if the flag is off.
        // Eventually we'll delete this branch altogether.
        typeof b == "object" && b !== null && typeof b.render == "function" && b.$$typeof === void 0
      ) {
        {
          var Y = kt(r) || "Unknown";
          Jo[Y] || (l("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", Y, Y, Y), Jo[Y] = true);
        }
        vs(b, r, a, f), ks(e, t, b, r, a);
      } else if (Ts(r), R) {
        var Z = t.treeContext, ne = 1, Fe = 0;
        t.treeContext = Ei(Z, ne, Fe);
        try {
          Ur(e, t, b);
        } finally {
          t.treeContext = Z;
        }
      } else
        Ur(e, t, b);
      fn(t);
    }
    __name(Rs, "Rs");
    function Ts(e) {
      {
        if (e && e.childContextTypes && l("%s(...): childContextTypes cannot be defined on a function component.", e.displayName || e.name || "Component"), e.defaultProps !== void 0) {
          var t = kt(e) || "Unknown";
          Zo[t] || (l("%s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.", t), Zo[t] = true);
        }
        if (typeof e.getDerivedStateFromProps == "function") {
          var r = kt(e) || "Unknown";
          Es[r] || (l("%s: Function components do not support getDerivedStateFromProps.", r), Es[r] = true);
        }
        if (typeof e.contextType == "object" && e.contextType !== null) {
          var a = kt(e) || "Unknown";
          Mi[a] || (l("%s: Function components do not support contextType.", a), Mi[a] = true);
        }
      }
    }
    __name(Ts, "Ts");
    function Ni(e, t) {
      if (e && e.defaultProps) {
        var r = Rr({}, t), a = e.defaultProps;
        for (var f in a)
          r[f] === void 0 && (r[f] = a[f]);
        return r;
      }
      return t;
    }
    __name(Ni, "Ni");
    function _s(e, t, r, a, f) {
      Wo(t, r.render);
      var v = Xo(e, t, r.render, a, f), b = _i();
      if (b) {
        var R = t.treeContext, F = 1, Y = 0;
        t.treeContext = Ei(R, F, Y);
        try {
          Ur(e, t, v);
        } finally {
          t.treeContext = R;
        }
      } else
        Ur(e, t, v);
      fn(t);
    }
    __name(_s, "_s");
    function Ll(e, t, r, a, f) {
      var v = r.type, b = Ni(v, a);
      zi(e, t, v, b, f);
    }
    __name(Ll, "Ll");
    function Ul(e, t, r, a) {
      r._context === void 0 ? r !== r.Consumer && (Bi || (Bi = true, l("Rendering <Context> directly is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?"))) : r = r._context;
      var f = a.children;
      typeof f != "function" && l("A context consumer was rendered with multiple children, or a child that isn't a function. A context consumer expects a single child that is a function. If you did pass a function, make sure there is no trailing or leading whitespace around it.");
      var v = An(r), b = f(v);
      Ur(e, t, b);
    }
    __name(Ul, "Ul");
    function Ps(e, t, r, a) {
      var f = r._context, v = a.value, b = a.children, R;
      R = t.context, t.context = ls(f, v), Ur(e, t, b), t.context = us(f), R !== t.context && l("Popping the context provider did not return back to the original snapshot. This is a bug in React.");
    }
    __name(Ps, "Ps");
    function Bl(e, t, r, a, f) {
      Wn(t, "Lazy");
      var v = r._payload, b = r._init, R = b(v), F = Ni(R, a);
      zi(e, t, R, F, f), fn(t);
    }
    __name(Bl, "Bl");
    function zi(e, t, r, a, f) {
      if (typeof r == "function")
        if (Go(r)) {
          jl(e, t, r, a);
          return;
        } else {
          Rs(e, t, r, a);
          return;
        }
      if (typeof r == "string") {
        Di(e, t, r, a);
        return;
      }
      switch (r) {
        // TODO: LegacyHidden acts the same as a fragment. This only works
        // because we currently assume that every instance of LegacyHidden is
        // accompanied by a host component wrapper. In the hidden mode, the host
        // component is given a `hidden` attribute, which ensures that the
        // initial HTML is not visible. To support the use of LegacyHidden as a
        // true fragment, without an extra DOM node, we would have to hide the
        // initial HTML in some other way.
        // TODO: Add REACT_OFFSCREEN_TYPE here too with the same capability.
        case ci:
        case ui:
        case Dr:
        case ts:
        case ha: {
          Ur(e, t, a.children);
          return;
        }
        case To: {
          Wn(t, "SuspenseList"), Ur(e, t, a.children), fn(t);
          return;
        }
        case li:
          throw new Error("ReactDOMServer does not yet support scope components.");
        // eslint-disable-next-line-no-fallthrough
        case ya: {
          Yo(e, t, a);
          return;
        }
      }
      if (typeof r == "object" && r !== null)
        switch (r.$$typeof) {
          case ga: {
            _s(e, t, r, a, f);
            return;
          }
          case _o: {
            Ll(e, t, r, a, f);
            return;
          }
          case va: {
            Ps(e, t, r, a);
            return;
          }
          case ma: {
            Ul(e, t, r, a);
            return;
          }
          case oo: {
            Bl(e, t, r, a);
            return;
          }
        }
      var v = "";
      throw (r === void 0 || typeof r == "object" && r !== null && Object.keys(r).length === 0) && (v += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports."), new Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) " + ("but got: " + (r == null ? r : typeof r) + "." + v));
    }
    __name(zi, "zi");
    function Nl(e, t) {
      typeof Symbol == "function" && // $FlowFixMe Flow doesn't know about toStringTag
      e[Symbol.toStringTag] === "Generator" && (Li || l("Using Generators as children is unsupported and will likely yield unexpected results because enumerating a generator mutates it. You may convert it to an array with `Array.from()` or the `[...spread]` operator before rendering. Keep in mind you might need to polyfill these features for older browsers."), Li = true), e.entries === t && (Ui || l("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Ui = true);
    }
    __name(Nl, "Nl");
    function Ur(e, t, r) {
      try {
        return zl(e, t, r);
      } catch (a) {
        throw typeof a == "object" && a !== null && typeof a.then == "function" || (kn = kn !== null ? kn : Fi()), a;
      }
    }
    __name(Ur, "Ur");
    function zl(e, t, r) {
      if (t.node = r, typeof r == "object" && r !== null) {
        switch (r.$$typeof) {
          case ll: {
            var a = r, f = a.type, v = a.props, b = a.ref;
            zi(e, t, f, v, b);
            return;
          }
          case es:
            throw new Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
          // eslint-disable-next-line-no-fallthrough
          case oo: {
            var R = r, F = R._payload, Y = R._init, Z;
            try {
              Z = Y(F);
            } catch (mo) {
              throw typeof mo == "object" && mo !== null && typeof mo.then == "function" && Wn(t, "Lazy"), mo;
            }
            Ur(e, t, Z);
            return;
          }
        }
        if (T(r)) {
          Xa(e, t, r);
          return;
        }
        var ne = cl(r);
        if (ne) {
          Nl(r, ne);
          var Fe = ne.call(r);
          if (Fe) {
            var tt = Fe.next();
            if (!tt.done) {
              var Xt = [];
              do
                Xt.push(tt.value), tt = Fe.next();
              while (!tt.done);
              Xa(e, t, Xt);
              return;
            }
            return;
          }
        }
        var Yn = Object.prototype.toString.call(r);
        throw new Error("Objects are not valid as a React child (found: " + (Yn === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : Yn) + "). If you meant to render a collection of children, use an array instead.");
      }
      if (typeof r == "string") {
        var Gn = t.blockedSegment;
        Gn.lastPushedText = Ki(t.blockedSegment.chunks, r, e.responseState, Gn.lastPushedText);
        return;
      }
      if (typeof r == "number") {
        var Cn = t.blockedSegment;
        Cn.lastPushedText = Ki(t.blockedSegment.chunks, "" + r, e.responseState, Cn.lastPushedText);
        return;
      }
      typeof r == "function" && l("Functions are not valid as a React child. This may happen if you return a Component instead of <Component /> from render. Or maybe you meant to call this function rather than return it.");
    }
    __name(zl, "zl");
    function Xa(e, t, r) {
      for (var a = r.length, f = 0; f < a; f++) {
        var v = t.treeContext;
        t.treeContext = Ei(v, a, f);
        try {
          hr(e, t, r[f]);
        } finally {
          t.treeContext = v;
        }
      }
    }
    __name(Xa, "Xa");
    function Hl(e, t, r) {
      var a = t.blockedSegment, f = a.chunks.length, v = Ya(
        e,
        f,
        null,
        a.formatContext,
        // Adopt the parent segment's leading text embed
        a.lastPushedText,
        // Assume we are text embedded at the trailing edge
        true
      );
      a.children.push(v), a.lastPushedText = false;
      var b = $n(e, t.node, t.blockedBoundary, v, t.abortSet, t.legacyContext, t.context, t.treeContext);
      t.componentStack !== null && (b.componentStack = t.componentStack.parent);
      var R = b.ping;
      r.then(R, R);
    }
    __name(Hl, "Hl");
    function hr(e, t, r) {
      var a = t.blockedSegment.formatContext, f = t.legacyContext, v = t.context, b = null;
      b = t.componentStack;
      try {
        return Ur(e, t, r);
      } catch (R) {
        if (Ho(), typeof R == "object" && R !== null && typeof R.then == "function") {
          Hl(e, t, R), t.blockedSegment.formatContext = a, t.legacyContext = f, t.context = v, jo(v), t.componentStack = b;
          return;
        } else
          throw t.blockedSegment.formatContext = a, t.legacyContext = f, t.context = v, jo(v), t.componentStack = b, R;
      }
    }
    __name(hr, "hr");
    function $l(e, t, r, a) {
      var f = Vo(e, a);
      if (t === null ? an(e, a) : (t.pendingTasks--, t.forceClientRender || (t.forceClientRender = true, t.errorDigest = f, Ga(t, a), t.parentFlushed && e.clientRenderedBoundaries.push(t))), e.allPendingTasks--, e.allPendingTasks === 0) {
        var v = e.onAllReady;
        v();
      }
    }
    __name($l, "$l");
    function Is(e) {
      var t = this, r = e.blockedBoundary, a = e.blockedSegment;
      a.status = Wa, Os(t, r, a);
    }
    __name(Is, "Is");
    function As(e, t, r) {
      var a = e.blockedBoundary, f = e.blockedSegment;
      if (f.status = Wa, a === null)
        t.allPendingTasks--, t.status !== Hn && (t.status = Hn, t.destination !== null && I(t.destination));
      else {
        if (a.pendingTasks--, !a.forceClientRender) {
          a.forceClientRender = true;
          var v = r === void 0 ? new Error("The render was aborted by the server without a reason.") : r;
          a.errorDigest = t.onError(v);
          {
            var b = "The server did not finish this Suspense boundary: ";
            v && typeof v.message == "string" ? v = b + v.message : v = b + String(v);
            var R = Sn;
            Sn = e;
            try {
              Ga(a, v);
            } finally {
              Sn = R;
            }
          }
          a.parentFlushed && t.clientRenderedBoundaries.push(a);
        }
        if (a.fallbackAbortableTasks.forEach(function(Y) {
          return As(Y, t, r);
        }), a.fallbackAbortableTasks.clear(), t.allPendingTasks--, t.allPendingTasks === 0) {
          var F = t.onAllReady;
          F();
        }
      }
    }
    __name(As, "As");
    function vo(e, t) {
      if (t.chunks.length === 0 && t.children.length === 1 && t.children[0].boundary === null) {
        var r = t.children[0];
        r.id = t.id, r.parentFlushed = true, r.status === co && vo(e, r);
      } else {
        var a = e.completedSegments;
        a.push(t);
      }
    }
    __name(vo, "vo");
    function Os(e, t, r) {
      if (t === null) {
        if (r.parentFlushed) {
          if (e.completedRootSegment !== null)
            throw new Error("There can only be one root segment. This is a bug in React.");
          e.completedRootSegment = r;
        }
        if (e.pendingRootTasks--, e.pendingRootTasks === 0) {
          e.onShellError = po;
          var a = e.onShellReady;
          a();
        }
      } else if (t.pendingTasks--, !t.forceClientRender) {
        if (t.pendingTasks === 0)
          r.parentFlushed && r.status === co && vo(t, r), t.parentFlushed && e.completedBoundaries.push(t), t.fallbackAbortableTasks.forEach(Is, e), t.fallbackAbortableTasks.clear();
        else if (r.parentFlushed && r.status === co) {
          vo(t, r);
          var f = t.completedSegments;
          f.length === 1 && t.parentFlushed && e.partialBoundaries.push(t);
        }
      }
      if (e.allPendingTasks--, e.allPendingTasks === 0) {
        var v = e.onAllReady;
        v();
      }
    }
    __name(Os, "Os");
    function Wl(e, t) {
      var r = t.blockedSegment;
      if (r.status === Ha) {
        jo(t.context);
        var a = null;
        a = Sn, Sn = t;
        try {
          Ur(e, t, t.node), qi(r.chunks, e.responseState, r.lastPushedText, r.textEmbedded), t.abortSet.delete(t), r.status = co, Os(e, t.blockedBoundary, r);
        } catch (v) {
          if (Ho(), typeof v == "object" && v !== null && typeof v.then == "function") {
            var f = t.ping;
            v.then(f, f);
          } else
            t.abortSet.delete(t), r.status = Va, $l(e, t.blockedBoundary, r, v);
        } finally {
          Sn = a;
        }
      }
    }
    __name(Wl, "Wl");
    function Hi(e) {
      if (e.status !== Hn) {
        var t = cs(), r = za.current;
        za.current = ws;
        var a;
        a = $o.getCurrentStack, $o.getCurrentStack = Fi;
        var f = Ai;
        Ss(e.responseState);
        try {
          var v = e.pingedTasks, b;
          for (b = 0; b < v.length; b++) {
            var R = v[b];
            Wl(e, R);
          }
          v.splice(0, b), e.destination !== null && Za(e, e.destination);
        } catch (F) {
          Vo(e, F), an(e, F);
        } finally {
          Ss(f), za.current = r, $o.getCurrentStack = a, r === ws && jo(t);
        }
      }
    }
    __name(Hi, "Hi");
    function Vn(e, t, r) {
      switch (r.parentFlushed = true, r.status) {
        case Ha: {
          var a = r.id = e.nextSegmentId++;
          return r.lastPushedText = false, r.textEmbedded = false, dr(t, e.responseState, a);
        }
        case co: {
          r.status = $a;
          for (var f = true, v = r.chunks, b = 0, R = r.children, F = 0; F < R.length; F++) {
            for (var Y = R[F]; b < Y.index; b++)
              g(t, v[b]);
            f = Qo(e, t, Y);
          }
          for (; b < v.length - 1; b++)
            g(t, v[b]);
          return b < v.length && (f = x(t, v[b])), f;
        }
        default:
          throw new Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
      }
    }
    __name(Vn, "Vn");
    function Qo(e, t, r) {
      var a = r.boundary;
      if (a === null)
        return Vn(e, t, r);
      if (a.parentFlushed = true, a.forceClientRender)
        return al(t, e.responseState, a.errorDigest, a.errorMessage, a.errorComponentStack), Vn(e, t, r), sl(t, e.responseState);
      if (a.pendingTasks > 0) {
        a.rootSegmentID = e.nextSegmentId++, a.completedSegments.length > 0 && e.partialBoundaries.push(a);
        var f = a.id = ut(e.responseState);
        return ke(t, e.responseState, f), Vn(e, t, r), je(t, e.responseState);
      } else {
        if (a.byteSize > e.progressiveChunkSize)
          return a.rootSegmentID = e.nextSegmentId++, e.completedBoundaries.push(a), ke(t, e.responseState, a.id), Vn(e, t, r), je(t, e.responseState);
        ol(t, e.responseState);
        var v = a.completedSegments;
        if (v.length !== 1)
          throw new Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
        var b = v[0];
        return Qo(e, t, b), il(t, e.responseState);
      }
    }
    __name(Qo, "Qo");
    function Vl(e, t, r) {
      return el(t, e.responseState, r.id, r.errorDigest, r.errorMessage, r.errorComponentStack);
    }
    __name(Vl, "Vl");
    function $i(e, t, r) {
      return Ro(t, e.responseState, r.formatContext, r.id), Qo(e, t, r), da(t, r.formatContext);
    }
    __name($i, "$i");
    function Ko(e, t, r) {
      for (var a = r.completedSegments, f = 0; f < a.length; f++) {
        var v = a[f];
        Fs(e, t, r, v);
      }
      return a.length = 0, pr(t, e.responseState, r.id, r.rootSegmentID);
    }
    __name(Ko, "Ko");
    function Ja(e, t, r) {
      for (var a = r.completedSegments, f = 0; f < a.length; f++) {
        var v = a[f];
        if (!Fs(e, t, r, v))
          return f++, a.splice(0, f), false;
      }
      return a.splice(0, f), true;
    }
    __name(Ja, "Ja");
    function Fs(e, t, r, a) {
      if (a.status === $a)
        return true;
      var f = a.id;
      if (f === -1) {
        var v = a.id = r.rootSegmentID;
        if (v === -1)
          throw new Error("A root segment ID must have been assigned by now. This is a bug in React.");
        return $i(e, t, a);
      } else
        return $i(e, t, a), K(t, e.responseState, f);
    }
    __name(Fs, "Fs");
    function Za(e, t) {
      try {
        var r = e.completedRootSegment;
        r !== null && e.pendingRootTasks === 0 && (Qo(e, t, r), e.completedRootSegment = null, or(t, e.responseState));
        var a = e.clientRenderedBoundaries, f;
        for (f = 0; f < a.length; f++) {
          var v = a[f];
          if (!Vl(e, t, v)) {
            e.destination = null, f++, a.splice(0, f);
            return;
          }
        }
        a.splice(0, f);
        var b = e.completedBoundaries;
        for (f = 0; f < b.length; f++) {
          var R = b[f];
          if (!Ko(e, t, R)) {
            e.destination = null, f++, b.splice(0, f);
            return;
          }
        }
        b.splice(0, f);
        var F = e.partialBoundaries;
        for (f = 0; f < F.length; f++) {
          var Y = F[f];
          if (!Ja(e, t, Y)) {
            e.destination = null, f++, F.splice(0, f);
            return;
          }
        }
        F.splice(0, f);
        var Z = e.completedBoundaries;
        for (f = 0; f < Z.length; f++) {
          var ne = Z[f];
          if (!Ko(e, t, ne)) {
            e.destination = null, f++, Z.splice(0, f);
            return;
          }
        }
        Z.splice(0, f);
      } finally {
        e.allPendingTasks === 0 && e.pingedTasks.length === 0 && e.clientRenderedBoundaries.length === 0 && e.completedBoundaries.length === 0 && (e.abortableTasks.size !== 0 && l("There was still abortable task at the root when we closed. This is a bug in React."), I(t));
      }
    }
    __name(Za, "Za");
    function Ds(e) {
      E(function() {
        return Hi(e);
      });
    }
    __name(Ds, "Ds");
    function Yl(e, t) {
      if (e.status === Oi) {
        e.status = Hn, G(t, e.fatalError);
        return;
      }
      if (e.status !== Hn && e.destination === null) {
        e.destination = t;
        try {
          Za(e, t);
        } catch (r) {
          Vo(e, r), an(e, r);
        }
      }
    }
    __name(Yl, "Yl");
    function Ms(e, t) {
      try {
        var r = e.abortableTasks;
        r.forEach(function(a) {
          return As(a, e, t);
        }), r.clear(), e.destination !== null && Za(e, e.destination);
      } catch (a) {
        Vo(e, a), an(e, a);
      }
    }
    __name(Ms, "Ms");
    function Wi() {
    }
    __name(Wi, "Wi");
    function js(e, t, r, a) {
      var f = false, v = null, b = "", R = {
        push: /* @__PURE__ */ __name(function(ne) {
          return ne !== null && (b += ne), true;
        }, "push"),
        destroy: /* @__PURE__ */ __name(function(ne) {
          f = true, v = ne;
        }, "destroy")
      }, F = false;
      function Y() {
        F = true;
      }
      __name(Y, "Y");
      var Z = ho(e, rl(r, t ? t.identifierPrefix : void 0), nl(), 1 / 0, Wi, void 0, Y);
      if (Ds(Z), Ms(Z, a), Yl(Z, R), f)
        throw v;
      if (!F)
        throw new Error("A component suspended while responding to synchronous input. This will cause the UI to be replaced with a loading indicator. To fix, updates that suspend should be wrapped with startTransition.");
      return b;
    }
    __name(js, "js");
    function Gl(e, t) {
      return js(e, t, false, 'The server used "renderToString" which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to "renderToReadableStream" which supports Suspense on the server');
    }
    __name(Gl, "Gl");
    function Ls(e, t) {
      return js(e, t, true, 'The server used "renderToStaticMarkup" which does not support Suspense. If you intended to have the server wait for the suspended component please switch to "renderToReadableStream" which supports Suspense on the server');
    }
    __name(Ls, "Ls");
    function Xl() {
      throw new Error("ReactDOMServer.renderToNodeStream(): The streaming API is not available in the browser. Use ReactDOMServer.renderToString() instead.");
    }
    __name(Xl, "Xl");
    function n() {
      throw new Error("ReactDOMServer.renderToStaticNodeStream(): The streaming API is not available in the browser. Use ReactDOMServer.renderToStaticMarkup() instead.");
    }
    __name(n, "n");
    ea.renderToNodeStream = Xl, ea.renderToStaticMarkup = Ls, ea.renderToStaticNodeStream = n, ea.renderToString = Gl, ea.version = i;
  }()), ea;
}
__name(_f, "_f");
var Hs = {};
var Pu;
function Pf() {
  return Pu || (Pu = 1, function() {
    var o = aa(), i = "18.3.1", c = o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function d(n) {
      {
        for (var e = arguments.length, t = new Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
          t[r - 1] = arguments[r];
        S("warn", n, t);
      }
    }
    __name(d, "d");
    function l(n) {
      {
        for (var e = arguments.length, t = new Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
          t[r - 1] = arguments[r];
        S("error", n, t);
      }
    }
    __name(l, "l");
    function S(n, e, t) {
      {
        var r = c.ReactDebugCurrentFrame, a = r.getStackAddendum();
        a !== "" && (e += "%s", t = t.concat([a]));
        var f = t.map(function(v) {
          return String(v);
        });
        f.unshift("Warning: " + e), Function.prototype.apply.call(console[n], console, f);
      }
    }
    __name(S, "S");
    function E(n) {
      n();
    }
    __name(E, "E");
    var P = 512, g = null, x = 0;
    function M(n) {
      g = new Uint8Array(P), x = 0;
    }
    __name(M, "M");
    function I(n, e) {
      if (e.length !== 0) {
        if (e.length > P) {
          x > 0 && (n.enqueue(new Uint8Array(g.buffer, 0, x)), g = new Uint8Array(P), x = 0), n.enqueue(e);
          return;
        }
        var t = e, r = g.length - x;
        r < t.length && (r === 0 ? n.enqueue(g) : (g.set(t.subarray(0, r), x), n.enqueue(g), t = t.subarray(r)), g = new Uint8Array(P), x = 0), g.set(t, x), x += t.length;
      }
    }
    __name(I, "I");
    function $(n, e) {
      return I(n, e), true;
    }
    __name($, "$");
    function te(n) {
      g && x > 0 && (n.enqueue(new Uint8Array(g.buffer, 0, x)), g = null, x = 0);
    }
    __name(te, "te");
    function G(n) {
      n.close();
    }
    __name(G, "G");
    var se = new TextEncoder();
    function H(n) {
      return se.encode(n);
    }
    __name(H, "H");
    function B(n) {
      return se.encode(n);
    }
    __name(B, "B");
    function he(n, e) {
      typeof n.error == "function" ? n.error(e) : n.close();
    }
    __name(he, "he");
    function ye(n) {
      {
        var e = typeof Symbol == "function" && Symbol.toStringTag, t = e && n[Symbol.toStringTag] || n.constructor.name || "Object";
        return t;
      }
    }
    __name(ye, "ye");
    function Pe(n) {
      try {
        return pe(n), false;
      } catch {
        return true;
      }
    }
    __name(Pe, "Pe");
    function pe(n) {
      return "" + n;
    }
    __name(pe, "pe");
    function Ce(n, e) {
      if (Pe(n))
        return l("The provided `%s` attribute is an unsupported type %s. This value must be coerced to a string before before using it here.", e, ye(n)), pe(n);
    }
    __name(Ce, "Ce");
    function le(n, e) {
      if (Pe(n))
        return l("The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before before using it here.", e, ye(n)), pe(n);
    }
    __name(le, "le");
    function ue(n) {
      if (Pe(n))
        return l("The provided HTML markup uses a value of unsupported type %s. This value must be coerced to a string before before using it here.", ye(n)), pe(n);
    }
    __name(ue, "ue");
    var xe = Object.prototype.hasOwnProperty, Ge = 0, ft = 1, Je = 2, Ze = 3, $e = 4, We = 5, rt = 6, ce = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD", oe = ce + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040", nt = new RegExp("^[" + ce + "][" + oe + "]*$"), St = {}, A = {};
    function V(n) {
      return xe.call(A, n) ? true : xe.call(St, n) ? false : nt.test(n) ? (A[n] = true, true) : (St[n] = true, l("Invalid attribute name: `%s`", n), false);
    }
    __name(V, "V");
    function ae(n, e, t, r) {
      if (t !== null && t.type === Ge)
        return false;
      switch (typeof e) {
        case "function":
        // $FlowIssue symbol is perfectly valid here
        case "symbol":
          return true;
        case "boolean": {
          if (t !== null)
            return !t.acceptsBooleans;
          var a = n.toLowerCase().slice(0, 5);
          return a !== "data-" && a !== "aria-";
        }
        default:
          return false;
      }
    }
    __name(ae, "ae");
    function ve(n) {
      return Re.hasOwnProperty(n) ? Re[n] : null;
    }
    __name(ve, "ve");
    function de(n, e, t, r, a, f, v) {
      this.acceptsBooleans = e === Je || e === Ze || e === $e, this.attributeName = r, this.attributeNamespace = a, this.mustUseProperty = t, this.propertyName = n, this.type = e, this.sanitizeURL = f, this.removeEmptyString = v;
    }
    __name(de, "de");
    var Re = {}, Se = [
      "children",
      "dangerouslySetInnerHTML",
      // TODO: This prevents the assignment of defaultValue to regular
      // elements (not just inputs). Now that ReactDOMInput assigns to the
      // defaultValue property -- do we need this?
      "defaultValue",
      "defaultChecked",
      "innerHTML",
      "suppressContentEditableWarning",
      "suppressHydrationWarning",
      "style"
    ];
    Se.forEach(function(n) {
      Re[n] = new de(
        n,
        Ge,
        false,
        // mustUseProperty
        n,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(n) {
      var e = n[0], t = n[1];
      Re[e] = new de(
        e,
        ft,
        false,
        // mustUseProperty
        t,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(n) {
      Re[n] = new de(
        n,
        Je,
        false,
        // mustUseProperty
        n.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(n) {
      Re[n] = new de(
        n,
        Je,
        false,
        // mustUseProperty
        n,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [
      "allowFullScreen",
      "async",
      // Note: there is a special case that prevents it from being written to the DOM
      // on the client side because the browsers are inconsistent. Instead we call focus().
      "autoFocus",
      "autoPlay",
      "controls",
      "default",
      "defer",
      "disabled",
      "disablePictureInPicture",
      "disableRemotePlayback",
      "formNoValidate",
      "hidden",
      "loop",
      "noModule",
      "noValidate",
      "open",
      "playsInline",
      "readOnly",
      "required",
      "reversed",
      "scoped",
      "seamless",
      // Microdata
      "itemScope"
    ].forEach(function(n) {
      Re[n] = new de(
        n,
        Ze,
        false,
        // mustUseProperty
        n.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [
      "checked",
      // Note: `option.selected` is not updated if `select.multiple` is
      // disabled with `removeAttribute`. We have special logic for handling this.
      "multiple",
      "muted",
      "selected"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(n) {
      Re[n] = new de(
        n,
        Ze,
        true,
        // mustUseProperty
        n,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [
      "capture",
      "download"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(n) {
      Re[n] = new de(
        n,
        $e,
        false,
        // mustUseProperty
        n,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [
      "cols",
      "rows",
      "size",
      "span"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(n) {
      Re[n] = new de(
        n,
        rt,
        false,
        // mustUseProperty
        n,
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), ["rowSpan", "start"].forEach(function(n) {
      Re[n] = new de(
        n,
        We,
        false,
        // mustUseProperty
        n.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    });
    var De = /[\-\:]([a-z])/g, Ee = /* @__PURE__ */ __name(function(n) {
      return n[1].toUpperCase();
    }, "Ee");
    [
      "accent-height",
      "alignment-baseline",
      "arabic-form",
      "baseline-shift",
      "cap-height",
      "clip-path",
      "clip-rule",
      "color-interpolation",
      "color-interpolation-filters",
      "color-profile",
      "color-rendering",
      "dominant-baseline",
      "enable-background",
      "fill-opacity",
      "fill-rule",
      "flood-color",
      "flood-opacity",
      "font-family",
      "font-size",
      "font-size-adjust",
      "font-stretch",
      "font-style",
      "font-variant",
      "font-weight",
      "glyph-name",
      "glyph-orientation-horizontal",
      "glyph-orientation-vertical",
      "horiz-adv-x",
      "horiz-origin-x",
      "image-rendering",
      "letter-spacing",
      "lighting-color",
      "marker-end",
      "marker-mid",
      "marker-start",
      "overline-position",
      "overline-thickness",
      "paint-order",
      "panose-1",
      "pointer-events",
      "rendering-intent",
      "shape-rendering",
      "stop-color",
      "stop-opacity",
      "strikethrough-position",
      "strikethrough-thickness",
      "stroke-dasharray",
      "stroke-dashoffset",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-miterlimit",
      "stroke-opacity",
      "stroke-width",
      "text-anchor",
      "text-decoration",
      "text-rendering",
      "underline-position",
      "underline-thickness",
      "unicode-bidi",
      "unicode-range",
      "units-per-em",
      "v-alphabetic",
      "v-hanging",
      "v-ideographic",
      "v-mathematical",
      "vector-effect",
      "vert-adv-y",
      "vert-origin-x",
      "vert-origin-y",
      "word-spacing",
      "writing-mode",
      "xmlns:xlink",
      "x-height"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(n) {
      var e = n.replace(De, Ee);
      Re[e] = new de(
        e,
        ft,
        false,
        // mustUseProperty
        n,
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    }), [
      "xlink:actuate",
      "xlink:arcrole",
      "xlink:role",
      "xlink:show",
      "xlink:title",
      "xlink:type"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(n) {
      var e = n.replace(De, Ee);
      Re[e] = new de(
        e,
        ft,
        false,
        // mustUseProperty
        n,
        "http://www.w3.org/1999/xlink",
        false,
        // sanitizeURL
        false
      );
    }), [
      "xml:base",
      "xml:lang",
      "xml:space"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(n) {
      var e = n.replace(De, Ee);
      Re[e] = new de(
        e,
        ft,
        false,
        // mustUseProperty
        n,
        "http://www.w3.org/XML/1998/namespace",
        false,
        // sanitizeURL
        false
      );
    }), ["tabIndex", "crossOrigin"].forEach(function(n) {
      Re[n] = new de(
        n,
        ft,
        false,
        // mustUseProperty
        n.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        false,
        // sanitizeURL
        false
      );
    });
    var ze = "xlinkHref";
    Re[ze] = new de(
      "xlinkHref",
      ft,
      false,
      // mustUseProperty
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      true,
      // sanitizeURL
      false
    ), ["src", "href", "action", "formAction"].forEach(function(n) {
      Re[n] = new de(
        n,
        ft,
        false,
        // mustUseProperty
        n.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        true,
        // sanitizeURL
        true
      );
    });
    var bt = {
      animationIterationCount: true,
      aspectRatio: true,
      borderImageOutset: true,
      borderImageSlice: true,
      borderImageWidth: true,
      boxFlex: true,
      boxFlexGroup: true,
      boxOrdinalGroup: true,
      columnCount: true,
      columns: true,
      flex: true,
      flexGrow: true,
      flexPositive: true,
      flexShrink: true,
      flexNegative: true,
      flexOrder: true,
      gridArea: true,
      gridRow: true,
      gridRowEnd: true,
      gridRowSpan: true,
      gridRowStart: true,
      gridColumn: true,
      gridColumnEnd: true,
      gridColumnSpan: true,
      gridColumnStart: true,
      fontWeight: true,
      lineClamp: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      tabSize: true,
      widows: true,
      zIndex: true,
      zoom: true,
      // SVG-related properties
      fillOpacity: true,
      floodOpacity: true,
      stopOpacity: true,
      strokeDasharray: true,
      strokeDashoffset: true,
      strokeMiterlimit: true,
      strokeOpacity: true,
      strokeWidth: true
    };
    function Ut(n, e) {
      return n + e.charAt(0).toUpperCase() + e.substring(1);
    }
    __name(Ut, "Ut");
    var dt = ["Webkit", "ms", "Moz", "O"];
    Object.keys(bt).forEach(function(n) {
      dt.forEach(function(e) {
        bt[Ut(e, n)] = bt[n];
      });
    });
    var Pt = {
      button: true,
      checkbox: true,
      image: true,
      hidden: true,
      radio: true,
      reset: true,
      submit: true
    };
    function ar(n, e) {
      Pt[e.type] || e.onChange || e.onInput || e.readOnly || e.disabled || e.value == null || l("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`."), e.onChange || e.readOnly || e.disabled || e.checked == null || l("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.");
    }
    __name(ar, "ar");
    function Bt(n, e) {
      if (n.indexOf("-") === -1)
        return typeof e.is == "string";
      switch (n) {
        // These are reserved SVG and MathML elements.
        // We don't mind this list too much because we expect it to never grow.
        // The alternative is to track the namespace in a few places which is convoluted.
        // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return false;
        default:
          return true;
      }
    }
    __name(Bt, "Bt");
    var mr = {
      "aria-current": 0,
      // state
      "aria-description": 0,
      "aria-details": 0,
      "aria-disabled": 0,
      // state
      "aria-hidden": 0,
      // state
      "aria-invalid": 0,
      // state
      "aria-keyshortcuts": 0,
      "aria-label": 0,
      "aria-roledescription": 0,
      // Widget Attributes
      "aria-autocomplete": 0,
      "aria-checked": 0,
      "aria-expanded": 0,
      "aria-haspopup": 0,
      "aria-level": 0,
      "aria-modal": 0,
      "aria-multiline": 0,
      "aria-multiselectable": 0,
      "aria-orientation": 0,
      "aria-placeholder": 0,
      "aria-pressed": 0,
      "aria-readonly": 0,
      "aria-required": 0,
      "aria-selected": 0,
      "aria-sort": 0,
      "aria-valuemax": 0,
      "aria-valuemin": 0,
      "aria-valuenow": 0,
      "aria-valuetext": 0,
      // Live Region Attributes
      "aria-atomic": 0,
      "aria-busy": 0,
      "aria-live": 0,
      "aria-relevant": 0,
      // Drag-and-Drop Attributes
      "aria-dropeffect": 0,
      "aria-grabbed": 0,
      // Relationship Attributes
      "aria-activedescendant": 0,
      "aria-colcount": 0,
      "aria-colindex": 0,
      "aria-colspan": 0,
      "aria-controls": 0,
      "aria-describedby": 0,
      "aria-errormessage": 0,
      "aria-flowto": 0,
      "aria-labelledby": 0,
      "aria-owns": 0,
      "aria-posinset": 0,
      "aria-rowcount": 0,
      "aria-rowindex": 0,
      "aria-rowspan": 0,
      "aria-setsize": 0
    }, Nt = {}, $t = new RegExp("^(aria)-[" + oe + "]*$"), At = new RegExp("^(aria)[A-Z][" + oe + "]*$");
    function gr(n, e) {
      {
        if (xe.call(Nt, e) && Nt[e])
          return true;
        if (At.test(e)) {
          var t = "aria-" + e.slice(4).toLowerCase(), r = mr.hasOwnProperty(t) ? t : null;
          if (r == null)
            return l("Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.", e), Nt[e] = true, true;
          if (e !== r)
            return l("Invalid ARIA attribute `%s`. Did you mean `%s`?", e, r), Nt[e] = true, true;
        }
        if ($t.test(e)) {
          var a = e.toLowerCase(), f = mr.hasOwnProperty(a) ? a : null;
          if (f == null)
            return Nt[e] = true, false;
          if (e !== f)
            return l("Unknown ARIA attribute `%s`. Did you mean `%s`?", e, f), Nt[e] = true, true;
        }
      }
      return true;
    }
    __name(gr, "gr");
    function Ot(n, e) {
      {
        var t = [];
        for (var r in e) {
          var a = gr(n, r);
          a || t.push(r);
        }
        var f = t.map(function(v) {
          return "`" + v + "`";
        }).join(", ");
        t.length === 1 ? l("Invalid aria prop %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", f, n) : t.length > 1 && l("Invalid aria props %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", f, n);
      }
    }
    __name(Ot, "Ot");
    function Ct(n, e) {
      Bt(n, e) || Ot(n, e);
    }
    __name(Ct, "Ct");
    var vt = false;
    function yr(n, e) {
      {
        if (n !== "input" && n !== "textarea" && n !== "select")
          return;
        e != null && e.value === null && !vt && (vt = true, n === "select" && e.multiple ? l("`value` prop on `%s` should not be null. Consider using an empty array when `multiple` is set to `true` to clear the component or `undefined` for uncontrolled components.", n) : l("`value` prop on `%s` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.", n));
      }
    }
    __name(yr, "yr");
    var Tr = {
      // HTML
      accept: "accept",
      acceptcharset: "acceptCharset",
      "accept-charset": "acceptCharset",
      accesskey: "accessKey",
      action: "action",
      allowfullscreen: "allowFullScreen",
      alt: "alt",
      as: "as",
      async: "async",
      autocapitalize: "autoCapitalize",
      autocomplete: "autoComplete",
      autocorrect: "autoCorrect",
      autofocus: "autoFocus",
      autoplay: "autoPlay",
      autosave: "autoSave",
      capture: "capture",
      cellpadding: "cellPadding",
      cellspacing: "cellSpacing",
      challenge: "challenge",
      charset: "charSet",
      checked: "checked",
      children: "children",
      cite: "cite",
      class: "className",
      classid: "classID",
      classname: "className",
      cols: "cols",
      colspan: "colSpan",
      content: "content",
      contenteditable: "contentEditable",
      contextmenu: "contextMenu",
      controls: "controls",
      controlslist: "controlsList",
      coords: "coords",
      crossorigin: "crossOrigin",
      dangerouslysetinnerhtml: "dangerouslySetInnerHTML",
      data: "data",
      datetime: "dateTime",
      default: "default",
      defaultchecked: "defaultChecked",
      defaultvalue: "defaultValue",
      defer: "defer",
      dir: "dir",
      disabled: "disabled",
      disablepictureinpicture: "disablePictureInPicture",
      disableremoteplayback: "disableRemotePlayback",
      download: "download",
      draggable: "draggable",
      enctype: "encType",
      enterkeyhint: "enterKeyHint",
      for: "htmlFor",
      form: "form",
      formmethod: "formMethod",
      formaction: "formAction",
      formenctype: "formEncType",
      formnovalidate: "formNoValidate",
      formtarget: "formTarget",
      frameborder: "frameBorder",
      headers: "headers",
      height: "height",
      hidden: "hidden",
      high: "high",
      href: "href",
      hreflang: "hrefLang",
      htmlfor: "htmlFor",
      httpequiv: "httpEquiv",
      "http-equiv": "httpEquiv",
      icon: "icon",
      id: "id",
      imagesizes: "imageSizes",
      imagesrcset: "imageSrcSet",
      innerhtml: "innerHTML",
      inputmode: "inputMode",
      integrity: "integrity",
      is: "is",
      itemid: "itemID",
      itemprop: "itemProp",
      itemref: "itemRef",
      itemscope: "itemScope",
      itemtype: "itemType",
      keyparams: "keyParams",
      keytype: "keyType",
      kind: "kind",
      label: "label",
      lang: "lang",
      list: "list",
      loop: "loop",
      low: "low",
      manifest: "manifest",
      marginwidth: "marginWidth",
      marginheight: "marginHeight",
      max: "max",
      maxlength: "maxLength",
      media: "media",
      mediagroup: "mediaGroup",
      method: "method",
      min: "min",
      minlength: "minLength",
      multiple: "multiple",
      muted: "muted",
      name: "name",
      nomodule: "noModule",
      nonce: "nonce",
      novalidate: "noValidate",
      open: "open",
      optimum: "optimum",
      pattern: "pattern",
      placeholder: "placeholder",
      playsinline: "playsInline",
      poster: "poster",
      preload: "preload",
      profile: "profile",
      radiogroup: "radioGroup",
      readonly: "readOnly",
      referrerpolicy: "referrerPolicy",
      rel: "rel",
      required: "required",
      reversed: "reversed",
      role: "role",
      rows: "rows",
      rowspan: "rowSpan",
      sandbox: "sandbox",
      scope: "scope",
      scoped: "scoped",
      scrolling: "scrolling",
      seamless: "seamless",
      selected: "selected",
      shape: "shape",
      size: "size",
      sizes: "sizes",
      span: "span",
      spellcheck: "spellCheck",
      src: "src",
      srcdoc: "srcDoc",
      srclang: "srcLang",
      srcset: "srcSet",
      start: "start",
      step: "step",
      style: "style",
      summary: "summary",
      tabindex: "tabIndex",
      target: "target",
      title: "title",
      type: "type",
      usemap: "useMap",
      value: "value",
      width: "width",
      wmode: "wmode",
      wrap: "wrap",
      // SVG
      about: "about",
      accentheight: "accentHeight",
      "accent-height": "accentHeight",
      accumulate: "accumulate",
      additive: "additive",
      alignmentbaseline: "alignmentBaseline",
      "alignment-baseline": "alignmentBaseline",
      allowreorder: "allowReorder",
      alphabetic: "alphabetic",
      amplitude: "amplitude",
      arabicform: "arabicForm",
      "arabic-form": "arabicForm",
      ascent: "ascent",
      attributename: "attributeName",
      attributetype: "attributeType",
      autoreverse: "autoReverse",
      azimuth: "azimuth",
      basefrequency: "baseFrequency",
      baselineshift: "baselineShift",
      "baseline-shift": "baselineShift",
      baseprofile: "baseProfile",
      bbox: "bbox",
      begin: "begin",
      bias: "bias",
      by: "by",
      calcmode: "calcMode",
      capheight: "capHeight",
      "cap-height": "capHeight",
      clip: "clip",
      clippath: "clipPath",
      "clip-path": "clipPath",
      clippathunits: "clipPathUnits",
      cliprule: "clipRule",
      "clip-rule": "clipRule",
      color: "color",
      colorinterpolation: "colorInterpolation",
      "color-interpolation": "colorInterpolation",
      colorinterpolationfilters: "colorInterpolationFilters",
      "color-interpolation-filters": "colorInterpolationFilters",
      colorprofile: "colorProfile",
      "color-profile": "colorProfile",
      colorrendering: "colorRendering",
      "color-rendering": "colorRendering",
      contentscripttype: "contentScriptType",
      contentstyletype: "contentStyleType",
      cursor: "cursor",
      cx: "cx",
      cy: "cy",
      d: "d",
      datatype: "datatype",
      decelerate: "decelerate",
      descent: "descent",
      diffuseconstant: "diffuseConstant",
      direction: "direction",
      display: "display",
      divisor: "divisor",
      dominantbaseline: "dominantBaseline",
      "dominant-baseline": "dominantBaseline",
      dur: "dur",
      dx: "dx",
      dy: "dy",
      edgemode: "edgeMode",
      elevation: "elevation",
      enablebackground: "enableBackground",
      "enable-background": "enableBackground",
      end: "end",
      exponent: "exponent",
      externalresourcesrequired: "externalResourcesRequired",
      fill: "fill",
      fillopacity: "fillOpacity",
      "fill-opacity": "fillOpacity",
      fillrule: "fillRule",
      "fill-rule": "fillRule",
      filter: "filter",
      filterres: "filterRes",
      filterunits: "filterUnits",
      floodopacity: "floodOpacity",
      "flood-opacity": "floodOpacity",
      floodcolor: "floodColor",
      "flood-color": "floodColor",
      focusable: "focusable",
      fontfamily: "fontFamily",
      "font-family": "fontFamily",
      fontsize: "fontSize",
      "font-size": "fontSize",
      fontsizeadjust: "fontSizeAdjust",
      "font-size-adjust": "fontSizeAdjust",
      fontstretch: "fontStretch",
      "font-stretch": "fontStretch",
      fontstyle: "fontStyle",
      "font-style": "fontStyle",
      fontvariant: "fontVariant",
      "font-variant": "fontVariant",
      fontweight: "fontWeight",
      "font-weight": "fontWeight",
      format: "format",
      from: "from",
      fx: "fx",
      fy: "fy",
      g1: "g1",
      g2: "g2",
      glyphname: "glyphName",
      "glyph-name": "glyphName",
      glyphorientationhorizontal: "glyphOrientationHorizontal",
      "glyph-orientation-horizontal": "glyphOrientationHorizontal",
      glyphorientationvertical: "glyphOrientationVertical",
      "glyph-orientation-vertical": "glyphOrientationVertical",
      glyphref: "glyphRef",
      gradienttransform: "gradientTransform",
      gradientunits: "gradientUnits",
      hanging: "hanging",
      horizadvx: "horizAdvX",
      "horiz-adv-x": "horizAdvX",
      horizoriginx: "horizOriginX",
      "horiz-origin-x": "horizOriginX",
      ideographic: "ideographic",
      imagerendering: "imageRendering",
      "image-rendering": "imageRendering",
      in2: "in2",
      in: "in",
      inlist: "inlist",
      intercept: "intercept",
      k1: "k1",
      k2: "k2",
      k3: "k3",
      k4: "k4",
      k: "k",
      kernelmatrix: "kernelMatrix",
      kernelunitlength: "kernelUnitLength",
      kerning: "kerning",
      keypoints: "keyPoints",
      keysplines: "keySplines",
      keytimes: "keyTimes",
      lengthadjust: "lengthAdjust",
      letterspacing: "letterSpacing",
      "letter-spacing": "letterSpacing",
      lightingcolor: "lightingColor",
      "lighting-color": "lightingColor",
      limitingconeangle: "limitingConeAngle",
      local: "local",
      markerend: "markerEnd",
      "marker-end": "markerEnd",
      markerheight: "markerHeight",
      markermid: "markerMid",
      "marker-mid": "markerMid",
      markerstart: "markerStart",
      "marker-start": "markerStart",
      markerunits: "markerUnits",
      markerwidth: "markerWidth",
      mask: "mask",
      maskcontentunits: "maskContentUnits",
      maskunits: "maskUnits",
      mathematical: "mathematical",
      mode: "mode",
      numoctaves: "numOctaves",
      offset: "offset",
      opacity: "opacity",
      operator: "operator",
      order: "order",
      orient: "orient",
      orientation: "orientation",
      origin: "origin",
      overflow: "overflow",
      overlineposition: "overlinePosition",
      "overline-position": "overlinePosition",
      overlinethickness: "overlineThickness",
      "overline-thickness": "overlineThickness",
      paintorder: "paintOrder",
      "paint-order": "paintOrder",
      panose1: "panose1",
      "panose-1": "panose1",
      pathlength: "pathLength",
      patterncontentunits: "patternContentUnits",
      patterntransform: "patternTransform",
      patternunits: "patternUnits",
      pointerevents: "pointerEvents",
      "pointer-events": "pointerEvents",
      points: "points",
      pointsatx: "pointsAtX",
      pointsaty: "pointsAtY",
      pointsatz: "pointsAtZ",
      prefix: "prefix",
      preservealpha: "preserveAlpha",
      preserveaspectratio: "preserveAspectRatio",
      primitiveunits: "primitiveUnits",
      property: "property",
      r: "r",
      radius: "radius",
      refx: "refX",
      refy: "refY",
      renderingintent: "renderingIntent",
      "rendering-intent": "renderingIntent",
      repeatcount: "repeatCount",
      repeatdur: "repeatDur",
      requiredextensions: "requiredExtensions",
      requiredfeatures: "requiredFeatures",
      resource: "resource",
      restart: "restart",
      result: "result",
      results: "results",
      rotate: "rotate",
      rx: "rx",
      ry: "ry",
      scale: "scale",
      security: "security",
      seed: "seed",
      shaperendering: "shapeRendering",
      "shape-rendering": "shapeRendering",
      slope: "slope",
      spacing: "spacing",
      specularconstant: "specularConstant",
      specularexponent: "specularExponent",
      speed: "speed",
      spreadmethod: "spreadMethod",
      startoffset: "startOffset",
      stddeviation: "stdDeviation",
      stemh: "stemh",
      stemv: "stemv",
      stitchtiles: "stitchTiles",
      stopcolor: "stopColor",
      "stop-color": "stopColor",
      stopopacity: "stopOpacity",
      "stop-opacity": "stopOpacity",
      strikethroughposition: "strikethroughPosition",
      "strikethrough-position": "strikethroughPosition",
      strikethroughthickness: "strikethroughThickness",
      "strikethrough-thickness": "strikethroughThickness",
      string: "string",
      stroke: "stroke",
      strokedasharray: "strokeDasharray",
      "stroke-dasharray": "strokeDasharray",
      strokedashoffset: "strokeDashoffset",
      "stroke-dashoffset": "strokeDashoffset",
      strokelinecap: "strokeLinecap",
      "stroke-linecap": "strokeLinecap",
      strokelinejoin: "strokeLinejoin",
      "stroke-linejoin": "strokeLinejoin",
      strokemiterlimit: "strokeMiterlimit",
      "stroke-miterlimit": "strokeMiterlimit",
      strokewidth: "strokeWidth",
      "stroke-width": "strokeWidth",
      strokeopacity: "strokeOpacity",
      "stroke-opacity": "strokeOpacity",
      suppresscontenteditablewarning: "suppressContentEditableWarning",
      suppresshydrationwarning: "suppressHydrationWarning",
      surfacescale: "surfaceScale",
      systemlanguage: "systemLanguage",
      tablevalues: "tableValues",
      targetx: "targetX",
      targety: "targetY",
      textanchor: "textAnchor",
      "text-anchor": "textAnchor",
      textdecoration: "textDecoration",
      "text-decoration": "textDecoration",
      textlength: "textLength",
      textrendering: "textRendering",
      "text-rendering": "textRendering",
      to: "to",
      transform: "transform",
      typeof: "typeof",
      u1: "u1",
      u2: "u2",
      underlineposition: "underlinePosition",
      "underline-position": "underlinePosition",
      underlinethickness: "underlineThickness",
      "underline-thickness": "underlineThickness",
      unicode: "unicode",
      unicodebidi: "unicodeBidi",
      "unicode-bidi": "unicodeBidi",
      unicoderange: "unicodeRange",
      "unicode-range": "unicodeRange",
      unitsperem: "unitsPerEm",
      "units-per-em": "unitsPerEm",
      unselectable: "unselectable",
      valphabetic: "vAlphabetic",
      "v-alphabetic": "vAlphabetic",
      values: "values",
      vectoreffect: "vectorEffect",
      "vector-effect": "vectorEffect",
      version: "version",
      vertadvy: "vertAdvY",
      "vert-adv-y": "vertAdvY",
      vertoriginx: "vertOriginX",
      "vert-origin-x": "vertOriginX",
      vertoriginy: "vertOriginY",
      "vert-origin-y": "vertOriginY",
      vhanging: "vHanging",
      "v-hanging": "vHanging",
      videographic: "vIdeographic",
      "v-ideographic": "vIdeographic",
      viewbox: "viewBox",
      viewtarget: "viewTarget",
      visibility: "visibility",
      vmathematical: "vMathematical",
      "v-mathematical": "vMathematical",
      vocab: "vocab",
      widths: "widths",
      wordspacing: "wordSpacing",
      "word-spacing": "wordSpacing",
      writingmode: "writingMode",
      "writing-mode": "writingMode",
      x1: "x1",
      x2: "x2",
      x: "x",
      xchannelselector: "xChannelSelector",
      xheight: "xHeight",
      "x-height": "xHeight",
      xlinkactuate: "xlinkActuate",
      "xlink:actuate": "xlinkActuate",
      xlinkarcrole: "xlinkArcrole",
      "xlink:arcrole": "xlinkArcrole",
      xlinkhref: "xlinkHref",
      "xlink:href": "xlinkHref",
      xlinkrole: "xlinkRole",
      "xlink:role": "xlinkRole",
      xlinkshow: "xlinkShow",
      "xlink:show": "xlinkShow",
      xlinktitle: "xlinkTitle",
      "xlink:title": "xlinkTitle",
      xlinktype: "xlinkType",
      "xlink:type": "xlinkType",
      xmlbase: "xmlBase",
      "xml:base": "xmlBase",
      xmllang: "xmlLang",
      "xml:lang": "xmlLang",
      xmlns: "xmlns",
      "xml:space": "xmlSpace",
      xmlnsxlink: "xmlnsXlink",
      "xmlns:xlink": "xmlnsXlink",
      xmlspace: "xmlSpace",
      y1: "y1",
      y2: "y2",
      y: "y",
      ychannelselector: "yChannelSelector",
      z: "z",
      zoomandpan: "zoomAndPan"
    }, _r = /* @__PURE__ */ __name(function() {
    }, "_r");
    {
      var mt = {}, Br = /^on./, Qr = /^on[^A-Z]/, Nr = new RegExp("^(aria)-[" + oe + "]*$"), Kr = new RegExp("^(aria)[A-Z][" + oe + "]*$");
      _r = /* @__PURE__ */ __name(function(n, e, t, r) {
        if (xe.call(mt, e) && mt[e])
          return true;
        var a = e.toLowerCase();
        if (a === "onfocusin" || a === "onfocusout")
          return l("React uses onFocus and onBlur instead of onFocusIn and onFocusOut. All React events are normalized to bubble, so onFocusIn and onFocusOut are not needed/supported by React."), mt[e] = true, true;
        if (r != null) {
          var f = r.registrationNameDependencies, v = r.possibleRegistrationNames;
          if (f.hasOwnProperty(e))
            return true;
          var b = v.hasOwnProperty(a) ? v[a] : null;
          if (b != null)
            return l("Invalid event handler property `%s`. Did you mean `%s`?", e, b), mt[e] = true, true;
          if (Br.test(e))
            return l("Unknown event handler property `%s`. It will be ignored.", e), mt[e] = true, true;
        } else if (Br.test(e))
          return Qr.test(e) && l("Invalid event handler property `%s`. React events use the camelCase naming convention, for example `onClick`.", e), mt[e] = true, true;
        if (Nr.test(e) || Kr.test(e))
          return true;
        if (a === "innerhtml")
          return l("Directly setting property `innerHTML` is not permitted. For more information, lookup documentation on `dangerouslySetInnerHTML`."), mt[e] = true, true;
        if (a === "aria")
          return l("The `aria` attribute is reserved for future use in React. Pass individual `aria-` attributes instead."), mt[e] = true, true;
        if (a === "is" && t !== null && t !== void 0 && typeof t != "string")
          return l("Received a `%s` for a string attribute `is`. If this is expected, cast the value to a string.", typeof t), mt[e] = true, true;
        if (typeof t == "number" && isNaN(t))
          return l("Received NaN for the `%s` attribute. If this is expected, cast the value to a string.", e), mt[e] = true, true;
        var R = ve(e), F = R !== null && R.type === Ge;
        if (Tr.hasOwnProperty(a)) {
          var Y = Tr[a];
          if (Y !== e)
            return l("Invalid DOM property `%s`. Did you mean `%s`?", e, Y), mt[e] = true, true;
        } else if (!F && e !== a)
          return l("React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.", e, a), mt[e] = true, true;
        return typeof t == "boolean" && ae(e, t, R) ? (t ? l('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.', t, e, e, t, e) : l('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.', t, e, e, t, e, e, e), mt[e] = true, true) : F ? true : ae(e, t, R) ? (mt[e] = true, false) : ((t === "false" || t === "true") && R !== null && R.type === Ze && (l("Received the string `%s` for the boolean attribute `%s`. %s Did you mean %s={%s}?", t, e, t === "false" ? "The browser will interpret it as a truthy value." : 'Although this works, it will not work as expected if you pass the string "false".', e, t), mt[e] = true), true);
      }, "_r");
    }
    var zr = /* @__PURE__ */ __name(function(n, e, t) {
      {
        var r = [];
        for (var a in e) {
          var f = _r(n, a, e[a], t);
          f || r.push(a);
        }
        var v = r.map(function(b) {
          return "`" + b + "`";
        }).join(", ");
        r.length === 1 ? l("Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", v, n) : r.length > 1 && l("Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", v, n);
      }
    }, "zr");
    function dn(n, e, t) {
      Bt(n, e) || zr(n, e, t);
    }
    __name(dn, "dn");
    var Qt = /* @__PURE__ */ __name(function() {
    }, "Qt");
    {
      var ir = /^(?:webkit|moz|o)[A-Z]/, qr = /^-ms-/, Hr = /-(.)/g, Tt = /;\s*$/, It = {}, Wt = {}, Ne = false, zt = false, sr = /* @__PURE__ */ __name(function(n) {
        return n.replace(Hr, function(e, t) {
          return t.toUpperCase();
        });
      }, "sr"), br = /* @__PURE__ */ __name(function(n) {
        It.hasOwnProperty(n) && It[n] || (It[n] = true, l(
          "Unsupported style property %s. Did you mean %s?",
          n,
          // As Andi Smith suggests
          // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
          // is converted to lowercase `ms`.
          sr(n.replace(qr, "ms-"))
        ));
      }, "br"), Kt = /* @__PURE__ */ __name(function(n) {
        It.hasOwnProperty(n) && It[n] || (It[n] = true, l("Unsupported vendor-prefixed style property %s. Did you mean %s?", n, n.charAt(0).toUpperCase() + n.slice(1)));
      }, "Kt"), Pr = /* @__PURE__ */ __name(function(n, e) {
        Wt.hasOwnProperty(e) && Wt[e] || (Wt[e] = true, l(`Style property values shouldn't contain a semicolon. Try "%s: %s" instead.`, n, e.replace(Tt, "")));
      }, "Pr"), qt = /* @__PURE__ */ __name(function(n, e) {
        Ne || (Ne = true, l("`NaN` is an invalid value for the `%s` css style property.", n));
      }, "qt"), xt = /* @__PURE__ */ __name(function(n, e) {
        zt || (zt = true, l("`Infinity` is an invalid value for the `%s` css style property.", n));
      }, "xt");
      Qt = /* @__PURE__ */ __name(function(n, e) {
        n.indexOf("-") > -1 ? br(n) : ir.test(n) ? Kt(n) : Tt.test(e) && Pr(n, e), typeof e == "number" && (isNaN(e) ? qt(n, e) : isFinite(e) || xt(n, e));
      }, "Qt");
    }
    var lr = Qt, wr = /["'&<>]/;
    function $r(n) {
      ue(n);
      var e = "" + n, t = wr.exec(e);
      if (!t)
        return e;
      var r, a = "", f, v = 0;
      for (f = t.index; f < e.length; f++) {
        switch (e.charCodeAt(f)) {
          case 34:
            r = "&quot;";
            break;
          case 38:
            r = "&amp;";
            break;
          case 39:
            r = "&#x27;";
            break;
          case 60:
            r = "&lt;";
            break;
          case 62:
            r = "&gt;";
            break;
          default:
            continue;
        }
        v !== f && (a += e.substring(v, f)), v = f + 1, a += r;
      }
      return v !== f ? a + e.substring(v, f) : a;
    }
    __name($r, "$r");
    function gt(n) {
      return typeof n == "boolean" || typeof n == "number" ? "" + n : $r(n);
    }
    __name(gt, "gt");
    var en = /([A-Z])/g, pn = /^ms-/;
    function hn(n) {
      return n.replace(en, "-$1").toLowerCase().replace(pn, "-ms-");
    }
    __name(hn, "hn");
    var T = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i, X = false;
    function re(n) {
      !X && T.test(n) && (X = true, l("A future version of React will block javascript: URLs as a security precaution. Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead. React was passed %s.", JSON.stringify(n)));
    }
    __name(re, "re");
    var ie = Array.isArray;
    function Ae(n) {
      return ie(n);
    }
    __name(Ae, "Ae");
    var Ue = B("<script>"), Me = B("<\/script>"), Ie = B('<script src="'), lt = B('<script type="module" src="'), Ve = B('" async=""><\/script>');
    function Qe(n) {
      return ue(n), ("" + n).replace(at, ur);
    }
    __name(Qe, "Qe");
    var at = /(<\/|<)(s)(cript)/gi, ur = /* @__PURE__ */ __name(function(n, e, t, r) {
      return "" + e + (t === "s" ? "\\u0073" : "\\u0053") + r;
    }, "ur");
    function er(n, e, t, r, a) {
      var f = n === void 0 ? "" : n, v = e === void 0 ? Ue : B('<script nonce="' + gt(e) + '">'), b = [];
      if (t !== void 0 && b.push(v, H(Qe(t)), Me), r !== void 0)
        for (var R = 0; R < r.length; R++)
          b.push(Ie, H(gt(r[R])), Ve);
      if (a !== void 0)
        for (var F = 0; F < a.length; F++)
          b.push(lt, H(gt(a[F])), Ve);
      return {
        bootstrapChunks: b,
        startInlineScript: v,
        placeholderPrefix: B(f + "P:"),
        segmentPrefix: B(f + "S:"),
        boundaryPrefix: f + "B:",
        idPrefix: f,
        nextSuspenseID: 0,
        sentCompleteSegmentFunction: false,
        sentCompleteBoundaryFunction: false,
        sentClientRenderFunction: false
      };
    }
    __name(er, "er");
    var ut = 0, ct = 1, tr = 2, rr = 3, Wr = 4, Sr = 5, nr = 6, cr = 7;
    function Mt(n, e) {
      return {
        insertionMode: n,
        selectedValue: e
      };
    }
    __name(Mt, "Mt");
    function Ir(n) {
      var e = n === "http://www.w3.org/2000/svg" ? tr : n === "http://www.w3.org/1998/Math/MathML" ? rr : ut;
      return Mt(e, null);
    }
    __name(Ir, "Ir");
    function Vr(n, e, t) {
      switch (e) {
        case "select":
          return Mt(ct, t.value != null ? t.value : t.defaultValue);
        case "svg":
          return Mt(tr, null);
        case "math":
          return Mt(rr, null);
        case "foreignObject":
          return Mt(ct, null);
        // Table parents are special in that their children can only be created at all if they're
        // wrapped in a table parent. So we need to encode that we're entering this mode.
        case "table":
          return Mt(Wr, null);
        case "thead":
        case "tbody":
        case "tfoot":
          return Mt(Sr, null);
        case "colgroup":
          return Mt(cr, null);
        case "tr":
          return Mt(nr, null);
      }
      return n.insertionMode >= Wr || n.insertionMode === ut ? Mt(ct, null) : n;
    }
    __name(Vr, "Vr");
    var tn = null;
    function Vt(n) {
      var e = n.nextSuspenseID++;
      return B(n.boundaryPrefix + e.toString(16));
    }
    __name(Vt, "Vt");
    function fr(n, e, t) {
      var r = n.idPrefix, a = ":" + r + "R" + e;
      return t > 0 && (a += "H" + t.toString(32)), a + ":";
    }
    __name(fr, "fr");
    function Ht(n) {
      return gt(n);
    }
    __name(Ht, "Ht");
    var ln = B("<!-- -->");
    function Et(n, e, t, r) {
      return e === "" ? r : (r && n.push(ln), n.push(H(Ht(e))), true);
    }
    __name(Et, "Et");
    function jt(n, e, t, r) {
      t && r && n.push(ln);
    }
    __name(jt, "jt");
    var s = /* @__PURE__ */ new Map();
    function p(n) {
      var e = s.get(n);
      if (e !== void 0)
        return e;
      var t = B(gt(hn(n)));
      return s.set(n, t), t;
    }
    __name(p, "p");
    var w = B(' style="'), C = B(":"), j = B(";");
    function O(n, e, t) {
      if (typeof t != "object")
        throw new Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
      var r = true;
      for (var a in t)
        if (xe.call(t, a)) {
          var f = t[a];
          if (!(f == null || typeof f == "boolean" || f === "")) {
            var v = void 0, b = void 0, R = a.indexOf("--") === 0;
            R ? (v = H(gt(a)), le(f, a), b = H(gt(("" + f).trim()))) : (lr(a, f), v = p(a), typeof f == "number" ? f !== 0 && !xe.call(bt, a) ? b = H(f + "px") : b = H("" + f) : (le(f, a), b = H(gt(("" + f).trim())))), r ? (r = false, n.push(w, v, C, b)) : n.push(j, v, C, b);
          }
        }
      r || n.push(be);
    }
    __name(O, "O");
    var N = B(" "), Q = B('="'), be = B('"'), Te = B('=""');
    function we(n, e, t, r) {
      switch (t) {
        case "style": {
          O(n, e, r);
          return;
        }
        case "defaultValue":
        case "defaultChecked":
        // These shouldn't be set as attributes on generic HTML elements.
        case "innerHTML":
        // Must use dangerouslySetInnerHTML instead.
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
          return;
      }
      if (
        // shouldIgnoreAttribute
        // We have already filtered out null/undefined and reserved words.
        !(t.length > 2 && (t[0] === "o" || t[0] === "O") && (t[1] === "n" || t[1] === "N"))
      ) {
        var a = ve(t);
        if (a !== null) {
          switch (typeof r) {
            case "function":
            // $FlowIssue symbol is perfectly valid here
            case "symbol":
              return;
            case "boolean":
              if (!a.acceptsBooleans)
                return;
          }
          var f = a.attributeName, v = H(f);
          switch (a.type) {
            case Ze:
              r && n.push(N, v, Te);
              return;
            case $e:
              r === true ? n.push(N, v, Te) : r === false || n.push(N, v, Q, H(gt(r)), be);
              return;
            case We:
              isNaN(r) || n.push(N, v, Q, H(gt(r)), be);
              break;
            case rt:
              !isNaN(r) && r >= 1 && n.push(N, v, Q, H(gt(r)), be);
              break;
            default:
              a.sanitizeURL && (Ce(r, f), r = "" + r, re(r)), n.push(N, v, Q, H(gt(r)), be);
          }
        } else if (V(t)) {
          switch (typeof r) {
            case "function":
            // $FlowIssue symbol is perfectly valid here
            case "symbol":
              return;
            case "boolean": {
              var b = t.toLowerCase().slice(0, 5);
              if (b !== "data-" && b !== "aria-")
                return;
            }
          }
          n.push(N, H(t), Q, H(gt(r)), be);
        }
      }
    }
    __name(we, "we");
    var Xe = B(">"), Rt = B("/>");
    function Ft(n, e, t) {
      if (e != null) {
        if (t != null)
          throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        if (typeof e != "object" || !("__html" in e))
          throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
        var r = e.__html;
        r != null && (ue(r), n.push(H("" + r)));
      }
    }
    __name(Ft, "Ft");
    var Lt = false, Yr = false, xr = false, rn = false, Gr = false, Xr = false, kr = false;
    function Jr(n, e) {
      {
        var t = n[e];
        if (t != null) {
          var r = Ae(t);
          n.multiple && !r ? l("The `%s` prop supplied to <select> must be an array if `multiple` is true.", e) : !n.multiple && r && l("The `%s` prop supplied to <select> must be a scalar value if `multiple` is false.", e);
        }
      }
    }
    __name(Jr, "Jr");
    function Co(n, e, t) {
      ar("select", e), Jr(e, "value"), Jr(e, "defaultValue"), e.value !== void 0 && e.defaultValue !== void 0 && !xr && (l("Select elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled select element and remove one of these props. More info: https://reactjs.org/link/controlled-components"), xr = true), n.push(Yt("select"));
      var r = null, a = null;
      for (var f in e)
        if (xe.call(e, f)) {
          var v = e[f];
          if (v == null)
            continue;
          switch (f) {
            case "children":
              r = v;
              break;
            case "dangerouslySetInnerHTML":
              a = v;
              break;
            case "defaultValue":
            case "value":
              break;
            default:
              we(n, t, f, v);
              break;
          }
        }
      return n.push(Xe), Ft(n, a, r), r;
    }
    __name(Co, "Co");
    function Zn(n) {
      var e = "";
      return o.Children.forEach(n, function(t) {
        t != null && (e += t, !Gr && typeof t != "string" && typeof t != "number" && (Gr = true, l("Cannot infer the option value of complex children. Pass a `value` prop or use a plain string as children to <option>.")));
      }), e;
    }
    __name(Zn, "Zn");
    var vn = B(' selected=""');
    function Cr(n, e, t, r) {
      var a = r.selectedValue;
      n.push(Yt("option"));
      var f = null, v = null, b = null, R = null;
      for (var F in e)
        if (xe.call(e, F)) {
          var Y = e[F];
          if (Y == null)
            continue;
          switch (F) {
            case "children":
              f = Y;
              break;
            case "selected":
              b = Y, kr || (l("Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>."), kr = true);
              break;
            case "dangerouslySetInnerHTML":
              R = Y;
              break;
            // eslint-disable-next-line-no-fallthrough
            case "value":
              v = Y;
            // We intentionally fallthrough to also set the attribute on the node.
            // eslint-disable-next-line-no-fallthrough
            default:
              we(n, t, F, Y);
              break;
          }
        }
      if (a != null) {
        var Z;
        if (v !== null ? (Ce(v, "value"), Z = "" + v) : (R !== null && (Xr || (Xr = true, l("Pass a `value` prop if you set dangerouslyInnerHTML so React knows which value should be selected."))), Z = Zn(f)), Ae(a))
          for (var ne = 0; ne < a.length; ne++) {
            Ce(a[ne], "value");
            var Fe = "" + a[ne];
            if (Fe === Z) {
              n.push(vn);
              break;
            }
          }
        else
          Ce(a, "select.value"), "" + a === Z && n.push(vn);
      } else b && n.push(vn);
      return n.push(Xe), Ft(n, R, f), f;
    }
    __name(Cr, "Cr");
    function Eo(n, e, t) {
      ar("input", e), e.checked !== void 0 && e.defaultChecked !== void 0 && !Yr && (l("%s contains an input of type %s with both checked and defaultChecked props. Input elements must be either controlled or uncontrolled (specify either the checked prop, or the defaultChecked prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", "A component", e.type), Yr = true), e.value !== void 0 && e.defaultValue !== void 0 && !Lt && (l("%s contains an input of type %s with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", "A component", e.type), Lt = true), n.push(Yt("input"));
      var r = null, a = null, f = null, v = null;
      for (var b in e)
        if (xe.call(e, b)) {
          var R = e[b];
          if (R == null)
            continue;
          switch (b) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw new Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            // eslint-disable-next-line-no-fallthrough
            case "defaultChecked":
              v = R;
              break;
            case "defaultValue":
              a = R;
              break;
            case "checked":
              f = R;
              break;
            case "value":
              r = R;
              break;
            default:
              we(n, t, b, R);
              break;
          }
        }
      return f !== null ? we(n, t, "checked", f) : v !== null && we(n, t, "checked", v), r !== null ? we(n, t, "value", r) : a !== null && we(n, t, "value", a), n.push(Rt), null;
    }
    __name(Eo, "Eo");
    function Ar(n, e, t) {
      ar("textarea", e), e.value !== void 0 && e.defaultValue !== void 0 && !rn && (l("Textarea elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled textarea and remove one of these props. More info: https://reactjs.org/link/controlled-components"), rn = true), n.push(Yt("textarea"));
      var r = null, a = null, f = null;
      for (var v in e)
        if (xe.call(e, v)) {
          var b = e[v];
          if (b == null)
            continue;
          switch (v) {
            case "children":
              f = b;
              break;
            case "value":
              r = b;
              break;
            case "defaultValue":
              a = b;
              break;
            case "dangerouslySetInnerHTML":
              throw new Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
            // eslint-disable-next-line-no-fallthrough
            default:
              we(n, t, v, b);
              break;
          }
        }
      if (r === null && a !== null && (r = a), n.push(Xe), f != null) {
        if (l("Use the `defaultValue` or `value` props instead of setting children on <textarea>."), r != null)
          throw new Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
        if (Ae(f)) {
          if (f.length > 1)
            throw new Error("<textarea> can only have at most one child.");
          ue(f[0]), r = "" + f[0];
        }
        ue(f), r = "" + f;
      }
      return typeof r == "string" && r[0] === `
` && n.push(Zr), r !== null && (Ce(r, "value"), n.push(H(Ht("" + r)))), null;
    }
    __name(Ar, "Ar");
    function En(n, e, t, r) {
      n.push(Yt(t));
      for (var a in e)
        if (xe.call(e, a)) {
          var f = e[a];
          if (f == null)
            continue;
          switch (a) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw new Error(t + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
            // eslint-disable-next-line-no-fallthrough
            default:
              we(n, r, a, f);
              break;
          }
        }
      return n.push(Rt), null;
    }
    __name(En, "En");
    function nn(n, e, t) {
      n.push(Yt("menuitem"));
      for (var r in e)
        if (xe.call(e, r)) {
          var a = e[r];
          if (a == null)
            continue;
          switch (r) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw new Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
            // eslint-disable-next-line-no-fallthrough
            default:
              we(n, t, r, a);
              break;
          }
        }
      return n.push(Xe), null;
    }
    __name(nn, "nn");
    function it(n, e, t) {
      n.push(Yt("title"));
      var r = null;
      for (var a in e)
        if (xe.call(e, a)) {
          var f = e[a];
          if (f == null)
            continue;
          switch (a) {
            case "children":
              r = f;
              break;
            case "dangerouslySetInnerHTML":
              throw new Error("`dangerouslySetInnerHTML` does not make sense on <title>.");
            // eslint-disable-next-line-no-fallthrough
            default:
              we(n, t, a, f);
              break;
          }
        }
      n.push(Xe);
      {
        var v = Array.isArray(r) && r.length < 2 ? r[0] || null : r;
        Array.isArray(r) && r.length > 1 ? l("A title element received an array with more than 1 element as children. In browsers title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering") : v != null && v.$$typeof != null ? l("A title element received a React element for children. In the browser title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering") : v != null && typeof v != "string" && typeof v != "number" && l("A title element received a value that was not a string or number for children. In the browser title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering");
      }
      return r;
    }
    __name(it, "it");
    function or(n, e, t, r) {
      n.push(Yt(t));
      var a = null, f = null;
      for (var v in e)
        if (xe.call(e, v)) {
          var b = e[v];
          if (b == null)
            continue;
          switch (v) {
            case "children":
              a = b;
              break;
            case "dangerouslySetInnerHTML":
              f = b;
              break;
            default:
              we(n, r, v, b);
              break;
          }
        }
      return n.push(Xe), Ft(n, f, a), typeof a == "string" ? (n.push(H(Ht(a))), null) : a;
    }
    __name(or, "or");
    function mn(n, e, t, r) {
      n.push(Yt(t));
      var a = null, f = null;
      for (var v in e)
        if (xe.call(e, v)) {
          var b = e[v];
          if (b == null)
            continue;
          switch (v) {
            case "children":
              a = b;
              break;
            case "dangerouslySetInnerHTML":
              f = b;
              break;
            case "style":
              O(n, r, b);
              break;
            case "suppressContentEditableWarning":
            case "suppressHydrationWarning":
              break;
            default:
              V(v) && typeof b != "function" && typeof b != "symbol" && n.push(N, H(v), Q, H(gt(b)), be);
              break;
          }
        }
      return n.push(Xe), Ft(n, f, a), a;
    }
    __name(mn, "mn");
    var Zr = B(`
`);
    function dr(n, e, t, r) {
      n.push(Yt(t));
      var a = null, f = null;
      for (var v in e)
        if (xe.call(e, v)) {
          var b = e[v];
          if (b == null)
            continue;
          switch (v) {
            case "children":
              a = b;
              break;
            case "dangerouslySetInnerHTML":
              f = b;
              break;
            default:
              we(n, r, v, b);
              break;
          }
        }
      if (n.push(Xe), f != null) {
        if (a != null)
          throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        if (typeof f != "object" || !("__html" in f))
          throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
        var R = f.__html;
        R != null && (typeof R == "string" && R.length > 0 && R[0] === `
` ? n.push(Zr, H(R)) : (ue(R), n.push(H("" + R))));
      }
      return typeof a == "string" && a[0] === `
` && n.push(Zr), a;
    }
    __name(dr, "dr");
    var un = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/, Er = /* @__PURE__ */ new Map();
    function Yt(n) {
      var e = Er.get(n);
      if (e === void 0) {
        if (!un.test(n))
          throw new Error("Invalid tag: " + n);
        e = B("<" + n), Er.set(n, e);
      }
      return e;
    }
    __name(Yt, "Yt");
    var Dn = B("<!DOCTYPE html>");
    function gn(n, e, t, r, a) {
      switch (Ct(e, t), yr(e, t), dn(e, t, null), !t.suppressContentEditableWarning && t.contentEditable && t.children != null && l("A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional."), a.insertionMode !== tr && a.insertionMode !== rr && e.indexOf("-") === -1 && typeof t.is != "string" && e.toLowerCase() !== e && l("<%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.", e), e) {
        // Special tags
        case "select":
          return Co(n, t, r);
        case "option":
          return Cr(n, t, r, a);
        case "textarea":
          return Ar(n, t, r);
        case "input":
          return Eo(n, t, r);
        case "menuitem":
          return nn(n, t, r);
        case "title":
          return it(n, t, r);
        // Newline eating tags
        case "listing":
        case "pre":
          return dr(n, t, e, r);
        // Omitted close tags
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "img":
        case "keygen":
        case "link":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
          return En(n, t, e, r);
        // These are reserved SVG and MathML elements, that are never custom elements.
        // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return or(n, t, e, r);
        case "html":
          return a.insertionMode === ut && n.push(Dn), or(n, t, e, r);
        default:
          return e.indexOf("-") === -1 && typeof t.is != "string" ? or(n, t, e, r) : mn(n, t, e, r);
      }
    }
    __name(gn, "gn");
    var Qn = B("</"), Rn = B(">");
    function m(n, e, t) {
      switch (e) {
        // Omitted close tags
        // TODO: Instead of repeating this switch we could try to pass a flag from above.
        // That would require returning a tuple. Which might be ok if it gets inlined.
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "img":
        case "input":
        case "keygen":
        case "link":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
          break;
        default:
          n.push(Qn, H(e), Rn);
      }
    }
    __name(m, "m");
    function _(n, e) {
      for (var t = e.bootstrapChunks, r = 0; r < t.length - 1; r++)
        I(n, t[r]);
      return r < t.length ? $(n, t[r]) : true;
    }
    __name(_, "_");
    var U = B('<template id="'), z = B('"></template>');
    function ee(n, e, t) {
      I(n, U), I(n, e.placeholderPrefix);
      var r = H(t.toString(16));
      return I(n, r), $(n, z);
    }
    __name(ee, "ee");
    var ke = B("<!--$-->"), fe = B('<!--$?--><template id="'), Oe = B('"></template>'), je = B("<!--$!-->"), Ke = B("<!--/$-->"), st = B("<template"), qe = B('"'), ot = B(' data-dgst="'), pt = B(' data-msg="'), _t = B(' data-stck="'), yn = B("></template>");
    function Tn(n, e) {
      return $(n, ke);
    }
    __name(Tn, "Tn");
    function bn(n, e, t) {
      if (I(n, fe), t === null)
        throw new Error("An ID must have been assigned before we can complete the boundary.");
      return I(n, t), $(n, Oe);
    }
    __name(bn, "bn");
    function Gt(n, e, t, r, a) {
      var f;
      return f = $(n, je), I(n, st), t && (I(n, ot), I(n, H(gt(t))), I(n, qe)), r && (I(n, pt), I(n, H(gt(r))), I(n, qe)), a && (I(n, _t), I(n, H(gt(a))), I(n, qe)), f = $(n, yn), f;
    }
    __name(Gt, "Gt");
    function Mn(n, e) {
      return $(n, Ke);
    }
    __name(Mn, "Mn");
    function _n(n, e) {
      return $(n, Ke);
    }
    __name(_n, "_n");
    function Kn(n, e) {
      return $(n, Ke);
    }
    __name(Kn, "Kn");
    var qn = B('<div hidden id="'), eo = B('">'), sa = B("</div>"), la = B('<svg aria-hidden="true" style="display:none" id="'), to = B('">'), ro = B("</svg>"), ua = B('<math aria-hidden="true" style="display:none" id="'), ca = B('">'), fa = B("</math>"), Ro = B('<table hidden id="'), da = B('">'), u = B("</table>"), h = B('<table hidden><tbody id="'), y = B('">'), k = B("</tbody></table>"), L = B('<table hidden><tr id="'), D = B('">'), W = B("</tr></table>"), K = B('<table hidden><colgroup id="'), _e = B('">'), Be = B("</colgroup></table>");
    function Le(n, e, t, r) {
      switch (t.insertionMode) {
        case ut:
        case ct:
          return I(n, qn), I(n, e.segmentPrefix), I(n, H(r.toString(16))), $(n, eo);
        case tr:
          return I(n, la), I(n, e.segmentPrefix), I(n, H(r.toString(16))), $(n, to);
        case rr:
          return I(n, ua), I(n, e.segmentPrefix), I(n, H(r.toString(16))), $(n, ca);
        case Wr:
          return I(n, Ro), I(n, e.segmentPrefix), I(n, H(r.toString(16))), $(n, da);
        // TODO: For the rest of these, there will be extra wrapper nodes that never
        // get deleted from the document. We need to delete the table too as part
        // of the injected scripts. They are invisible though so it's not too terrible
        // and it's kind of an edge case to suspend in a table. Totally supported though.
        case Sr:
          return I(n, h), I(n, e.segmentPrefix), I(n, H(r.toString(16))), $(n, y);
        case nr:
          return I(n, L), I(n, e.segmentPrefix), I(n, H(r.toString(16))), $(n, D);
        case cr:
          return I(n, K), I(n, e.segmentPrefix), I(n, H(r.toString(16))), $(n, _e);
        default:
          throw new Error("Unknown insertion mode. This is a bug in React.");
      }
    }
    __name(Le, "Le");
    function ht(n, e) {
      switch (e.insertionMode) {
        case ut:
        case ct:
          return $(n, sa);
        case tr:
          return $(n, ro);
        case rr:
          return $(n, fa);
        case Wr:
          return $(n, u);
        case Sr:
          return $(n, k);
        case nr:
          return $(n, W);
        case cr:
          return $(n, Be);
        default:
          throw new Error("Unknown insertion mode. This is a bug in React.");
      }
    }
    __name(ht, "ht");
    var pr = "function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)}", Or = 'function $RC(a,b){a=document.getElementById(a);b=document.getElementById(b);b.parentNode.removeChild(b);if(a){a=a.previousSibling;var f=a.parentNode,c=a.nextSibling,e=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d)if(0===e)break;else e--;else"$"!==d&&"$?"!==d&&"$!"!==d||e++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;b.firstChild;)f.insertBefore(b.firstChild,c);a.data="$";a._reactRetry&&a._reactRetry()}}', Fr = 'function $RX(b,c,d,e){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),b._reactRetry&&b._reactRetry())}', no = B(pr + ';$RS("'), pa = B('$RS("'), jn = B('","'), el = B('")<\/script>');
    function tl(n, e, t) {
      I(n, e.startInlineScript), e.sentCompleteSegmentFunction ? I(n, pa) : (e.sentCompleteSegmentFunction = true, I(n, no)), I(n, e.segmentPrefix);
      var r = H(t.toString(16));
      return I(n, r), I(n, jn), I(n, e.placeholderPrefix), I(n, r), $(n, el);
    }
    __name(tl, "tl");
    var si = B(Or + ';$RC("'), rl = B('$RC("'), nl = B('","'), Ki = B('")<\/script>');
    function qi(n, e, t, r) {
      if (I(n, e.startInlineScript), e.sentCompleteBoundaryFunction ? I(n, rl) : (e.sentCompleteBoundaryFunction = true, I(n, si)), t === null)
        throw new Error("An ID must have been assigned before we can complete the boundary.");
      var a = H(r.toString(16));
      return I(n, t), I(n, nl), I(n, e.segmentPrefix), I(n, a), $(n, Ki);
    }
    __name(qi, "qi");
    var ol = B(Fr + ';$RX("'), al = B('$RX("'), il = B('"'), sl = B(")<\/script>"), Rr = B(",");
    function ll(n, e, t, r, a, f) {
      if (I(n, e.startInlineScript), e.sentClientRenderFunction ? I(n, al) : (e.sentClientRenderFunction = true, I(n, ol)), t === null)
        throw new Error("An ID must have been assigned before we can complete the boundary.");
      return I(n, t), I(n, il), (r || a || f) && (I(n, Rr), I(n, H(ha(r || "")))), (a || f) && (I(n, Rr), I(n, H(ha(a || "")))), f && (I(n, Rr), I(n, H(ha(f)))), $(n, sl);
    }
    __name(ll, "ll");
    var es = /[<\u2028\u2029]/g;
    function ha(n) {
      var e = JSON.stringify(n);
      return e.replace(es, function(t) {
        switch (t) {
          // santizing breaking out of strings and script tags
          case "<":
            return "\\u003c";
          case "\u2028":
            return "\\u2028";
          case "\u2029":
            return "\\u2029";
          default:
            throw new Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
        }
      });
    }
    __name(ha, "ha");
    var Dr = Object.assign, ts = Symbol.for("react.element"), va = Symbol.for("react.portal"), ma = Symbol.for("react.fragment"), ga = Symbol.for("react.strict_mode"), ya = Symbol.for("react.profiler"), To = Symbol.for("react.provider"), _o = Symbol.for("react.context"), oo = Symbol.for("react.forward_ref"), li = Symbol.for("react.suspense"), ui = Symbol.for("react.suspense_list"), ci = Symbol.for("react.memo"), ba = Symbol.for("react.lazy"), rs = Symbol.for("react.scope"), ul = Symbol.for("react.debug_trace_mode"), cl = Symbol.for("react.legacy_hidden"), fl = Symbol.for("react.default_value"), fi = Symbol.iterator, kt = "@@iterator";
    function Po(n) {
      if (n === null || typeof n != "object")
        return null;
      var e = fi && n[fi] || n[kt];
      return typeof e == "function" ? e : null;
    }
    __name(Po, "Po");
    function ns(n, e, t) {
      var r = n.displayName;
      if (r)
        return r;
      var a = e.displayName || e.name || "";
      return a !== "" ? t + "(" + a + ")" : t;
    }
    __name(ns, "ns");
    function di(n) {
      return n.displayName || "Context";
    }
    __name(di, "di");
    function wt(n) {
      if (n == null)
        return null;
      if (typeof n.tag == "number" && l("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof n == "function")
        return n.displayName || n.name || null;
      if (typeof n == "string")
        return n;
      switch (n) {
        case ma:
          return "Fragment";
        case va:
          return "Portal";
        case ya:
          return "Profiler";
        case ga:
          return "StrictMode";
        case li:
          return "Suspense";
        case ui:
          return "SuspenseList";
      }
      if (typeof n == "object")
        switch (n.$$typeof) {
          case _o:
            var e = n;
            return di(e) + ".Consumer";
          case To:
            var t = n;
            return di(t._context) + ".Provider";
          case oo:
            return ns(n, n.render, "ForwardRef");
          case ci:
            var r = n.displayName || null;
            return r !== null ? r : wt(n.type) || "Memo";
          case ba: {
            var a = n, f = a._payload, v = a._init;
            try {
              return wt(v(f));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    __name(wt, "wt");
    var ao = 0, pi, hi, vi, mi, os, as, wa;
    function Sa() {
    }
    __name(Sa, "Sa");
    Sa.__reactDisabledLog = true;
    function Io() {
      {
        if (ao === 0) {
          pi = console.log, hi = console.info, vi = console.warn, mi = console.error, os = console.group, as = console.groupCollapsed, wa = console.groupEnd;
          var n = {
            configurable: true,
            enumerable: true,
            value: Sa,
            writable: true
          };
          Object.defineProperties(console, {
            info: n,
            log: n,
            warn: n,
            error: n,
            group: n,
            groupCollapsed: n,
            groupEnd: n
          });
        }
        ao++;
      }
    }
    __name(Io, "Io");
    function gi() {
      {
        if (ao--, ao === 0) {
          var n = {
            configurable: true,
            enumerable: true,
            writable: true
          };
          Object.defineProperties(console, {
            log: Dr({}, n, {
              value: pi
            }),
            info: Dr({}, n, {
              value: hi
            }),
            warn: Dr({}, n, {
              value: vi
            }),
            error: Dr({}, n, {
              value: mi
            }),
            group: Dr({}, n, {
              value: os
            }),
            groupCollapsed: Dr({}, n, {
              value: as
            }),
            groupEnd: Dr({}, n, {
              value: wa
            })
          });
        }
        ao < 0 && l("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    __name(gi, "gi");
    var io = c.ReactCurrentDispatcher, yi;
    function Ln(n, e, t) {
      {
        if (yi === void 0)
          try {
            throw Error();
          } catch (a) {
            var r = a.stack.trim().match(/\n( *(at )?)/);
            yi = r && r[1] || "";
          }
        return `
` + yi + n;
      }
    }
    __name(Ln, "Ln");
    var bi = false, Ao;
    {
      var dl = typeof WeakMap == "function" ? WeakMap : Map;
      Ao = new dl();
    }
    function Oo(n, e) {
      if (!n || bi)
        return "";
      {
        var t = Ao.get(n);
        if (t !== void 0)
          return t;
      }
      var r;
      bi = true;
      var a = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var f;
      f = io.current, io.current = null, Io();
      try {
        if (e) {
          var v = /* @__PURE__ */ __name(function() {
            throw Error();
          }, "v");
          if (Object.defineProperty(v.prototype, "props", {
            set: /* @__PURE__ */ __name(function() {
              throw Error();
            }, "set")
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(v, []);
            } catch (tt) {
              r = tt;
            }
            Reflect.construct(n, [], v);
          } else {
            try {
              v.call();
            } catch (tt) {
              r = tt;
            }
            n.call(v.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (tt) {
            r = tt;
          }
          n();
        }
      } catch (tt) {
        if (tt && r && typeof tt.stack == "string") {
          for (var b = tt.stack.split(`
`), R = r.stack.split(`
`), F = b.length - 1, Y = R.length - 1; F >= 1 && Y >= 0 && b[F] !== R[Y]; )
            Y--;
          for (; F >= 1 && Y >= 0; F--, Y--)
            if (b[F] !== R[Y]) {
              if (F !== 1 || Y !== 1)
                do
                  if (F--, Y--, Y < 0 || b[F] !== R[Y]) {
                    var Z = `
` + b[F].replace(" at new ", " at ");
                    return n.displayName && Z.includes("<anonymous>") && (Z = Z.replace("<anonymous>", n.displayName)), typeof n == "function" && Ao.set(n, Z), Z;
                  }
                while (F >= 1 && Y >= 0);
              break;
            }
        }
      } finally {
        bi = false, io.current = f, gi(), Error.prepareStackTrace = a;
      }
      var ne = n ? n.displayName || n.name : "", Fe = ne ? Ln(ne) : "";
      return typeof n == "function" && Ao.set(n, Fe), Fe;
    }
    __name(Oo, "Oo");
    function is(n, e, t) {
      return Oo(n, true);
    }
    __name(is, "is");
    function wi(n, e, t) {
      return Oo(n, false);
    }
    __name(wi, "wi");
    function xa(n) {
      var e = n.prototype;
      return !!(e && e.isReactComponent);
    }
    __name(xa, "xa");
    function ka(n, e, t) {
      if (n == null)
        return "";
      if (typeof n == "function")
        return Oo(n, xa(n));
      if (typeof n == "string")
        return Ln(n);
      switch (n) {
        case li:
          return Ln("Suspense");
        case ui:
          return Ln("SuspenseList");
      }
      if (typeof n == "object")
        switch (n.$$typeof) {
          case oo:
            return wi(n.render);
          case ci:
            return ka(n.type, e, t);
          case ba: {
            var r = n, a = r._payload, f = r._init;
            try {
              return ka(f(a), e, t);
            } catch {
            }
          }
        }
      return "";
    }
    __name(ka, "ka");
    var Ca = {}, Fo = c.ReactDebugCurrentFrame;
    function Do(n) {
      if (n) {
        var e = n._owner, t = ka(n.type, n._source, e ? e.type : null);
        Fo.setExtraStackFrame(t);
      } else
        Fo.setExtraStackFrame(null);
    }
    __name(Do, "Do");
    function ss(n, e, t, r, a) {
      {
        var f = Function.call.bind(xe);
        for (var v in n)
          if (f(n, v)) {
            var b = void 0;
            try {
              if (typeof n[v] != "function") {
                var R = Error((r || "React class") + ": " + t + " type `" + v + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof n[v] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw R.name = "Invariant Violation", R;
              }
              b = n[v](e, v, r, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (F) {
              b = F;
            }
            b && !(b instanceof Error) && (Do(a), l("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", r || "React class", t, v, typeof b), Do(null)), b instanceof Error && !(b.message in Ca) && (Ca[b.message] = true, Do(a), l("Failed %s type: %s", t, b.message), Do(null));
          }
      }
    }
    __name(ss, "ss");
    var Un;
    Un = {};
    var Ea = {};
    Object.freeze(Ea);
    function Pn(n, e) {
      {
        var t = n.contextTypes;
        if (!t)
          return Ea;
        var r = {};
        for (var a in t)
          r[a] = e[a];
        {
          var f = wt(n) || "Unknown";
          ss(t, r, "context", f);
        }
        return r;
      }
    }
    __name(Pn, "Pn");
    function Si(n, e, t, r) {
      {
        if (typeof n.getChildContext != "function") {
          {
            var a = wt(e) || "Unknown";
            Un[a] || (Un[a] = true, l("%s.childContextTypes is specified but there is no getChildContext() method on the instance. You can either define getChildContext() on %s or remove childContextTypes from it.", a, a));
          }
          return t;
        }
        var f = n.getChildContext();
        for (var v in f)
          if (!(v in r))
            throw new Error((wt(e) || "Unknown") + '.getChildContext(): key "' + v + '" is not defined in childContextTypes.');
        {
          var b = wt(e) || "Unknown";
          ss(r, f, "child context", b);
        }
        return Dr({}, t, f);
      }
    }
    __name(Si, "Si");
    var Bn;
    Bn = {};
    var Ra = null, In = null;
    function Ta(n) {
      n.context._currentValue = n.parentValue;
    }
    __name(Ta, "Ta");
    function _a(n) {
      n.context._currentValue = n.value;
    }
    __name(_a, "_a");
    function Mo(n, e) {
      if (n !== e) {
        Ta(n);
        var t = n.parent, r = e.parent;
        if (t === null) {
          if (r !== null)
            throw new Error("The stacks must reach the root at the same time. This is a bug in React.");
        } else {
          if (r === null)
            throw new Error("The stacks must reach the root at the same time. This is a bug in React.");
          Mo(t, r);
        }
        _a(e);
      }
    }
    __name(Mo, "Mo");
    function jo(n) {
      Ta(n);
      var e = n.parent;
      e !== null && jo(e);
    }
    __name(jo, "jo");
    function ls(n) {
      var e = n.parent;
      e !== null && ls(e), _a(n);
    }
    __name(ls, "ls");
    function us(n, e) {
      Ta(n);
      var t = n.parent;
      if (t === null)
        throw new Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
      t.depth === e.depth ? Mo(t, e) : us(t, e);
    }
    __name(us, "us");
    function cs(n, e) {
      var t = e.parent;
      if (t === null)
        throw new Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
      n.depth === t.depth ? Mo(n, t) : cs(n, t), _a(e);
    }
    __name(cs, "cs");
    function An(n) {
      var e = In, t = n;
      e !== t && (e === null ? ls(t) : t === null ? jo(e) : e.depth === t.depth ? Mo(e, t) : e.depth > t.depth ? us(e, t) : cs(e, t), In = t);
    }
    __name(An, "An");
    function xi(n, e) {
      var t;
      t = n._currentValue, n._currentValue = e, n._currentRenderer !== void 0 && n._currentRenderer !== null && n._currentRenderer !== Bn && l("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported."), n._currentRenderer = Bn;
      var r = In, a = {
        parent: r,
        depth: r === null ? 0 : r.depth + 1,
        context: n,
        parentValue: t,
        value: e
      };
      return In = a, a;
    }
    __name(xi, "xi");
    function pl(n) {
      var e = In;
      if (e === null)
        throw new Error("Tried to pop a Context at the root of the app. This is a bug in React.");
      e.context !== n && l("The parent context is not the expected context. This is probably a bug in React.");
      {
        var t = e.parentValue;
        t === fl ? e.context._currentValue = e.context._defaultValue : e.context._currentValue = t, n._currentRenderer !== void 0 && n._currentRenderer !== null && n._currentRenderer !== Bn && l("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported."), n._currentRenderer = Bn;
      }
      return In = e.parent;
    }
    __name(pl, "pl");
    function fs() {
      return In;
    }
    __name(fs, "fs");
    function so(n) {
      var e = n._currentValue;
      return e;
    }
    __name(so, "so");
    function Lo(n) {
      return n._reactInternals;
    }
    __name(Lo, "Lo");
    function ki(n, e) {
      n._reactInternals = e;
    }
    __name(ki, "ki");
    var Pa = {}, Ia = {}, Aa, lo, Uo, Bo, Oa, No, Fa, Da, Ci;
    {
      Aa = /* @__PURE__ */ new Set(), lo = /* @__PURE__ */ new Set(), Uo = /* @__PURE__ */ new Set(), Fa = /* @__PURE__ */ new Set(), Bo = /* @__PURE__ */ new Set(), Da = /* @__PURE__ */ new Set(), Ci = /* @__PURE__ */ new Set();
      var ds = /* @__PURE__ */ new Set();
      No = /* @__PURE__ */ __name(function(n, e) {
        if (!(n === null || typeof n == "function")) {
          var t = e + "_" + n;
          ds.has(t) || (ds.add(t), l("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", e, n));
        }
      }, "No"), Oa = /* @__PURE__ */ __name(function(n, e) {
        if (e === void 0) {
          var t = wt(n) || "Component";
          Bo.has(t) || (Bo.add(t), l("%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. You have returned undefined.", t));
        }
      }, "Oa");
    }
    function ps(n, e) {
      {
        var t = n.constructor, r = t && wt(t) || "ReactClass", a = r + "." + e;
        if (Pa[a])
          return;
        l(`%s(...): Can only update a mounting component. This usually means you called %s() outside componentWillMount() on the server. This is a no-op.

Please check the code for the %s component.`, e, e, r), Pa[a] = true;
      }
    }
    __name(ps, "ps");
    var hs = {
      isMounted: /* @__PURE__ */ __name(function(n) {
        return false;
      }, "isMounted"),
      enqueueSetState: /* @__PURE__ */ __name(function(n, e, t) {
        var r = Lo(n);
        r.queue === null ? ps(n, "setState") : (r.queue.push(e), t != null && No(t, "setState"));
      }, "enqueueSetState"),
      enqueueReplaceState: /* @__PURE__ */ __name(function(n, e, t) {
        var r = Lo(n);
        r.replace = true, r.queue = [e], t != null && No(t, "setState");
      }, "enqueueReplaceState"),
      enqueueForceUpdate: /* @__PURE__ */ __name(function(n, e) {
        var t = Lo(n);
        t.queue === null ? ps(n, "forceUpdate") : e != null && No(e, "setState");
      }, "enqueueForceUpdate")
    };
    function hl(n, e, t, r, a) {
      var f = t(a, r);
      Oa(e, f);
      var v = f == null ? r : Dr({}, r, f);
      return v;
    }
    __name(hl, "hl");
    function vs(n, e, t) {
      var r = Ea, a = n.contextType;
      if ("contextType" in n) {
        var f = (
          // Allow null for conditional declaration
          a === null || a !== void 0 && a.$$typeof === _o && a._context === void 0
        );
        if (!f && !Ci.has(n)) {
          Ci.add(n);
          var v = "";
          a === void 0 ? v = " However, it is set to undefined. This can be caused by a typo or by mixing up named and default imports. This can also happen due to a circular dependency, so try moving the createContext() call to a separate file." : typeof a != "object" ? v = " However, it is set to a " + typeof a + "." : a.$$typeof === To ? v = " Did you accidentally pass the Context.Provider instead?" : a._context !== void 0 ? v = " Did you accidentally pass the Context.Consumer instead?" : v = " However, it is set to an object with keys {" + Object.keys(a).join(", ") + "}.", l("%s defines an invalid contextType. contextType should point to the Context object returned by React.createContext().%s", wt(n) || "Component", v);
        }
      }
      typeof a == "object" && a !== null ? r = so(a) : r = t;
      var b = new n(e, r);
      {
        if (typeof n.getDerivedStateFromProps == "function" && (b.state === null || b.state === void 0)) {
          var R = wt(n) || "Component";
          Aa.has(R) || (Aa.add(R), l("`%s` uses `getDerivedStateFromProps` but its initial state is %s. This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.", R, b.state === null ? "null" : "undefined", R));
        }
        if (typeof n.getDerivedStateFromProps == "function" || typeof b.getSnapshotBeforeUpdate == "function") {
          var F = null, Y = null, Z = null;
          if (typeof b.componentWillMount == "function" && b.componentWillMount.__suppressDeprecationWarning !== true ? F = "componentWillMount" : typeof b.UNSAFE_componentWillMount == "function" && (F = "UNSAFE_componentWillMount"), typeof b.componentWillReceiveProps == "function" && b.componentWillReceiveProps.__suppressDeprecationWarning !== true ? Y = "componentWillReceiveProps" : typeof b.UNSAFE_componentWillReceiveProps == "function" && (Y = "UNSAFE_componentWillReceiveProps"), typeof b.componentWillUpdate == "function" && b.componentWillUpdate.__suppressDeprecationWarning !== true ? Z = "componentWillUpdate" : typeof b.UNSAFE_componentWillUpdate == "function" && (Z = "UNSAFE_componentWillUpdate"), F !== null || Y !== null || Z !== null) {
            var ne = wt(n) || "Component", Fe = typeof n.getDerivedStateFromProps == "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
            Uo.has(ne) || (Uo.add(ne), l(`Unsafe legacy lifecycles will not be called for components using new component APIs.

%s uses %s but also contains the following legacy lifecycles:%s%s%s

The above lifecycles should be removed. Learn more about this warning here:
https://reactjs.org/link/unsafe-component-lifecycles`, ne, Fe, F !== null ? `
  ` + F : "", Y !== null ? `
  ` + Y : "", Z !== null ? `
  ` + Z : ""));
          }
        }
      }
      return b;
    }
    __name(vs, "vs");
    function vl(n, e, t) {
      {
        var r = wt(e) || "Component", a = n.render;
        a || (e.prototype && typeof e.prototype.render == "function" ? l("%s(...): No `render` method found on the returned component instance: did you accidentally return an object from the constructor?", r) : l("%s(...): No `render` method found on the returned component instance: you may have forgotten to define `render`.", r)), n.getInitialState && !n.getInitialState.isReactClassApproved && !n.state && l("getInitialState was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Did you mean to define a state property instead?", r), n.getDefaultProps && !n.getDefaultProps.isReactClassApproved && l("getDefaultProps was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Use a static property to define defaultProps instead.", r), n.propTypes && l("propTypes was defined as an instance property on %s. Use a static property to define propTypes instead.", r), n.contextType && l("contextType was defined as an instance property on %s. Use a static property to define contextType instead.", r), n.contextTypes && l("contextTypes was defined as an instance property on %s. Use a static property to define contextTypes instead.", r), e.contextType && e.contextTypes && !Da.has(e) && (Da.add(e), l("%s declares both contextTypes and contextType static properties. The legacy contextTypes property will be ignored.", r)), typeof n.componentShouldUpdate == "function" && l("%s has a method called componentShouldUpdate(). Did you mean shouldComponentUpdate()? The name is phrased as a question because the function is expected to return a value.", r), e.prototype && e.prototype.isPureReactComponent && typeof n.shouldComponentUpdate < "u" && l("%s has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.", wt(e) || "A pure component"), typeof n.componentDidUnmount == "function" && l("%s has a method called componentDidUnmount(). But there is no such lifecycle method. Did you mean componentWillUnmount()?", r), typeof n.componentDidReceiveProps == "function" && l("%s has a method called componentDidReceiveProps(). But there is no such lifecycle method. If you meant to update the state in response to changing props, use componentWillReceiveProps(). If you meant to fetch data or run side-effects or mutations after React has updated the UI, use componentDidUpdate().", r), typeof n.componentWillRecieveProps == "function" && l("%s has a method called componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", r), typeof n.UNSAFE_componentWillRecieveProps == "function" && l("%s has a method called UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?", r);
        var f = n.props !== t;
        n.props !== void 0 && f && l("%s(...): When calling super() in `%s`, make sure to pass up the same props that your component's constructor was passed.", r, r), n.defaultProps && l("Setting defaultProps as an instance property on %s is not supported and will be ignored. Instead, define defaultProps as a static property on %s.", r, r), typeof n.getSnapshotBeforeUpdate == "function" && typeof n.componentDidUpdate != "function" && !lo.has(e) && (lo.add(e), l("%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.", wt(e))), typeof n.getDerivedStateFromProps == "function" && l("%s: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.", r), typeof n.getDerivedStateFromError == "function" && l("%s: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.", r), typeof e.getSnapshotBeforeUpdate == "function" && l("%s: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.", r);
        var v = n.state;
        v && (typeof v != "object" || Ae(v)) && l("%s.state: must be set to an object or null", r), typeof n.getChildContext == "function" && typeof e.childContextTypes != "object" && l("%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().", r);
      }
    }
    __name(vl, "vl");
    function ml(n, e) {
      var t = e.state;
      if (typeof e.componentWillMount == "function") {
        if (e.componentWillMount.__suppressDeprecationWarning !== true) {
          var r = wt(n) || "Unknown";
          Ia[r] || (d(
            // keep this warning in sync with ReactStrictModeWarning.js
            `componentWillMount has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move code from componentWillMount to componentDidMount (preferred in most cases) or the constructor.

Please update the following components: %s`,
            r
          ), Ia[r] = true);
        }
        e.componentWillMount();
      }
      typeof e.UNSAFE_componentWillMount == "function" && e.UNSAFE_componentWillMount(), t !== e.state && (l("%s.componentWillMount(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", wt(n) || "Component"), hs.enqueueReplaceState(e, e.state, null));
    }
    __name(ml, "ml");
    function Ei(n, e, t, r) {
      if (n.queue !== null && n.queue.length > 0) {
        var a = n.queue, f = n.replace;
        if (n.queue = null, n.replace = false, f && a.length === 1)
          e.state = a[0];
        else {
          for (var v = f ? a[0] : e.state, b = true, R = f ? 1 : 0; R < a.length; R++) {
            var F = a[R], Y = typeof F == "function" ? F.call(e, v, t, r) : F;
            Y != null && (b ? (b = false, v = Dr({}, v, Y)) : Dr(v, Y));
          }
          e.state = v;
        }
      } else
        n.queue = null;
    }
    __name(Ei, "Ei");
    function zo(n, e, t, r) {
      vl(n, e, t);
      var a = n.state !== void 0 ? n.state : null;
      n.updater = hs, n.props = t, n.state = a;
      var f = {
        queue: [],
        replace: false
      };
      ki(n, f);
      var v = e.contextType;
      if (typeof v == "object" && v !== null ? n.context = so(v) : n.context = r, n.state === t) {
        var b = wt(e) || "Component";
        Fa.has(b) || (Fa.add(b), l("%s: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.", b));
      }
      var R = e.getDerivedStateFromProps;
      typeof R == "function" && (n.state = hl(n, e, R, a, t)), typeof e.getDerivedStateFromProps != "function" && typeof n.getSnapshotBeforeUpdate != "function" && (typeof n.UNSAFE_componentWillMount == "function" || typeof n.componentWillMount == "function") && (ml(e, n), Ei(f, n, t, r));
    }
    __name(zo, "zo");
    var gl = {
      id: 1,
      overflow: ""
    };
    function yl(n) {
      var e = n.overflow, t = n.id, r = t & ~bl(t);
      return r.toString(32) + e;
    }
    __name(yl, "yl");
    function Ri(n, e, t) {
      var r = n.id, a = n.overflow, f = Ma(r) - 1, v = r & ~(1 << f), b = t + 1, R = Ma(e) + f;
      if (R > 30) {
        var F = f - f % 5, Y = (1 << F) - 1, Z = (v & Y).toString(32), ne = v >> F, Fe = f - F, tt = Ma(e) + Fe, Xt = b << Fe, Yn = Xt | ne, Gn = Z + a;
        return {
          id: 1 << tt | Yn,
          overflow: Gn
        };
      } else {
        var Cn = b << f, mo = Cn | v, Jl = a;
        return {
          id: 1 << R | mo,
          overflow: Jl
        };
      }
    }
    __name(Ri, "Ri");
    function Ma(n) {
      return 32 - wl(n);
    }
    __name(Ma, "Ma");
    function bl(n) {
      return 1 << Ma(n) - 1;
    }
    __name(bl, "bl");
    var wl = Math.clz32 ? Math.clz32 : Ti, Sl = Math.log, wn = Math.LN2;
    function Ti(n) {
      var e = n >>> 0;
      return e === 0 ? 32 : 31 - (Sl(e) / wn | 0) | 0;
    }
    __name(Ti, "Ti");
    function ja(n, e) {
      return n === e && (n !== 0 || 1 / n === 1 / e) || n !== n && e !== e;
    }
    __name(ja, "ja");
    var yt = typeof Object.is == "function" ? Object.is : ja, Mr = null, uo = null, Nn = null, et = null, On = false, La = false, jr = 0, Lr = null, cn = 0, xl = 25, on = false, Fn;
    function zn() {
      if (Mr === null)
        throw new Error(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`);
      return on && l("Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://reactjs.org/link/rules-of-hooks"), Mr;
    }
    __name(zn, "zn");
    function kl(n, e) {
      if (e === null)
        return l("%s received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.", Fn), false;
      n.length !== e.length && l(`The final argument passed to %s changed size between renders. The order and size of this array must remain constant.

Previous: %s
Incoming: %s`, Fn, "[" + n.join(", ") + "]", "[" + e.join(", ") + "]");
      for (var t = 0; t < e.length && t < n.length; t++)
        if (!yt(n[t], e[t]))
          return false;
      return true;
    }
    __name(kl, "kl");
    function _i() {
      if (cn > 0)
        throw new Error("Rendered more hooks than during the previous render");
      return {
        memoizedState: null,
        queue: null,
        next: null
      };
    }
    __name(_i, "_i");
    function Ho() {
      return et === null ? Nn === null ? (On = false, Nn = et = _i()) : (On = true, et = Nn) : et.next === null ? (On = false, et = et.next = _i()) : (On = true, et = et.next), et;
    }
    __name(Ho, "Ho");
    function Cl(n, e) {
      Mr = e, uo = n, on = false, jr = 0;
    }
    __name(Cl, "Cl");
    function El(n, e, t, r) {
      for (; La; )
        La = false, jr = 0, cn += 1, et = null, t = n(e, r);
      return Pi(), t;
    }
    __name(El, "El");
    function Ua() {
      var n = jr !== 0;
      return n;
    }
    __name(Ua, "Ua");
    function Pi() {
      on = false, Mr = null, uo = null, La = false, Nn = null, cn = 0, Lr = null, et = null;
    }
    __name(Pi, "Pi");
    function ms(n) {
      return on && l("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo()."), so(n);
    }
    __name(ms, "ms");
    function gs(n) {
      return Fn = "useContext", zn(), so(n);
    }
    __name(gs, "gs");
    function Ii(n, e) {
      return typeof e == "function" ? e(n) : e;
    }
    __name(Ii, "Ii");
    function Rl(n) {
      return Fn = "useState", ys(
        Ii,
        // useReducer has a special case to support lazy useState initializers
        n
      );
    }
    __name(Rl, "Rl");
    function ys(n, e, t) {
      if (n !== Ii && (Fn = "useReducer"), Mr = zn(), et = Ho(), On) {
        var r = et.queue, a = r.dispatch;
        if (Lr !== null) {
          var f = Lr.get(r);
          if (f !== void 0) {
            Lr.delete(r);
            var v = et.memoizedState, b = f;
            do {
              var R = b.action;
              on = true, v = n(v, R), on = false, b = b.next;
            } while (b !== null);
            return et.memoizedState = v, [v, a];
          }
        }
        return [et.memoizedState, a];
      } else {
        on = true;
        var F;
        n === Ii ? F = typeof e == "function" ? e() : e : F = t !== void 0 ? t(e) : e, on = false, et.memoizedState = F;
        var Y = et.queue = {
          last: null,
          dispatch: null
        }, Z = Y.dispatch = Pl.bind(null, Mr, Y);
        return [et.memoizedState, Z];
      }
    }
    __name(ys, "ys");
    function bs(n, e) {
      Mr = zn(), et = Ho();
      var t = e === void 0 ? null : e;
      if (et !== null) {
        var r = et.memoizedState;
        if (r !== null && t !== null) {
          var a = r[1];
          if (kl(t, a))
            return r[0];
        }
      }
      on = true;
      var f = n();
      return on = false, et.memoizedState = [f, t], f;
    }
    __name(bs, "bs");
    function Tl(n) {
      Mr = zn(), et = Ho();
      var e = et.memoizedState;
      if (e === null) {
        var t = {
          current: n
        };
        return Object.seal(t), et.memoizedState = t, t;
      } else
        return e;
    }
    __name(Tl, "Tl");
    function _l(n, e) {
      Fn = "useLayoutEffect", l("useLayoutEffect does nothing on the server, because its effect cannot be encoded into the server renderer's output format. This will lead to a mismatch between the initial, non-hydrated UI and the intended UI. To avoid this, useLayoutEffect should only be used in components that render exclusively on the client. See https://reactjs.org/link/uselayouteffect-ssr for common fixes.");
    }
    __name(_l, "_l");
    function Pl(n, e, t) {
      if (cn >= xl)
        throw new Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
      if (n === Mr) {
        La = true;
        var r = {
          action: t,
          next: null
        };
        Lr === null && (Lr = /* @__PURE__ */ new Map());
        var a = Lr.get(e);
        if (a === void 0)
          Lr.set(e, r);
        else {
          for (var f = a; f.next !== null; )
            f = f.next;
          f.next = r;
        }
      }
    }
    __name(Pl, "Pl");
    function Il(n, e) {
      return bs(function() {
        return n;
      }, e);
    }
    __name(Il, "Il");
    function Al(n, e, t) {
      return zn(), e(n._source);
    }
    __name(Al, "Al");
    function Ol(n, e, t) {
      if (t === void 0)
        throw new Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
      return t();
    }
    __name(Ol, "Ol");
    function Ba(n) {
      return zn(), n;
    }
    __name(Ba, "Ba");
    function ws() {
      throw new Error("startTransition cannot be called during server rendering.");
    }
    __name(ws, "ws");
    function Ai() {
      return zn(), [false, ws];
    }
    __name(Ai, "Ai");
    function Ss() {
      var n = uo, e = yl(n.treeContext), t = $o;
      if (t === null)
        throw new Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
      var r = jr++;
      return fr(t, e, r);
    }
    __name(Ss, "Ss");
    function Na() {
    }
    __name(Na, "Na");
    var za = {
      readContext: ms,
      useContext: gs,
      useMemo: bs,
      useReducer: ys,
      useRef: Tl,
      useState: Rl,
      useInsertionEffect: Na,
      useLayoutEffect: _l,
      useCallback: Il,
      // useImperativeHandle is not run in the server environment
      useImperativeHandle: Na,
      // Effects are not run in the server environment.
      useEffect: Na,
      // Debugging effect
      useDebugValue: Na,
      useDeferredValue: Ba,
      useTransition: Ai,
      useId: Ss,
      // Subscriptions are not setup in a server environment.
      useMutableSource: Al,
      useSyncExternalStore: Ol
    }, $o = null;
    function Ha(n) {
      $o = n;
    }
    __name(Ha, "Ha");
    function co(n) {
      try {
        var e = "", t = n;
        do {
          switch (t.tag) {
            case 0:
              e += Ln(t.type, null, null);
              break;
            case 1:
              e += wi(t.type, null, null);
              break;
            case 2:
              e += is(t.type, null, null);
              break;
          }
          t = t.parent;
        } while (t);
        return e;
      } catch (r) {
        return `
Error generating stack: ` + r.message + `
` + r.stack;
      }
    }
    __name(co, "co");
    var $a = c.ReactCurrentDispatcher, Wa = c.ReactDebugCurrentFrame, Va = 0, fo = 1, Oi = 2, Hn = 3, xs = 4, Fl = 0, po = 1, ho = 2, Dl = 12800;
    function Ml(n) {
      return console.error(n), null;
    }
    __name(Ml, "Ml");
    function $n() {
    }
    __name($n, "$n");
    function Ya(n, e, t, r, a, f, v, b, R) {
      var F = [], Y = /* @__PURE__ */ new Set(), Z = {
        destination: null,
        responseState: e,
        progressiveChunkSize: r === void 0 ? Dl : r,
        status: Fl,
        fatalError: null,
        nextSegmentId: 0,
        allPendingTasks: 0,
        pendingRootTasks: 0,
        completedRootSegment: null,
        abortableTasks: Y,
        pingedTasks: F,
        clientRenderedBoundaries: [],
        completedBoundaries: [],
        partialBoundaries: [],
        onError: a === void 0 ? Ml : a,
        onAllReady: f === void 0 ? $n : f,
        onShellReady: v === void 0 ? $n : v,
        onShellError: b === void 0 ? $n : b,
        onFatalError: R === void 0 ? $n : R
      }, ne = Wo(
        Z,
        0,
        null,
        t,
        // Root segments are never embedded in Text on either edge
        false,
        false
      );
      ne.parentFlushed = true;
      var Fe = Wn(Z, n, null, ne, Y, Ea, Ra, gl);
      return F.push(Fe), Z;
    }
    __name(Ya, "Ya");
    function Sn(n, e) {
      var t = n.pingedTasks;
      t.push(e), t.length === 1 && E(function() {
        return $i(n);
      });
    }
    __name(Sn, "Sn");
    function Fi(n, e) {
      return {
        id: tn,
        rootSegmentID: -1,
        parentFlushed: false,
        pendingTasks: 0,
        forceClientRender: false,
        completedSegments: [],
        byteSize: 0,
        fallbackAbortableTasks: e,
        errorDigest: null
      };
    }
    __name(Fi, "Fi");
    function Wn(n, e, t, r, a, f, v, b) {
      n.allPendingTasks++, t === null ? n.pendingRootTasks++ : t.pendingTasks++;
      var R = {
        node: e,
        ping: /* @__PURE__ */ __name(function() {
          return Sn(n, R);
        }, "ping"),
        blockedBoundary: t,
        blockedSegment: r,
        abortSet: a,
        legacyContext: f,
        context: v,
        treeContext: b
      };
      return R.componentStack = null, a.add(R), R;
    }
    __name(Wn, "Wn");
    function Wo(n, e, t, r, a, f) {
      return {
        status: Va,
        id: -1,
        // lazily assigned later
        index: e,
        parentFlushed: false,
        chunks: [],
        children: [],
        formatContext: r,
        boundary: t,
        lastPushedText: a,
        textEmbedded: f
      };
    }
    __name(Wo, "Wo");
    var xn = null;
    function fn() {
      return xn === null || xn.componentStack === null ? "" : co(xn.componentStack);
    }
    __name(fn, "fn");
    function kn(n, e) {
      n.componentStack = {
        tag: 0,
        parent: n.componentStack,
        type: e
      };
    }
    __name(kn, "kn");
    function Ga(n, e) {
      n.componentStack = {
        tag: 1,
        parent: n.componentStack,
        type: e
      };
    }
    __name(Ga, "Ga");
    function Vo(n, e) {
      n.componentStack = {
        tag: 2,
        parent: n.componentStack,
        type: e
      };
    }
    __name(Vo, "Vo");
    function an(n) {
      n.componentStack === null ? l("Unexpectedly popped too many stack frames. This is a bug in React.") : n.componentStack = n.componentStack.parent;
    }
    __name(an, "an");
    var Yo = null;
    function Di(n, e) {
      {
        var t;
        typeof e == "string" ? t = e : e && typeof e.message == "string" ? t = e.message : t = String(e);
        var r = Yo || fn();
        Yo = null, n.errorMessage = t, n.errorComponentStack = r;
      }
    }
    __name(Di, "Di");
    function Go(n, e) {
      var t = n.onError(e);
      if (t != null && typeof t != "string")
        throw new Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + typeof t + '" instead');
      return t;
    }
    __name(Go, "Go");
    function Xo(n, e) {
      var t = n.onShellError;
      t(e);
      var r = n.onFatalError;
      r(e), n.destination !== null ? (n.status = ho, he(n.destination, e)) : (n.status = po, n.fatalError = e);
    }
    __name(Xo, "Xo");
    function ks(n, e, t) {
      kn(e, "Suspense");
      var r = e.blockedBoundary, a = e.blockedSegment, f = t.fallback, v = t.children, b = /* @__PURE__ */ new Set(), R = Fi(n, b), F = a.chunks.length, Y = Wo(
        n,
        F,
        R,
        a.formatContext,
        // boundaries never require text embedding at their edges because comment nodes bound them
        false,
        false
      );
      a.children.push(Y), a.lastPushedText = false;
      var Z = Wo(
        n,
        0,
        null,
        a.formatContext,
        // boundaries never require text embedding at their edges because comment nodes bound them
        false,
        false
      );
      Z.parentFlushed = true, e.blockedBoundary = R, e.blockedSegment = Z;
      try {
        if (vo(n, e, v), jt(Z.chunks, n.responseState, Z.lastPushedText, Z.textEmbedded), Z.status = fo, Vn(R, Z), R.pendingTasks === 0) {
          an(e);
          return;
        }
      } catch (Fe) {
        Z.status = xs, R.forceClientRender = true, R.errorDigest = Go(n, Fe), Di(R, Fe);
      } finally {
        e.blockedBoundary = r, e.blockedSegment = a;
      }
      var ne = Wn(n, f, r, Y, b, e.legacyContext, e.context, e.treeContext);
      ne.componentStack = e.componentStack, n.pingedTasks.push(ne), an(e);
    }
    __name(ks, "ks");
    function jl(n, e, t, r) {
      kn(e, t);
      var a = e.blockedSegment, f = gn(a.chunks, t, r, n.responseState, a.formatContext);
      a.lastPushedText = false;
      var v = a.formatContext;
      a.formatContext = Vr(v, t, r), vo(n, e, f), a.formatContext = v, m(a.chunks, t), a.lastPushedText = false, an(e);
    }
    __name(jl, "jl");
    function Cs(n) {
      return n.prototype && n.prototype.isReactComponent;
    }
    __name(Cs, "Cs");
    function Jo(n, e, t, r, a) {
      var f = {};
      Cl(e, f);
      var v = t(r, a);
      return El(t, r, v, a);
    }
    __name(Jo, "Jo");
    function Mi(n, e, t, r, a) {
      var f = t.render();
      t.props !== a && (Bi || l("It looks like %s is reassigning its own `this.props` while rendering. This is not supported and can lead to confusing bugs.", wt(r) || "a component"), Bi = true);
      {
        var v = r.childContextTypes;
        if (v != null) {
          var b = e.legacyContext, R = Si(t, r, b, v);
          e.legacyContext = R, hr(n, e, f), e.legacyContext = b;
          return;
        }
      }
      hr(n, e, f);
    }
    __name(Mi, "Mi");
    function Es(n, e, t, r) {
      Vo(e, t);
      var a = Pn(t, e.legacyContext), f = vs(t, r, a);
      zo(f, t, r, a), Mi(n, e, f, t, r), an(e);
    }
    __name(Es, "Es");
    var ji = {}, Zo = {}, Li = {}, Ui = {}, Bi = false, Rs = {}, Ts = false, Ni = false, _s = false;
    function Ll(n, e, t, r) {
      var a;
      if (a = Pn(t, e.legacyContext), Ga(e, t), t.prototype && typeof t.prototype.render == "function") {
        var f = wt(t) || "Unknown";
        ji[f] || (l("The <%s /> component appears to have a render method, but doesn't extend React.Component. This is likely to cause errors. Change %s to extend React.Component instead.", f, f), ji[f] = true);
      }
      var v = Jo(n, e, t, r, a), b = Ua();
      if (typeof v == "object" && v !== null && typeof v.render == "function" && v.$$typeof === void 0) {
        var R = wt(t) || "Unknown";
        Zo[R] || (l("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", R, R, R), Zo[R] = true);
      }
      if (
        // Run these checks in production only if the flag is off.
        // Eventually we'll delete this branch altogether.
        typeof v == "object" && v !== null && typeof v.render == "function" && v.$$typeof === void 0
      ) {
        {
          var F = wt(t) || "Unknown";
          Zo[F] || (l("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", F, F, F), Zo[F] = true);
        }
        zo(v, t, r, a), Mi(n, e, v, t, r);
      } else if (Ul(t), b) {
        var Y = e.treeContext, Z = 1, ne = 0;
        e.treeContext = Ri(Y, Z, ne);
        try {
          hr(n, e, v);
        } finally {
          e.treeContext = Y;
        }
      } else
        hr(n, e, v);
      an(e);
    }
    __name(Ll, "Ll");
    function Ul(n) {
      {
        if (n && n.childContextTypes && l("%s(...): childContextTypes cannot be defined on a function component.", n.displayName || n.name || "Component"), n.defaultProps !== void 0) {
          var e = wt(n) || "Unknown";
          Rs[e] || (l("%s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.", e), Rs[e] = true);
        }
        if (typeof n.getDerivedStateFromProps == "function") {
          var t = wt(n) || "Unknown";
          Ui[t] || (l("%s: Function components do not support getDerivedStateFromProps.", t), Ui[t] = true);
        }
        if (typeof n.contextType == "object" && n.contextType !== null) {
          var r = wt(n) || "Unknown";
          Li[r] || (l("%s: Function components do not support contextType.", r), Li[r] = true);
        }
      }
    }
    __name(Ul, "Ul");
    function Ps(n, e) {
      if (n && n.defaultProps) {
        var t = Dr({}, e), r = n.defaultProps;
        for (var a in r)
          t[a] === void 0 && (t[a] = r[a]);
        return t;
      }
      return e;
    }
    __name(Ps, "Ps");
    function Bl(n, e, t, r, a) {
      Ga(e, t.render);
      var f = Jo(n, e, t.render, r, a), v = Ua();
      if (v) {
        var b = e.treeContext, R = 1, F = 0;
        e.treeContext = Ri(b, R, F);
        try {
          hr(n, e, f);
        } finally {
          e.treeContext = b;
        }
      } else
        hr(n, e, f);
      an(e);
    }
    __name(Bl, "Bl");
    function zi(n, e, t, r, a) {
      var f = t.type, v = Ps(f, r);
      Xa(n, e, f, v, a);
    }
    __name(zi, "zi");
    function Nl(n, e, t, r) {
      t._context === void 0 ? t !== t.Consumer && (_s || (_s = true, l("Rendering <Context> directly is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?"))) : t = t._context;
      var a = r.children;
      typeof a != "function" && l("A context consumer was rendered with multiple children, or a child that isn't a function. A context consumer expects a single child that is a function. If you did pass a function, make sure there is no trailing or leading whitespace around it.");
      var f = so(t), v = a(f);
      hr(n, e, v);
    }
    __name(Nl, "Nl");
    function Ur(n, e, t, r) {
      var a = t._context, f = r.value, v = r.children, b;
      b = e.context, e.context = xi(a, f), hr(n, e, v), e.context = pl(a), b !== e.context && l("Popping the context provider did not return back to the original snapshot. This is a bug in React.");
    }
    __name(Ur, "Ur");
    function zl(n, e, t, r, a) {
      kn(e, "Lazy");
      var f = t._payload, v = t._init, b = v(f), R = Ps(b, r);
      Xa(n, e, b, R, a), an(e);
    }
    __name(zl, "zl");
    function Xa(n, e, t, r, a) {
      if (typeof t == "function")
        if (Cs(t)) {
          Es(n, e, t, r);
          return;
        } else {
          Ll(n, e, t, r);
          return;
        }
      if (typeof t == "string") {
        jl(n, e, t, r);
        return;
      }
      switch (t) {
        // TODO: LegacyHidden acts the same as a fragment. This only works
        // because we currently assume that every instance of LegacyHidden is
        // accompanied by a host component wrapper. In the hidden mode, the host
        // component is given a `hidden` attribute, which ensures that the
        // initial HTML is not visible. To support the use of LegacyHidden as a
        // true fragment, without an extra DOM node, we would have to hide the
        // initial HTML in some other way.
        // TODO: Add REACT_OFFSCREEN_TYPE here too with the same capability.
        case cl:
        case ul:
        case ga:
        case ya:
        case ma: {
          hr(n, e, r.children);
          return;
        }
        case ui: {
          kn(e, "SuspenseList"), hr(n, e, r.children), an(e);
          return;
        }
        case rs:
          throw new Error("ReactDOMServer does not yet support scope components.");
        // eslint-disable-next-line-no-fallthrough
        case li: {
          ks(n, e, r);
          return;
        }
      }
      if (typeof t == "object" && t !== null)
        switch (t.$$typeof) {
          case oo: {
            Bl(n, e, t, r, a);
            return;
          }
          case ci: {
            zi(n, e, t, r, a);
            return;
          }
          case To: {
            Ur(n, e, t, r);
            return;
          }
          case _o: {
            Nl(n, e, t, r);
            return;
          }
          case ba: {
            zl(n, e, t, r);
            return;
          }
        }
      var f = "";
      throw (t === void 0 || typeof t == "object" && t !== null && Object.keys(t).length === 0) && (f += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports."), new Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) " + ("but got: " + (t == null ? t : typeof t) + "." + f));
    }
    __name(Xa, "Xa");
    function Hl(n, e) {
      typeof Symbol == "function" && // $FlowFixMe Flow doesn't know about toStringTag
      n[Symbol.toStringTag] === "Generator" && (Ts || l("Using Generators as children is unsupported and will likely yield unexpected results because enumerating a generator mutates it. You may convert it to an array with `Array.from()` or the `[...spread]` operator before rendering. Keep in mind you might need to polyfill these features for older browsers."), Ts = true), n.entries === e && (Ni || l("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Ni = true);
    }
    __name(Hl, "Hl");
    function hr(n, e, t) {
      try {
        return $l(n, e, t);
      } catch (r) {
        throw typeof r == "object" && r !== null && typeof r.then == "function" || (Yo = Yo !== null ? Yo : fn()), r;
      }
    }
    __name(hr, "hr");
    function $l(n, e, t) {
      if (e.node = t, typeof t == "object" && t !== null) {
        switch (t.$$typeof) {
          case ts: {
            var r = t, a = r.type, f = r.props, v = r.ref;
            Xa(n, e, a, f, v);
            return;
          }
          case va:
            throw new Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
          // eslint-disable-next-line-no-fallthrough
          case ba: {
            var b = t, R = b._payload, F = b._init, Y;
            try {
              Y = F(R);
            } catch (Cn) {
              throw typeof Cn == "object" && Cn !== null && typeof Cn.then == "function" && kn(e, "Lazy"), Cn;
            }
            hr(n, e, Y);
            return;
          }
        }
        if (Ae(t)) {
          Is(n, e, t);
          return;
        }
        var Z = Po(t);
        if (Z) {
          Hl(t, Z);
          var ne = Z.call(t);
          if (ne) {
            var Fe = ne.next();
            if (!Fe.done) {
              var tt = [];
              do
                tt.push(Fe.value), Fe = ne.next();
              while (!Fe.done);
              Is(n, e, tt);
              return;
            }
            return;
          }
        }
        var Xt = Object.prototype.toString.call(t);
        throw new Error("Objects are not valid as a React child (found: " + (Xt === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : Xt) + "). If you meant to render a collection of children, use an array instead.");
      }
      if (typeof t == "string") {
        var Yn = e.blockedSegment;
        Yn.lastPushedText = Et(e.blockedSegment.chunks, t, n.responseState, Yn.lastPushedText);
        return;
      }
      if (typeof t == "number") {
        var Gn = e.blockedSegment;
        Gn.lastPushedText = Et(e.blockedSegment.chunks, "" + t, n.responseState, Gn.lastPushedText);
        return;
      }
      typeof t == "function" && l("Functions are not valid as a React child. This may happen if you return a Component instead of <Component /> from render. Or maybe you meant to call this function rather than return it.");
    }
    __name($l, "$l");
    function Is(n, e, t) {
      for (var r = t.length, a = 0; a < r; a++) {
        var f = e.treeContext;
        e.treeContext = Ri(f, r, a);
        try {
          vo(n, e, t[a]);
        } finally {
          e.treeContext = f;
        }
      }
    }
    __name(Is, "Is");
    function As(n, e, t) {
      var r = e.blockedSegment, a = r.chunks.length, f = Wo(
        n,
        a,
        null,
        r.formatContext,
        // Adopt the parent segment's leading text embed
        r.lastPushedText,
        // Assume we are text embedded at the trailing edge
        true
      );
      r.children.push(f), r.lastPushedText = false;
      var v = Wn(n, e.node, e.blockedBoundary, f, e.abortSet, e.legacyContext, e.context, e.treeContext);
      e.componentStack !== null && (v.componentStack = e.componentStack.parent);
      var b = v.ping;
      t.then(b, b);
    }
    __name(As, "As");
    function vo(n, e, t) {
      var r = e.blockedSegment.formatContext, a = e.legacyContext, f = e.context, v = null;
      v = e.componentStack;
      try {
        return hr(n, e, t);
      } catch (b) {
        if (Pi(), typeof b == "object" && b !== null && typeof b.then == "function") {
          As(n, e, b), e.blockedSegment.formatContext = r, e.legacyContext = a, e.context = f, An(f), e.componentStack = v;
          return;
        } else
          throw e.blockedSegment.formatContext = r, e.legacyContext = a, e.context = f, An(f), e.componentStack = v, b;
      }
    }
    __name(vo, "vo");
    function Os(n, e, t, r) {
      var a = Go(n, r);
      if (e === null ? Xo(n, r) : (e.pendingTasks--, e.forceClientRender || (e.forceClientRender = true, e.errorDigest = a, Di(e, r), e.parentFlushed && n.clientRenderedBoundaries.push(e))), n.allPendingTasks--, n.allPendingTasks === 0) {
        var f = n.onAllReady;
        f();
      }
    }
    __name(Os, "Os");
    function Wl(n) {
      var e = this, t = n.blockedBoundary, r = n.blockedSegment;
      r.status = Hn, Qo(e, t, r);
    }
    __name(Wl, "Wl");
    function Hi(n, e, t) {
      var r = n.blockedBoundary, a = n.blockedSegment;
      if (a.status = Hn, r === null)
        e.allPendingTasks--, e.status !== ho && (e.status = ho, e.destination !== null && G(e.destination));
      else {
        if (r.pendingTasks--, !r.forceClientRender) {
          r.forceClientRender = true;
          var f = t === void 0 ? new Error("The render was aborted by the server without a reason.") : t;
          r.errorDigest = e.onError(f);
          {
            var v = "The server did not finish this Suspense boundary: ";
            f && typeof f.message == "string" ? f = v + f.message : f = v + String(f);
            var b = xn;
            xn = n;
            try {
              Di(r, f);
            } finally {
              xn = b;
            }
          }
          r.parentFlushed && e.clientRenderedBoundaries.push(r);
        }
        if (r.fallbackAbortableTasks.forEach(function(F) {
          return Hi(F, e, t);
        }), r.fallbackAbortableTasks.clear(), e.allPendingTasks--, e.allPendingTasks === 0) {
          var R = e.onAllReady;
          R();
        }
      }
    }
    __name(Hi, "Hi");
    function Vn(n, e) {
      if (e.chunks.length === 0 && e.children.length === 1 && e.children[0].boundary === null) {
        var t = e.children[0];
        t.id = e.id, t.parentFlushed = true, t.status === fo && Vn(n, t);
      } else {
        var r = n.completedSegments;
        r.push(e);
      }
    }
    __name(Vn, "Vn");
    function Qo(n, e, t) {
      if (e === null) {
        if (t.parentFlushed) {
          if (n.completedRootSegment !== null)
            throw new Error("There can only be one root segment. This is a bug in React.");
          n.completedRootSegment = t;
        }
        if (n.pendingRootTasks--, n.pendingRootTasks === 0) {
          n.onShellError = $n;
          var r = n.onShellReady;
          r();
        }
      } else if (e.pendingTasks--, !e.forceClientRender) {
        if (e.pendingTasks === 0)
          t.parentFlushed && t.status === fo && Vn(e, t), e.parentFlushed && n.completedBoundaries.push(e), e.fallbackAbortableTasks.forEach(Wl, n), e.fallbackAbortableTasks.clear();
        else if (t.parentFlushed && t.status === fo) {
          Vn(e, t);
          var a = e.completedSegments;
          a.length === 1 && e.parentFlushed && n.partialBoundaries.push(e);
        }
      }
      if (n.allPendingTasks--, n.allPendingTasks === 0) {
        var f = n.onAllReady;
        f();
      }
    }
    __name(Qo, "Qo");
    function Vl(n, e) {
      var t = e.blockedSegment;
      if (t.status === Va) {
        An(e.context);
        var r = null;
        r = xn, xn = e;
        try {
          hr(n, e, e.node), jt(t.chunks, n.responseState, t.lastPushedText, t.textEmbedded), e.abortSet.delete(e), t.status = fo, Qo(n, e.blockedBoundary, t);
        } catch (f) {
          if (Pi(), typeof f == "object" && f !== null && typeof f.then == "function") {
            var a = e.ping;
            f.then(a, a);
          } else
            e.abortSet.delete(e), t.status = xs, Os(n, e.blockedBoundary, t, f);
        } finally {
          xn = r;
        }
      }
    }
    __name(Vl, "Vl");
    function $i(n) {
      if (n.status !== ho) {
        var e = fs(), t = $a.current;
        $a.current = za;
        var r;
        r = Wa.getCurrentStack, Wa.getCurrentStack = fn;
        var a = $o;
        Ha(n.responseState);
        try {
          var f = n.pingedTasks, v;
          for (v = 0; v < f.length; v++) {
            var b = f[v];
            Vl(n, b);
          }
          f.splice(0, v), n.destination !== null && Wi(n, n.destination);
        } catch (R) {
          Go(n, R), Xo(n, R);
        } finally {
          Ha(a), $a.current = t, Wa.getCurrentStack = r, t === za && An(e);
        }
      }
    }
    __name($i, "$i");
    function Ko(n, e, t) {
      switch (t.parentFlushed = true, t.status) {
        case Va: {
          var r = t.id = n.nextSegmentId++;
          return t.lastPushedText = false, t.textEmbedded = false, ee(e, n.responseState, r);
        }
        case fo: {
          t.status = Oi;
          for (var a = true, f = t.chunks, v = 0, b = t.children, R = 0; R < b.length; R++) {
            for (var F = b[R]; v < F.index; v++)
              I(e, f[v]);
            a = Ja(n, e, F);
          }
          for (; v < f.length - 1; v++)
            I(e, f[v]);
          return v < f.length && (a = $(e, f[v])), a;
        }
        default:
          throw new Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
      }
    }
    __name(Ko, "Ko");
    function Ja(n, e, t) {
      var r = t.boundary;
      if (r === null)
        return Ko(n, e, t);
      if (r.parentFlushed = true, r.forceClientRender)
        return Gt(e, n.responseState, r.errorDigest, r.errorMessage, r.errorComponentStack), Ko(n, e, t), Kn(e, n.responseState);
      if (r.pendingTasks > 0) {
        r.rootSegmentID = n.nextSegmentId++, r.completedSegments.length > 0 && n.partialBoundaries.push(r);
        var a = r.id = Vt(n.responseState);
        return bn(e, n.responseState, a), Ko(n, e, t), _n(e, n.responseState);
      } else {
        if (r.byteSize > n.progressiveChunkSize)
          return r.rootSegmentID = n.nextSegmentId++, n.completedBoundaries.push(r), bn(e, n.responseState, r.id), Ko(n, e, t), _n(e, n.responseState);
        Tn(e, n.responseState);
        var f = r.completedSegments;
        if (f.length !== 1)
          throw new Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
        var v = f[0];
        return Ja(n, e, v), Mn(e, n.responseState);
      }
    }
    __name(Ja, "Ja");
    function Fs(n, e, t) {
      return ll(e, n.responseState, t.id, t.errorDigest, t.errorMessage, t.errorComponentStack);
    }
    __name(Fs, "Fs");
    function Za(n, e, t) {
      return Le(e, n.responseState, t.formatContext, t.id), Ja(n, e, t), ht(e, t.formatContext);
    }
    __name(Za, "Za");
    function Ds(n, e, t) {
      for (var r = t.completedSegments, a = 0; a < r.length; a++) {
        var f = r[a];
        Ms(n, e, t, f);
      }
      return r.length = 0, qi(e, n.responseState, t.id, t.rootSegmentID);
    }
    __name(Ds, "Ds");
    function Yl(n, e, t) {
      for (var r = t.completedSegments, a = 0; a < r.length; a++) {
        var f = r[a];
        if (!Ms(n, e, t, f))
          return a++, r.splice(0, a), false;
      }
      return r.splice(0, a), true;
    }
    __name(Yl, "Yl");
    function Ms(n, e, t, r) {
      if (r.status === Oi)
        return true;
      var a = r.id;
      if (a === -1) {
        var f = r.id = t.rootSegmentID;
        if (f === -1)
          throw new Error("A root segment ID must have been assigned by now. This is a bug in React.");
        return Za(n, e, r);
      } else
        return Za(n, e, r), tl(e, n.responseState, a);
    }
    __name(Ms, "Ms");
    function Wi(n, e) {
      M();
      try {
        var t = n.completedRootSegment;
        t !== null && n.pendingRootTasks === 0 && (Ja(n, e, t), n.completedRootSegment = null, _(e, n.responseState));
        var r = n.clientRenderedBoundaries, a;
        for (a = 0; a < r.length; a++) {
          var f = r[a];
          Fs(n, e, f);
        }
        r.splice(0, a);
        var v = n.completedBoundaries;
        for (a = 0; a < v.length; a++) {
          var b = v[a];
          Ds(n, e, b);
        }
        v.splice(0, a), te(e), M(e);
        var R = n.partialBoundaries;
        for (a = 0; a < R.length; a++) {
          var F = R[a];
          if (!Yl(n, e, F)) {
            n.destination = null, a++, R.splice(0, a);
            return;
          }
        }
        R.splice(0, a);
        var Y = n.completedBoundaries;
        for (a = 0; a < Y.length; a++) {
          var Z = Y[a];
          Ds(n, e, Z);
        }
        Y.splice(0, a);
      } finally {
        te(e), n.allPendingTasks === 0 && n.pingedTasks.length === 0 && n.clientRenderedBoundaries.length === 0 && n.completedBoundaries.length === 0 && (n.abortableTasks.size !== 0 && l("There was still abortable task at the root when we closed. This is a bug in React."), G(e));
      }
    }
    __name(Wi, "Wi");
    function js(n) {
      E(function() {
        return $i(n);
      });
    }
    __name(js, "js");
    function Gl(n, e) {
      if (n.status === po) {
        n.status = ho, he(e, n.fatalError);
        return;
      }
      if (n.status !== ho && n.destination === null) {
        n.destination = e;
        try {
          Wi(n, e);
        } catch (t) {
          Go(n, t), Xo(n, t);
        }
      }
    }
    __name(Gl, "Gl");
    function Ls(n, e) {
      try {
        var t = n.abortableTasks;
        t.forEach(function(r) {
          return Hi(r, n, e);
        }), t.clear(), n.destination !== null && Wi(n, n.destination);
      } catch (r) {
        Go(n, r), Xo(n, r);
      }
    }
    __name(Ls, "Ls");
    function Xl(n, e) {
      return new Promise(function(t, r) {
        var a, f, v = new Promise(function(ne, Fe) {
          f = ne, a = Fe;
        });
        function b() {
          var ne = new ReadableStream(
            {
              type: "bytes",
              pull: /* @__PURE__ */ __name(function(Fe) {
                Gl(F, Fe);
              }, "pull"),
              cancel: /* @__PURE__ */ __name(function(Fe) {
                Ls(F);
              }, "cancel")
            },
            // $FlowFixMe size() methods are not allowed on byte streams.
            {
              highWaterMark: 0
            }
          );
          ne.allReady = v, t(ne);
        }
        __name(b, "b");
        function R(ne) {
          v.catch(function() {
          }), r(ne);
        }
        __name(R, "R");
        var F = Ya(n, er(e ? e.identifierPrefix : void 0, e ? e.nonce : void 0, e ? e.bootstrapScriptContent : void 0, e ? e.bootstrapScripts : void 0, e ? e.bootstrapModules : void 0), Ir(e ? e.namespaceURI : void 0), e ? e.progressiveChunkSize : void 0, e ? e.onError : void 0, f, b, R, a);
        if (e && e.signal) {
          var Y = e.signal, Z = /* @__PURE__ */ __name(function() {
            Ls(F, Y.reason), Y.removeEventListener("abort", Z);
          }, "Z");
          Y.addEventListener("abort", Z);
        }
        js(F);
      });
    }
    __name(Xl, "Xl");
    Hs.renderToReadableStream = Xl, Hs.version = i;
  }()), Hs;
}
__name(Pf, "Pf");
var Iu;
function If() {
  if (Iu) return go;
  Iu = 1;
  var o, i;
  return false ? (o = Rf(), i = Tf()) : (o = _f(), i = Pf()), go.version = o.version, go.renderToString = o.renderToString, go.renderToStaticMarkup = o.renderToStaticMarkup, go.renderToNodeStream = o.renderToNodeStream, go.renderToStaticNodeStream = o.renderToStaticNodeStream, go.renderToReadableStream = i.renderToReadableStream, go;
}
__name(If, "If");
var Af = If();
var Of = vr.createContext(null);
var Ff = /* @__PURE__ */ __name((o, i, c, d) => async (l, S) => {
  const E = c ? c({ children: l, Layout: i, c: o, ...S }) : l;
  {
    const g = "<!DOCTYPE html>" + Af.renderToString(vr.createElement(Of.Provider, { value: o }, E));
    return o.html(g);
  }
}, "Ff");
var Df = /* @__PURE__ */ __name((o, i) => function(d, l) {
  const S = d.getLayout() ?? vr.Fragment;
  return o && d.setLayout((E) => o({ ...E, Layout: S, c: d }, d)), d.setRenderer(Ff(d, S, o)), l();
}, "Df");
var Mf = /* @__PURE__ */ __name((o) => {
  const c = {
    ...{
      origin: "*",
      allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
      allowHeaders: [],
      exposeHeaders: []
    },
    ...o
  }, d = /* @__PURE__ */ ((S) => typeof S == "string" ? S === "*" ? () => S : (E) => S === E ? E : null : typeof S == "function" ? S : (E) => S.includes(E) ? E : null)(c.origin), l = ((S) => typeof S == "function" ? S : Array.isArray(S) ? () => S : () => [])(c.allowMethods);
  return async function(E, P) {
    function g(M, I) {
      E.res.headers.set(M, I);
    }
    __name(g, "g");
    const x = d(E.req.header("origin") || "", E);
    if (x && g("Access-Control-Allow-Origin", x), c.origin !== "*") {
      const M = E.req.header("Vary");
      M ? g("Vary", M) : g("Vary", "Origin");
    }
    if (c.credentials && g("Access-Control-Allow-Credentials", "true"), c.exposeHeaders?.length && g("Access-Control-Expose-Headers", c.exposeHeaders.join(",")), E.req.method === "OPTIONS") {
      c.maxAge != null && g("Access-Control-Max-Age", c.maxAge.toString());
      const M = l(E.req.header("origin") || "", E);
      M.length && g("Access-Control-Allow-Methods", M.join(","));
      let I = c.allowHeaders;
      if (!I?.length) {
        const $ = E.req.header("Access-Control-Request-Headers");
        $ && (I = $.split(/\s*,\s*/));
      }
      return I?.length && (g("Access-Control-Allow-Headers", I.join(",")), E.res.headers.append("Vary", "Access-Control-Request-Headers")), E.res.headers.delete("Content-Length"), E.res.headers.delete("Content-Type"), new Response(null, {
        headers: E.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await P();
  };
}, "Mf");
var jf = /^[\w!#$%&'*.^`|~+-]+$/;
var Lf = /^[ !#-:<-[\]-~]*$/;
var Uf = /* @__PURE__ */ __name((o, i) => {
  if (o.indexOf(i) === -1)
    return {};
  const c = o.trim().split(";"), d = {};
  for (let l of c) {
    l = l.trim();
    const S = l.indexOf("=");
    if (S === -1)
      continue;
    const E = l.substring(0, S).trim();
    if (i !== E || !jf.test(E))
      continue;
    let P = l.substring(S + 1).trim();
    if (P.startsWith('"') && P.endsWith('"') && (P = P.slice(1, -1)), Lf.test(P)) {
      d[E] = P.indexOf("%") !== -1 ? Xs(P, cu) : P;
      break;
    }
  }
  return d;
}, "Uf");
var Bf = /* @__PURE__ */ __name((o, i, c = {}) => {
  let d = `${o}=${i}`;
  if (o.startsWith("__Secure-") && !c.secure)
    throw new Error("__Secure- Cookie must have Secure attributes");
  if (o.startsWith("__Host-")) {
    if (!c.secure)
      throw new Error("__Host- Cookie must have Secure attributes");
    if (c.path !== "/")
      throw new Error('__Host- Cookie must have Path attributes with "/"');
    if (c.domain)
      throw new Error("__Host- Cookie must not have Domain attributes");
  }
  if (c && typeof c.maxAge == "number" && c.maxAge >= 0) {
    if (c.maxAge > 3456e4)
      throw new Error(
        "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
      );
    d += `; Max-Age=${c.maxAge | 0}`;
  }
  if (c.domain && c.prefix !== "host" && (d += `; Domain=${c.domain}`), c.path && (d += `; Path=${c.path}`), c.expires) {
    if (c.expires.getTime() - Date.now() > 3456e7)
      throw new Error(
        "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
      );
    d += `; Expires=${c.expires.toUTCString()}`;
  }
  if (c.httpOnly && (d += "; HttpOnly"), c.secure && (d += "; Secure"), c.sameSite && (d += `; SameSite=${c.sameSite.charAt(0).toUpperCase() + c.sameSite.slice(1)}`), c.priority && (d += `; Priority=${c.priority.charAt(0).toUpperCase() + c.priority.slice(1)}`), c.partitioned) {
    if (!c.secure)
      throw new Error("Partitioned Cookie must have Secure attributes");
    d += "; Partitioned";
  }
  return d;
}, "Bf");
var Kl = /* @__PURE__ */ __name((o, i, c) => (i = encodeURIComponent(i), Bf(o, i, c)), "Kl");
var fu = /* @__PURE__ */ __name((o, i, c) => {
  const d = o.req.raw.headers.get("Cookie");
  {
    if (!d)
      return;
    let l = i;
    return Uf(d, l)[l];
  }
}, "fu");
var Nf = /* @__PURE__ */ __name((o, i, c) => {
  let d;
  return c?.prefix === "secure" ? d = Kl("__Secure-" + o, i, { path: "/", ...c, secure: true }) : c?.prefix === "host" ? d = Kl("__Host-" + o, i, {
    ...c,
    path: "/",
    secure: true,
    domain: void 0
  }) : d = Kl(o, i, { path: "/", ...c }), d;
}, "Nf");
var nc = /* @__PURE__ */ __name((o, i, c, d) => {
  const l = Nf(i, c, d);
  o.header("Set-Cookie", l, { append: true });
}, "nc");
var zf = /* @__PURE__ */ __name((o, i, c) => {
  const d = fu(o, i);
  return nc(o, i, "", { ...c, maxAge: 0 }), d;
}, "zf");
var oa = /* @__PURE__ */ __name((o = {}) => {
  const i = /* @__PURE__ */ __name((c, d = "") => typeof c == "string" ? c || d : c && typeof c == "object" && (c.value || c.toString?.()) || d, "i");
  return {
    google: {
      clientId: i(o.GOOGLE_CLIENT_ID, ""),
      clientSecret: i(o.GOOGLE_CLIENT_SECRET, ""),
      redirectURI: i(o.GOOGLE_REDIRECT_URI, "")
    },
    session: {
      maxAge: 3600 * 24 * 7,
      // 7 days in seconds
      cookieName: "auth_session"
    },
    baseURL: o.AUTH_BASE_URL || void 0
  };
}, "oa");
var Hf = oa();
async function $f(o, i) {
  const c = i || oa(), d = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: c.google.clientId,
      client_secret: c.google.clientSecret,
      code: o,
      grant_type: "authorization_code",
      redirect_uri: c.google.redirectURI
    })
  });
  if (!d.ok) {
    const l = await d.text();
    throw console.error("Token exchange failed:", d.status, l), new Error(`Failed to exchange code for tokens: ${d.status} ${l}`);
  }
  return d.json();
}
__name($f, "$f");
async function Wf(o) {
  const i = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${o}`
    }
  });
  if (!i.ok)
    throw new Error("Failed to get user info");
  return i.json();
}
__name(Wf, "Wf");
var Vf = /* @__PURE__ */ __name((o) => {
  const i = {
    ...o,
    exp: Date.now() + Hf.session.maxAge * 1e3
    // Convert to milliseconds
  };
  return btoa(JSON.stringify(i));
}, "Vf");
var Yf = /* @__PURE__ */ __name((o) => {
  if (!o) return null;
  try {
    const i = JSON.parse(atob(o));
    return i.exp > Date.now() ? i : null;
  } catch {
    return null;
  }
}, "Yf");
var oc = Yf;
function Au(o, i) {
  if (typeof o == "function")
    return o(i);
  o != null && (o.current = i);
}
__name(Au, "Au");
function Gf(...o) {
  return (i) => {
    let c = false;
    const d = o.map((l) => {
      const S = Au(l, i);
      return !c && typeof S == "function" && (c = true), S;
    });
    if (c)
      return () => {
        for (let l = 0; l < d.length; l++) {
          const S = d[l];
          typeof S == "function" ? S() : Au(o[l], null);
        }
      };
  };
}
__name(Gf, "Gf");
// @__NO_SIDE_EFFECTS__
function Xf(o) {
  const i = /* @__PURE__ */ Jf(o), c = q.forwardRef((d, l) => {
    const { children: S, ...E } = d, P = q.Children.toArray(S), g = P.find(Qf);
    if (g) {
      const x = g.props.children, M = P.map((I) => I === g ? q.Children.count(x) > 1 ? q.Children.only(null) : q.isValidElement(x) ? x.props.children : null : I);
      return /* @__PURE__ */ J.jsx(i, { ...E, ref: l, children: q.isValidElement(x) ? q.cloneElement(x, void 0, M) : null });
    }
    return /* @__PURE__ */ J.jsx(i, { ...E, ref: l, children: S });
  });
  return c.displayName = `${o}.Slot`, c;
}
__name(Xf, "Xf");
var ni = /* @__PURE__ */ Xf("Slot");
// @__NO_SIDE_EFFECTS__
function Jf(o) {
  const i = q.forwardRef((c, d) => {
    const { children: l, ...S } = c;
    if (q.isValidElement(l)) {
      const E = qf(l), P = Kf(S, l.props);
      return l.type !== q.Fragment && (P.ref = d ? Gf(d, E) : E), q.cloneElement(l, P);
    }
    return q.Children.count(l) > 1 ? q.Children.only(null) : null;
  });
  return i.displayName = `${o}.SlotClone`, i;
}
__name(Jf, "Jf");
var Zf = Symbol("radix.slottable");
function Qf(o) {
  return q.isValidElement(o) && typeof o.type == "function" && "__radixId" in o.type && o.type.__radixId === Zf;
}
__name(Qf, "Qf");
function Kf(o, i) {
  const c = { ...i };
  for (const d in i) {
    const l = o[d], S = i[d];
    /^on[A-Z]/.test(d) ? l && S ? c[d] = (...P) => {
      const g = S(...P);
      return l(...P), g;
    } : l && (c[d] = l) : d === "style" ? c[d] = { ...l, ...S } : d === "className" && (c[d] = [l, S].filter(Boolean).join(" "));
  }
  return { ...o, ...c };
}
__name(Kf, "Kf");
function qf(o) {
  let i = Object.getOwnPropertyDescriptor(o.props, "ref")?.get, c = i && "isReactWarning" in i && i.isReactWarning;
  return c ? o.ref : (i = Object.getOwnPropertyDescriptor(o, "ref")?.get, c = i && "isReactWarning" in i && i.isReactWarning, c ? o.props.ref : o.props.ref || o.ref);
}
__name(qf, "qf");
function ac(o) {
  var i, c, d = "";
  if (typeof o == "string" || typeof o == "number") d += o;
  else if (typeof o == "object") if (Array.isArray(o)) {
    var l = o.length;
    for (i = 0; i < l; i++) o[i] && (c = ac(o[i])) && (d && (d += " "), d += c);
  } else for (c in o) o[c] && (d && (d += " "), d += c);
  return d;
}
__name(ac, "ac");
function ic() {
  for (var o, i, c = 0, d = "", l = arguments.length; c < l; c++) (o = arguments[c]) && (i = ac(o)) && (d && (d += " "), d += i);
  return d;
}
__name(ic, "ic");
var Ou = /* @__PURE__ */ __name((o) => typeof o == "boolean" ? `${o}` : o === 0 ? "0" : o, "Ou");
var Fu = ic;
var sn = /* @__PURE__ */ __name((o, i) => (c) => {
  var d;
  if (i?.variants == null) return Fu(o, c?.class, c?.className);
  const { variants: l, defaultVariants: S } = i, E = Object.keys(l).map((x) => {
    const M = c?.[x], I = S?.[x];
    if (M === null) return null;
    const $ = Ou(M) || Ou(I);
    return l[x][$];
  }), P = c && Object.entries(c).reduce((x, M) => {
    let [I, $] = M;
    return $ === void 0 || (x[I] = $), x;
  }, {}), g = i == null || (d = i.compoundVariants) === null || d === void 0 ? void 0 : d.reduce((x, M) => {
    let { class: I, className: $, ...te } = M;
    return Object.entries(te).every((G) => {
      let [se, H] = G;
      return Array.isArray(H) ? H.includes({
        ...S,
        ...P
      }[se]) : {
        ...S,
        ...P
      }[se] === H;
    }) ? [
      ...x,
      I,
      $
    ] : x;
  }, []);
  return Fu(o, E, g, c?.class, c?.className);
}, "sn");
var du = "-";
var ed = /* @__PURE__ */ __name((o) => {
  const i = rd(o), {
    conflictingClassGroups: c,
    conflictingClassGroupModifiers: d
  } = o;
  return {
    getClassGroupId: /* @__PURE__ */ __name((E) => {
      const P = E.split(du);
      return P[0] === "" && P.length !== 1 && P.shift(), sc(P, i) || td(E);
    }, "getClassGroupId"),
    getConflictingClassGroupIds: /* @__PURE__ */ __name((E, P) => {
      const g = c[E] || [];
      return P && d[E] ? [...g, ...d[E]] : g;
    }, "getConflictingClassGroupIds")
  };
}, "ed");
var sc = /* @__PURE__ */ __name((o, i) => {
  if (o.length === 0)
    return i.classGroupId;
  const c = o[0], d = i.nextPart.get(c), l = d ? sc(o.slice(1), d) : void 0;
  if (l)
    return l;
  if (i.validators.length === 0)
    return;
  const S = o.join(du);
  return i.validators.find(({
    validator: E
  }) => E(S))?.classGroupId;
}, "sc");
var Du = /^\[(.+)\]$/;
var td = /* @__PURE__ */ __name((o) => {
  if (Du.test(o)) {
    const i = Du.exec(o)[1], c = i?.substring(0, i.indexOf(":"));
    if (c)
      return "arbitrary.." + c;
  }
}, "td");
var rd = /* @__PURE__ */ __name((o) => {
  const {
    theme: i,
    classGroups: c
  } = o, d = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  for (const l in c)
    ou(c[l], d, l, i);
  return d;
}, "rd");
var ou = /* @__PURE__ */ __name((o, i, c, d) => {
  o.forEach((l) => {
    if (typeof l == "string") {
      const S = l === "" ? i : Mu(i, l);
      S.classGroupId = c;
      return;
    }
    if (typeof l == "function") {
      if (nd(l)) {
        ou(l(d), i, c, d);
        return;
      }
      i.validators.push({
        validator: l,
        classGroupId: c
      });
      return;
    }
    Object.entries(l).forEach(([S, E]) => {
      ou(E, Mu(i, S), c, d);
    });
  });
}, "ou");
var Mu = /* @__PURE__ */ __name((o, i) => {
  let c = o;
  return i.split(du).forEach((d) => {
    c.nextPart.has(d) || c.nextPart.set(d, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), c = c.nextPart.get(d);
  }), c;
}, "Mu");
var nd = /* @__PURE__ */ __name((o) => o.isThemeGetter, "nd");
var od = /* @__PURE__ */ __name((o) => {
  if (o < 1)
    return {
      get: /* @__PURE__ */ __name(() => {
      }, "get"),
      set: /* @__PURE__ */ __name(() => {
      }, "set")
    };
  let i = 0, c = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  const l = /* @__PURE__ */ __name((S, E) => {
    c.set(S, E), i++, i > o && (i = 0, d = c, c = /* @__PURE__ */ new Map());
  }, "l");
  return {
    get(S) {
      let E = c.get(S);
      if (E !== void 0)
        return E;
      if ((E = d.get(S)) !== void 0)
        return l(S, E), E;
    },
    set(S, E) {
      c.has(S) ? c.set(S, E) : l(S, E);
    }
  };
}, "od");
var au = "!";
var iu = ":";
var ad = iu.length;
var id = /* @__PURE__ */ __name((o) => {
  const {
    prefix: i,
    experimentalParseClassName: c
  } = o;
  let d = /* @__PURE__ */ __name((l) => {
    const S = [];
    let E = 0, P = 0, g = 0, x;
    for (let G = 0; G < l.length; G++) {
      let se = l[G];
      if (E === 0 && P === 0) {
        if (se === iu) {
          S.push(l.slice(g, G)), g = G + ad;
          continue;
        }
        if (se === "/") {
          x = G;
          continue;
        }
      }
      se === "[" ? E++ : se === "]" ? E-- : se === "(" ? P++ : se === ")" && P--;
    }
    const M = S.length === 0 ? l : l.substring(g), I = sd(M), $ = I !== M, te = x && x > g ? x - g : void 0;
    return {
      modifiers: S,
      hasImportantModifier: $,
      baseClassName: I,
      maybePostfixModifierPosition: te
    };
  }, "d");
  if (i) {
    const l = i + iu, S = d;
    d = /* @__PURE__ */ __name((E) => E.startsWith(l) ? S(E.substring(l.length)) : {
      isExternal: true,
      modifiers: [],
      hasImportantModifier: false,
      baseClassName: E,
      maybePostfixModifierPosition: void 0
    }, "d");
  }
  if (c) {
    const l = d;
    d = /* @__PURE__ */ __name((S) => c({
      className: S,
      parseClassName: l
    }), "d");
  }
  return d;
}, "id");
var sd = /* @__PURE__ */ __name((o) => o.endsWith(au) ? o.substring(0, o.length - 1) : o.startsWith(au) ? o.substring(1) : o, "sd");
var ld = /* @__PURE__ */ __name((o) => {
  const i = Object.fromEntries(o.orderSensitiveModifiers.map((d) => [d, true]));
  return (d) => {
    if (d.length <= 1)
      return d;
    const l = [];
    let S = [];
    return d.forEach((E) => {
      E[0] === "[" || i[E] ? (l.push(...S.sort(), E), S = []) : S.push(E);
    }), l.push(...S.sort()), l;
  };
}, "ld");
var ud = /* @__PURE__ */ __name((o) => ({
  cache: od(o.cacheSize),
  parseClassName: id(o),
  sortModifiers: ld(o),
  ...ed(o)
}), "ud");
var cd = /\s+/;
var fd = /* @__PURE__ */ __name((o, i) => {
  const {
    parseClassName: c,
    getClassGroupId: d,
    getConflictingClassGroupIds: l,
    sortModifiers: S
  } = i, E = [], P = o.trim().split(cd);
  let g = "";
  for (let x = P.length - 1; x >= 0; x -= 1) {
    const M = P[x], {
      isExternal: I,
      modifiers: $,
      hasImportantModifier: te,
      baseClassName: G,
      maybePostfixModifierPosition: se
    } = c(M);
    if (I) {
      g = M + (g.length > 0 ? " " + g : g);
      continue;
    }
    let H = !!se, B = d(H ? G.substring(0, se) : G);
    if (!B) {
      if (!H) {
        g = M + (g.length > 0 ? " " + g : g);
        continue;
      }
      if (B = d(G), !B) {
        g = M + (g.length > 0 ? " " + g : g);
        continue;
      }
      H = false;
    }
    const he = S($).join(":"), ye = te ? he + au : he, Pe = ye + B;
    if (E.includes(Pe))
      continue;
    E.push(Pe);
    const pe = l(B, H);
    for (let Ce = 0; Ce < pe.length; ++Ce) {
      const le = pe[Ce];
      E.push(ye + le);
    }
    g = M + (g.length > 0 ? " " + g : g);
  }
  return g;
}, "fd");
function dd() {
  let o = 0, i, c, d = "";
  for (; o < arguments.length; )
    (i = arguments[o++]) && (c = lc(i)) && (d && (d += " "), d += c);
  return d;
}
__name(dd, "dd");
var lc = /* @__PURE__ */ __name((o) => {
  if (typeof o == "string")
    return o;
  let i, c = "";
  for (let d = 0; d < o.length; d++)
    o[d] && (i = lc(o[d])) && (c && (c += " "), c += i);
  return c;
}, "lc");
function pd(o, ...i) {
  let c, d, l, S = E;
  function E(g) {
    const x = i.reduce((M, I) => I(M), o());
    return c = ud(x), d = c.cache.get, l = c.cache.set, S = P, P(g);
  }
  __name(E, "E");
  function P(g) {
    const x = d(g);
    if (x)
      return x;
    const M = fd(g, c);
    return l(g, M), M;
  }
  __name(P, "P");
  return function() {
    return S(dd.apply(null, arguments));
  };
}
__name(pd, "pd");
var Jt = /* @__PURE__ */ __name((o) => {
  const i = /* @__PURE__ */ __name((c) => c[o] || [], "i");
  return i.isThemeGetter = true, i;
}, "Jt");
var uc = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
var cc = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
var hd = /^\d+\/\d+$/;
var vd = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
var md = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
var gd = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
var yd = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
var bd = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
var Ka = /* @__PURE__ */ __name((o) => hd.test(o), "Ka");
var He = /* @__PURE__ */ __name((o) => !!o && !Number.isNaN(Number(o)), "He");
var yo = /* @__PURE__ */ __name((o) => !!o && Number.isInteger(Number(o)), "yo");
var ql = /* @__PURE__ */ __name((o) => o.endsWith("%") && He(o.slice(0, -1)), "ql");
var Xn = /* @__PURE__ */ __name((o) => vd.test(o), "Xn");
var wd = /* @__PURE__ */ __name(() => true, "wd");
var Sd = /* @__PURE__ */ __name((o) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  md.test(o) && !gd.test(o)
), "Sd");
var fc = /* @__PURE__ */ __name(() => false, "fc");
var xd = /* @__PURE__ */ __name((o) => yd.test(o), "xd");
var kd = /* @__PURE__ */ __name((o) => bd.test(o), "kd");
var Cd = /* @__PURE__ */ __name((o) => !me(o) && !ge(o), "Cd");
var Ed = /* @__PURE__ */ __name((o) => oi(o, hc, fc), "Ed");
var me = /* @__PURE__ */ __name((o) => uc.test(o), "me");
var ta = /* @__PURE__ */ __name((o) => oi(o, vc, Sd), "ta");
var eu = /* @__PURE__ */ __name((o) => oi(o, Id, He), "eu");
var ju = /* @__PURE__ */ __name((o) => oi(o, dc, fc), "ju");
var Rd = /* @__PURE__ */ __name((o) => oi(o, pc, kd), "Rd");
var $s = /* @__PURE__ */ __name((o) => oi(o, mc, xd), "$s");
var ge = /* @__PURE__ */ __name((o) => cc.test(o), "ge");
var Xi = /* @__PURE__ */ __name((o) => ai(o, vc), "Xi");
var Td = /* @__PURE__ */ __name((o) => ai(o, Ad), "Td");
var Lu = /* @__PURE__ */ __name((o) => ai(o, dc), "Lu");
var _d = /* @__PURE__ */ __name((o) => ai(o, hc), "_d");
var Pd = /* @__PURE__ */ __name((o) => ai(o, pc), "Pd");
var Ws = /* @__PURE__ */ __name((o) => ai(o, mc, true), "Ws");
var oi = /* @__PURE__ */ __name((o, i, c) => {
  const d = uc.exec(o);
  return d ? d[1] ? i(d[1]) : c(d[2]) : false;
}, "oi");
var ai = /* @__PURE__ */ __name((o, i, c = false) => {
  const d = cc.exec(o);
  return d ? d[1] ? i(d[1]) : c : false;
}, "ai");
var dc = /* @__PURE__ */ __name((o) => o === "position" || o === "percentage", "dc");
var pc = /* @__PURE__ */ __name((o) => o === "image" || o === "url", "pc");
var hc = /* @__PURE__ */ __name((o) => o === "length" || o === "size" || o === "bg-size", "hc");
var vc = /* @__PURE__ */ __name((o) => o === "length", "vc");
var Id = /* @__PURE__ */ __name((o) => o === "number", "Id");
var Ad = /* @__PURE__ */ __name((o) => o === "family-name", "Ad");
var mc = /* @__PURE__ */ __name((o) => o === "shadow", "mc");
var Od = /* @__PURE__ */ __name(() => {
  const o = Jt("color"), i = Jt("font"), c = Jt("text"), d = Jt("font-weight"), l = Jt("tracking"), S = Jt("leading"), E = Jt("breakpoint"), P = Jt("container"), g = Jt("spacing"), x = Jt("radius"), M = Jt("shadow"), I = Jt("inset-shadow"), $ = Jt("text-shadow"), te = Jt("drop-shadow"), G = Jt("blur"), se = Jt("perspective"), H = Jt("aspect"), B = Jt("ease"), he = Jt("animate"), ye = /* @__PURE__ */ __name(() => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], "ye"), Pe = /* @__PURE__ */ __name(() => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ], "Pe"), pe = /* @__PURE__ */ __name(() => [...Pe(), ge, me], "pe"), Ce = /* @__PURE__ */ __name(() => ["auto", "hidden", "clip", "visible", "scroll"], "Ce"), le = /* @__PURE__ */ __name(() => ["auto", "contain", "none"], "le"), ue = /* @__PURE__ */ __name(() => [ge, me, g], "ue"), xe = /* @__PURE__ */ __name(() => [Ka, "full", "auto", ...ue()], "xe"), Ge = /* @__PURE__ */ __name(() => [yo, "none", "subgrid", ge, me], "Ge"), ft = /* @__PURE__ */ __name(() => ["auto", {
    span: ["full", yo, ge, me]
  }, yo, ge, me], "ft"), Je = /* @__PURE__ */ __name(() => [yo, "auto", ge, me], "Je"), Ze = /* @__PURE__ */ __name(() => ["auto", "min", "max", "fr", ge, me], "Ze"), $e = /* @__PURE__ */ __name(() => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], "$e"), We = /* @__PURE__ */ __name(() => ["start", "end", "center", "stretch", "center-safe", "end-safe"], "We"), rt = /* @__PURE__ */ __name(() => ["auto", ...ue()], "rt"), ce = /* @__PURE__ */ __name(() => [Ka, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...ue()], "ce"), oe = /* @__PURE__ */ __name(() => [o, ge, me], "oe"), nt = /* @__PURE__ */ __name(() => [...Pe(), Lu, ju, {
    position: [ge, me]
  }], "nt"), St = /* @__PURE__ */ __name(() => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], "St"), A = /* @__PURE__ */ __name(() => ["auto", "cover", "contain", _d, Ed, {
    size: [ge, me]
  }], "A"), V = /* @__PURE__ */ __name(() => [ql, Xi, ta], "V"), ae = /* @__PURE__ */ __name(() => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    x,
    ge,
    me
  ], "ae"), ve = /* @__PURE__ */ __name(() => ["", He, Xi, ta], "ve"), de = /* @__PURE__ */ __name(() => ["solid", "dashed", "dotted", "double"], "de"), Re = /* @__PURE__ */ __name(() => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], "Re"), Se = /* @__PURE__ */ __name(() => [He, ql, Lu, ju], "Se"), De = /* @__PURE__ */ __name(() => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    G,
    ge,
    me
  ], "De"), Ee = /* @__PURE__ */ __name(() => ["none", He, ge, me], "Ee"), ze = /* @__PURE__ */ __name(() => ["none", He, ge, me], "ze"), bt = /* @__PURE__ */ __name(() => [He, ge, me], "bt"), Ut = /* @__PURE__ */ __name(() => [Ka, "full", ...ue()], "Ut");
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [Xn],
      breakpoint: [Xn],
      color: [wd],
      container: [Xn],
      "drop-shadow": [Xn],
      ease: ["in", "out", "in-out"],
      font: [Cd],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [Xn],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [Xn],
      shadow: [Xn],
      spacing: ["px", He],
      text: [Xn],
      "text-shadow": [Xn],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", Ka, me, ge, H]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [He, me, ge, P]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": ye()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": ye()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: pe()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: Ce()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": Ce()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": Ce()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: le()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": le()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": le()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: xe()
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": xe()
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": xe()
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: xe()
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: xe()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: xe()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: xe()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: xe()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: xe()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [yo, "auto", ge, me]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [Ka, "full", "auto", P, ...ue()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [He, Ka, "auto", "initial", "none", me]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", He, ge, me]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", He, ge, me]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [yo, "first", "last", "none", ge, me]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": Ge()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ft()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": Je()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": Je()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": Ge()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ft()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": Je()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": Je()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": Ze()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": Ze()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: ue()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": ue()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": ue()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...$e(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...We(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...We()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...$e()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...We(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...We(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": $e()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...We(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...We()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: ue()
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: ue()
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: ue()
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: ue()
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: ue()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: ue()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: ue()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: ue()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: ue()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: rt()
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: rt()
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: rt()
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: rt()
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: rt()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: rt()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: rt()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: rt()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: rt()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": ue()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": ue()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: ce()
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [P, "screen", ...ce()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          P,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...ce()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          P,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [E]
          },
          ...ce()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...ce()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...ce()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...ce()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", c, Xi, ta]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [d, ge, eu]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", ql, me]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [Td, me, i]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [l, ge, me]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [He, "none", ge, eu]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          S,
          ...ue()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", ge, me]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", ge, me]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: oe()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: oe()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...de(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [He, "from-font", "auto", ge, ta]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: oe()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [He, "auto", ge, me]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: ue()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", ge, me]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", ge, me]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: nt()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: St()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: A()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, yo, ge, me],
          radial: ["", ge, me],
          conic: [yo, ge, me]
        }, Pd, Rd]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: oe()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: V()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: V()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: V()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: oe()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: oe()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: oe()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: ae()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": ae()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": ae()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": ae()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": ae()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": ae()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": ae()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": ae()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": ae()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": ae()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": ae()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": ae()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": ae()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": ae()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": ae()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: ve()
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": ve()
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": ve()
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": ve()
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": ve()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": ve()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": ve()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": ve()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": ve()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": ve()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": ve()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...de(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...de(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: oe()
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": oe()
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": oe()
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": oe()
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": oe()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": oe()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": oe()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": oe()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": oe()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: oe()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...de(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [He, ge, me]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", He, Xi, ta]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: oe()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          M,
          Ws,
          $s
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: oe()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", I, Ws, $s]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": oe()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: ve()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: oe()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [He, ta]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": oe()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": ve()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": oe()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", $, Ws, $s]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": oe()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [He, ge, me]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...Re(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": Re()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [He]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": Se()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": Se()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": oe()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": oe()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": Se()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": Se()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": oe()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": oe()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": Se()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": Se()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": oe()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": oe()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": Se()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": Se()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": oe()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": oe()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": Se()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": Se()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": oe()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": oe()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": Se()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": Se()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": oe()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": oe()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": Se()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": Se()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": oe()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": oe()
      }],
      "mask-image-radial": [{
        "mask-radial": [ge, me]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": Se()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": Se()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": oe()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": oe()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": Pe()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [He]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": Se()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": Se()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": oe()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": oe()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: nt()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: St()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: A()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", ge, me]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          ge,
          me
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: De()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [He, ge, me]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [He, ge, me]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          te,
          Ws,
          $s
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": oe()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", He, ge, me]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [He, ge, me]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", He, ge, me]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [He, ge, me]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", He, ge, me]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          ge,
          me
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": De()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [He, ge, me]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [He, ge, me]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", He, ge, me]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [He, ge, me]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", He, ge, me]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [He, ge, me]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [He, ge, me]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", He, ge, me]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": ue()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": ue()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": ue()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", ge, me]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [He, "initial", ge, me]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", B, ge, me]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [He, ge, me]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", he, ge, me]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [se, ge, me]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": pe()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: Ee()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": Ee()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": Ee()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": Ee()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: ze()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": ze()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": ze()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": ze()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: bt()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": bt()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": bt()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [ge, me, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: pe()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: Ut()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": Ut()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": Ut()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": Ut()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: oe()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: oe()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", ge, me]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": ue()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": ue()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": ue()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": ue()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": ue()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": ue()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": ue()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": ue()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": ue()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": ue()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": ue()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": ue()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": ue()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": ue()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": ue()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": ue()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": ue()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": ue()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", ge, me]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...oe()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [He, Xi, ta, eu]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...oe()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
}, "Od");
var Fd = /* @__PURE__ */ pd(Od);
function Dt(...o) {
  return Fd(ic(o));
}
__name(Dt, "Dt");
var Dd = {
  outline: {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  },
  filled: {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    stroke: "none"
  }
};
var ia = /* @__PURE__ */ __name((o, i, c, d) => {
  const l = q.forwardRef(
    ({ color: S = "currentColor", size: E = 24, stroke: P = 2, title: g, className: x, children: M, ...I }, $) => q.createElement(
      "svg",
      {
        ref: $,
        ...Dd[o],
        width: E,
        height: E,
        className: ["tabler-icon", `tabler-icon-${i}`, x].join(" "),
        ...o === "filled" ? {
          fill: S
        } : {
          strokeWidth: P,
          stroke: S
        },
        ...I
      },
      [
        g && q.createElement("title", { key: "svg-title" }, g),
        ...d.map(([te, G]) => q.createElement(te, G)),
        ...Array.isArray(M) ? M : [M]
      ]
    )
  );
  return l.displayName = `${c}`, l;
}, "ia");
var Md = [["path", { d: "M5 12l5 5l10 -10", key: "svg-0" }]];
var jd = ia("outline", "check", "Check", Md);
var Ld = [["path", { d: "M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1", key: "svg-0" }], ["path", { d: "M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z", key: "svg-1" }], ["path", { d: "M16 5l3 3", key: "svg-2" }]];
var Ud = ia("outline", "edit", "Edit", Ld);
var Bd = [["path", { d: "M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2", key: "svg-0" }], ["path", { d: "M9 12h12l-3 -3", key: "svg-1" }], ["path", { d: "M18 15l3 -3", key: "svg-2" }]];
var Nd = ia("outline", "logout", "Logout", Bd);
var zd = [["path", { d: "M12 5l0 14", key: "svg-0" }], ["path", { d: "M5 12l14 0", key: "svg-1" }]];
var Uu = ia("outline", "plus", "Plus", zd);
var Hd = [["path", { d: "M4 7l16 0", key: "svg-0" }], ["path", { d: "M10 11l0 6", key: "svg-1" }], ["path", { d: "M14 11l0 6", key: "svg-2" }], ["path", { d: "M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12", key: "svg-3" }], ["path", { d: "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3", key: "svg-4" }]];
var $d = ia("outline", "trash", "Trash", Hd);
var Wd = [["path", { d: "M18 6l-12 12", key: "svg-0" }], ["path", { d: "M6 6l12 12", key: "svg-1" }]];
var Vd = ia("outline", "x", "X", Wd);
var Yd = [["path", { d: "M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z", key: "svg-0" }]];
var Gd = ia("filled", "brand-google-filled", "BrandGoogleFilled", Yd);
var Xd = Object.defineProperty;
var Jd = /* @__PURE__ */ __name((o, i, c) => i in o ? Xd(o, i, { enumerable: true, configurable: true, writable: true, value: c }) : o[i] = c, "Jd");
var tu = /* @__PURE__ */ __name((o, i, c) => (Jd(o, typeof i != "symbol" ? i + "" : i, c), c), "tu");
var Zd = class {
  static {
    __name(this, "Zd");
  }
  constructor() {
    tu(this, "current", this.detect()), tu(this, "handoffState", "pending"), tu(this, "currentId", 0);
  }
  set(i) {
    this.current !== i && (this.handoffState = "pending", this.currentId = 0, this.current = i);
  }
  reset() {
    this.set(this.detect());
  }
  nextId() {
    return ++this.currentId;
  }
  get isServer() {
    return this.current === "server";
  }
  get isClient() {
    return this.current === "client";
  }
  detect() {
    return typeof window > "u" || typeof document > "u" ? "server" : "client";
  }
  handoff() {
    this.handoffState === "pending" && (this.handoffState = "complete");
  }
  get isHandoffComplete() {
    return this.handoffState === "complete";
  }
};
var Ys = new Zd();
function Qd(o) {
  typeof queueMicrotask == "function" ? queueMicrotask(o) : Promise.resolve().then(o).catch((i) => setTimeout(() => {
    throw i;
  }));
}
__name(Qd, "Qd");
function Js() {
  let o = [], i = { addEventListener(c, d, l, S) {
    return c.addEventListener(d, l, S), i.add(() => c.removeEventListener(d, l, S));
  }, requestAnimationFrame(...c) {
    let d = requestAnimationFrame(...c);
    return i.add(() => cancelAnimationFrame(d));
  }, nextFrame(...c) {
    return i.requestAnimationFrame(() => i.requestAnimationFrame(...c));
  }, setTimeout(...c) {
    let d = setTimeout(...c);
    return i.add(() => clearTimeout(d));
  }, microTask(...c) {
    let d = { current: true };
    return Qd(() => {
      d.current && c[0]();
    }), i.add(() => {
      d.current = false;
    });
  }, style(c, d, l) {
    let S = c.style.getPropertyValue(d);
    return Object.assign(c.style, { [d]: l }), this.add(() => {
      Object.assign(c.style, { [d]: S });
    });
  }, group(c) {
    let d = Js();
    return c(d), this.add(() => d.dispose());
  }, add(c) {
    return o.includes(c) || o.push(c), () => {
      let d = o.indexOf(c);
      if (d >= 0) for (let l of o.splice(d, 1)) l();
    };
  }, dispose() {
    for (let c of o.splice(0)) c();
  } };
  return i;
}
__name(Js, "Js");
function gc() {
  let [o] = q.useState(Js);
  return q.useEffect(() => () => o.dispose(), [o]), o;
}
__name(gc, "gc");
var ko = /* @__PURE__ */ __name((o, i) => {
  Ys.isServer ? q.useEffect(o, i) : q.useLayoutEffect(o, i);
}, "ko");
function yc(o) {
  let i = q.useRef(o);
  return ko(() => {
    i.current = o;
  }, [o]), i;
}
__name(yc, "yc");
var Jn = /* @__PURE__ */ __name(function(o) {
  let i = yc(o);
  return vr.useCallback((...c) => i.current(...c), [i]);
}, "Jn");
function su(...o) {
  return Array.from(new Set(o.flatMap((i) => typeof i == "string" ? i.split(" ") : []))).filter(Boolean).join(" ");
}
__name(su, "su");
function Zs(o, i, ...c) {
  if (o in i) {
    let l = i[o];
    return typeof l == "function" ? l(...c) : l;
  }
  let d = new Error(`Tried to handle "${o}" but there is no handler defined. Only defined handlers are: ${Object.keys(i).map((l) => `"${l}"`).join(", ")}.`);
  throw Error.captureStackTrace && Error.captureStackTrace(d, Zs), d;
}
__name(Zs, "Zs");
var bc = ((o) => (o[o.None = 0] = "None", o[o.RenderStrategy = 1] = "RenderStrategy", o[o.Static = 2] = "Static", o))(bc || {});
var So = ((o) => (o[o.Unmount = 0] = "Unmount", o[o.Hidden = 1] = "Hidden", o))(So || {});
function wc() {
  let o = qd();
  return q.useCallback((i) => Kd({ mergeRefs: o, ...i }), [o]);
}
__name(wc, "wc");
function Kd({ ourProps: o, theirProps: i, slot: c, defaultTag: d, features: l, visible: S = true, name: E, mergeRefs: P }) {
  P = P ?? ep;
  let g = Sc(i, o);
  if (S) return Vs(g, c, d, E, P);
  let x = l ?? 0;
  if (x & 2) {
    let { static: M = false, ...I } = g;
    if (M) return Vs(I, c, d, E, P);
  }
  if (x & 1) {
    let { unmount: M = true, ...I } = g;
    return Zs(M ? 0 : 1, { 0() {
      return null;
    }, 1() {
      return Vs({ ...I, hidden: true, style: { display: "none" } }, c, d, E, P);
    } });
  }
  return Vs(g, c, d, E, P);
}
__name(Kd, "Kd");
function Vs(o, i = {}, c, d, l) {
  let { as: S = c, children: E, refName: P = "ref", ...g } = ru(o, ["unmount", "static"]), x = o.ref !== void 0 ? { [P]: o.ref } : {}, M = typeof E == "function" ? E(i) : E;
  "className" in g && g.className && typeof g.className == "function" && (g.className = g.className(i)), g["aria-labelledby"] && g["aria-labelledby"] === g.id && (g["aria-labelledby"] = void 0);
  let I = {};
  if (i) {
    let $ = false, te = [];
    for (let [G, se] of Object.entries(i)) typeof se == "boolean" && ($ = true), se === true && te.push(G.replace(/([A-Z])/g, (H) => `-${H.toLowerCase()}`));
    if ($) {
      I["data-headlessui-state"] = te.join(" ");
      for (let G of te) I[`data-${G}`] = "";
    }
  }
  if (S === q.Fragment && (Object.keys(ra(g)).length > 0 || Object.keys(ra(I)).length > 0)) if (!q.isValidElement(M) || Array.isArray(M) && M.length > 1) {
    if (Object.keys(ra(g)).length > 0) throw new Error(['Passing props on "Fragment"!', "", `The current component <${d} /> is rendering a "Fragment".`, "However we need to passthrough the following props:", Object.keys(ra(g)).concat(Object.keys(ra(I))).map(($) => `  - ${$}`).join(`
`), "", "You can apply a few solutions:", ['Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".', "Render a single element as the child so that we can forward the props onto that element."].map(($) => `  - ${$}`).join(`
`)].join(`
`));
  } else {
    let $ = M.props, te = $?.className, G = typeof te == "function" ? (...B) => su(te(...B), g.className) : su(te, g.className), se = G ? { className: G } : {}, H = Sc(M.props, ra(ru(g, ["ref"])));
    for (let B in I) B in H && delete I[B];
    return q.cloneElement(M, Object.assign({}, H, I, x, { ref: l(tp(M), x.ref) }, se));
  }
  return q.createElement(S, Object.assign({}, ru(g, ["ref"]), S !== q.Fragment && x, S !== q.Fragment && I), M);
}
__name(Vs, "Vs");
function qd() {
  let o = q.useRef([]), i = q.useCallback((c) => {
    for (let d of o.current) d != null && (typeof d == "function" ? d(c) : d.current = c);
  }, []);
  return (...c) => {
    if (!c.every((d) => d == null)) return o.current = c, i;
  };
}
__name(qd, "qd");
function ep(...o) {
  return o.every((i) => i == null) ? void 0 : (i) => {
    for (let c of o) c != null && (typeof c == "function" ? c(i) : c.current = i);
  };
}
__name(ep, "ep");
function Sc(...o) {
  if (o.length === 0) return {};
  if (o.length === 1) return o[0];
  let i = {}, c = {};
  for (let d of o) for (let l in d) l.startsWith("on") && typeof d[l] == "function" ? (c[l] != null || (c[l] = []), c[l].push(d[l])) : i[l] = d[l];
  if (i.disabled || i["aria-disabled"]) for (let d in c) /^(on(?:Click|Pointer|Mouse|Key)(?:Down|Up|Press)?)$/.test(d) && (c[d] = [(l) => {
    var S;
    return (S = l?.preventDefault) == null ? void 0 : S.call(l);
  }]);
  for (let d in c) Object.assign(i, { [d](l, ...S) {
    let E = c[d];
    for (let P of E) {
      if ((l instanceof Event || l?.nativeEvent instanceof Event) && l.defaultPrevented) return;
      P(l, ...S);
    }
  } });
  return i;
}
__name(Sc, "Sc");
function pu(o) {
  var i;
  return Object.assign(q.forwardRef(o), { displayName: (i = o.displayName) != null ? i : o.name });
}
__name(pu, "pu");
function ra(o) {
  let i = Object.assign({}, o);
  for (let c in i) i[c] === void 0 && delete i[c];
  return i;
}
__name(ra, "ra");
function ru(o, i = []) {
  let c = Object.assign({}, o);
  for (let d of i) d in c && delete c[d];
  return c;
}
__name(ru, "ru");
function tp(o) {
  return vr.version.split(".")[0] >= "19" ? o.props.ref : o.ref;
}
__name(tp, "tp");
var rp = Symbol();
function xc(...o) {
  let i = q.useRef(o);
  q.useEffect(() => {
    i.current = o;
  }, [o]);
  let c = Jn((d) => {
    for (let l of i.current) l != null && (typeof l == "function" ? l(d) : l.current = d);
  });
  return o.every((d) => d == null || d?.[rp]) ? void 0 : c;
}
__name(xc, "xc");
function np(o = 0) {
  let [i, c] = q.useState(o), d = q.useCallback((g) => c(g), [i]), l = q.useCallback((g) => c((x) => x | g), [i]), S = q.useCallback((g) => (i & g) === g, [i]), E = q.useCallback((g) => c((x) => x & ~g), [c]), P = q.useCallback((g) => c((x) => x ^ g), [c]);
  return { flags: i, setFlag: d, addFlag: l, hasFlag: S, removeFlag: E, toggleFlag: P };
}
__name(np, "np");
var Bu;
var Nu;
typeof process < "u" && typeof globalThis < "u" && typeof Element < "u" && ((Bu = process == null ? void 0 : process.env) == null ? void 0 : Bu.NODE_ENV) === "test" && typeof ((Nu = Element?.prototype) == null ? void 0 : Nu.getAnimations) > "u" && (Element.prototype.getAnimations = function() {
  return console.warn(["Headless UI has polyfilled `Element.prototype.getAnimations` for your tests.", "Please install a proper polyfill e.g. `jsdom-testing-mocks`, to silence these warnings.", "", "Example usage:", "```js", "import { mockAnimationsApi } from 'jsdom-testing-mocks'", "mockAnimationsApi()", "```"].join(`
`)), [];
});
var op = ((o) => (o[o.None = 0] = "None", o[o.Closed = 1] = "Closed", o[o.Enter = 2] = "Enter", o[o.Leave = 4] = "Leave", o))(op || {});
function ap(o) {
  let i = {};
  for (let c in o) o[c] === true && (i[`data-${c}`] = "");
  return i;
}
__name(ap, "ap");
function ip(o, i, c, d) {
  let [l, S] = q.useState(c), { hasFlag: E, addFlag: P, removeFlag: g } = np(o && l ? 3 : 0), x = q.useRef(false), M = q.useRef(false), I = gc();
  return ko(() => {
    var $;
    if (o) {
      if (c && S(true), !i) {
        c && P(3);
        return;
      }
      return ($ = d?.start) == null || $.call(d, c), sp(i, { inFlight: x, prepare() {
        M.current ? M.current = false : M.current = x.current, x.current = true, !M.current && (c ? (P(3), g(4)) : (P(4), g(2)));
      }, run() {
        M.current ? c ? (g(3), P(4)) : (g(4), P(3)) : c ? g(1) : P(1);
      }, done() {
        var te;
        M.current && typeof i.getAnimations == "function" && i.getAnimations().length > 0 || (x.current = false, g(7), c || S(false), (te = d?.end) == null || te.call(d, c));
      } });
    }
  }, [o, c, i, I]), o ? [l, { closed: E(1), enter: E(2), leave: E(4), transition: E(2) || E(4) }] : [c, { closed: void 0, enter: void 0, leave: void 0, transition: void 0 }];
}
__name(ip, "ip");
function sp(o, { prepare: i, run: c, done: d, inFlight: l }) {
  let S = Js();
  return up(o, { prepare: i, inFlight: l }), S.nextFrame(() => {
    c(), S.requestAnimationFrame(() => {
      S.add(lp(o, d));
    });
  }), S.dispose;
}
__name(sp, "sp");
function lp(o, i) {
  var c, d;
  let l = Js();
  if (!o) return l.dispose;
  let S = false;
  l.add(() => {
    S = true;
  });
  let E = (d = (c = o.getAnimations) == null ? void 0 : c.call(o).filter((P) => P instanceof CSSTransition)) != null ? d : [];
  return E.length === 0 ? (i(), l.dispose) : (Promise.allSettled(E.map((P) => P.finished)).then(() => {
    S || i();
  }), l.dispose);
}
__name(lp, "lp");
function up(o, { inFlight: i, prepare: c }) {
  if (i != null && i.current) {
    c();
    return;
  }
  let d = o.style.transition;
  o.style.transition = "none", c(), o.offsetHeight, o.style.transition = d;
}
__name(up, "up");
var hu = q.createContext(null);
hu.displayName = "OpenClosedContext";
var na = ((o) => (o[o.Open = 1] = "Open", o[o.Closed = 2] = "Closed", o[o.Closing = 4] = "Closing", o[o.Opening = 8] = "Opening", o))(na || {});
function kc() {
  return q.useContext(hu);
}
__name(kc, "kc");
function cp({ value: o, children: i }) {
  return vr.createElement(hu.Provider, { value: o }, i);
}
__name(cp, "cp");
function fp() {
  let o = typeof document > "u";
  return "useSyncExternalStore" in Eu ? ((i) => i.useSyncExternalStore)(Eu)(() => () => {
  }, () => false, () => !o) : false;
}
__name(fp, "fp");
function Cc() {
  let o = fp(), [i, c] = q.useState(Ys.isHandoffComplete);
  return i && Ys.isHandoffComplete === false && c(false), q.useEffect(() => {
    i !== true && c(true);
  }, [i]), q.useEffect(() => Ys.handoff(), []), o ? false : i;
}
__name(Cc, "Cc");
function dp() {
  let o = q.useRef(false);
  return ko(() => (o.current = true, () => {
    o.current = false;
  }), []), o;
}
__name(dp, "dp");
function Ec(o) {
  var i;
  return !!(o.enter || o.enterFrom || o.enterTo || o.leave || o.leaveFrom || o.leaveTo) || ((i = o.as) != null ? i : Tc) !== q.Fragment || vr.Children.count(o.children) === 1;
}
__name(Ec, "Ec");
var Qs = q.createContext(null);
Qs.displayName = "TransitionContext";
var pp = ((o) => (o.Visible = "visible", o.Hidden = "hidden", o))(pp || {});
function hp() {
  let o = q.useContext(Qs);
  if (o === null) throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");
  return o;
}
__name(hp, "hp");
function vp() {
  let o = q.useContext(Ks);
  if (o === null) throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");
  return o;
}
__name(vp, "vp");
var Ks = q.createContext(null);
Ks.displayName = "NestingContext";
function qs(o) {
  return "children" in o ? qs(o.children) : o.current.filter(({ el: i }) => i.current !== null).filter(({ state: i }) => i === "visible").length > 0;
}
__name(qs, "qs");
function Rc(o, i) {
  let c = yc(o), d = q.useRef([]), l = dp(), S = gc(), E = Jn((te, G = So.Hidden) => {
    let se = d.current.findIndex(({ el: H }) => H === te);
    se !== -1 && (Zs(G, { [So.Unmount]() {
      d.current.splice(se, 1);
    }, [So.Hidden]() {
      d.current[se].state = "hidden";
    } }), S.microTask(() => {
      var H;
      !qs(d) && l.current && ((H = c.current) == null || H.call(c));
    }));
  }), P = Jn((te) => {
    let G = d.current.find(({ el: se }) => se === te);
    return G ? G.state !== "visible" && (G.state = "visible") : d.current.push({ el: te, state: "visible" }), () => E(te, So.Unmount);
  }), g = q.useRef([]), x = q.useRef(Promise.resolve()), M = q.useRef({ enter: [], leave: [] }), I = Jn((te, G, se) => {
    g.current.splice(0), i && (i.chains.current[G] = i.chains.current[G].filter(([H]) => H !== te)), i?.chains.current[G].push([te, new Promise((H) => {
      g.current.push(H);
    })]), i?.chains.current[G].push([te, new Promise((H) => {
      Promise.all(M.current[G].map(([B, he]) => he)).then(() => H());
    })]), G === "enter" ? x.current = x.current.then(() => i?.wait.current).then(() => se(G)) : se(G);
  }), $ = Jn((te, G, se) => {
    Promise.all(M.current[G].splice(0).map(([H, B]) => B)).then(() => {
      var H;
      (H = g.current.shift()) == null || H();
    }).then(() => se(G));
  });
  return q.useMemo(() => ({ children: d, register: P, unregister: E, onStart: I, onStop: $, wait: x, chains: M }), [P, E, d, I, $, M, x]);
}
__name(Rc, "Rc");
var Tc = q.Fragment;
var _c = bc.RenderStrategy;
function mp(o, i) {
  var c, d;
  let { transition: l = true, beforeEnter: S, afterEnter: E, beforeLeave: P, afterLeave: g, enter: x, enterFrom: M, enterTo: I, entered: $, leave: te, leaveFrom: G, leaveTo: se, ...H } = o, [B, he] = q.useState(null), ye = q.useRef(null), Pe = Ec(o), pe = xc(...Pe ? [ye, i, he] : i === null ? [] : [i]), Ce = (c = H.unmount) == null || c ? So.Unmount : So.Hidden, { show: le, appear: ue, initial: xe } = hp(), [Ge, ft] = q.useState(le ? "visible" : "hidden"), Je = vp(), { register: Ze, unregister: $e } = Je;
  ko(() => Ze(ye), [Ze, ye]), ko(() => {
    if (Ce === So.Hidden && ye.current) {
      if (le && Ge !== "visible") {
        ft("visible");
        return;
      }
      return Zs(Ge, { hidden: /* @__PURE__ */ __name(() => $e(ye), "hidden"), visible: /* @__PURE__ */ __name(() => Ze(ye), "visible") });
    }
  }, [Ge, ye, Ze, $e, le, Ce]);
  let We = Cc();
  ko(() => {
    if (Pe && We && Ge === "visible" && ye.current === null) throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?");
  }, [ye, Ge, We, Pe]);
  let rt = xe && !ue, ce = ue && le && xe, oe = q.useRef(false), nt = Rc(() => {
    oe.current || (ft("hidden"), $e(ye));
  }, Je), St = Jn((Se) => {
    oe.current = true;
    let De = Se ? "enter" : "leave";
    nt.onStart(ye, De, (Ee) => {
      Ee === "enter" ? S?.() : Ee === "leave" && P?.();
    });
  }), A = Jn((Se) => {
    let De = Se ? "enter" : "leave";
    oe.current = false, nt.onStop(ye, De, (Ee) => {
      Ee === "enter" ? E?.() : Ee === "leave" && g?.();
    }), De === "leave" && !qs(nt) && (ft("hidden"), $e(ye));
  });
  q.useEffect(() => {
    Pe && l || (St(le), A(le));
  }, [le, Pe, l]);
  let V = !(!l || !Pe || !We || rt), [, ae] = ip(V, B, le, { start: St, end: A }), ve = ra({ ref: pe, className: ((d = su(H.className, ce && x, ce && M, ae.enter && x, ae.enter && ae.closed && M, ae.enter && !ae.closed && I, ae.leave && te, ae.leave && !ae.closed && G, ae.leave && ae.closed && se, !ae.transition && le && $)) == null ? void 0 : d.trim()) || void 0, ...ap(ae) }), de = 0;
  Ge === "visible" && (de |= na.Open), Ge === "hidden" && (de |= na.Closed), le && Ge === "hidden" && (de |= na.Opening), !le && Ge === "visible" && (de |= na.Closing);
  let Re = wc();
  return vr.createElement(Ks.Provider, { value: nt }, vr.createElement(cp, { value: de }, Re({ ourProps: ve, theirProps: H, defaultTag: Tc, features: _c, visible: Ge === "visible", name: "Transition.Child" })));
}
__name(mp, "mp");
function gp(o, i) {
  let { show: c, appear: d = false, unmount: l = true, ...S } = o, E = q.useRef(null), P = Ec(o), g = xc(...P ? [E, i] : i === null ? [] : [i]);
  Cc();
  let x = kc();
  if (c === void 0 && x !== null && (c = (x & na.Open) === na.Open), c === void 0) throw new Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");
  let [M, I] = q.useState(c ? "visible" : "hidden"), $ = Rc(() => {
    c || I("hidden");
  }), [te, G] = q.useState(true), se = q.useRef([c]);
  ko(() => {
    te !== false && se.current[se.current.length - 1] !== c && (se.current.push(c), G(false));
  }, [se, c]);
  let H = q.useMemo(() => ({ show: c, appear: d, initial: te }), [c, d, te]);
  ko(() => {
    c ? I("visible") : !qs($) && E.current !== null && I("hidden");
  }, [c, $]);
  let B = { unmount: l }, he = Jn(() => {
    var pe;
    te && G(false), (pe = o.beforeEnter) == null || pe.call(o);
  }), ye = Jn(() => {
    var pe;
    te && G(false), (pe = o.beforeLeave) == null || pe.call(o);
  }), Pe = wc();
  return vr.createElement(Ks.Provider, { value: $ }, vr.createElement(Qs.Provider, { value: H }, Pe({ ourProps: { ...B, as: q.Fragment, children: vr.createElement(Pc, { ref: g, ...B, ...S, beforeEnter: he, beforeLeave: ye }) }, theirProps: {}, defaultTag: q.Fragment, features: _c, visible: M === "visible", name: "Transition" })));
}
__name(gp, "gp");
function yp(o, i) {
  let c = q.useContext(Qs) !== null, d = kc() !== null;
  return vr.createElement(vr.Fragment, null, !c && d ? vr.createElement(lu, { ref: i, ...o }) : vr.createElement(Pc, { ref: i, ...o }));
}
__name(yp, "yp");
var lu = pu(gp);
var Pc = pu(mp);
var bp = pu(yp);
var zu = Object.assign(lu, { Child: bp, Root: lu });
var wp = sn(
  "btn",
  {
    variants: {
      // Color variants
      color: {
        default: "",
        neutral: "btn-neutral",
        primary: "btn-primary",
        secondary: "btn-secondary",
        accent: "btn-accent",
        info: "btn-info",
        success: "btn-success",
        warning: "btn-warning",
        error: "btn-error"
      },
      // Style variants
      style: {
        default: "",
        outline: "btn-outline",
        dash: "btn-dash",
        soft: "btn-soft",
        ghost: "btn-ghost",
        link: "btn-link"
      },
      // Behavior variants
      behaviour: {
        default: "",
        active: "btn-active",
        disabled: "btn-disabled"
      },
      // Size variants
      size: {
        xs: "btn-xs",
        sm: "btn-sm",
        md: "btn-md",
        lg: "btn-lg",
        xl: "btn-xl",
        icon: "btn-circle btn-xs p-0"
      },
      // Modifier variants
      modifier: {
        default: "",
        circle: "btn-circle",
        square: "btn-square",
        wide: "btn-wide",
        block: "btn-block"
      }
    },
    defaultVariants: {
      color: "default",
      style: "default",
      behaviour: "default",
      size: "md",
      modifier: "default"
    }
  }
);
function ti({
  className: o,
  color: i,
  style: c,
  behaviour: d,
  size: l,
  modifier: S,
  asChild: E = false,
  processing: P = false,
  success: g = false,
  fail: x = false,
  icon: M,
  disabled: I,
  children: $,
  ...te
}) {
  const G = E ? ni : "button", se = I || P, H = g ? "success" : x ? "error" : i, B = g || x ? "soft" : c, he = se ? "disabled" : d, ye = l === "icon", Pe = /* @__PURE__ */ __name(() => /* @__PURE__ */ J.jsxs(J.Fragment, { children: [
    /* @__PURE__ */ J.jsx(
      zu,
      {
        show: g,
        enter: "transition ease-in-out duration-300",
        enterFrom: "opacity-0 scale-95",
        enterTo: "opacity-100 scale-100",
        leave: "transition ease-in-out duration-200",
        leaveFrom: "opacity-100 scale-100",
        leaveTo: "opacity-0 scale-95",
        children: /* @__PURE__ */ J.jsx(jd, { size: ye ? "16" : "12", className: `text-success-foreground ${ye ? "" : "mr-2"}` })
      }
    ),
    /* @__PURE__ */ J.jsx(
      zu,
      {
        show: x,
        enter: "transition ease-in-out duration-300",
        enterFrom: "opacity-0 scale-95",
        enterTo: "opacity-100 scale-100",
        leave: "transition ease-in-out duration-200",
        leaveFrom: "opacity-100 scale-100",
        leaveTo: "opacity-0 scale-95",
        children: /* @__PURE__ */ J.jsx(Vd, { size: ye ? "16" : "12", className: `text-error-foreground ${ye ? "" : "mr-2"}` })
      }
    ),
    !g && !x && P && /* @__PURE__ */ J.jsx("span", { className: `loading loading-spinner ${ye ? "" : "mr-2"}` }),
    !P && !g && !x && M && q.createElement(M, { size: ye ? 16 : 12, className: ye ? "" : "mr-2" }),
    !ye && /* @__PURE__ */ J.jsx("span", { children: $ })
  ] }), "Pe");
  return /* @__PURE__ */ J.jsx(
    G,
    {
      className: Dt(wp({ color: H, style: B, behaviour: he, size: l, modifier: S }), o),
      disabled: se,
      ...te,
      children: Pe()
    }
  );
}
__name(ti, "ti");
var Sp = sn(
  "card bg-base-100",
  {
    variants: {
      // DaisyUI card size variants
      size: {
        xs: "card-xs",
        sm: "card-sm",
        md: "card-md",
        lg: "card-lg",
        xl: "card-xl"
      },
      // DaisyUI card style variants
      style: {
        default: "",
        border: "card-border",
        dash: "card-dash"
      },
      // DaisyUI card modifier variants
      modifier: {
        default: "",
        side: "card-side",
        image: "image-full"
      },
      // Shadow variants
      shadow: {
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
        none: "shadow-none"
      }
    },
    defaultVariants: {
      size: "md",
      style: "default",
      modifier: "default",
      shadow: "md"
    }
  }
);
var xp = sn("card-body");
var kp = sn("card-title");
var Cp = sn(
  "card-actions",
  {
    variants: {
      justify: {
        default: "",
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around"
      }
    },
    defaultVariants: {
      justify: "default"
    }
  }
);
var Ic = q.forwardRef(
  ({ className: o, size: i, style: c, modifier: d, shadow: l, ...S }, E) => /* @__PURE__ */ J.jsx(
    "div",
    {
      ref: E,
      className: Dt(Sp({ size: i, style: c, modifier: d, shadow: l }), o),
      ...S
    }
  )
);
Ic.displayName = "Card";
var Ac = q.forwardRef(
  ({ className: o, ...i }, c) => /* @__PURE__ */ J.jsx(
    "div",
    {
      ref: c,
      className: Dt(xp(), o),
      ...i
    }
  )
);
Ac.displayName = "CardBody";
var Oc = q.forwardRef(
  ({ className: o, ...i }, c) => /* @__PURE__ */ J.jsx(
    "h2",
    {
      ref: c,
      className: Dt(kp(), o),
      ...i
    }
  )
);
Oc.displayName = "CardTitle";
var Fc = q.forwardRef(
  ({ className: o, justify: i, ...c }, d) => /* @__PURE__ */ J.jsx(
    "div",
    {
      ref: d,
      className: Dt(Cp({ justify: i }), o),
      ...c
    }
  )
);
Fc.displayName = "CardActions";
var Dc = q.forwardRef(
  ({ className: o, ...i }, c) => /* @__PURE__ */ J.jsx(
    "figure",
    {
      ref: c,
      className: Dt(o),
      ...i
    }
  )
);
Dc.displayName = "CardFigure";
var xo = Ic;
xo.Body = Ac;
xo.Title = Oc;
xo.Actions = Fc;
xo.Figure = Dc;
var Ep = /* @__PURE__ */ __name(({ googleAuthUrl: o }) => /* @__PURE__ */ J.jsx("div", { className: "min-h-screen flex items-center justify-center bg-base-200", children: /* @__PURE__ */ J.jsx("div", { className: "w-full max-w-md p-8", children: /* @__PURE__ */ J.jsx(xo, { shadow: "xl", size: "xl", children: /* @__PURE__ */ J.jsxs(xo.Body, { className: "items-center text-center", children: [
  /* @__PURE__ */ J.jsx(xo.Title, { className: "text-3xl mb-2", children: "Store CRUD" }),
  /* @__PURE__ */ J.jsx("p", { className: "text-base-content/70 mb-8", children: "A modern store management application built with Hono" }),
  /* @__PURE__ */ J.jsx(xo.Actions, { className: "w-full flex justify-center", children: /* @__PURE__ */ J.jsx(
    ti,
    {
      color: "primary",
      style: "soft",
      modifier: "wide",
      icon: Gd,
      onClick: /* @__PURE__ */ __name(() => window.location.href = o, "onClick"),
      children: "Sign in with Google"
    }
  ) })
] }) }) }) }), "Ep");
var Hu = sn(
  "navbar",
  {
    variants: {
      // Color variants
      color: {
        default: "",
        neutral: "bg-neutral text-neutral-content",
        primary: "bg-primary text-primary-content",
        secondary: "bg-secondary text-secondary-content",
        accent: "bg-accent text-accent-content",
        info: "bg-info text-info-content",
        success: "bg-success text-success-content",
        warning: "bg-warning text-warning-content",
        error: "bg-error text-error-content",
        base100: "bg-base-100",
        base200: "bg-base-200",
        base300: "bg-base-300"
      },
      // Size variants
      size: {
        default: "",
        compact: "navbar-compact"
      },
      // Shadow variants
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl"
      },
      // Position variants
      position: {
        default: "",
        sticky: "sticky top-0 z-30",
        fixed: "fixed top-0 left-0 right-0 z-30"
      }
    },
    defaultVariants: {
      color: "default",
      size: "default",
      shadow: "none",
      position: "default"
    }
  }
);
function Rp({
  className: o,
  color: i,
  size: c,
  shadow: d,
  position: l,
  start: S,
  center: E,
  end: P,
  startProps: g,
  centerProps: x,
  endProps: M,
  asChild: I = false,
  children: $,
  ...te
}) {
  const G = I ? ni : "div";
  return $ ? /* @__PURE__ */ J.jsx(
    G,
    {
      className: Dt(Hu({ color: i, size: c, shadow: d, position: l }), o),
      ...te,
      children: $
    }
  ) : /* @__PURE__ */ J.jsxs(
    G,
    {
      className: Dt(Hu({ color: i, size: c, shadow: d, position: l }), o),
      role: "navigation",
      ...te,
      children: [
        S && /* @__PURE__ */ J.jsx(
          "div",
          {
            className: Dt("navbar-start", g?.className),
            ...g,
            children: S
          }
        ),
        E && /* @__PURE__ */ J.jsx(
          "div",
          {
            className: Dt("navbar-center", x?.className),
            ...x,
            children: E
          }
        ),
        P && /* @__PURE__ */ J.jsx(
          "div",
          {
            className: Dt("navbar-end", M?.className),
            ...M,
            children: P
          }
        )
      ]
    }
  );
}
__name(Rp, "Rp");
function Tp({
  className: o,
  children: i,
  asChild: c = false,
  ...d
}) {
  const l = c ? ni : "div";
  return /* @__PURE__ */ J.jsx(
    l,
    {
      className: Dt("navbar-brand text-xl font-bold p-2", o),
      ...d,
      children: i
    }
  );
}
__name(Tp, "Tp");
function _p({
  className: o,
  horizontal: i = true,
  children: c,
  asChild: d = false,
  ...l
}) {
  const S = d ? ni : "ul";
  return /* @__PURE__ */ J.jsx(
    S,
    {
      className: Dt(
        "menu",
        i ? "menu-horizontal" : "",
        "px-1",
        o
      ),
      ...l,
      children: c
    }
  );
}
__name(_p, "_p");
function Pp({
  className: o,
  asChild: i = false,
  ...c
}) {
  const d = i ? ni : "div";
  return /* @__PURE__ */ J.jsx(
    d,
    {
      className: Dt("navbar-start", o),
      ...c
    }
  );
}
__name(Pp, "Pp");
function Ip({
  className: o,
  asChild: i = false,
  ...c
}) {
  const d = i ? ni : "div";
  return /* @__PURE__ */ J.jsx(
    d,
    {
      className: Dt("navbar-end", o),
      ...c
    }
  );
}
__name(Ip, "Ip");
var ri = Rp;
ri.Start = Pp;
ri.End = Ip;
ri.Brand = Tp;
ri.Menu = _p;
var Ap = /* @__PURE__ */ __name((o) => {
  if (!o || o === "default") return "";
  const i = {
    zebra: "table-zebra",
    pinRows: "table-pin-rows",
    pinCols: "table-pin-cols"
  };
  return o.split(" ").map((c) => c.trim()).filter((c) => c && i[c]).map((c) => i[c]).join(" ");
}, "Ap");
var Op = sn(
  "table",
  {
    variants: {
      // DaisyUI table size variants (5 sizes)
      size: {
        xs: "table-xs",
        sm: "table-sm",
        md: "table-md",
        lg: "table-lg",
        xl: "table-xl"
      },
      // Responsive behavior
      responsive: {
        true: "",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      responsive: true
    },
    compoundVariants: [
      // When responsive is true, override size for small screens
      {
        responsive: true,
        size: "md",
        class: "table-xs sm:table-sm md:table-md"
      },
      {
        responsive: true,
        size: "lg",
        class: "table-xs sm:table-sm md:table-lg"
      },
      {
        responsive: true,
        size: "xl",
        class: "table-xs sm:table-sm md:table-xl"
      },
      // xs and sm sizes remain unchanged when responsive
      {
        responsive: true,
        size: "xs",
        class: "table-xs"
      },
      {
        responsive: true,
        size: "sm",
        class: "table-xs sm:table-sm"
      }
    ]
  }
);
var Fp = sn("overflow-x-auto");
var Dp = sn("");
var Mp = sn("");
var jp = sn(
  "",
  {
    variants: {
      hover: {
        default: "",
        true: "hover"
      },
      active: {
        default: "",
        true: "active"
      }
    },
    defaultVariants: {
      hover: "default",
      active: "default"
    }
  }
);
var Lp = sn("");
var Up = sn("");
var Mc = q.forwardRef(
  ({ className: o, size: i, modifier: c, responsive: d, ...l }, S) => /* @__PURE__ */ J.jsx(
    "table",
    {
      ref: S,
      className: Dt(
        Op({ size: i, responsive: d }),
        Ap(c),
        o
      ),
      ...l
    }
  )
);
Mc.displayName = "Table";
var jc = q.forwardRef(
  ({ className: o, ...i }, c) => /* @__PURE__ */ J.jsx(
    "div",
    {
      ref: c,
      className: Dt(Fp(), o),
      ...i
    }
  )
);
jc.displayName = "TableWrapper";
var Lc = q.forwardRef(
  ({ className: o, ...i }, c) => /* @__PURE__ */ J.jsx(
    "thead",
    {
      ref: c,
      className: Dt(Dp(), o),
      ...i
    }
  )
);
Lc.displayName = "TableHead";
var Uc = q.forwardRef(
  ({ className: o, ...i }, c) => /* @__PURE__ */ J.jsx(
    "tbody",
    {
      ref: c,
      className: Dt(Mp(), o),
      ...i
    }
  )
);
Uc.displayName = "TableBody";
var uu = q.forwardRef(
  ({ className: o, hover: i, active: c, ...d }, l) => /* @__PURE__ */ J.jsx(
    "tr",
    {
      ref: l,
      className: Dt(jp({ hover: i, active: c }), o),
      ...d
    }
  )
);
uu.displayName = "TableRow";
var bo = q.forwardRef(
  ({ className: o, ...i }, c) => /* @__PURE__ */ J.jsx(
    "td",
    {
      ref: c,
      className: Dt(Lp(), o),
      ...i
    }
  )
);
bo.displayName = "TableCell";
var wo = q.forwardRef(
  ({ className: o, ...i }, c) => /* @__PURE__ */ J.jsx(
    "th",
    {
      ref: c,
      className: Dt(Up(), o),
      ...i
    }
  )
);
wo.displayName = "TableHeaderCell";
var Bp = /* @__PURE__ */ __name((o) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
}).format(o), "Bp");
var Np = /* @__PURE__ */ __name((o) => new Date(o).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric"
}), "Np");
var zp = /* @__PURE__ */ __name(({
  items: o,
  loading: i = false,
  onEdit: c,
  onDelete: d,
  onAdd: l
}) => i ? /* @__PURE__ */ J.jsx("div", { className: "card bg-base-100 shadow-xl", children: /* @__PURE__ */ J.jsx("div", { className: "card-body", children: /* @__PURE__ */ J.jsxs("div", { className: "flex items-center justify-center p-8", children: [
  /* @__PURE__ */ J.jsx("span", { className: "loading loading-spinner loading-lg" }),
  /* @__PURE__ */ J.jsx("span", { className: "ml-4 text-base-content/70", children: "Loading items..." })
] }) }) }) : /* @__PURE__ */ J.jsx("div", { className: "card bg-base-100 shadow-xl", children: /* @__PURE__ */ J.jsxs("div", { className: "card-body", children: [
  /* @__PURE__ */ J.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
    /* @__PURE__ */ J.jsxs("div", { children: [
      /* @__PURE__ */ J.jsx("h2", { className: "card-title text-2xl", children: "Store Items" }),
      /* @__PURE__ */ J.jsxs("p", { className: "text-base-content/70", children: [
        o.length,
        " item",
        o.length !== 1 ? "s" : "",
        " in inventory"
      ] })
    ] }),
    l && /* @__PURE__ */ J.jsx(
      ti,
      {
        color: "primary",
        icon: Uu,
        onClick: l,
        children: "Add Item"
      }
    )
  ] }),
  o.length === 0 ? /* @__PURE__ */ J.jsxs("div", { className: "text-center py-12", children: [
    /* @__PURE__ */ J.jsx("div", { className: "text-base-content/50 text-lg mb-4", children: "No items found" }),
    /* @__PURE__ */ J.jsx("p", { className: "text-base-content/70 mb-6", children: "Get started by adding your first item to the inventory." }),
    l && /* @__PURE__ */ J.jsx(
      ti,
      {
        color: "primary",
        style: "outline",
        icon: Uu,
        onClick: l,
        children: "Add Your First Item"
      }
    )
  ] }) : /* @__PURE__ */ J.jsx(jc, { children: /* @__PURE__ */ J.jsxs(Mc, { size: "md", modifier: "zebra", className: "w-full", children: [
    /* @__PURE__ */ J.jsx(Lc, { children: /* @__PURE__ */ J.jsxs(uu, { children: [
      /* @__PURE__ */ J.jsx(wo, { children: "Name" }),
      /* @__PURE__ */ J.jsx(wo, { children: "Description" }),
      /* @__PURE__ */ J.jsx(wo, { children: "Price" }),
      /* @__PURE__ */ J.jsx(wo, { children: "Quantity" }),
      /* @__PURE__ */ J.jsx(wo, { children: "Category" }),
      /* @__PURE__ */ J.jsx(wo, { children: "Updated" }),
      /* @__PURE__ */ J.jsx(wo, { children: "Actions" })
    ] }) }),
    /* @__PURE__ */ J.jsx(Uc, { children: o.map((S) => /* @__PURE__ */ J.jsxs(uu, { hover: true, children: [
      /* @__PURE__ */ J.jsx(bo, { children: /* @__PURE__ */ J.jsx("div", { className: "font-semibold", children: S.name }) }),
      /* @__PURE__ */ J.jsx(bo, { children: /* @__PURE__ */ J.jsx("div", { className: "max-w-xs truncate text-base-content/70", children: S.description || "\u2014" }) }),
      /* @__PURE__ */ J.jsx(bo, { children: /* @__PURE__ */ J.jsx("div", { className: "font-mono", children: Bp(S.price) }) }),
      /* @__PURE__ */ J.jsx(bo, { children: /* @__PURE__ */ J.jsx("div", { className: `badge ${S.quantity === 0 ? "badge-error" : S.quantity < 10 ? "badge-warning" : "badge-success"}`, children: S.quantity }) }),
      /* @__PURE__ */ J.jsx(bo, { children: /* @__PURE__ */ J.jsx("div", { className: "text-base-content/70", children: S.category || "\u2014" }) }),
      /* @__PURE__ */ J.jsx(bo, { children: /* @__PURE__ */ J.jsx("div", { className: "text-base-content/70 text-sm", children: Np(S.updatedAt) }) }),
      /* @__PURE__ */ J.jsx(bo, { children: /* @__PURE__ */ J.jsxs("div", { className: "flex gap-2", children: [
        c && /* @__PURE__ */ J.jsx(
          ti,
          {
            size: "sm",
            style: "ghost",
            color: "primary",
            icon: Ud,
            onClick: /* @__PURE__ */ __name(() => c(S), "onClick")
          }
        ),
        d && /* @__PURE__ */ J.jsx(
          ti,
          {
            size: "sm",
            style: "ghost",
            color: "error",
            icon: $d,
            onClick: /* @__PURE__ */ __name(() => d(S), "onClick")
          }
        )
      ] }) })
    ] }, S.id)) })
  ] }) })
] }) }), "zp");
function Hp(o) {
  let i = { price: 0, quantity: 0, category: "" };
  try {
    if (o.data) {
      const c = JSON.parse(o.data);
      i = {
        price: parseFloat(c.price) || 0,
        quantity: parseInt(c.quantity) || 0,
        category: c.category || ""
      };
    }
  } catch {
  }
  return {
    id: o.id.toString(),
    name: o.name,
    description: o.description,
    price: i.price,
    quantity: i.quantity,
    category: i.category,
    createdAt: o.created_at,
    updatedAt: o.updated_at
  };
}
__name(Hp, "Hp");
var $p = /* @__PURE__ */ __name(() => {
  if (typeof window < "u" && window.__INITIAL_PROPS__?.apiUrl)
    return window.__INITIAL_PROPS__.apiUrl;
}, "$p");
var Wp = $p();
function Vp() {
  if (typeof window > "u") return null;
}
__name(Vp, "Vp");
async function Bc(o, i = {}) {
  const c = Vp(), d = await fetch(`${Wp}${o}`, {
    ...i,
    headers: {
      "Content-Type": "application/json",
      ...c && { Authorization: `Bearer ${c}` },
      ...i.headers
    },
    credentials: "include"
    // Include cookies for session
  });
  if (!d.ok) {
    const l = await d.text();
    throw new Error(`API Error ${d.status}: ${l}`);
  }
  return d.json();
}
__name(Bc, "Bc");
async function Nc() {
  return (await Bc("/api/items")).items.map(Hp);
}
__name(Nc, "Nc");
async function Yp(o) {
  return Bc(`/api/items/${o}`, {
    method: "DELETE"
  });
}
__name(Yp, "Yp");
var Gp = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  deleteItem: Yp,
  getItems: Nc
}, Symbol.toStringTag, { value: "Module" }));
var Xp = /* @__PURE__ */ __name(({ user: o }) => {
  const [i, c] = q.useState([]), [d, l] = q.useState(true), [S, E] = q.useState(null);
  q.useEffect(() => {
    (async () => {
      try {
        l(true);
        const $ = await Nc();
        c($), E(null);
      } catch ($) {
        console.error("Failed to fetch items:", $), E($ instanceof Error ? $.message : "Failed to load items");
      } finally {
        l(false);
      }
    })().then();
  }, []);
  const P = /* @__PURE__ */ __name(() => {
    window.location.href = "/auth/logout";
  }, "P"), g = /* @__PURE__ */ __name((I) => {
    console.log("Edit item:", I);
  }, "g"), x = /* @__PURE__ */ __name(async (I) => {
    if (confirm(`Are you sure you want to delete "${I.name}"?`))
      try {
        const { deleteItem: $ } = await Promise.resolve().then(() => Gp);
        await $(I.id), c(i.filter((te) => te.id !== I.id));
      } catch ($) {
        console.error("Failed to delete item:", $), E($ instanceof Error ? $.message : "Failed to delete item");
      }
  }, "x"), M = /* @__PURE__ */ __name(() => {
    console.log("Add new item");
  }, "M");
  return /* @__PURE__ */ J.jsxs("div", { className: "min-h-screen bg-base-200", children: [
    /* @__PURE__ */ J.jsx(
      ri,
      {
        color: "base100",
        shadow: "md",
        position: "sticky",
        start: /* @__PURE__ */ J.jsx(ri.Brand, { children: "Store CRUD" }),
        end: /* @__PURE__ */ J.jsxs("div", { className: "flex flex-row gap-4", children: [
          /* @__PURE__ */ J.jsxs("div", { className: "p-2 my-auto text-sm", children: [
            "Logged in as: ",
            o.email
          ] }),
          /* @__PURE__ */ J.jsx(
            ti,
            {
              style: "ghost",
              icon: Nd,
              onClick: P,
              children: "Logout"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ J.jsxs("div", { className: "container mx-auto px-4 py-8", children: [
      S ? /* @__PURE__ */ J.jsx("div", { className: "alert alert-error mb-6", children: /* @__PURE__ */ J.jsxs("span", { children: [
        "Error: ",
        S
      ] }) }) : null,
      /* @__PURE__ */ J.jsx(
        zp,
        {
          items: i,
          loading: d,
          onEdit: g,
          onDelete: x,
          onAdd: M
        }
      )
    ] })
  ] });
}, "Xp");
var Jp = {
  "src/client.tsx": { file: "static/client.js", css: ["assets/client-BMiILdY_.css"] }
};
var ii = new rc();
ii.use(
  Df(({ children: o, initialProps: i }) => {
    let c = [], d = "/src/client.tsx";
    {
      const E = Jp["src/client.tsx"];
      c = E?.css || [], d = `/${E.file}`;
    }
    const S = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>')}`;
    return /* @__PURE__ */ J.jsxs("html", { "data-theme": "dim", children: [
      /* @__PURE__ */ J.jsxs("head", { children: [
        /* @__PURE__ */ J.jsx("meta", { charSet: "utf-8" }),
        /* @__PURE__ */ J.jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
        /* @__PURE__ */ J.jsx("link", { rel: "icon", href: S, type: "image/svg+xml" }),
        c.map((E) => /* @__PURE__ */ J.jsx("link", { rel: "stylesheet", href: `/${E}` }, E)),
        false,
        i && /* @__PURE__ */ J.jsx("script", { dangerouslySetInnerHTML: {
          __html: `window.__INITIAL_PROPS__ = ${JSON.stringify(i)};`
        } })
      ] }),
      /* @__PURE__ */ J.jsxs("body", { className: "min-h-screen bg-base-200", children: [
        /* @__PURE__ */ J.jsx("div", { id: "app", children: o }),
        /* @__PURE__ */ J.jsx("script", { type: "module", src: d })
      ] })
    ] });
  })
);
ii.use("*", Mf({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
ii.get("/test", (o) => o.text(`Test OK. CLIENT_ID exists: ${!!o.env.GOOGLE_CLIENT_ID}, Length: ${o.env.GOOGLE_CLIENT_ID?.length || 0}`));
ii.get("/", (o) => {
  const i = oa(o.env), c = fu(o, i.session.cookieName);
  if (c)
    try {
      return oc(c), o.redirect("/dashboard");
    } catch {
    }
  const d = oa(o.env), S = {
    googleAuthUrl: `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: d.google.clientId,
      redirect_uri: d.google.redirectURI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline"
    }).toString()}`,
    apiUrl: o.env?.API_URL || void 0
  };
  return o.render(/* @__PURE__ */ J.jsx(Ep, { ...S }), { initialProps: S });
});
ii.get("/dashboard", (o) => {
  const i = oa(o.env), c = fu(o, i.session.cookieName);
  if (!c)
    return o.redirect("/");
  let d;
  try {
    d = oc(c);
  } catch {
    return o.redirect("/");
  }
  if (!d)
    return o.redirect("/");
  const l = {
    user: d,
    apiUrl: o.env?.API_URL || void 0
  };
  return o.render(/* @__PURE__ */ J.jsx(Xp, { ...l }), { initialProps: l });
});
var vu = new rc();
vu.get("/callback/google", async (o) => {
  try {
    const i = o.req.query("code");
    if (!i)
      return o.redirect("/?error=no_code");
    const c = oa(o.env), d = await $f(i, c), l = await Wf(d.access_token), S = {
      id: l.id,
      name: l.name,
      email: l.email,
      image: l.picture
    }, E = Vf(S);
    return nc(o, c.session.cookieName, E, {
      httpOnly: true,
      secure: o.env?.ENVIRONMENT === "production",
      sameSite: "Lax",
      maxAge: c.session.maxAge
    }), o.redirect("/dashboard");
  } catch (i) {
    return console.error("OAuth callback error:", i), o.redirect("/?error=auth_failed");
  }
});
vu.get("/logout", async (o) => {
  const i = oa(o.env);
  return zf(o, i.session.cookieName), o.redirect("/");
});
ii.route("/auth", vu);

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-xD8FEb/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = ii;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-xD8FEb/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * @license React
 * react-dom-server-legacy.browser.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * @license React
 * react-dom-server.browser.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * @license React
 * react-dom-server-legacy.browser.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * @license React
 * react-dom-server.browser.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * @license @tabler/icons-react v3.34.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
//# sourceMappingURL=index.js.map
