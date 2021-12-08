let logger = () => null;

/**
 * Reveal web components when loading is complete by removing the unresolved attribute
 * from the body tag; log the event.
 * @throws debugging log indicating the reveal event
 */
function reveal() {
  logger(`[reveal] elements ready, revealing the body`);
  window.document.body.removeAttribute("unresolved");
}

/**
 * Auto-reveal functionality prevents a flash of unstyled content before components
 * have finished loading.
 * @param {function} logFunction
 * @see https://github.com/github/webcomponentsjs#webcomponents-loaderjs
 */
function autoReveal(logFunction) {
  logger = logFunction;
  // If Web Components are already ready, run the handler right away.  If they
  // are not yet ready, wait.
  //
  // see https://github.com/github/webcomponentsjs#webcomponents-loaderjs for
  // info about web component readiness events
  const polyfillPresent = window.WebComponents;
  const polyfillReady = polyfillPresent && window.WebComponents.ready;

  if (!polyfillPresent || polyfillReady) {
    handleWebComponentsReady();
  } else {
    window.addEventListener("WebComponentsReady", handleWebComponentsReady);
  }
}

/**
 * Reveal web components when loading is complete and log event.
 * @throws debugging log indicating the web components are ready
 */
function handleWebComponentsReady() {
  logger("[reveal] web components ready");
  reveal();
}

/**
 * Verify that a property definition's `type` field contains one of the allowed
 * types.  If the definition type resolves to falsy, assumes String type.
 * @param {constructor} definition
 * @default String
 * @return {Boolean} True if the definition type is one of String, Number, or Boolean
 */
function isAllowedType(definition) {
  return [String, Number, Boolean].includes(definition.type || String);
}

/**
 * Verify that a property definition's `default` value is of the correct type.
 *
 * A `default` value is valid if it's of the same type as the `type`
 * definition.  Or, if there is no `type` definition, then it must be a String
 * (the default value for `type`).
 * @param {type} definition
 * @return {Boolean} True if the default value matches the type of the definition object.
 */
function isValidDefaultType(definition) {
  return definition.hasOwnProperty("default") && definition.default.constructor === definition.type;
}

// @POLYFILL  Array.includes
/** @see https://tc39.github.io/ecma262/#sec-array.prototype.includes */
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, "includes", {
    value: function (valueToFind, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === "number" && typeof y === "number" && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(valueToFind, elementK) is true, return true.
        if (sameValueZero(o[k], valueToFind)) {
          return true;
        }
        // c. Increase k by 1.
        k++;
      }

      // 8. Return false
      return false;
    },
  });
}

// @POLYFILL Object.entries
/** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries */
if (!Object.entries) {
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}

// @POLYFILL String.startsWith
/** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith#polyfill */
if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, "startsWith", {
    value: function (search, rawPos) {
      var pos = rawPos > 0 ? rawPos | 0 : 0;
      return this.substring(pos, pos + search.length) === search;
    },
  });
}

// @POLYFILL  Element.closest
// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// @POLYFILL  Element.matches
// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// @POLYFILL  Array.prototype.find
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, "find", {
    value: function (predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== "function") {
        throw new TypeError("predicate must be a function");
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true,
  });
}

/*!
 * PatternFly Elements: PFElement 1.12.2
 * @license
 * Copyright 2021 Red Hat, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
*/

// /**
//  * Global prefix used for all components in the project.
//  * @constant {String}
//  * */
const prefix = "pfe";

/**
 * @class PFElement
 * @extends HTMLElement
 * @version 1.12.2
 * @classdesc Serves as the baseline for all PatternFly Element components.
 */
class PFElement extends HTMLElement {
  /**
   * A boolean value that indicates if the logging should be printed to the console; used for debugging.
   * For use in a JS file or script tag; can also be added in the constructor of a component during development.
   * @example PFElement.debugLog(true);
   * @tags debug
   */
  static debugLog(preference = null) {
    if (preference !== null) {
      // wrap localStorage references in a try/catch; merely referencing it can
      // throw errors in some locked down environments
      try {
        localStorage.pfeLog = !!preference;
      } catch (e) {
        // if localStorage fails, fall back to PFElement._debugLog
        PFElement._debugLog = !!preference;
        return PFElement._debugLog;
      }
    }
    // @TODO the reference to _debugLog is for backwards compatibiilty and will be removed in 2.0
    return localStorage.pfeLog === "true" || PFElement._debugLog;
  }

  /**
   * A boolean value that indicates if the performance should be tracked.
   * For use in a JS file or script tag; can also be added in the constructor of a component during development.
   * @example PFElement._trackPerformance = true;
   */
  static trackPerformance(preference = null) {
    if (preference !== null) {
      PFElement._trackPerformance = !!preference;
    }
    return PFElement._trackPerformance;
  }

  /**
   * A object that contains configuration set outside of pfe.
   *
   * @example const config = PFElement.config;
   */
  static get config() {
    // @TODO: Add config validation in the future.
    return window.PfeConfig || {};
  }

  /**
   * A logging wrapper which checks the debugLog boolean and prints to the console if true.
   *
   * @example PFElement.log("Hello");
   */
  static log(...msgs) {
    if (PFElement.debugLog()) {
      console.log(...msgs);
    }
  }

  /**
   * Local logging that outputs the tag name as a prefix automatically
   *
   * @example this.log("Hello");
   */
  log(...msgs) {
    PFElement.log(`[${this.tag}${this.id ? `#${this.id}` : ""}]`, ...msgs);
  }

  /**
   * A console warning wrapper which formats your output with useful debugging information.
   *
   * @example PFElement.warn("Hello");
   */
  static warn(...msgs) {
    console.warn(...msgs);
  }

  /**
   * Local warning wrapper that outputs the tag name as a prefix automatically.
   * For use inside a component's function.
   * @example this.warn("Hello");
   */
  warn(...msgs) {
    PFElement.warn(`[${this.tag}${this.id ? `#${this.id}` : ``}]`, ...msgs);
  }

  /**
   * A console error wrapper which formats your output with useful debugging information.
   * For use inside a component's function.
   * @example PFElement.error("Hello");
   */
  static error(...msgs) {
    throw new Error([...msgs].join(" "));
  }

  /**
   * Local error wrapper that outputs the tag name as a prefix automatically.
   * For use inside a component's function.
   * @example this.error("Hello");
   */
  error(...msgs) {
    PFElement.error(`[${this.tag}${this.id ? `#${this.id}` : ``}]`, ...msgs);
  }

  /**
   * A global definition of component types (a general way of defining the purpose of a
   * component and how it is put together).
   */
  static get PfeTypes() {
    return {
      Container: "container",
      Content: "content",
      Combo: "combo",
    };
  }

  /**
   * The current version of a component; set by the compiler using the package.json data.
   */
  static get version() {
    return "1.12.2";
  }

  /**
   * A local alias to the static version.
   * For use in the console to validate version being loaded.
   * @example PfeAccordion.version
   */
  get version() {
    return this._pfeClass.version;
  }

  /**
   * Global property definitions: properties managed by the base class that apply to all components.
   */
  static get properties() {
    return {
      pfelement: {
        title: "Upgraded flag",
        type: Boolean,
        default: true,
        observer: "_upgradeObserver",
      },
      on: {
        title: "Context",
        description: "Describes the visual context (backgrounds).",
        type: String,
        values: ["light", "dark", "saturated"],
        default: (el) => el.contextVariable,
        observer: "_onObserver",
      },
      context: {
        title: "Context hook",
        description: "Lets you override the system-set context.",
        type: String,
        values: ["light", "dark", "saturated"],
        observer: "_contextObserver",
      },
      // @TODO: Deprecated with 1.0
      oldTheme: {
        type: String,
        values: ["light", "dark", "saturated"],
        alias: "context",
        attr: "pfe-theme",
      },
      _style: {
        title: "Custom styles",
        type: String,
        attr: "style",
        observer: "_inlineStyleObserver",
      },
      type: {
        title: "Component type",
        type: String,
        values: ["container", "content", "combo"],
      },
    };
  }

  static get observedAttributes() {
    const properties = this.allProperties;
    if (properties) {
      const oa = Object.keys(properties)
        .filter((prop) => properties[prop].observer || properties[prop].cascade || properties[prop].alias)
        .map((p) => this._convertPropNameToAttrName(p));
      return [...oa];
    }
  }

  /**
   * A quick way to fetch a random ID value.
   * _Note:_ All values are prefixes with `pfe` automatically to ensure an ID-safe value is returned.
   *
   * @example this.id = this.randomID;
   */
  get randomId() {
    return `${prefix}-` + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Set the --context variable with the provided value in this component.
   */
  set contextVariable(value) {
    this.cssVariable("context", value);
  }

  /**
   * Get the current value of the --context variable in this component.
   * @return {string} [dark|light|saturated]
   */
  get contextVariable() {
    /* @DEPRECATED --theme in 1.0, to be removed in 2.0 */
    return this.cssVariable("context") || this.cssVariable("theme");
  }

  /**
   * Returns a boolean statement of whether or not this component contains any light DOM.
   * @returns {boolean}
   * @example if(this.hasLightDOM()) this._init();
   */
  hasLightDOM() {
    return this.children.length || this.textContent.trim().length;
  }

  /**
   * Returns a boolean statement of whether or not that slot exists in the light DOM.
   *
   * @param {String|Array} name The slot name.
   * @example this.hasSlot("header");
   */
  hasSlot(name) {
    if (!name) {
      this.warn(`Please provide at least one slot name for which to search.`);
      return;
    }

    if (typeof name === "string") {
      return (
        [...this.children].filter((child) => child.hasAttribute("slot") && child.getAttribute("slot") === name).length >
        0
      );
    } else if (Array.isArray(name)) {
      return name.reduce(
        (n) =>
          [...this.children].filter((child) => child.hasAttribute("slot") && child.getAttribute("slot") === n).length >
          0
      );
    } else {
      this.warn(`Expected hasSlot argument to be a string or an array, but it was given: ${typeof name}.`);
      return;
    }
  }

  /**
   * Given a slot name, returns elements assigned to the slot as an arry.
   * If no value is provided (i.e., `this.getSlot()`), it returns all children not assigned to a slot (without a slot attribute).
   *
   * @example: `this.getSlot("header")`
   */
  getSlot(name = "unassigned") {
    if (name !== "unassigned") {
      return [...this.children].filter((child) => child.hasAttribute("slot") && child.getAttribute("slot") === name);
    } else {
      return [...this.children].filter((child) => !child.hasAttribute("slot"));
    }
  }

  cssVariable(name, value, element = this) {
    name = name.substr(0, 2) !== "--" ? "--" + name : name;
    if (value) {
      element.style.setProperty(name, value);
      return value;
    }
    return window.getComputedStyle(element).getPropertyValue(name).trim() || null;
  }

  /**
   * This alerts nested components to a change in the context
   */
  contextUpdate() {
    // Loop over light DOM elements, find direct descendants that are components
    const lightEls = [...this.querySelectorAll("*")]
      .filter((item) => item.tagName.toLowerCase().slice(0, 4) === `${prefix}-`)
      // Closest will return itself or it's ancestor matching that selector
      .filter((item) => {
        // If there is no parent element, return null
        if (!item.parentElement) return;
        // Otherwise, find the closest component that's this one
        else return item.parentElement.closest(`[${this._pfeClass._getCache("prop2attr").pfelement}]`) === this;
      });

    // Loop over shadow elements, find direct descendants that are components
    let shadowEls = [...this.shadowRoot.querySelectorAll("*")]
      .filter((item) => item.tagName.toLowerCase().slice(0, 4) === `${prefix}-`)
      // Closest will return itself or it's ancestor matching that selector
      .filter((item) => {
        // If there is a parent element and we can find another web component in the ancestor tree
        if (item.parentElement && item.parentElement.closest(`[${this._pfeClass._getCache("prop2attr").pfelement}]`)) {
          return item.parentElement.closest(`[${this._pfeClass._getCache("prop2attr").pfelement}]`) === this;
        }
        // Otherwise, check if the host matches this context
        if (item.getRootNode().host === this) return true;

        // If neither state is true, return false
        return false;
      });

    const nestedEls = lightEls.concat(shadowEls);

    // If nested elements don't exist, return without processing
    if (nestedEls.length === 0) return;

    // Loop over the nested elements and reset their context
    nestedEls.map((child) => {
      if (child.resetContext) {
        this.log(`Update context of ${child.tagName.toLowerCase()}`);

        // Ask the component to recheck it's context in case it changed
        child.resetContext(this.on);
      }
    });
  }

  resetContext(fallback) {
    if (this.isIE11) return;

    // Priority order for context values to be pulled from:
    //--> 1. context (OLD: pfe-theme)
    //--> 2. --context (OLD: --theme)
    let value = this.context || this.contextVariable || fallback;

    // Validate that the current context (this.on) and the new context (value) are the same OR
    // no context is set and there isn't a new context being set
    if (this.on === value || (!this.on && !value)) return;

    this.log(`Resetting context from ${this.on} to ${value || "null"}`);
    this.on = value;
  }

  constructor(pfeClass, { type = null, delayRender = false } = {}) {
    super();

    this._pfeClass = pfeClass;
    this.tag = pfeClass.tag;
    this._parseObserver = this._parseObserver.bind(this);
    this.isIE11 = /MSIE|Trident|Edge\//.test(window.navigator.userAgent);

    // Initialize the array of jump links pointers
    // Expects items in the array to be NodeItems
    if (!this._pfeClass.instances || !(this._pfeClass.instances.length >= 0)) this._pfeClass.instances = [];

    // Set up the mark ID based on existing ID on component if it exists
    if (!this.id) {
      this._markId = this.randomId.replace("pfe", this.tag);
    } else if (this.id.startsWith("pfe-") && !this.id.startsWith(this.tag)) {
      this._markId = this.id.replace("pfe", this.tag);
    } else {
      this._markId = `${this.tag}-${this.id}`;
    }

    this._markCount = 0;

    // TODO: Deprecated for 1.0 release
    this.schemaProps = pfeClass.schemaProperties;

    // TODO: Migrate this out of schema for 1.0
    this.slots = pfeClass.slots;

    this.template = document.createElement("template");

    // Set the default value to the passed in type
    if (type && this._pfeClass.allProperties.type) this._pfeClass.allProperties.type.default = type;

    // Initalize the properties and attributes from the property getter
    this._initializeProperties();

    this.attachShadow({ mode: "open" });

    // Tracks if the component has been initially rendered. Useful if for debouncing
    // template updates.
    this._rendered = false;

    if (!delayRender) this.render();
  }

  /**
   * Standard connected callback; fires when the component is added to the DOM.
   */
  connectedCallback() {
    this._initializeAttributeDefaults();

    if (window.ShadyCSS) window.ShadyCSS.styleElement(this);

    // Register this instance with the pointer for the scoped class and the global context
    this._pfeClass.instances.push(this);
    PFElement.allInstances.push(this);

    // If the slot definition exists, set up an observer
    if (typeof this.slots === "object") {
      this._slotsObserver = new MutationObserver(() => this._initializeSlots(this.tag, this.slots));
      this._initializeSlots(this.tag, this.slots);
    }
  }

  /**
   * Standard disconnected callback; fires when a componet is removed from the DOM.
   * Add your removeEventListeners here.
   */
  disconnectedCallback() {
    if (this._cascadeObserver) this._cascadeObserver.disconnect();
    if (this._slotsObserver) this._slotsObserver.disconnect();

    // Remove this instance from the pointer
    const classIdx = this._pfeClass.instances.find((item) => item !== this);
    delete this._pfeClass.instances[classIdx];

    const globalIdx = PFElement.allInstances.find((item) => item !== this);
    delete PFElement.allInstances[globalIdx];
  }

  /**
   * Attribute changed callback fires when attributes are updated.
   * This combines the global and the component-specific logic.
   */
  attributeChangedCallback(attr, oldVal, newVal) {
    if (!this._pfeClass.allProperties) return;

    let propName = this._pfeClass._attr2prop(attr);

    const propDef = this._pfeClass.allProperties[propName];

    // If the attribute that changed derives from a property definition
    if (propDef) {
      // If the property/attribute pair has an alias, copy the new value to the alias target
      if (propDef.alias) {
        const aliasedPropDef = this._pfeClass.allProperties[propDef.alias];
        const aliasedAttr = this._pfeClass._prop2attr(propDef.alias);
        const aliasedAttrVal = this.getAttribute(aliasedAttr);
        if (aliasedAttrVal !== newVal) {
          this[propDef.alias] = this._castPropertyValue(aliasedPropDef, newVal);
        }
      }

      // If the property/attribute pair has an observer, fire it
      // Observers receive the oldValue and the newValue from the attribute changed callback
      if (propDef.observer) {
        this[propDef.observer](this._castPropertyValue(propDef, oldVal), this._castPropertyValue(propDef, newVal));
      }

      // If the property/attribute pair has a cascade target, copy the attribute to the matching elements
      // Note: this handles the cascading of new/updated attributes
      if (propDef.cascade) {
        this._cascadeAttribute(attr, this._pfeClass._convertSelectorsToArray(propDef.cascade));
      }
    }
  }

  /**
   * Standard render function.
   */
  render() {
    this.shadowRoot.innerHTML = "";
    this.template.innerHTML = this.html;

    if (window.ShadyCSS) {
      window.ShadyCSS.prepareTemplate(this.template, this.tag);
    }

    this.shadowRoot.appendChild(this.template.content.cloneNode(true));

    this.log(`render`);

    // Cascade properties to the rendered template
    this.cascadeProperties();

    // Update the display context
    this.contextUpdate();

    if (PFElement.trackPerformance()) {
      try {
        performance.mark(`${this._markId}-rendered`);

        if (this._markCount < 1) {
          this._markCount = this._markCount + 1;

          // Navigation start, i.e., the browser first sees that the user has navigated to the page
          performance.measure(`${this._markId}-from-navigation-to-first-render`, undefined, `${this._markId}-rendered`);

          // Render is run before connection unless delayRender is used
          performance.measure(
            `${this._markId}-from-defined-to-first-render`,
            `${this._markId}-defined`,
            `${this._markId}-rendered`
          );
        }
      } catch (err) {
        this.log(`Performance marks are not supported by this browser.`);
      }
    }

    // If the slot definition exists, set up an observer
    if (typeof this.slots === "object" && this._slotsObserver) {
      this._slotsObserver.observe(this, { childList: true });
    }

    // If an observer was defined, set it to begin observing here
    if (this._cascadeObserver) {
      this._cascadeObserver.observe(this, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    this._rendered = true;
  }

  /**
   * A wrapper around an event dispatch to standardize formatting.
   */
  emitEvent(name, { bubbles = true, cancelable = false, composed = true, detail = {} } = {}) {
    if (detail) this.log(`Custom event: ${name}`, detail);
    else this.log(`Custom event: ${name}`);

    this.dispatchEvent(
      new CustomEvent(name, {
        bubbles,
        cancelable,
        composed,
        detail,
      })
    );
  }

  /**
   * Handles the cascading of properties to nested components when new elements are added
   * Attribute updates/additions are handled by the attribute callback
   */
  cascadeProperties(nodeList) {
    const cascade = this._pfeClass._getCache("cascadingProperties");

    if (cascade) {
      if (this._cascadeObserver) this._cascadeObserver.disconnect();

      let selectors = Object.keys(cascade);
      // Find out if anything in the nodeList matches any of the observed selectors for cacading properties
      if (selectors) {
        if (nodeList) {
          [...nodeList].forEach((nodeItem) => {
            selectors.forEach((selector) => {
              // if this node has a match function (i.e., it's an HTMLElement, not
              // a text node), see if it matches the selector, otherwise drop it (like it's hot).
              if (nodeItem.matches && nodeItem.matches(selector)) {
                let attrNames = cascade[selector];
                // each selector can match multiple properties/attributes, so
                // copy each of them
                attrNames.forEach((attrName) => this._copyAttribute(attrName, nodeItem));
              }
            });
          });
        } else {
          // If a match was found, cascade each attribute to the element
          const components = selectors
            .filter((item) => item.slice(0, prefix.length + 1) === `${prefix}-`)
            .map((name) => customElements.whenDefined(name));

          if (components)
            Promise.all(components).then(() => {
              this._cascadeAttributes(selectors, cascade);
            });
          else this._cascadeAttributes(selectors, cascade);
        }
      }

      if (this._rendered && this._cascadeObserver)
        this._cascadeObserver.observe(this, {
          attributes: true,
          childList: true,
          subtree: true,
        });
    }
  }

  /* --- Observers for global properties --- */

  /**
   * This responds to changes in the pfelement attribute; indicates if the component upgraded
   * @TODO maybe we should use just the attribute instead of the class?
   * https://github.com/angular/angular/issues/15399#issuecomment-318785677
   */
  _upgradeObserver() {
    this.classList.add("PFElement");
  }

  /**
   * This responds to changes in the context attribute; manual override tool
   */
  _contextObserver(oldValue, newValue) {
    if (newValue && ((oldValue && oldValue !== newValue) || !oldValue)) {
      this.log(`Running the context observer`);
      this.on = newValue;
      this.cssVariable("context", newValue);
    }
  }

  /**
   * This responds to changes in the context; source of truth for components
   */
  _onObserver(oldValue, newValue) {
    if ((oldValue && oldValue !== newValue) || (newValue && !oldValue)) {
      this.log(`Context update`);
      // Fire an event for child components
      this.contextUpdate();
    }
  }

  /**
   * This responds to inline style changes and greps for context or theme updates.
   * @TODO: --theme will be deprecated in 2.0
   */
  _inlineStyleObserver(oldValue, newValue) {
    if (oldValue === newValue) return;
    // If there are no inline styles, a context might have been deleted, so call resetContext
    if (!newValue) this.resetContext();
    else {
      this.log(`Style observer activated on ${this.tag}`, `${newValue || "null"}`);
      // Grep for context/theme
      const regex = /--[\w|-]*(?:context|theme):\s*(?:\"*(light|dark|saturated)\"*)/gi;
      let match = regex.exec(newValue);

      // If no match is returned, exit the observer
      if (!match) return;

      const newContext = match[1];
      // If the new context value differs from the on value, update
      if (newContext !== this.on && !this.context) this.on = newContext;
    }
  }

  /**
   * This is connected with a mutation observer that watches for updates to the light DOM
   * and pushes down the cascading values
   */
  _parseObserver(mutationsList) {
    // Iterate over the mutation list, look for cascade updates
    for (let mutation of mutationsList) {
      // If a new node is added, attempt to cascade attributes to it
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        const nonTextNodes = [...mutation.addedNodes].filter((n) => n.nodeType !== HTMLElement.TEXT_NODE);
        this.cascadeProperties(nonTextNodes);
      }
    }
  }
  /* --- End observers --- */

  /**
   * Validate that the property meets the requirements for type and naming.
   */
  static _validateProperties() {
    for (let propName in this.allProperties) {
      const propDef = this.allProperties[propName];

      // Verify that properties conform to the allowed data types
      if (!isAllowedType(propDef)) {
        this.error(`Property "${propName}" on ${this.name} must have type String, Number, or Boolean.`);
      }

      // Verify the property name conforms to our naming rules
      if (!/^[a-z_]/.test(propName)) {
        this.error(
          `Property ${this.name}.${propName} defined, but prop names must begin with a lower-case letter or an underscore`
        );
      }

      const isFunction = typeof propDef.default === "function";

      // If the default value is not the same type as defined by the property
      // and it's not a function (we can't validate the output of the function
      // on the class level), throw a warning
      if (propDef.default && !isValidDefaultType(propDef) && !isFunction)
        this.error(
          `[${this.name}] The default value \`${propDef.default}\` does not match the assigned type ${propDef.type.name} for the \'${propName}\' property`
        );
    }
  }

  /**
   * Convert provided property value to the correct type as defined in the properties method.
   */
  _castPropertyValue(propDef, attrValue) {
    switch (propDef.type) {
      case Number:
        // map various attribute string values to their respective
        // desired property values
        return {
          [attrValue]: Number(attrValue),
          null: null,
          NaN: NaN,
          undefined: undefined,
        }[attrValue];

      case Boolean:
        return attrValue !== null;

      case String:
        return {
          [attrValue]: attrValue,
          undefined: undefined,
        }[attrValue];

      default:
        return attrValue;
    }
  }

  /**
   * Map provided value to the attribute name on the component.
   */
  _assignValueToAttribute(obj, attr, value) {
    // If the default is false and the property is boolean, we don't need to do anything
    const isBooleanFalse = obj.type === Boolean && !value;
    const isNull = value === null;
    const isUndefined = typeof value === "undefined";

    // If the attribute is not defined, set the default value
    if (isBooleanFalse || isNull || isUndefined) {
      this.removeAttribute(attr);
    } else {
      // Boolean values get an empty string: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
      if (obj.type === Boolean && typeof value === "boolean") {
        this.setAttribute(attr, "");
      } else {
        // Validate against the provided values
        if (obj.values) {
          this._validateAttributeValue(obj, attr, value);
        }

        // Still accept the value provided even if it's not valid
        this.setAttribute(attr, value);
      }
    }
  }

  /**
   * Maps the defined slots into an object that is easier to query
   */
  _initializeSlots(tag, slots) {
    this.log("Validate slots...");

    if (this._slotsObserver) this._slotsObserver.disconnect();

    // Loop over the properties provided by the schema
    Object.keys(slots).forEach((slot) => {
      let slotObj = slots[slot];

      // Only attach the information if the data provided is a schema object
      if (typeof slotObj === "object") {
        let slotExists = false;
        let result = [];
        // If it's a named slot, look for that slot definition
        if (slotObj.namedSlot) {
          // Check prefixed slots
          result = this.getSlot(`${tag}--${slot}`);
          if (result.length > 0) {
            slotObj.nodes = result;
            slotExists = true;
          }

          // Check for unprefixed slots
          result = this.getSlot(`${slot}`);
          if (result.length > 0) {
            slotObj.nodes = result;
            slotExists = true;
          }
          // If it's the default slot, look for direct children not assigned to a slot
        } else {
          result = [...this.children].filter((child) => !child.hasAttribute("slot"));

          if (result.length > 0) {
            slotObj.nodes = result;
            slotExists = true;
          }
        }

        // If the slot exists, attach an attribute to the parent to indicate that
        if (slotExists) {
          this.setAttribute(`has_${slot}`, "");
        } else {
          this.removeAttribute(`has_${slot}`);
        }
      }
    });

    this.log("Slots validated.");

    if (this._slotsObserver) this._slotsObserver.observe(this, { childList: true });
  }

  /**
   * Sets up the property definitions based on the properties method.
   */
  _initializeProperties() {
    const properties = this._pfeClass.allProperties;
    let hasCascade = false;

    if (Object.keys(properties).length > 0) this.log(`Initialize properties`);

    for (let propName in properties) {
      const propDef = properties[propName];

      // Check if the property exists, throw a warning if it does.
      // HTMLElements have a LOT of properties; it wouldn't be hard
      // to overwrite one accidentally.
      if (typeof this[propName] !== "undefined") {
        this.log(
          `Property "${propName}" on ${this.constructor.name} cannot be defined because the property name is reserved`
        );
      } else {
        const attrName = this._pfeClass._prop2attr(propName);
        if (propDef.cascade) hasCascade = true;

        Object.defineProperty(this, propName, {
          get: () => {
            const attrValue = this.getAttribute(attrName);

            return this._castPropertyValue(propDef, attrValue);
          },
          set: (rawNewVal) => {
            // Assign the value to the attribute
            this._assignValueToAttribute(propDef, attrName, rawNewVal);

            return rawNewVal;
          },
          writeable: true,
          enumerable: true,
          configurable: false,
        });
      }
    }

    // If any of the properties has cascade, attach a new mutation observer to the component
    if (hasCascade) {
      this._cascadeObserver = new MutationObserver(this._parseObserver);
    }
  }

  /**
   * Intialize the default value for an attribute.
   */
  _initializeAttributeDefaults() {
    const properties = this._pfeClass.allProperties;

    for (let propName in properties) {
      const propDef = properties[propName];

      const attrName = this._pfeClass._prop2attr(propName);

      if (propDef.hasOwnProperty("default")) {
        let value = propDef.default;

        // Check if default is a function
        if (typeof propDef.default === "function") {
          value = propDef.default(this);
        }

        // If the attribute has not already been set, assign the default value
        if (!this.hasAttribute(attrName)) {
          // Assign the value to the attribute
          this._assignValueToAttribute(propDef, attrName, value);
        }
      }
    }
  }

  /**
   * Validate the value against provided values.
   */
  // @TODO add support for a validation function
  _validateAttributeValue(propDef, attr, value) {
    if (
      Array.isArray(propDef.values) &&
      propDef.values.length > 0 &&
      !propDef.values.includes(value) // ||
      // (typeof propDef.values === "string" && propDef.values !== value) ||
      // (typeof propDef.values === "function" && !propDef.values(value))
    ) {
      this.warn(
        `${value} is not a valid value for ${attr}. Please provide one of the following values: ${propDef.values.join(
          ", "
        )}`
      );
    }

    return value;
  }

  /**
   * Look up an attribute name linked to a given property name.
   */
  static _prop2attr(propName) {
    return this._getCache("prop2attr")[propName];
  }

  /**
   * Look up an property name linked to a given attribute name.
   */
  static _attr2prop(attrName) {
    return this._getCache("attr2prop")[attrName];
  }

  /**
   * Convert a property name to an attribute name.
   */
  static _convertPropNameToAttrName(propName) {
    const propDef = this.allProperties[propName];

    if (propDef.attr) {
      return propDef.attr;
    }

    return propName
      .replace(/^_/, "")
      .replace(/^[A-Z]/, (l) => l.toLowerCase())
      .replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`);
  }

  /**
   * Convert an attribute name to a property name.
   */
  static _convertAttrNameToPropName(attrName) {
    for (let prop in this.allProperties) {
      if (this.allProperties[prop].attr === attrName) {
        return prop;
      }
    }

    // Convert the property name to kebab case
    const propName = attrName.replace(/-([A-Za-z])/g, (l) => l[1].toUpperCase());
    return propName;
  }

  _cascadeAttributes(selectors, set) {
    selectors.forEach((selector) => {
      set[selector].forEach((attr) => {
        this._cascadeAttribute(attr, selector);
      });
    });
  }

  /**
   * Trigger a cascade of the named attribute to any child elements that match
   * the `to` selector.  The selector can match elements in the light DOM and
   * shadow DOM.
   * @param {String} name The name of the attribute to cascade (not necessarily the same as the property name).
   * @param {String} to A CSS selector that matches the elements that should received the cascaded attribute.  The selector will be applied within `this` element's light and shadow DOM trees.
   */
  _cascadeAttribute(name, to) {
    const recipients = [...this.querySelectorAll(to), ...this.shadowRoot.querySelectorAll(to)];

    for (const node of recipients) {
      this._copyAttribute(name, node);
    }
  }

  /**
   * Copy the named attribute to a target element.
   */
  _copyAttribute(name, el) {
    this.log(`copying ${name} to ${el}`);
    const value = this.getAttribute(name);
    const fname = value == null ? "removeAttribute" : "setAttribute";
    el[fname](name, value);
  }

  static _convertSelectorsToArray(selectors) {
    if (selectors) {
      if (typeof selectors === "string") return selectors.split(",");
      else if (typeof selectors === "object") return selectors;
      else {
        this.warn(`selectors should be provided as a string, array, or object; received: ${typeof selectors}.`);
      }
    }

    return;
  }

  static _parsePropertiesForCascade(mergedProperties) {
    let cascadingProperties = {};
    // Parse the properties to pull out attributes that cascade
    for (const [propName, config] of Object.entries(mergedProperties)) {
      let cascadeTo = this._convertSelectorsToArray(config.cascade);

      // Iterate over each node in the cascade list for this property
      if (cascadeTo)
        cascadeTo.map((nodeItem) => {
          let attr = this._prop2attr(propName);
          // Create an object with the node as the key and an array of attributes
          // that are to be cascaded down to it
          if (!cascadingProperties[nodeItem]) cascadingProperties[nodeItem] = [attr];
          else cascadingProperties[nodeItem].push(attr);
        });
    }

    return cascadingProperties;
  }

  /**
   * Caching the attributes and properties data for efficiency
   */
  static create(pfe) {
    pfe._createCache();
    pfe._populateCache(pfe);
    pfe._validateProperties();

    try {
      window.customElements.define(pfe.tag, pfe);
    } catch (err) {
      // Capture the class currently using this tag in the registry
      const prevDefinition = window.customElements.get(pfe.tag);

      // Check if the previous definition's version matches this one
      if (prevDefinition && prevDefinition.version !== pfe.version) {
        this.warn(
          `${pfe.tag} was registered at version ${prevDefinition.version}; cannot register version ${pfe.version}.`
        );
      }

      // @TODO Should this error be reported to the console?
      if (err && err.message) this.log(err.message);
    }

    if (PFElement.trackPerformance()) {
      try {
        performance.mark(`${this._markId}-defined`);
      } catch (err) {
        this.log(`Performance marks are not supported by this browser.`);
      }
    }
  }

  static _createCache() {
    this._cache = {
      properties: {},
      globalProperties: {},
      componentProperties: {},
      cascadingProperties: {},
      attr2prop: {},
      prop2attr: {},
    };
  }

  /**
   * Cache an object in a given cache namespace.  This overwrites anything
   * already in that namespace.
   */
  static _setCache(namespace, object) {
    this._cache[namespace] = object;
  }

  /**
   * Get a cached object by namespace, or get all cached objects.
   */
  static _getCache(namespace) {
    return namespace ? this._cache[namespace] : this._cache;
  }

  /**
   * Populate initial values for properties cache.
   */
  static _populateCache(pfe) {
    // @TODO add a warning when a component property conflicts with a global property.
    const mergedProperties = { ...pfe.properties, ...PFElement.properties };

    pfe._setCache("componentProperties", pfe.properties);
    pfe._setCache("globalProperties", PFElement.properties);
    pfe._setCache("properties", mergedProperties);

    // create mapping objects to go from prop name to attrname and back
    const prop2attr = {};
    const attr2prop = {};
    for (let propName in mergedProperties) {
      const attrName = this._convertPropNameToAttrName(propName);
      prop2attr[propName] = attrName;
      attr2prop[attrName] = propName;
    }
    pfe._setCache("attr2prop", attr2prop);
    pfe._setCache("prop2attr", prop2attr);

    const cascadingProperties = this._parsePropertiesForCascade(mergedProperties);
    if (Object.keys(cascadingProperties)) pfe._setCache("cascadingProperties", cascadingProperties);
  }

  /**
   * allProperties returns an object containing PFElement's global properties
   * and the descendents' (such as PfeCard, etc) component properties.  The two
   * objects are merged together and in the case of a property name conflict,
   * PFElement's properties override the component's properties.
   */
  static get allProperties() {
    return this._getCache("properties");
  }

  /**
   * cascadingProperties returns an object containing PFElement's global properties
   * and the descendents' (such as PfeCard, etc) component properties.  The two
   * objects are merged together and in the case of a property name conflict,
   * PFElement's properties override the component's properties.
   */
  static get cascadingProperties() {
    return this._getCache("cascadingProperties");
  }

  /**
   * Breakpoint object mapping human-readable size names to viewport sizes
   * To overwrite this at the component-level, include `static get breakpoint` in your component's class definition
   * @returns {Object} keys are t-shirt sizes and values map to screen-sizes (sourced from PF4)
   */
  static get breakpoint() {
    return {
      xs: "0px", // $pf-global--breakpoint--xs: 0 !default;
      sm: "576px", // $pf-global--breakpoint--sm: 576px !default;
      md: "768px", // $pf-global--breakpoint--md: 768px !default;
      lg: "992px", // $pf-global--breakpoint--lg: 992px !default;
      xl: "1200px", // $pf-global--breakpoint--xl: 1200px !default;
      "2xl": "1450px", // $pf-global--breakpoint--2xl: 1450px !default;
    };
  }
}

// Initialize the global instances
PFElement.allInstances = [];

autoReveal(PFElement.log);

// @POLYFILL  Array.prototype.findIndex
// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, "findIndex", {
    value: function (predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== "function") {
        throw new TypeError("predicate must be a function");
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    },
    configurable: true,
    writable: true,
  });
}

/*!
 * PatternFly Elements: PfeTabs 1.12.2
 * @license
 * Copyright 2021 Red Hat, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
*/

const TAB_CONTENT_MUTATION_CONFIG = {
  characterData: true,
  childList: true,
  subtree: true,
};
class PfeTab extends PFElement {

  // Injected at build-time
  static get version() {
    return "1.12.2";
  }

  // Injected at build-time
  get html() {
    return `
<style>:host{text-align:left;position:relative;display:block;cursor:pointer;margin:0 0 calc(1px * -1);margin:var(--pfe-tabs__tab--Margin,0 0 calc(var(--pfe-theme--ui--border-width,1px) * -1));padding:1rem calc(1rem * 2) 1rem calc(1rem * 2);padding:var(--pfe-tabs__tab--PaddingTop,var(--pfe-theme--container-padding,1rem)) var(--pfe-tabs__tab--PaddingRight,calc(var(--pfe-theme--container-padding,1rem) * 2)) var(--pfe-tabs__tab--PaddingBottom,var(--pfe-theme--container-padding,1rem)) var(--pfe-tabs__tab--PaddingLeft,calc(var(--pfe-theme--container-padding,1rem) * 2));border-style:solid;border-style:var(--pfe-theme--ui--border-style,solid);border-width:1px;border-width:var(--pfe-theme--ui--border-width,1px);border-color:transparent;border-bottom-width:3px;border-bottom-width:var(--pfe-tabs--BorderWidth,var(--pfe-theme--ui--border-width--active,3px));background-color:none;background-color:var(--pfe-tabs--BackgroundColor--inactive,none);text-align:center;text-align:var(--pfe-tabs__tab--TextAlign,center);text-transform:none;text-transform:var(--pfe-tabs__tab--TextTransform,none);color:#6a6e73;color:var(--pfe-tabs--Color,var(--pfe-theme--color--text--muted,#6a6e73));font-size:1rem;font-size:var(--pfe-tabs__tab--FontSize,var(--pf-global--FontSize--md,1rem));font-family:"Red Hat Text",RedHatText,Overpass,Overpass,Arial,sans-serif;font-family:var(--pfe-tabs__tab--LineHeight, var(--pfe-theme--font-family, "Red Hat Text", "RedHatText", "Overpass", Overpass, Arial, sans-serif));line-height:1.5;line-height:var(--pfe-tabs__tab--LineHeight,var(--pfe-theme--line-height,1.5));font-weight:400;font-weight:var(--pfe-tabs__tab--FontWeight,var(--pfe-theme--font-weight--normal,400));--pf-c--FontSize:var(--pfe-tabs--FontSize)}:host #tab{display:-webkit-inline-box;display:-webkit-inline-flex;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;height:100%}:host #tab *{font-size:inherit;font-weight:inherit;color:inherit;margin:0}:host([aria-selected=true]){background-color:transparent;background-color:var(--pfe-tabs--BackgroundColor,transparent);border-bottom-color:#06c;border-bottom-color:var(--pfe-tabs--BorderColor,var(--pfe-tabs--highlight,var(--pfe-theme--color--ui-accent,#06c)))}:host([aria-selected=true]) #tab *{color:#151515;color:var(--pfe-tabs--Color--focus,var(--pfe-tabs--focus,var(--pfe-theme--color--text,#151515)))}:host(:active),:host(:hover){background-color:transparent;background-color:var(--pfe-tabs--BackgroundColor,transparent);border-bottom-color:#b8bbbe;border-bottom-color:var(--pfe-tabs--BorderColor--hover,#b8bbbe)}:host(:active) #tab *,:host(:hover) #tab *{color:#151515;color:var(--pfe-tabs--Color--focus,var(--pfe-tabs--focus,var(--pfe-theme--color--text,#151515)))}@media screen and (min-width:768px){:host([vertical]){border-bottom-color:transparent;border-bottom-width:0;border-left-color:#d2d2d2;border-left-color:var(--pfe-theme--color--surface--border,#d2d2d2);border-left-width:1px;border-left-width:var(--pfe-theme--ui--border-width,1px);padding:1rem;padding:var(--pfe-theme--container-padding,1rem);--pfe-tabs--Margin:0 calc(var(--pfe-theme--ui--border-width, 1px) * -1) 0 0}:host([vertical][aria-selected=true]){border-left-color:#06c;border-left-color:var(--pfe-tabs--BorderColor,var(--pfe-tabs--highlight,var(--pfe-theme--color--ui-accent,#06c)));border-left-width:3px}:host([vertical]:not([variant=earth])){border-left:1px solid #d2d2d2;border-left:var(--pfe-theme--ui--border-width,1px) var(--pfe-theme--ui--border-style,solid) var(--pfe-theme--color--surface--border,#d2d2d2);text-align:left!important}:host([vertical]:not([variant=earth])[aria-selected=true]){border-right:3px solid transparent;border-right:var(--pfe-tabs--BorderWidth,var(--pfe-theme--ui--border-width--active,3px)) var(--pfe-theme--ui--border-style,solid) transparent;border-left:3px solid #06c;border-left:var(--pfe-tabs--BorderWidth,var(--pfe-theme--ui--border-width--active,3px)) var(--pfe-theme--ui--border-style,solid) var(--pfe-tabs--BorderColor,var(--pfe-tabs--highlight,var(--pfe-theme--color--ui-accent,#06c)));padding-left:calc(1rem - 2px);padding-left:calc(var(--pfe-theme--container-padding,1rem) - 2px)}:host([vertical]:not([variant=earth])[aria-selected=false]){border-right:3px solid transparent;border-right:var(--pfe-tabs--BorderWidth,var(--pfe-theme--ui--border-width--active,3px)) var(--pfe-theme--ui--border-style,solid) transparent}:host([vertical]:not([variant=earth])[aria-selected=false]:hover){border-right:3px solid transparent;border-right:var(--pfe-tabs--BorderWidth,var(--pfe-theme--ui--border-width--active,3px)) var(--pfe-theme--ui--border-style,solid) transparent;border-bottom:0;border-left:3px solid #b8bbbe;border-left:var(--pfe-tabs--BorderWidth,var(--pfe-theme--ui--border-width--active,3px)) var(--pfe-theme--ui--border-style,solid) var(--pfe-tabs--BorderColor--hover,#b8bbbe);padding-left:calc(1rem - 2px);padding-left:calc(var(--pfe-theme--container-padding,1rem) - 2px)}}@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host([variant=earth]){background-color:#f0f0f0;color:#6a6e73}}:host(:not([vertical])[variant=earth]:not([aria-selected=true]):first-of-type){border-left-color:transparent}:host(:not([vertical])[variant=earth]:not([aria-selected=true]):last-of-type){border-right-color:transparent}:host([variant=earth][aria-selected=false]){background-color:#f0f0f0;background-color:var(--pfe-tabs--BackgroundColor--inactive,var(--pfe-theme--color--surface--lighter,#f0f0f0));border-color:#d2d2d2;border-color:var(--pfe-theme--color--surface--border,#d2d2d2);border-top-width:3px;border-top-width:var(--pfe-tabs--BorderWidth,var(--pfe-theme--ui--border-width--active,3px));border-top-color:transparent;border-bottom-color:#b8bbbe;border-bottom-color:var(--pfe-tabs--BorderColor--hover,#b8bbbe);border-bottom-width:1px;border-bottom-width:var(--pfe-theme--ui--border-width,1px)}:host([variant=earth][aria-selected=false]:hover){border-top-color:#b8bbbe;border-top-color:var(--pfe-tabs--BorderColor--hover,#b8bbbe)}:host([variant=earth][aria-selected=true]){background-color:#fff;background-color:var(--pfe-tabs--BackgroundColor,var(--pfe-theme--color--surface--lightest,#fff));border-bottom:0;border-left-color:#d2d2d2;border-left-color:var(--pfe-theme--color--surface--border,#d2d2d2);border-right-color:#d2d2d2;border-right-color:var(--pfe-theme--color--surface--border,#d2d2d2);border-top:solid #06c 3px;border-top:solid var(--pfe-tabs--BorderColor,var(--pfe-tabs--highlight,var(--pfe-theme--color--ui-accent,#06c))) var(--pfe-tabs--BorderWidth,var(--pfe-theme--ui--border-width--active,3px))}@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host([variant=earth][aria-selected=true]){color:#6a6e73;background-color:#fff;border-left:1px solid #d2d2d2;border-top:3px solid #06c;border-top:var(--pfe-tabs--BorderWidth,var(--pfe-theme--ui--border-width--active,3px)) solid var(--pfe-tabs--BorderColor,var(--pfe-tabs--highlight,var(--pfe-theme--color--ui-accent,#06c)));border-bottom:0}}:host([variant=earth][aria-selected=true]:last-of-type){border-right:1px solid #d2d2d2;border-right:var(--pfe-theme--ui--border-width,1px) var(--pfe-theme--ui--border-style,solid) var(--pfe-theme--color--surface--border,#d2d2d2)}@media screen and (min-width:768px){:host([vertical][variant=earth]){border-top:1px solid #d2d2d2;border-top:var(--pfe-theme--ui--border-width,1px) var(--pfe-theme--ui--border-style,solid) var(--pfe-theme--color--surface--border,#d2d2d2);border-bottom:1px solid #d2d2d2;border-bottom:var(--pfe-theme--ui--border-width,1px) var(--pfe-theme--ui--border-style,solid) var(--pfe-theme--color--surface--border,#d2d2d2);border-left-width:3px;border-left-width:var(--pfe-theme--ui--border-width--active,3px);text-align:left}:host([vertical][variant=earth][aria-selected=false]:first-of-type){border-top-color:transparent;border-left:3px solid transparent;border-left:var(--pfe-tabs--BorderWidth,var(--pfe-theme--ui--border-width--active,3px)) var(--pfe-theme--ui--border-style,solid) transparent}:host([vertical][variant=earth][aria-selected=false]:last-of-type){border-bottom-color:transparent}:host([vertical][variant=earth][aria-selected=false]){border-right:0;border-bottom-color:transparent;border-left-color:transparent}:host([vertical][variant=earth][aria-selected=false]:hover){border-left-color:#b8bbbe;border-left-color:var(--pfe-tabs--BorderColor--hover,#b8bbbe);border-top-color:#d2d2d2;border-top-color:var(--pfe-theme--color--surface--border,#d2d2d2)}:host([vertical][variant=earth][aria-selected=false]:first-of-type:hover){border-left-color:#d2d2d2;border-left-color:var(--pfe-theme--color--surface--border,#d2d2d2);border-top-color:transparent}:host([vertical][variant=earth][aria-selected=true]){border-top-color:#d2d2d2;border-top-color:var(--pfe-theme--color--surface--border,#d2d2d2);border-left-color:#06c;border-left-color:var(--pfe-tabs--BorderColor,var(--pfe-tabs--highlight,var(--pfe-theme--color--ui-accent,#06c)));border-right-color:transparent;margin-right:-1px}}:host([on=dark][variant=earth]){--pfe-tabs--Color:var(--pfe-theme--color--text--on-dark, #fff);--pfe-tabs--Color--focus:var(--pfe-theme--color--text--on-dark, #fff);border-right-color:#6a6e73;border-right-color:var(--pfe-theme--color--surface--border--darker,#6a6e73);border-left-color:#6a6e73;border-left-color:var(--pfe-theme--color--surface--border--darker,#6a6e73)}:host([on=dark][variant=earth][aria-selected=false]){--pfe-tabs--Color:var(--pfe-theme--color--text--muted--on-dark, #d2d2d2);--pfe-tabs--BackgroundColor--inactive:var(--pfe-theme--color--surface--darker, #3c3f42)}@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host([on=dark][variant=earth][aria-selected=false]){background-color:#fff!important;background-color:var(--pfe-theme--color--surface--lightest,#fff)!important}:host([on=dark][variant=earth][aria-selected=false]) #tab *{color:#151515!important}}:host([on=dark][variant=earth][aria-selected=true]){--pfe-tabs--Color--focus:var(--pfe-theme--color--text--on-dark, #fff);--pfe-tabs--BackgroundColor:var(--pfe-theme--color--surface--darkest, #151515)}:host([variant=earth][on=saturated][aria-selected=false]){--pfe-tabs--BackgroundColor:var(--pfe-theme--color--surface--lighter, #f0f0f0)}:host([variant=earth][on=saturated][aria-selected=true]){--pfe-tabs--BackgroundColor:var(--pfe-theme--color--surface--lightest, #fff)}:host([on=saturated]:not([variant=earth])){--pfe-tabs--Color:var(--pfe-theme--color--text--on-saturated, #fff);--pfe-tabs--Color--focus:var(--pfe-theme--color--text--on-saturated, #fff)}@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host([on=saturated]:not([variant=earth])){background-color:transparent}:host([on=saturated]:not([variant=earth])) #tab *{color:#151515!important}}:host([on=saturated]:not([variant=earth])[aria-selected=true]){--pfe-tabs--Color--focus:var(--pfe-theme--color--text--on-saturated, #fff);--pfe-tabs--BorderColor:var(--pfe-theme--color--ui-base--on-saturated, #fff)}:host([on=saturated]:not([variant=earth])[aria-selected=false]){--pfe-tabs--Color:var(--pfe-theme--color--text--muted--on-saturated, #d2d2d2)}:host([on=saturated]:not([variant=earth])[aria-selected=false]:hover){--pfe-tabs--BorderColor:var(--pfe-theme--color--surface--border, #d2d2d2)}@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host([on=saturated]:not([variant=earth])[aria-selected=true]:last-of-type){border-left:0!important}}:host([on=dark]:not([variant=earth])){--pfe-tabs--Color:var(--pfe-theme--color--text--on-dark, #fff);--pfe-tabs--Color--focus:var(--pfe-theme--color--text--on-dark, #fff)}@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host([on=dark]:not([variant=earth])) #tab *{color:#151515!important}}:host([on=dark]:not([variant=earth])[aria-selected=false]){--pfe-tabs--Color:var(--pfe-theme--color--text--muted--on-saturated, #d2d2d2)}:host([on=dark]:not([variant=earth])[aria-selected=false]:hover){--pfe-tabs--BorderColor:var(--pfe-theme--color--surface--lightest, #fff);border-bottom-color:#f0f0f0;border-bottom-color:var(--pfe-theme--color--surface--base,#f0f0f0);--pfe-tabs__tab--BorderBottom:var(--pfe-tabs--BorderWidth, var(--pfe-theme--ui--border-width--active, 3px)) var(--pfe-theme--ui--border-style, solid) var(--pfe-theme--color--surface--border, #d2d2d2)}:host([on=dark]:not([variant=earth])[vertical][aria-selected=false]:hover){border-bottom-color:transparent} /*# sourceMappingURL=pfe-tab.min.css.map */</style>
<span id="tab"></span>`;
  }

  static get tag() {
    return "pfe-tab";
  }

  get styleUrl() {
    return "pfe-tab.scss";
  }

  get templateUrl() {
    return "pfe-tab.html";
  }

  static get properties() {
    return {
      selected: {
        title: "Selected tab",
        type: String,
        default: "false",
        attr: "aria-selected",
        values: ["true", "false"],
        observer: "_selectedHandler",
      },
      controls: {
        title: "Connected panel ID",
        type: String,
        attr: "aria-controls",
      },
      role: {
        type: String,
        default: "tab",
      },
      tabindex: {
        type: Number,
        default: -1,
      },
      variant: {
        title: "Variant",
        type: String,
        enum: ["wind", "earth"],
      },
      // @TODO: Deprecated in 1.0
      oldPfeId: {
        type: String,
        attr: "pfe-id",
        observer: "_oldPfeIdChanged",
      },
    };
  }

  // Declare the type of this component
  static get PfeType() {
    return PFElement.PfeTypes.Content;
  }

  constructor() {
    super(PfeTab, { type: PfeTab.PfeType });

    this._tabItem;
    this._init = this._init.bind(this);
    this._setTabContent = this._setTabContent.bind(this);
    this._getTabElement = this._getTabElement.bind(this);
    this._observer = new MutationObserver(this._init);
  }

  connectedCallback() {
    super.connectedCallback();

    this._tabItem = this.shadowRoot.querySelector(`#tab`);

    if (this.hasLightDOM()) this._init();

    this._observer.observe(this, TAB_CONTENT_MUTATION_CONFIG);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer.disconnect();
  }

  _selectedHandler() {
    if (this.selected === "true") this.tabindex = 0;
    else this.tabindex = -1;
  }

  _oldPfeIdChanged(oldVal, newVal) {
    if (!this.id) this.id = newVal;
  }

  _init() {
    if (window.ShadyCSS) this._observer.disconnect();

    // Force role to be set to tab
    this.role = "tab";

    // Copy the tab content into the template
    this._setTabContent();

    // If an ID is not defined, generate a random one
    if (!this.id) this.id = this.randomId;

    if (window.ShadyCSS) this._observer.observe(this, TAB_CONTENT_MUTATION_CONFIG);
  }

  _getTabElement() {
    // Check if there is no nested element or nested textNodes
    if (!this.firstElementChild && !this.firstChild) {
      this.warn(`No tab content provided`);
      return;
    }

    if (this.firstElementChild && this.firstElementChild.tagName) {
      // If the first element is a slot, query for it's content
      if (this.firstElementChild.tagName === "SLOT") {
        const slotted = this.firstElementChild.assignedNodes();
        // If there is no content inside the slot, return empty with a warning
        if (slotted.length === 0) {
          this.warn(`No heading information exists within this slot.`);
          return;
        }
        // If there is more than 1 element in the slot, capture the first h-tag
        if (slotted.length > 1) this.warn(`Tab heading currently only supports 1 heading tag.`);
        const htags = slotted.filter((slot) => slot.tagName.match(/^H[1-6]/) || slot.tagName === "P");
        if (htags.length > 0) return htags[0];
        else return;
      } else if (this.firstElementChild.tagName.match(/^H[1-6]/) || this.firstElementChild.tagName === "P") {
        return this.firstElementChild;
      } else {
        this.warn(`Tab heading should contain at least 1 heading tag for correct semantics.`);
      }
    }

    return;
  }

  _setTabContent() {
    let label = "";
    let isTag = false;
    let tabElement = this._getTabElement();
    if (tabElement) {
      // Copy the tab content into the template
      label = tabElement.textContent.trim().replace(/\s+/g, " ");
      isTag = true;
    }

    if (!tabElement) {
      // If no element is found, try for a text node
      if (this.textContent.trim().replace(/\s+/g, " ")) {
        label = this.textContent.trim().replace(/\s+/g, " ");
      }
    }

    if (!label) {
      this.warn(`There does not appear to be any content in the tab region.`);
      return;
    }

    let semantics = "h3";

    if (isTag) {
      semantics = tabElement.tagName.toLowerCase();
    }

    // Create an h-level tag for the shadow tab, default h3
    // or use the provided semantics from light DOM
    let heading = document.createElement(semantics);

    // Assign the label content to the new heading
    heading.textContent = label;

    // Attach the heading to the tabItem
    if (this._tabItem) {
      this._tabItem.innerHTML = "";
      this._tabItem.appendChild(heading);
    }
  }
}

/*!
 * PatternFly Elements: PfeTabs 1.12.2
 * @license
 * Copyright 2021 Red Hat, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
*/

const TAB_PANEL_MUTATION_CONFIG = {
  childList: true,
  subtree: true,
};

class PfeTabPanel extends PFElement {

  // Injected at build-time
  static get version() {
    return "1.12.2";
  }

  // Injected at build-time
  get html() {
    return `
<style>:host{display:block;color:#3c3f42;color:var(--pfe-broadcasted--text,#3c3f42)}:host(:focus){outline:0}:host [tabindex]{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;height:100%}:host .container{margin:0;width:100%;background-color:transparent;background-color:var(--pfe-tabs__panel--BackgroundColor,transparent);border-top:0;border-top:var(--pfe-tabs__panel--BorderTop,0);border-right:0;border-right:var(--pfe-tabs__panel--BorderRight,0);border-bottom:0;border-bottom:var(--pfe-tabs__panel--BorderBottom,0);border-left:0;border-left:var(--pfe-tabs__panel--BorderLeft,0);padding-top:calc(1rem * 3);padding-top:var(--pfe-tabs__panel--PaddingTop,calc(var(--pfe-theme--container-padding,1rem) * 3))}@media screen and (min-width:1200px){:host .container{padding-top:calc(1rem * 3);padding-top:var(--pfe-tabs__panel--PaddingTop,calc(var(--pfe-theme--container-padding,1rem) * 3));padding-right:0;padding-right:var(--pfe-tabs__panel--PaddingRight,0);padding-bottom:0;padding-bottom:var(--pfe-tabs__panel--PaddingBottom,0);padding-left:0;padding-left:var(--pfe-tabs__panel--PaddingLeft,0)}}:host .container::after{clear:both;content:"";display:table}@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host .container{padding:1em;background-color:#fff!important;color:#151515!important}}:host([hidden]){display:none}:host([variant=earth]){background-color:#fff;background-color:var(--pfe-tabs__panel--BackgroundColor,var(--pfe-theme--color--surface--lightest,#fff))}:host([variant=earth]) .container{padding-top:calc(1rem * 3);padding-top:var(--pfe-tabs__panel--PaddingTop,calc(var(--pfe-theme--container-padding,1rem) * 3));padding-right:calc(1rem * 3);padding-right:var(--pfe-tabs__panel--PaddingRight,calc(var(--pfe-theme--container-padding,1rem) * 3));padding-bottom:calc(1rem * 3);padding-bottom:var(--pfe-tabs__panel--PaddingBottom,calc(var(--pfe-theme--container-padding,1rem) * 3));padding-left:calc(1rem * 3);padding-left:var(--pfe-tabs__panel--PaddingLeft,calc(var(--pfe-theme--container-padding,1rem) * 3))}@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host([variant=earth]) .container{background-color:#fff;padding:1em;border-right:1px solid #d2d2d2;border-bottom:1px solid #d2d2d2;border-left:1px solid #d2d2d2}}@media screen and (min-width:768px){:host([variant=wind][vertical]) .container{padding-top:0;padding-top:var(--pfe-tabs__panel--PaddingTop,0);padding-bottom:0;padding-bottom:var(--pfe-tabs__panel--PaddingBottom,0);padding-right:0;padding-right:var(--pfe-tabs__panel--PaddingRight,0);margin:0 calc(1rem - 2px);margin:0 calc(var(--pfe-theme--container-spacer,1rem) - 2px)}}@media screen and (min-width:768px) and (-ms-high-contrast:active),screen and (min-width:768px) and (-ms-high-contrast:none){:host([variant=wind][vertical]) .container{padding:1em 0 1em 2em}}@media screen and (min-width:768px){:host([variant=earth][vertical]){border-top:0;border-top:var(--pfe-tabs--BorderTop,0);border-left:1px solid #d2d2d2;border-left:var(--pfe-tabs--BorderLeft,var(--pfe-theme--ui--border-width,1px) var(--pfe-theme--ui--border-style,solid) var(--pfe-theme--color--surface--border,#d2d2d2));height:100%;background-color:#fff;background-color:var(--pfe-tabs__panel--BackgroundColor,var(--pfe-theme--color--surface--lightest,#fff))}:host([variant=earth][vertical]) .container{padding-left:calc(1rem * 3);padding-left:var(--pfe-tabs__panel--PaddingLeft,calc(var(--pfe-theme--container-padding,1rem) * 3))}}@media screen and (min-width:768px) and (-ms-high-contrast:active),screen and (min-width:768px) and (-ms-high-contrast:none){:host([variant=earth][vertical]) .container{border-top:1px solid #d2d2d2}}:host([variant=earth]) .container{padding-top:calc(1rem * 3);padding-top:var(--pfe-tabs__panel--PaddingTop,calc(var(--pfe-theme--container-padding,1rem) * 3));padding-right:calc(1rem * 3);padding-right:var(--pfe-tabs__panel--PaddingRight,calc(var(--pfe-theme--container-padding,1rem) * 3));padding-bottom:calc(1rem * 3);padding-bottom:var(--pfe-tabs__panel--PaddingBottom,calc(var(--pfe-theme--container-padding,1rem) * 3));padding-left:calc(1rem * 3);padding-left:var(--pfe-tabs__panel--PaddingLeft,calc(var(--pfe-theme--container-padding,1rem) * 3))}:host([on=dark][variant=earth]){background-color:#151515;background-color:var(--pfe-tabs__panel--BackgroundColor,var(--pfe-theme--color--surface--darkest,#151515));--pfe-broadcasted--text:var(--pfe-theme--color--text--on-dark, #fff);--pfe-broadcasted--text--muted:var(--pfe-theme--color--text--muted--on-dark, #d2d2d2);--pfe-broadcasted--link:var(--pfe-theme--color--link--on-dark, #73bcf7);--pfe-broadcasted--link--hover:var(--pfe-theme--color--link--hover--on-dark, #bee1f4);--pfe-broadcasted--link--focus:var(--pfe-theme--color--link--focus--on-dark, #bee1f4);--pfe-broadcasted--link--visited:var(--pfe-theme--color--link--visited--on-dark, #bee1f4);--pfe-broadcasted--link-decoration:var(--pfe-theme--link-decoration--on-dark, none);--pfe-broadcasted--link-decoration--hover:var(--pfe-theme--link-decoration--hover--on-dark, underline);--pfe-broadcasted--link-decoration--focus:var(--pfe-theme--link-decoration--focus--on-dark, underline);--pfe-broadcasted--link-decoration--visited:var(--pfe-theme--link-decoration--visited--on-dark, none)}:host([on=saturated][variant=earth]){background-color:#fff;background-color:var(--pfe-tabs__panel--BackgroundColor,var(--pfe-theme--color--surface--lightest,#fff));--pfe-broadcasted--text:var(--pfe-theme--color--text, #151515);--pfe-broadcasted--text--muted:var(--pfe-theme--color--text--muted, #6a6e73);--pfe-broadcasted--link:var(--pfe-theme--color--link, #06c);--pfe-broadcasted--link--hover:var(--pfe-theme--color--link--hover, #004080);--pfe-broadcasted--link--focus:var(--pfe-theme--color--link--focus, #004080);--pfe-broadcasted--link--visited:var(--pfe-theme--color--link--visited, #6753ac);--pfe-broadcasted--link-decoration:var(--pfe-theme--link-decoration, none);--pfe-broadcasted--link-decoration--hover:var(--pfe-theme--link-decoration--hover, underline);--pfe-broadcasted--link-decoration--focus:var(--pfe-theme--link-decoration--focus, underline);--pfe-broadcasted--link-decoration--visited:var(--pfe-theme--link-decoration--visited, none)}:host([on=saturated]:not([variant=earth])){--pfe-broadcasted--text:var(--pfe-theme--color--text--on-saturated, #fff);--pfe-broadcasted--text--muted:var(--pfe-theme--color--text--muted--on-saturated, #d2d2d2);--pfe-broadcasted--link:var(--pfe-theme--color--link--on-saturated, #fff);--pfe-broadcasted--link--hover:var(--pfe-theme--color--link--hover--on-saturated, #fafafa);--pfe-broadcasted--link--focus:var(--pfe-theme--color--link--focus--on-saturated, #fafafa);--pfe-broadcasted--link--visited:var(--pfe-theme--color--link--visited--on-saturated, #d2d2d2);--pfe-broadcasted--link-decoration:var(--pfe-theme--link-decoration--on-saturated, underline);--pfe-broadcasted--link-decoration--hover:var(--pfe-theme--link-decoration--hover--on-saturated, underline);--pfe-broadcasted--link-decoration--focus:var(--pfe-theme--link-decoration--focus--on-saturated, underline);--pfe-broadcasted--link-decoration--visited:var(--pfe-theme--link-decoration--visited--on-saturated, underline)}:host([on=dark]:not([variant=earth])){--pfe-broadcasted--text:var(--pfe-theme--color--text--on-dark, #fff);--pfe-broadcasted--text--muted:var(--pfe-theme--color--text--muted--on-dark, #d2d2d2);--pfe-broadcasted--link:var(--pfe-theme--color--link--on-dark, #73bcf7);--pfe-broadcasted--link--hover:var(--pfe-theme--color--link--hover--on-dark, #bee1f4);--pfe-broadcasted--link--focus:var(--pfe-theme--color--link--focus--on-dark, #bee1f4);--pfe-broadcasted--link--visited:var(--pfe-theme--color--link--visited--on-dark, #bee1f4);--pfe-broadcasted--link-decoration:var(--pfe-theme--link-decoration--on-dark, none);--pfe-broadcasted--link-decoration--hover:var(--pfe-theme--link-decoration--hover--on-dark, underline);--pfe-broadcasted--link-decoration--focus:var(--pfe-theme--link-decoration--focus--on-dark, underline);--pfe-broadcasted--link-decoration--visited:var(--pfe-theme--link-decoration--visited--on-dark, none)} /*# sourceMappingURL=pfe-tab-panel.min.css.map */</style>
<div tabindex="-1" role="tabpanel">
  <div class="container">
    <slot></slot>
  </div>
</div>`;
  }

  static get tag() {
    return "pfe-tab-panel";
  }

  get styleUrl() {
    return "pfe-tab-panel.scss";
  }

  get templateUrl() {
    return "pfe-tab-panel.html";
  }

  static get properties() {
    return {
      selected: {
        title: "Selected tab",
        type: Boolean,
        default: false,
        attr: "aria-selected",
        observer: "_selectedHandler",
      },
      hidden: {
        title: "Visibility",
        type: Boolean,
        default: false,
      },
      role: {
        type: String,
        default: "tabpanel",
      },
      tabindex: {
        type: Number,
        default: 0,
      },
      labelledby: {
        type: String,
        attr: "aria-labelledby",
      },
      variant: {
        title: "Variant",
        type: String,
        enum: ["wind", "earth"],
      },
      // @TODO: Deprecated in 1.0
      oldPfeId: {
        type: String,
        attr: "pfe-id",
        observer: "_oldPfeIdChanged",
      },
    };
  }

  // Declare the type of this component
  static get PfeType() {
    return PFElement.PfeTypes.Container;
  }

  constructor() {
    super(PfeTabPanel, { type: PfeTabPanel.PfeType });

    this._init = this._init.bind(this);
    this._observer = new MutationObserver(this._init);
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.hasLightDOM()) this._init();
    this._observer.observe(this, TAB_PANEL_MUTATION_CONFIG);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer.disconnect();
  }

  _init() {
    if (window.ShadyCSS) this._observer.disconnect();

    // If an ID is not defined, generate a random one
    if (!this.id) this.id = this.randomId;

    // Force role to be set to tab
    this.role = "tabpanel";

    if (this.previousElementSibling && this.previousElementSibling.selected !== "true") {
      this.hidden = true;
    }

    if (window.ShadyCSS) this._observer.observe(this, TAB_PANEL_MUTATION_CONFIG);
  }

  _oldPfeIdChanged(oldVal, newVal) {
    if (!this.id) this.id = newVal;
  }
}

/*!
 * PatternFly Elements: PfeTabs 1.12.2
 * @license
 * Copyright 2021 Red Hat, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
*/

const KEYCODE = {
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  HOME: 36,
  END: 35,
};

// @IE11 doesn't support URLSearchParams
// https://caniuse.com/#search=urlsearchparams
const CAN_USE_URLSEARCHPARAMS = window.URLSearchParams ? true : false;

const TABS_MUTATION_CONFIG = {
  childList: true,
  subtree: true,
};

class PfeTabs extends PFElement {

  // Injected at build-time
  static get version() {
    return "1.12.2";
  }

  // Injected at build-time
  get html() {
    return `
<style>@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host{color:#151515!important}}:host{display:block;display:var(--pfe-tabs--Display,block);padding:0;padding:var(--pfe-tabs--Padding,0)}:host .tabs{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;flex-direction:var(--pfe-tabs__tabs--FlexDirection,row);width:auto;width:var(--pfe-tabs__tabs--Width,auto);border-top:0;border-top:var(--pfe-tabs__tabs--BorderTop,0);border-right:0;border-right:var(--pfe-tabs__tabs--BorderRight,0);border-bottom:1px solid #d2d2d2;border-bottom:var(--pfe-tabs__tabs--BorderBottom,var(--pfe-theme--ui--border-width,1px) var(--pfe-theme--ui--border-style,solid) var(--pfe-tabs__tabs--BorderColor,var(--pfe-theme--color--surface--border,#d2d2d2)));border-left:0;border-left:var(--pfe-tabs__tabs--BorderLeft,0);padding:0;padding:var(--pfe-tabs__tabs--Padding,0)}:host .panels{width:auto;width:var(--pfe-tabs__panels--Width,auto)}:host(:not([vertical])[tab-align=center]) .tabs{-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}@media screen and (min-width:768px){:host([vertical]){--pfe-tabs--Display:flex;--pfe-tabs__tabs--FlexDirection:column;--pfe-tabs__tabs--Width:20%;--pfe-tabs__tabs--BorderRight:var(--pfe-theme--ui--border-width, 1px) var(--pfe-theme--ui--border-style, solid) var(--pfe-tabs--BorderColor);--pfe-tabs__tabs--BorderBottom:0;--pfe-tabs__panels--Width:80%;--pfe-tabs__panels--PaddingRight:var(--pfe-theme--container-padding, 1rem)}}@media screen and (min-width:768px) and (-ms-high-contrast:active),screen and (min-width:768px) and (-ms-high-contrast:none){:host([vertical]){display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}:host([vertical]) .tabs{-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;width:22.22%;border-right:1px solid #d2d2d2;border-right:1px solid var(--pfe-theme--color--surface--border,#d2d2d2);border-bottom:0}:host([vertical]) .panels{width:77.8%;padding-right:1em}}@media screen and (min-width:768px) and (-ms-high-contrast:active),screen and (min-width:768px) and (-ms-high-contrast:none){:host([vertical][variant=earth]) .tabs{padding:1em 0 0 0}}@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host(:not([variant=earth])){background-color:#fff;background-color:var(--pfe-theme--color--surface--lightest,#fff);color:#151515;color:var(--pfe-theme--color--text,#151515)}}:host([variant=earth]){--pfe-tabs__tabs--PaddingLeft:var(--pfe-theme--container-padding, 1rem)}@media screen and (-ms-high-contrast:active),screen and (-ms-high-contrast:none){:host([variant=earth]) .tabs{padding-left:1em}}:host([on=dark]){--pfe-broadcasted--text:var(--pfe-theme--color--text--on-dark, #fff);--pfe-broadcasted--text--muted:var(--pfe-theme--color--text--muted--on-dark, #d2d2d2);--pfe-broadcasted--link:var(--pfe-theme--color--link--on-dark, #73bcf7);--pfe-broadcasted--link--hover:var(--pfe-theme--color--link--hover--on-dark, #bee1f4);--pfe-broadcasted--link--focus:var(--pfe-theme--color--link--focus--on-dark, #bee1f4);--pfe-broadcasted--link--visited:var(--pfe-theme--color--link--visited--on-dark, #bee1f4);--pfe-broadcasted--link-decoration:var(--pfe-theme--link-decoration--on-dark, none);--pfe-broadcasted--link-decoration--hover:var(--pfe-theme--link-decoration--hover--on-dark, underline);--pfe-broadcasted--link-decoration--focus:var(--pfe-theme--link-decoration--focus--on-dark, underline);--pfe-broadcasted--link-decoration--visited:var(--pfe-theme--link-decoration--visited--on-dark, none)}:host([on=saturated]){--pfe-broadcasted--text:var(--pfe-theme--color--text--on-saturated, #fff);--pfe-broadcasted--text--muted:var(--pfe-theme--color--text--muted--on-saturated, #d2d2d2);--pfe-broadcasted--link:var(--pfe-theme--color--link--on-saturated, #fff);--pfe-broadcasted--link--hover:var(--pfe-theme--color--link--hover--on-saturated, #fafafa);--pfe-broadcasted--link--focus:var(--pfe-theme--color--link--focus--on-saturated, #fafafa);--pfe-broadcasted--link--visited:var(--pfe-theme--color--link--visited--on-saturated, #d2d2d2);--pfe-broadcasted--link-decoration:var(--pfe-theme--link-decoration--on-saturated, underline);--pfe-broadcasted--link-decoration--hover:var(--pfe-theme--link-decoration--hover--on-saturated, underline);--pfe-broadcasted--link-decoration--focus:var(--pfe-theme--link-decoration--focus--on-saturated, underline);--pfe-broadcasted--link-decoration--visited:var(--pfe-theme--link-decoration--visited--on-saturated, underline)}:host([on=light]){--pfe-broadcasted--text:var(--pfe-theme--color--text, #151515);--pfe-broadcasted--text--muted:var(--pfe-theme--color--text--muted, #6a6e73);--pfe-broadcasted--link:var(--pfe-theme--color--link, #06c);--pfe-broadcasted--link--hover:var(--pfe-theme--color--link--hover, #004080);--pfe-broadcasted--link--focus:var(--pfe-theme--color--link--focus, #004080);--pfe-broadcasted--link--visited:var(--pfe-theme--color--link--visited, #6753ac);--pfe-broadcasted--link-decoration:var(--pfe-theme--link-decoration, none);--pfe-broadcasted--link-decoration--hover:var(--pfe-theme--link-decoration--hover, underline);--pfe-broadcasted--link-decoration--focus:var(--pfe-theme--link-decoration--focus, underline);--pfe-broadcasted--link-decoration--visited:var(--pfe-theme--link-decoration--visited, none)}:host([vertical]) .tabs-prefix,:host([vertical]) .tabs-suffix{left:0;top:0;content:" ";height:calc(1rem * 2);height:calc(var(--pfe-theme--container-padding,1rem) * 2);width:1px;position:relative}@media screen and (min-width:768px){:host([vertical]:not([variant=earth])) .tabs-prefix,:host([vertical]:not([variant=earth])) .tabs-suffix{background-color:#d2d2d2;background-color:var(--pfe-tabs__tabs--BorderColor,var(--pfe-theme--color--surface--border,#d2d2d2))}}:host(:not([vertical])[variant=earth]) .tabs-prefix{left:0;top:0;content:" ";height:1px;width:1rem;width:var(--pfe-theme--container-padding,1rem);position:relative}@media screen and (min-width:768px){:host(:not([vertical])[variant=earth]) .tabs-prefix{width:calc(1rem * 2);width:calc(var(--pfe-theme--container-padding,1rem) * 2)}}:host([hidden]){display:none} /*# sourceMappingURL=pfe-tabs.min.css.map */</style>
<div class="tabs">
  <div class="tabs-prefix"></div>
  <slot name="tab"></slot>
  <div class="tabs-suffix"></div>
</div>
<div class="panels">
  <slot name="panel"></slot>
</div>`;
  }

  static get tag() {
    return "pfe-tabs";
  }

  get styleUrl() {
    return "pfe-tabs.scss";
  }

  static get meta() {
    return {
      title: "Tabs",
      description: "This element creates a tabbed interface.",
    };
  }

  get templateUrl() {
    return "pfe-tabs.html";
  }

  // Each set contains a header and a panel
  static get contentTemplate() {
    return `
      <pfe-tab content-type="header" slot="tab"></pfe-tab>
      <pfe-tab-panel content-type="panel" slot="panel"></pfe-tab-panel>
    `;
  }

  static get properties() {
    return {
      vertical: {
        title: "Vertical orientation",
        type: Boolean,
        default: false,
        cascade: "pfe-tab,pfe-tab-panel",
        observer: "_verticalHandler",
      },
      orientation: {
        title: "Orientation",
        type: String,
        attr: "aria-orientation",
        default: "horizontal",
        values: ["horizontal", "vertical"],
      },
      // Do not set a default of 0, it causes a the URL history to
      // be updated on load for every tab; infinite looping goodness
      // Seriously, don't set a default here unless you do a rewrite
      selectedIndex: {
        title: "Index of the selected tab",
        type: Number,
        observer: "_selectedIndexHandler",
      },
      tabAlign: {
        title: "Tab alignment",
        type: String,
        enum: ["center"],
      },
      controls: {
        type: String,
        attr: "aria-controls",
      },
      variant: {
        title: "Variant",
        type: String,
        enum: ["wind", "earth"],
        default: "wind",
        cascade: "pfe-tab,pfe-tab-panel",
      },
      tabHistory: {
        title: "Tab History",
        type: Boolean,
        default: false,
        observer: "_tabHistoryHandler",
      },
      role: {
        type: String,
        default: "tablist",
      },
      // @TODO: Deprecated for 1.0
      oldVariant: {
        type: String,
        attr: "pfe-variant",
        alias: "variant",
      },
      // @TODO: Deprecated for 1.0
      oldTabHistory: {
        type: Boolean,
        alias: "tabHistory",
        attr: "pfe-tab-history",
      },
      // @TODO: Deprecated for 1.0
      oldPfeId: {
        type: String,
        attr: "pfe-id",
        observer: "_oldPfeIdChanged",
      },
    };
  }

  static get slots() {
    return {
      tab: {
        title: "Tab",
        type: "array",
        namedSlot: true,
        items: {
          $ref: "pfe-tab",
        },
      },
      panel: {
        title: "Panel",
        type: "array",
        namedSlot: true,
        items: {
          $ref: "pfe-tab-panel",
        },
      },
    };
  }

  static get events() {
    return {
      hiddenTab: `${this.tag}:hidden-tab`,
      shownTab: `${this.tag}:shown-tab`,
    };
  }

  // Declare the type of this component
  static get PfeType() {
    return PFElement.PfeTypes.Combo;
  }

  constructor() {
    super(PfeTabs, { type: PfeTabs.PfeType });

    this._linked = false;
    this._init = this._init.bind(this);
    this._onClick = this._onClick.bind(this);
    this._linkPanels = this._linkPanels.bind(this);
    this._popstateEventHandler = this._popstateEventHandler.bind(this);
    this._observer = new MutationObserver(this._init);
    this._updateHistory = true;
  }

  connectedCallback() {
    Promise.all([customElements.whenDefined(PfeTab.tag), customElements.whenDefined(PfeTabPanel.tag)]).then(() => {
      super.connectedCallback();

      if (this.hasLightDOM()) this._init();

      this._observer.observe(this, TABS_MUTATION_CONFIG);

      this.addEventListener("keydown", this._onKeyDown);
      this.addEventListener("click", this._onClick);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener("keydown", this._onKeyDown);
    this._allTabs().forEach((tab) => tab.removeEventListener("click", this._onClick));
    this._observer.disconnect();

    if (this.tabHistory) window.removeEventListener("popstate", this._popstateEventHandler);
  }

  _verticalHandler() {
    if (this.vertical) this.orientation = "vertical";
    else this.orientation = "horizontal";
  }

  _selectedIndexHandler(oldVal, newVal) {
    // Wait until the tab and panels are loaded
    Promise.all([customElements.whenDefined(PfeTab.tag), customElements.whenDefined(PfeTabPanel.tag)]).then(() => {
      this._linkPanels();
      this.selectIndex(newVal);
      this._updateHistory = true;
    });
  }

  _tabHistoryHandler() {
    if (!this.tabHistory) window.removeEventListener("popstate", this._popstateEventHandler);
    else window.addEventListener("popstate", this._popstateEventHandler);
  }

  _oldPfeIdChanged(oldVal, newVal) {
    if (!this.id && newVal) this.id = newVal;
  }

  select(newTab) {
    if (!newTab) return;

    if (newTab.tagName.toLowerCase() !== PfeTab.tag) {
      this.warn(`the tab must be a ${PfeTab.tag} element`);
      return;
    }

    this.selectedIndex = this._getTabIndex(newTab);
  }

  selectIndex(_index) {
    if (_index === undefined || _index === null) return;

    const index = parseInt(_index, 10);
    const tabs = this._allTabs();
    const tab = tabs[index];

    if (tabs.length > 0 && !tab) {
      this.warn(`tab ${_index} does not exist`);
      return;
    } else if (!tabs && !tab) {
      // Wait for upgrade?
      return;
    }
    if (this.selected && this.tabHistory && this._updateHistory && CAN_USE_URLSEARCHPARAMS) {
      // @IE11 doesn't support URLSearchParams
      // https://caniuse.com/#search=urlsearchparams
      // rebuild the url
      const pathname = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      urlParams.set(this.id, tab.id);
      history.pushState({}, "", `${pathname}?${urlParams.toString()}${hash}`);
    }

    this._selectTab(tab);

    return tab;
  }

  _init() {
    const tabIndexFromURL = this._getTabIndexFromURL();
    this._linked = false;
    this._linkPanels();

    // Force role to be set to tablist
    if (window.ShadyCSS) this._observer.disconnect();

    this.role = "tablist";

    if (tabIndexFromURL > -1) {
      this._setFocus = true;
      this.selectedIndex = tabIndexFromURL;
    }

    if (this.selectedIndex === null) this.selectedIndex = 0;

    if (window.ShadyCSS) this._observer.observe(this, TABS_MUTATION_CONFIG);
  }

  _linkPanels() {
    if (this._linked) return;

    if (window.ShadyCSS) this._observer.disconnect();

    this._allTabs().forEach((tab) => {
      const panel = tab.nextElementSibling;
      if (panel.tagName.toLowerCase() !== PfeTabPanel.tag) {
        this.warn(`not a sibling of a <${PfeTabPanel.tag}>`);
        return;
      }

      // Connect the 2 items via appropriate aria attributes
      tab.controls = panel.id;
      panel.labelledby = tab.id;

      tab.addEventListener("click", this._onClick);
    });

    this._linked = true;

    if (window.ShadyCSS) this._observer.observe(this, TABS_MUTATION_CONFIG);
  }

  _allPanels() {
    return [...this.children].filter((child) => child.matches(PfeTabPanel.tag));
  }

  _allTabs() {
    return [...this.children].filter((child) => child.matches(PfeTab.tag));
  }

  _panelForTab(tab) {
    if (!tab || !tab.controls) return;

    return this.querySelector(`#${tab.controls}`);
  }

  _prevTab() {
    const tabs = this._allTabs();
    let newIdx = tabs.findIndex((tab) => tab.selected === "true") - 1;
    return tabs[(newIdx + tabs.length) % tabs.length];
  }

  _firstTab() {
    const tabs = this._allTabs();
    return tabs[0];
  }

  _lastTab() {
    const tabs = this._allTabs();
    return tabs[tabs.length - 1];
  }

  _nextTab() {
    const tabs = this._allTabs();
    let newIdx = tabs.findIndex((tab) => tab.selected === "true") + 1;
    return tabs[newIdx % tabs.length];
  }

  _getTabIndex(_tab) {
    if (_tab) {
      const tabs = this._allTabs();
      return tabs.findIndex((tab) => tab.id === _tab.id);
    } else {
      this.warn(`No tab was provided to _getTabIndex; required to return the index value.`);
      return 0;
    }
  }

  reset() {
    const tabs = this._allTabs();
    const panels = this._allPanels();

    tabs.forEach((tab) => (tab.selected = "false"));
    panels.forEach((panel) => (panel.hidden = true));
  }

  _selectTab(newTab) {
    if (!newTab) return;

    this.reset();

    const newPanel = this._panelForTab(newTab);
    let newTabSelected = false;

    if (!newPanel) this.warn(`No panel was found for the selected tab${newTab.id ? `: pfe-tab#${newTab.id}` : ""}`);

    // this.selected on tabs contains a pointer to the selected tab element
    if (this.selected && this.selected !== newTab) {
      newTabSelected = true;

      this.emitEvent(PfeTabs.events.hiddenTab, {
        detail: {
          tab: this.selected,
        },
      });
    }

    newTab.selected = "true";
    newPanel.hidden = false;

    // Update the value of the selected pointer to the new tab
    this.selected = newTab;

    if (newTabSelected) {
      if (this._setFocus) newTab.focus();

      this.emitEvent(PfeTabs.events.shownTab, {
        detail: {
          tab: this.selected,
        },
      });
    }

    this._setFocus = false;
  }

  _onKeyDown(event) {
    const tabs = this._allTabs();
    const foundTab = tabs.find((tab) => tab === event.target);

    if (!foundTab) {
      return;
    }

    if (event.altKey) {
      return;
    }

    let newTab;

    switch (event.keyCode) {
      case KEYCODE.LEFT:
      case KEYCODE.UP:
        newTab = this._prevTab();
        break;

      case KEYCODE.RIGHT:
      case KEYCODE.DOWN:
        newTab = this._nextTab();
        break;

      case KEYCODE.HOME:
        newTab = this._firstTab();
        break;

      case KEYCODE.END:
        newTab = this._lastTab();
        break;

      default:
        return;
    }

    event.preventDefault();

    if (newTab) {
      this.selectedIndex = this._getTabIndex(newTab);
      this._setFocus = true;
    } else {
      this.warn(`No new tab could be found.`);
    }
  }

  _onClick(event) {
    // Find the clicked tab
    const foundTab = this._allTabs().find((tab) => tab === event.currentTarget);

    // If the tab wasn't found in the markup, exit the handler
    if (!foundTab) return;

    // Update the selected index to the clicked tab
    this.selectedIndex = this._getTabIndex(event.currentTarget);
  }

  _getTabIndexFromURL() {
    let urlParams;

    // @IE11 doesn't support URLSearchParams
    // https://caniuse.com/#search=urlsearchparams

    // @Deprecated in 1.0
    // the "pfe-" prefix has been deprecated but we'll continue to support it
    // we'll give priority to the urlParams.has(`${this.id}`) attribute first
    // and fallback to urlParams.has(`pfe-${this.id}`) if it exists. We should
    // be able to remove the || part of the if statement in the future
    if (CAN_USE_URLSEARCHPARAMS) {
      urlParams = new URLSearchParams(window.location.search);

      const tabsetInUrl = urlParams.has(`${this.id}`) || urlParams.has(`pfe-${this.id}`); // remove this condition when it's no longer used in production

      if (urlParams && tabsetInUrl) {
        let id = urlParams.get(`${this.id}`) || urlParams.get(`pfe-${this.id}`); // remove this condition when it's no longer used in production
        return this._allTabs().findIndex((tab) => tab.id === id);
      }
    }

    return -1;
  }

  _popstateEventHandler() {
    const tabIndexFromURL = this._getTabIndexFromURL();

    this._updateHistory = false;
    if (tabIndexFromURL > -1) this.selectedIndex = tabIndexFromURL;
  }
}

PFElement.create(PfeTab);
PFElement.create(PfeTabPanel);
PFElement.create(PfeTabs);
