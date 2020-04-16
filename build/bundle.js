
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (118:2) {:else}
    function create_else_block(ctx) {
    	let br;
    	let t0;
    	let tr;

    	const block = {
    		c: function create() {
    			br = element("br");
    			t0 = space();
    			tr = element("tr");
    			tr.textContent = "loading...";
    			add_location(br, file, 118, 4, 2600);
    			add_location(tr, file, 119, 4, 2611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, tr, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(118:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (105:2) {#if load === true}
    function create_if_block(ctx) {
    	let tr0;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*predict*/ ctx[3](/*DAY*/ ctx[2]) + "";
    	let t2;
    	let t3;
    	let tr1;
    	let td2;
    	let t5;
    	let td3;
    	let t6_value = /*DATA*/ ctx[0][/*DATA*/ ctx[0].length - 1] + "";
    	let t6;
    	let t7;
    	let tr2;
    	let td4;
    	let t9;
    	let td5;
    	let t10_value = /*diff*/ ctx[4](/*DAY*/ ctx[2]) + "";
    	let t10;

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Predicted Recoveries:";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "Today:";
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "Difference:";
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			attr_dev(td0, "class", "style svelte-kzmevt");
    			add_location(td0, file, 106, 6, 2250);
    			attr_dev(td1, "class", "style svelte-kzmevt");
    			add_location(td1, file, 107, 6, 2301);
    			attr_dev(tr0, "class", "style svelte-kzmevt");
    			add_location(tr0, file, 105, 4, 2225);
    			attr_dev(td2, "class", "style svelte-kzmevt");
    			add_location(td2, file, 110, 6, 2378);
    			attr_dev(td3, "class", "style svelte-kzmevt");
    			add_location(td3, file, 111, 6, 2414);
    			attr_dev(tr1, "class", "style svelte-kzmevt");
    			add_location(tr1, file, 109, 4, 2353);
    			attr_dev(td4, "class", "style svelte-kzmevt");
    			add_location(td4, file, 114, 6, 2500);
    			attr_dev(td5, "class", "style svelte-kzmevt");
    			add_location(td5, file, 115, 6, 2541);
    			attr_dev(tr2, "class", "style svelte-kzmevt");
    			add_location(tr2, file, 113, 4, 2475);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(td1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, tr1, anchor);
    			append_dev(tr1, td2);
    			append_dev(tr1, t5);
    			append_dev(tr1, td3);
    			append_dev(td3, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, tr2, anchor);
    			append_dev(tr2, td4);
    			append_dev(tr2, t9);
    			append_dev(tr2, td5);
    			append_dev(td5, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*DAY*/ 4 && t2_value !== (t2_value = /*predict*/ ctx[3](/*DAY*/ ctx[2]) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*DATA*/ 1 && t6_value !== (t6_value = /*DATA*/ ctx[0][/*DATA*/ ctx[0].length - 1] + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*DAY*/ 4 && t10_value !== (t10_value = /*diff*/ ctx[4](/*DAY*/ ctx[2]) + "")) set_data_dev(t10, t10_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(tr1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(tr2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(105:2) {#if load === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let table;
    	let tr0;
    	let td0;
    	let h1;
    	let t1;
    	let tr1;
    	let td1;
    	let t3;
    	let td2;
    	let input;
    	let input_updating = false;
    	let t4;
    	let dispose;

    	function input_input_handler() {
    		input_updating = true;
    		/*input_input_handler*/ ctx[9].call(input);
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*load*/ ctx[1] === true) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			h1 = element("h1");
    			h1.textContent = "OSWALD PREDICTOR";
    			t1 = space();
    			tr1 = element("tr");
    			td1 = element("td");
    			td1.textContent = "Days:";
    			t3 = space();
    			td2 = element("td");
    			input = element("input");
    			t4 = space();
    			if_block.c();
    			add_location(h1, file, 94, 6, 1994);
    			attr_dev(td0, "colspan", "2");
    			attr_dev(td0, "class", "svelte-kzmevt");
    			add_location(td0, file, 93, 4, 1971);
    			set_style(tr0, "text-align", "center");
    			add_location(tr0, file, 92, 2, 1934);
    			attr_dev(td1, "class", "style svelte-kzmevt");
    			add_location(td1, file, 98, 4, 2063);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", "Day");
    			attr_dev(input, "class", "svelte-kzmevt");
    			add_location(input, file, 100, 6, 2121);
    			attr_dev(td2, "class", "style svelte-kzmevt");
    			add_location(td2, file, 99, 4, 2096);
    			attr_dev(tr1, "class", "style svelte-kzmevt");
    			add_location(tr1, file, 97, 2, 2040);
    			attr_dev(table, "class", "svelte-kzmevt");
    			add_location(table, file, 91, 0, 1924);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, h1);
    			append_dev(table, t1);
    			append_dev(table, tr1);
    			append_dev(tr1, td1);
    			append_dev(tr1, t3);
    			append_dev(tr1, td2);
    			append_dev(td2, input);
    			set_input_value(input, /*DAY*/ ctx[2]);
    			append_dev(table, t4);
    			if_block.m(table, null);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", input_input_handler);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!input_updating && dirty & /*DAY*/ 4) {
    				set_input_value(input, /*DAY*/ ctx[2]);
    			}

    			input_updating = false;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(table, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let DATA = [];
    	let load = false;
    	let res;
    	let DAY = 0;
    	let AI;

    	Papa.parse("https://data.humdata.org/hxlproxy/api/data-preview.csv?url=https%3A%2F%2Fraw.githubusercontent.com%2FCSSEGISandData%2FCOVID-19%2Fmaster%2Fcsse_covid_19_data%2Fcsse_covid_19_time_series%2Ftime_series_covid19_recovered_global.csv&filename=time_series_covid19_recovered_global.csv", {
    		download: true,
    		complete: result => {
    			for (var i = 0; i < result.data.length - 1; i++) {
    				DATA.push(result.data[i]);
    			}

    			$$invalidate(0, DATA = DATA.splice(1, DATA.length));
    			cleanup();
    		}
    	});

    	function cleanup() {
    		const cases = [];

    		for (var i = 2; i < DATA[0].length; i++) {
    			const amount = [];

    			for (var o = 0; o < DATA.length; o++) {
    				try {
    					//console.log(amount + parseInt(DATA[o][i]))
    					amount.push(parseInt(DATA[o][i]));
    				} catch {
    					console.log(DATA[o][i]);
    				}
    			}

    			cases.push(amount.reduce((a, b) => a + b, 0));
    		}

    		$$invalidate(0, DATA = cases);
    		train();
    	}

    	function train() {
    		const x = [];

    		for (var i = 0; i < DATA.length; i++) {
    			x.push(i + 1);
    		}

    		AI = new window.PR(x, DATA, 1);
    		$$invalidate(2, DAY = DATA.length + 1);
    		$$invalidate(1, load = true);
    	}

    	function predict(day = 0) {
    		return Math.round(AI.predict(day));
    	}

    	function diff(day) {
    		const prediction = predict(day);
    		const today = DATA[DATA.length - 1];
    		const difference = Math.abs(prediction - today);
    		return difference;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function input_input_handler() {
    		DAY = to_number(this.value);
    		$$invalidate(2, DAY);
    	}

    	$$self.$capture_state = () => ({
    		DATA,
    		load,
    		res,
    		DAY,
    		AI,
    		cleanup,
    		train,
    		predict,
    		diff
    	});

    	$$self.$inject_state = $$props => {
    		if ("DATA" in $$props) $$invalidate(0, DATA = $$props.DATA);
    		if ("load" in $$props) $$invalidate(1, load = $$props.load);
    		if ("res" in $$props) res = $$props.res;
    		if ("DAY" in $$props) $$invalidate(2, DAY = $$props.DAY);
    		if ("AI" in $$props) AI = $$props.AI;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [DATA, load, DAY, predict, diff, AI, res, cleanup, train, input_input_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
