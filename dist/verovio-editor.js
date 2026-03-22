//#region ts/events/custom-event-manager.ts
var e = class {
	cache;
	objs;
	propagationList;
	constructor() {
		this.cache = /* @__PURE__ */ new Map(), this.objs = /* @__PURE__ */ new Map(), this.propagationList = [];
	}
	bind(e, t, n) {
		this.cache.has(e.id) || (this.cache.set(e.id, /* @__PURE__ */ new Map()), this.objs.set(e.id, e));
		let r = this.cache.get(e.id);
		r.has(t) || r.set(t, n);
	}
	addToPropagationList(e) {
		this.propagationList.includes(e) || this.propagationList.push(e);
	}
	dispatch(e) {
		for (let [t, n] of this.cache) {
			let r = n.get(e.type);
			if (r) {
				let n = this.objs.get(t);
				r.call(n, e);
			}
		}
		for (let t of this.propagationList) t.dispatch(e);
	}
};
//#endregion
//#region ts/utils/functions.ts
function t(e, t) {
	return y(e, t, "a");
}
function n(e, t) {
	return y(e, t, "canvas");
}
function r(e, t) {
	return y(e, t, "details");
}
function i(e, t) {
	return y(e, t, "div");
}
function a(e, t, n) {
	return b(e, t, "div", n);
}
function o(e, t) {
	return y(e, t, "input");
}
function s(e, t) {
	return y(e, t, "link");
}
function c(e, t) {
	return y(e, t, "option");
}
function l(e, t) {
	return y(e, t, "optgroup");
}
function u(e, t) {
	return y(e, t, "select");
}
function d(e, t, n = "") {
	let r = y(e, t, "span");
	return r.textContent = n, r;
}
function f(e, t) {
	return y(e, t, "summary");
}
function p(e, t) {
	return y(e, t, "table");
}
function m(e, t) {
	return y(e, t, "tbody");
}
function h(e, t) {
	return y(e, t, "td");
}
function g(e, t) {
	return y(e, t, "tr");
}
function _(e, t) {
	return y(e, t, "textarea");
}
function v(e) {
	return Math.floor((1 + Math.random()) * 16 ** e).toString(16).substring(1);
}
function y(e, t, n) {
	let r = document.createElement(n);
	return S(r, t), e.appendChild(r), r;
}
function b(e, t, n, r) {
	let i = document.createElement(n);
	return S(i, t), e.insertBefore(i, r), i;
}
function x(e, t) {
	let n = y(e, t, "midi-player");
	return n.setAttribute("sound-font", ""), n.style.display = "none", n;
}
function S(e, t) {
	for (let n in t) n === "style" ? C(e, t[n]) : n === "dataset" ? w(e, t[n]) : e.setAttribute(n, t[n]);
}
function C(e, t) {
	for (let n in t) t.hasOwnProperty(n) && (e.style[n] = t[n]);
}
function w(e, t) {
	for (let n in t) e.dataset[n] = t[n];
}
//#endregion
//#region ts/events/event-manager.ts
var T = class {
	parent;
	cache;
	appIDAttr;
	constructor(e) {
		e && (this.parent = e, this.cache = {}, this.appIDAttr = "data-app-el-id");
	}
	bind(e, t, n) {
		let r = e.getAttribute(this.appIDAttr) || e.getAttribute("id");
		r || (r = v(16), e.setAttribute(this.appIDAttr, r)), r in this.cache || (this.cache[r] = {});
		let i = this.cache[r];
		t in i || (i[t] = []);
		let a = i[t], o = n.bind(this.parent);
		a.push(o), e.addEventListener(t, o);
	}
	unbind(e, t) {
		let n = e.getAttribute(this.appIDAttr) || e.getAttribute("id");
		if (n && n in this.cache) {
			if (this.cache[n][t]) for (let r of this.cache[n][t]) e.removeEventListener(t, r);
			delete this.cache[n];
		}
	}
	unbindAll() {
		for (let e in this.cache) {
			let t = document.getElementById(e);
			if (t ||= document.querySelector(`*[${this.appIDAttr}='${e}']`), t) for (let n in this.cache[e]) for (let r of this.cache[e][n]) t.removeEventListener(n, r);
		}
		this.cache = {};
	}
}, E = window.pako, D = class {
	stack;
	storage;
	constructor(e) {
		this.storage = e;
		let t = this.storage.getItem("fileStack");
		this.stack = Object.assign({
			idx: 0,
			items: 0,
			maxItems: 6,
			filenames: []
		}, JSON.parse(t || "{}"));
	}
	store(e, t) {
		let n = this.fileList();
		for (let r = 0; r < n.length; r++) if (e === n[r].filename && t === this.load(n[r].idx).data) {
			console.debug("File already in the list");
			return;
		}
		this.stack.idx--, this.stack.idx < 0 && (this.stack.idx = this.stack.maxItems - 1), this.stack.filenames[this.stack.idx] = e;
		let r = btoa(E.deflate(t, { to: "string" }));
		this.storage.setItem("file-" + this.stack.idx, r), this.stack.items < this.stack.maxItems - 1 && this.stack.items++, this.storage.setItem("fileStack", JSON.stringify(this.stack));
	}
	load(e) {
		let t = this.storage.getItem("file-" + e), n = E.inflate(atob(t), { to: "string" });
		return {
			filename: this.stack.filenames[e],
			data: n
		};
	}
	getLast() {
		if (E !== void 0 && this.stack.items > 0) return this.load(this.stack.idx);
	}
	fileList() {
		let e = [];
		for (let t = 0; t < this.stack.items; t++) {
			let n = (this.stack.idx + t) % this.stack.maxItems;
			e.push({
				idx: n,
				filename: this.stack.filenames[n]
			});
		}
		return e;
	}
	reset() {
		let e = this.fileList();
		for (let t = 0; t < e.length; t++) this.storage.removeItem("file-" + e[t].idx);
		this.storage.removeItem("fileStack"), this.stack.items = 0;
	}
}, ee = "1.5.0", O = .5, k = `Live validation and synchronization from the XML editor is disabled for files larger than ${O}MB.\n\nPress 'Shift-Ctrl-V' to trigger validation and refreshing of the rendering.`;
`${ee}`;
var te = "You have un-synchronized modifications in the XML editor which will be lost.\n\nDo you want to continue?", A = /* @__PURE__ */ function(e) {
	return e.Activate = "onActivate", e.Deactivate = "onDeactivate", e.LoadData = "onLoadData", e.Select = "onSelect", e.EditData = "onEditData", e.Resized = "onResized", e.CursorActivity = "onCursorActivity", e.Page = "onPage", e.Zoom = "onZoom", e.StartLoading = "onStartLoading", e.EndLoading = "onEndLoading", e;
}({});
function j(e, t) {
	return new CustomEvent(e, { detail: t });
}
//#endregion
//#region ts/utils/notification-service.ts
var ne = class {
	element;
	stack;
	constructor(e) {
		this.element = e, this.stack = [];
	}
	show(e) {
		this.stack.push(e), this.stack.length < 2 && this.push();
	}
	push() {
		this.stack.length !== 0 && (this.element.textContent = this.stack[0], this.element.classList.remove("disabled"), setTimeout(() => {
			this.element.classList.add("disabled"), this.stack.shift(), this.stack.length > 0 && this.push();
		}, 3500));
	}
}, re = class {
	loader;
	loaderText;
	views;
	customEventManager;
	loadingCount;
	constructor(e, t, n, r) {
		this.loader = e, this.loaderText = t, this.views = n, this.customEventManager = r, this.loadingCount = 0;
	}
	start(e, t = !1) {
		console.debug(`[LoaderService] start: ${e} (light=${t}), count=${this.loadingCount}`), t ? this.views.style.pointerEvents = "none" : (this.views.style.overflow = "hidden", this.loader.style.display = "flex", this.loadingCount++), this.loaderText.textContent = e, this.customEventManager.dispatch(j(A.StartLoading, {
			light: t,
			msg: e
		}));
	}
	end(e = !1) {
		console.debug(`[LoaderService] end: (light=${e}), count=${this.loadingCount}`), e || (this.loadingCount--, this.loadingCount < 0 && (console.error("endLoading index corrupted"), this.loadingCount = 0)), !(this.loadingCount > 0) && (this.views.style.overflow = "scroll", this.loader.style.display = "none", this.views.style.pointerEvents = "", this.views.style.opacity = "", this.customEventManager.dispatch(j(A.EndLoading)));
	}
	getCount() {
		return this.loadingCount;
	}
}, M = class {
	promise;
	reject;
	resolve;
	constructor() {
		this.promise = new Promise((e, t) => {
			this.reject = t, this.resolve = e;
		});
	}
}, ie = 1, N = /* @__PURE__ */ new Map(), P = class {
	worker;
	constructor(e) {
		return this.worker = e, this.worker.addEventListener("message", (e) => {
			let { taskId: t, result: n } = e.data, r = N.get(t);
			r && (r.resolve(n), N.delete(t));
		}, !1), new Proxy(this, { get: (e, t) => function() {
			let n = ie++, r = Array.prototype.slice.call(arguments);
			e.worker.postMessage({
				taskId: n,
				method: t,
				args: r
			});
			let i = new M();
			return N.set(n, i), i.promise;
		} });
	}
}, F = class extends P {
	addPage;
	end;
	start;
	constructor(e) {
		super(e);
	}
}, ae = class extends P {
	check;
	validate;
	validateNG;
	setRelaxNGSchema;
	setSchema;
	onRuntimeInitialized;
	constructor(e) {
		super(e);
	}
}, oe = class extends P {
	edit;
	editInfo;
	getAvailableOptions;
	getDefaultOptions;
	getElementAttr;
	getElementsAtTime;
	getLog;
	getOptions;
	getMEI;
	getPageCount;
	getPageWithElement;
	loadData;
	redoLayout;
	redoPagePitchPosLayout;
	renderToExpansionMap;
	renderToMIDI;
	renderToSVG;
	select;
	setOptions;
	getVersion;
	onRuntimeInitialized;
	constructor(e) {
		super(e);
	}
}, I = class {
	tags;
	rngNs;
	constructor() {
		this.rngNs = "http://relaxng.org/ns/structure/1.0", this.tags = {};
	}
	setRelaxNGSchema(e) {
		let t = new window.DOMParser().parseFromString(e, "text/xml");
		this.tags = {};
		let n = this, r = this.collectDefinitions(t), i = /* @__PURE__ */ new Map();
		Object.keys(r).map(function(e) {
			r[e].map(function(e) {
				n.findElements(r, e, i);
			});
		}), i["!top"] = this.findAllTopLevelElements(r, [], t), this.tags = this.sortObject(i);
	}
	getTags() {
		return this.tags;
	}
	collectDefinitions(e) {
		let t = /* @__PURE__ */ new Map(), n = e.getElementsByTagNameNS(this.rngNs, "define"), r, i, a, o;
		for (r = 0; r < n.length; r += 1) a = n.item(r), i = a.getAttribute("name"), o = t[i] = t[i] || [], o.push(a);
		return t;
	}
	followReference(e, t, n, r) {
		let i = n.getAttribute("name").trim();
		t.indexOf(i) === -1 && (t.push(i), e[i].map(r), t.pop());
	}
	recurseRng(e, t, n, r) {
		let i;
		if (this.isRng(n, "ref")) this.followReference(e, t, n, function(e) {
			r(e);
		});
		else for (i = n.firstElementChild; i;) r(i), i = i.nextElementSibling;
	}
	getAttributeValues(e, t, n, r, i) {
		let a;
		if (this.isRng(n, "value")) a = n.textContent.trim(), r.indexOf(a) === -1 && r.push(a);
		else if (this.isRng(n, "data")) i.push(n.getAttribute("type"));
		else {
			let a = this;
			this.recurseRng(e, t, n, function(n) {
				a.getAttributeValues(e, t, n, r, i);
			});
		}
	}
	getNamesRecurse(e, t) {
		let n;
		if (this.isRng(e, "name")) t.push(e.textContent);
		else if (this.isRng(e, "choice")) for (n = e.firstElementChild; n;) this.getNamesRecurse(n, t), n = n.nextElementSibling;
	}
	getNames(e) {
		if (e.hasAttribute("name")) return [e.getAttribute("name")];
		let t = [], n = e.firstElementChild;
		for (; n;) this.getNamesRecurse(n, t), n = n.nextElementSibling;
		return t;
	}
	defineElement(e, t, n, r) {
		let i = [], a = [], o = [];
		if (this.isRng(n, "element")) i = this.getNames(n), i.map(function(e) {
			r.children.indexOf(e) === -1 && r.children.push(e);
		});
		else if (this.isRng(n, "attribute")) this.getAttributeValues(e, t, n, a, o), i = this.getNames(n), a.length === 0 && (a = null), i.map(function(e) {
			r.attrs[e] ? r.attrs[e] = r.attrs[e].concat(a) : r.attrs[e] = a, o && o.length > 0 && (r.types[e] = o[0]);
		});
		else if (this.isRng(n, "text")) r.text = !0;
		else {
			let i = this;
			this.recurseRng(e, t, n, function(n) {
				i.defineElement(e, t, n, r);
			});
		}
	}
	sortObject(e) {
		let t = {}, n = Object.keys(e);
		return n.sort(), n.map(function(n) {
			t[n] = e[n];
		}), t;
	}
	sortAttributeValues(e) {
		Object.keys(e).map(function(t) {
			let n = e[t];
			n && n.sort();
		});
	}
	findElements(e, t, n) {
		let r, i, a;
		if (this.isRng(t, "element")) {
			for (a = {
				attrs: {},
				children: [],
				types: {}
			}, r = t.firstElementChild; r;) this.defineElement(e, [], r, a), r = r.nextElementSibling;
			a.children.sort(), a.attrs = this.sortObject(a.attrs), this.sortAttributeValues(a.attrs), i = this.getNames(t), i.map(function(e) {
				n[e] = a;
			});
		} else for (r = t.firstElementChild; r;) this.findElements(e, r, n), r = r.nextElementSibling;
	}
	findTopLevelElements(e, t, n, r) {
		if (n.localName === "element") n.hasAttribute("name") && r.push(n.getAttribute("name"));
		else {
			let i = this;
			this.recurseRng(e, t, n, function(n) {
				i.findTopLevelElements(e, t, n, r);
			});
		}
	}
	findAllTopLevelElements(e, t, n) {
		let r = [], i = n.getElementsByTagNameNS(this.rngNs, "start"), a, o;
		for (o = 0; o < i.length; o += 1) a = i.item(o), this.findTopLevelElements(e, t, a, r);
		return r;
	}
	isRng(e, t) {
		return e.namespaceURI === this.rngNs && e.localName === t;
	}
}, se = class {
	verovio;
	validator = null;
	rngLoader = null;
	rngLoaderBasic = null;
	verovioRuntimeVersion = "";
	host;
	pdfkitUrl;
	constructor(e) {
		this.host = e.host, this.pdfkitUrl = e.pdfkitUrl;
		let t = this.getWorkerURL(`${e.host}/dist/verovio/verovio-worker.js`), n = new Worker(t), r = e.verovioUrl || `https://www.verovio.org/javascript/${e.verovioVersion}/verovio-toolkit-wasm.js`;
		if (n.postMessage({ verovioUrl: r }), this.verovio = new oe(n), e.enableEditor) {
			let t = this.getWorkerURL(`${e.host}/dist/xml/validator-worker.js`), n = new Worker(t), r = e.validatorUrl || "https://www.verovio.org/javascript/validator/xml-validator-2.10.3.js";
			n.postMessage({ validatorUrl: r }), this.validator = new ae(n), this.rngLoader = new I(), this.rngLoaderBasic = new I();
		}
	}
	getWorkerURL(e) {
		let t = `importScripts("${e}");`;
		return URL.createObjectURL(new Blob([t], { type: "text/javascript" }));
	}
	async init(e) {
		if (await this.verovio.onRuntimeInitialized(), this.verovioRuntimeVersion = await this.verovio.getVersion(), this.validator && this.rngLoader && this.rngLoaderBasic) {
			await this.validator.onRuntimeInitialized();
			let t = await (await fetch(e.schema)).text();
			e.enableValidation && await this.validator.setRelaxNGSchema(t), this.rngLoader.setRelaxNGSchema(t);
			let n = await (await fetch(e.schemaBasic)).text();
			this.rngLoaderBasic.setRelaxNGSchema(n);
		}
		return this.verovioRuntimeVersion;
	}
	getRuntimeVersion() {
		return this.verovioRuntimeVersion;
	}
	getPDFWorker() {
		let e = this.getWorkerURL(`${this.host}/dist/document/pdf-worker.js`), t = new Worker(e), n = this.pdfkitUrl || "https://www.verovio.org/javascript/pdfkit";
		return t.postMessage({ pdfkitUrl: n }), new F(t);
	}
}, ce = class {
	pdf;
	currentScale;
	verovio;
	constructor(e, t, n) {
		this.verovio = e, this.pdf = t, this.currentScale = n;
	}
	async generateFile() {
		let e = await this.verovio.getOptions();
		e.scale = this.currentScale, console.log(e), await this.verovio.setOptions({
			adjustPageHeight: !1,
			footer: "auto",
			justifyVertically: !0,
			mmOutput: !0,
			pageHeight: 2970,
			pageWidth: 2100,
			scale: 100
		}), await this.verovio.redoLayout();
		let t = await this.verovio.getPageCount();
		await this.pdf.start({
			useCSS: !0,
			compress: !0,
			autoFirstPage: !1,
			layout: "portrait"
		});
		for (let e = 0; e < t; e++) {
			let t = await this.verovio.renderToSVG(e + 1);
			await this.pdf.addPage(t);
		}
		let n = await this.pdf.end();
		return await this.verovio.setOptions(e), await this.verovio.redoLayout(), n;
	}
}, L = class e {
	app;
	eventManager;
	div;
	options;
	box;
	top;
	icon;
	close;
	content;
	bottom;
	cancelBtn;
	okBtn;
	boundKeyDown;
	deferred;
	constructor(t, n, r, a) {
		this.options = Object.assign({
			icon: "info",
			type: e.Type.OKCancel,
			okLabel: "OK",
			cancelLabel: "Cancel"
		}, a), this.div = t, this.div.textContent = "", this.app = n, this.eventManager = new T(this), this.bindListeners(), this.box = i(this.div, { class: "vrv-dialog-box" }), this.top = i(this.box, { class: "vrv-dialog-top" }), this.icon = i(this.top, { class: "vrv-dialog-icon" }), this.icon.classList.add(this.options.icon);
		let o = i(this.top, { class: "vrv-dialog-title" });
		o.textContent = r, this.close = i(this.top, { class: "vrv-dialog-close" }), this.content = i(this.box, { class: "vrv-dialog-content" }), this.bottom = i(this.box, { class: "vrv-dialog-bottom" }), this.cancelBtn = i(this.bottom, {
			class: "vrv-dialog-btn",
			"data-before": this.options.cancelLabel
		}), this.okBtn = i(this.bottom, {
			class: "vrv-dialog-btn",
			"data-before": this.options.okLabel
		}), this.eventManager.bind(this.close, "click", this.cancel), this.eventManager.bind(this.cancelBtn, "click", this.cancel), this.eventManager.bind(this.okBtn, "click", this.ok), document.addEventListener("keydown", this.boundKeyDown), this.options.type === e.Type.Msg && (this.cancelBtn.style.display = "none");
	}
	addButton(e, t) {
		let n = a(this.bottom, {
			class: "vrv-dialog-btn",
			"data-before": e
		}, this.cancelBtn);
		this.eventManager.bind(n, "click", t);
	}
	setContent(e) {
		this.content.innerHTML = e;
	}
	addDetails(e, t) {
		let n = r(this.content, {}), a = f(n, {}), o = i(n, {});
		a.innerHTML = e, o.innerHTML = t;
	}
	bindListeners() {
		this.boundKeyDown = (e) => this.keyDownListener(e);
	}
	cancel() {
		this.div.style.display = "none", document.removeEventListener("keydown", this.boundKeyDown), this.deferred.resolve(0);
	}
	ok() {
		this.div.style.display = "none", document.removeEventListener("keydown", this.boundKeyDown);
		let t = this.options.type === e.Type.Msg ? 0 : 1;
		this.deferred.resolve(t);
	}
	reset() {}
	async show() {
		return this.div.style.display = "block", this.okBtn.focus(), this.deferred = new M(), this.deferred.promise;
	}
	keyDownListener(e) {
		e.keyCode === 27 ? this.cancel() : e.keyCode === 13 && this.ok();
	}
	appendLabel(e, t) {
		let n = i(e, { class: "vrv-dialog-label" });
		return n.textContent = t, n;
	}
};
(function(e) {
	e.Type = /* @__PURE__ */ function(e) {
		return e[e.Msg = 0] = "Msg", e[e.OKCancel = 1] = "OKCancel", e;
	}({});
})(L ||= {});
//#endregion
//#region ts/utils/file-service.ts
var le = class {
	app;
	fileStack;
	inputData = "";
	filename = "untitled.xml";
	constructor(e) {
		this.app = e, this.fileStack = e.fileStack;
	}
	getInputData() {
		return this.inputData;
	}
	getFilename() {
		return this.filename;
	}
	loadData(e, t = "untitled.xml", n = !1, r = !1) {
		this.inputData.length !== 0 && r || (this.inputData.length !== 0 && (this.fileStack.store(this.filename, this.inputData), this.app.toolbarObj !== null && this.app.toolbarObj.updateRecent()), this.inputData = e, this.filename = t, this.app.isLoaded() && this.loadMEI(n));
	}
	async loadMEI(e) {
		this.app.loaderService.start("Loading the MEI data ..."), e && (await this.app.verovio.loadData(this.inputData), this.inputData = await this.app.verovio.getMEI({})), this.app.viewEditorObj && (this.app.viewEditorObj.setXmlEditorEnabled(!1), this.app.viewEditorObj.xmlEditorViewObj.setMode(this.inputData.length)), await this.checkSchema();
		let t = this.app.getView();
		t && t.customEventManager.dispatch(j(A.LoadData, {
			currentId: this.app.id,
			caller: t,
			lightEndLoading: !1,
			mei: this.inputData
		}));
	}
	async checkSchema() {
		if (!this.app.options.enableEditor || !/<\?xml-model.*schematypens=\"http?:\/\/relaxng\.org\/ns\/structure\/1\.0\"/.exec(this.inputData)) return;
		let e = /<\?xml-model.*href="([^"]*).*/.exec(this.inputData);
		if (e && e[1] !== this.app.getCurrentSchema()) {
			if (this.app.setCurrentSchema(this.app.options.schemaDefault), this.app.options.useCustomDialogs) {
				let t = new CustomEvent("onSchemaWarningRequest", {
					cancelable: !0,
					detail: {
						schema: e[1],
						defaultSchema: this.app.options.schemaDefault
					}
				});
				if (this.app.dispatchEvent(t), t.defaultPrevented) return;
			}
			let t = new L(this.app.dialogDiv, this.app, "Different Schema in the file", {
				icon: "warning",
				type: L.Type.Msg
			});
			t.setContent(`The Schema '${e[1]}' in the file is different from the one in the editor<br><br>The validation in the editor will use the Schema '${this.app.options.schemaDefault}'`), await t.show();
		}
	}
	async generatePDF(e) {
		this.app.pdfWorker || (this.app.pdfWorker = this.app.verovioService.getPDFWorker());
		let t = await new ce(this.app.verovio, this.app.pdfWorker, this.app.verovioOptions.scale).generateFile();
		this.app.loaderService.end(), e.href = `${t}`, e.download = this.filename.replace(/\.[^\.]*$/, ".pdf"), e.click();
	}
	async generateMIDI(e) {
		let t = await this.app.verovio.renderToMIDI();
		this.app.loaderService.end(), e.href = `data:audio/midi;base64,${t}`, e.download = this.filename.replace(/\.[^\.]*$/, ".mid"), e.click();
	}
	async generateMEI(e, t = null) {
		let n = await this.app.verovio.getMEI(e);
		return this.app.loaderService.end(), t && (t.href = "data:text/xml;charset=utf-8," + encodeURIComponent(n), t.download = this.filename.replace(/\.[^\.]*$/, ".mei"), t.click()), n;
	}
	setInputData(e) {
		this.inputData = e;
	}
	setFilename(e) {
		this.filename = e;
	}
}, R = class {
	getItem(e) {
		return window.localStorage.getItem(e);
	}
	setItem(e, t) {
		window.localStorage.setItem(e, t);
	}
	removeItem(e) {
		window.localStorage.removeItem(e);
	}
}, z = class {
	getItem(e) {
		return null;
	}
	setItem(e, t) {}
	removeItem(e) {}
}, ue = "/svg/filter.xml", B = class {
	plugins;
	services;
	commands;
	extensions;
	viewsRegistry;
	dialogDiv;
	host;
	customEventManager;
	zoomLevels;
	eventManager;
	id;
	fileStack;
	storageProvider;
	options;
	verovio;
	verovioService;
	fileService;
	verovioOptions;
	toolbar;
	views;
	loader;
	loaderText;
	statusbar;
	wrapper;
	notification;
	contextUnderlay;
	contextMenu;
	input;
	output;
	fileCopy;
	appIsLoaded = !1;
	appReset = !1;
	verovioRuntimeVersion = "";
	resizeTimer;
	view;
	toolbarView;
	pageCount = 0;
	currentZoomIndex = 4;
	currentSchema;
	eventTarget;
	clientId;
	div;
	notificationService;
	loaderService;
	queuedData = null;
	resolveReady;
	ready;
	constructor(t, n = {}, r = []) {
		this.div = t, this.plugins = /* @__PURE__ */ new Map(), this.services = /* @__PURE__ */ new Map(), this.commands = /* @__PURE__ */ new Map(), this.extensions = /* @__PURE__ */ new Map(), this.viewsRegistry = /* @__PURE__ */ new Map(), this.eventTarget = new EventTarget(), this.customEventManager = new e(), this.ready = new Promise((e) => {
			this.resolveReady = e;
		}), this.clientId = n?.githubClientId || "fd81068a15354a300522", this.host = n?.baseUrl || (window.location.hostname == "localhost" ? `http://${window.location.host}` : "https://editor.verovio.org"), this.id = this.clientId, this.options = Object.assign({
			version: n.version || "1.5.0",
			verovioVersion: "latest",
			documentViewMargin: 100,
			documentViewPageBorder: 1,
			documentViewSVG: !0,
			documentZoom: 3,
			responsiveZoom: 4,
			editorSplitterHorizontal: !0,
			editorZoom: 4,
			enableDocument: !0,
			enableEditor: !0,
			enableResponsive: !0,
			enableStatusbar: !0,
			enableToolbar: !0,
			enableMidiToolbar: !0,
			enableContextMenu: !0,
			enableFilter: !0,
			enableValidation: !0,
			showDevFeatures: !1,
			selection: {},
			editorial: {},
			schemaDefault: "https://music-encoding.org/schema/5.1/mei-all.rng",
			schema: "https://music-encoding.org/schema/5.1/mei-all.rng",
			schemaBasic: "https://music-encoding.org/schema/5.1/mei-basic.rng",
			defaultView: "responsive",
			isSafari: !1,
			disableLocalStorage: !1
		}, n), this.zoomLevels = [
			5,
			10,
			20,
			35,
			75,
			100,
			150,
			200
		], this.verovioOptions = {
			pageHeight: 2970,
			pageWidth: 2100,
			pageMarginLeft: 50,
			pageMarginRight: 50,
			pageMarginTop: 50,
			pageMarginBottom: 50,
			scale: 100,
			xmlIdSeed: 1
		}, this.storageProvider = this.options.storageProvider || (this.options.disableLocalStorage ? new z() : new R()), this.fileStack = new D(this.storageProvider), this.options.appReset && this.fileStack.reset(), this.setupBaseDOM(), r.forEach((e) => this.use(e)), this.initCore();
	}
	setupBaseDOM() {
		for (; this.div.firstChild;) this.div.firstChild.remove();
		this.options.injectStyles !== !1 && s(document.head, {
			href: `${this.host}/css/verovio.css`,
			rel: "stylesheet"
		}), this.wrapper = i(this.div, { class: "vrv-wrapper" }), this.notification = i(this.wrapper, { class: "vrv-notification disabled" }), this.contextUnderlay = i(this.wrapper, { class: "vrv-context-underlay" }), this.contextMenu = i(this.wrapper, { class: "vrv-context-menu" }), this.dialogDiv = i(this.wrapper, { class: "vrv-dialog" }), this.toolbar = i(this.wrapper, { class: "vrv-toolbar" }), this.views = i(this.wrapper, { class: "vrv-views" }), this.loader = i(this.views, { class: "vrv-loading" }), this.loaderText = i(this.loader, { class: "vrv-loading-text" }), this.statusbar = i(this.wrapper, { class: "vrv-statusbar" }), !this.options.enableToolbar && !this.options.enableMidiToolbar && (this.toolbar.style.display = "none"), this.options.enableStatusbar || (this.statusbar.style.display = "none", this.statusbar.style.minHeight = "0px"), this.input = o(this.div, {
			type: "file",
			class: "vrv-file-input"
		}), this.input.onchange = this.fileInput.bind(this), this.output = t(this.div, { class: "vrv-file-output" }), this.fileCopy = _(this.div, { class: "vrv-file-copy" }), this.notificationService = new ne(this.notification), this.loaderService = new re(this.loader, this.loaderText, this.views, this.customEventManager), this.eventManager = new T(this), this.fileService = new le(this);
		let e = `bridge-${this.id}`;
		Object.values(A).forEach((t) => {
			this.customEventManager.bind({ id: e }, t, (e) => {
				this.eventTarget.dispatchEvent(new CustomEvent(t, { detail: e.detail }));
			});
		}), window.onresize = this.onResize.bind(this), window.onbeforeunload = this.onBeforeUnload.bind(this);
	}
	async initCore() {
		let e = Object.assign({}, this.options, { host: this.host });
		this.verovioService = new se(e), this.verovio = this.verovioService.verovio, this.loaderService.start("Loading Verovio ..."), this.verovioRuntimeVersion = await this.verovioService.init(e), await this.initPlugins(), this.options.enableFilter && this.createFilter(), this.appIsLoaded = !0, this.loaderService.end();
		let t = this.fileStack.getLast();
		if (t && !this.queuedData && this.loadData(t.data, t.filename), this.resolveReady(), this.queuedData) {
			let { data: e, filename: t, convert: n, onlyIfEmpty: r } = this.queuedData;
			this.loadData(e, t, n, r), this.queuedData = null;
		}
	}
	loadData(e, t = "untitled.xml", n = !1, r = !1) {
		if (!this.appIsLoaded) {
			this.queuedData = {
				data: e,
				filename: t,
				convert: n,
				onlyIfEmpty: r
			};
			return;
		}
		this.fileService.loadData(e, t, n, r);
	}
	use(e) {
		return this.plugins.has(e.id) ? this : (this.plugins.set(e.id, e), e.install(this), this);
	}
	async initPlugins() {
		for (let e of this.plugins.values()) e.init && await e.init();
	}
	registerView(e, t) {
		this.viewsRegistry.set(e, t), (this.options.defaultView === e || !this.view) && (this.view = t, this.toolbarView = t.editorViewObj || t, this.view.onActivate(j(A.Activate)));
	}
	registerService(e, t) {
		this.services.set(e, t);
	}
	getService(e) {
		return this.services.get(e);
	}
	registerCommand(e, t) {
		this.commands.set(e, t);
	}
	executeCommand(e, ...t) {
		let n = this.commands.get(e);
		return n ? n(...t) : console.warn(`Command ${e} not found`);
	}
	contribute(e, t) {
		this.extensions.has(e) || this.extensions.set(e, []), this.extensions.get(e).push(t);
	}
	getContributions(e) {
		return this.extensions.get(e) || [];
	}
	getView() {
		return this.view;
	}
	getToolbarView() {
		return this.toolbarView;
	}
	getPageCount() {
		return this.pageCount;
	}
	setPageCount(e) {
		this.pageCount = e;
	}
	getCurrentZoomIndex() {
		return this.currentZoomIndex;
	}
	isLoaded() {
		return this.appIsLoaded;
	}
	on(e, t, n) {
		this.eventTarget.addEventListener(e, t, n);
	}
	off(e, t, n) {
		this.eventTarget.removeEventListener(e, t, n);
	}
	dispatchEvent(e) {
		return this.eventTarget.dispatchEvent(e);
	}
	getCurrentSchema() {
		return this.currentSchema;
	}
	setCurrentSchema(e) {
		this.currentSchema = e;
	}
	createFilter() {
		let e = i(this.div, { class: "vrv-filter" });
		fetch(`${this.host}${ue}`).then((e) => e.text()).then((t) => {
			let n = new DOMParser().parseFromString(t, "text/xml");
			e.appendChild(n.documentElement);
		});
	}
	onResize() {
		clearTimeout(this.resizeTimer), this.resizeTimer = setTimeout(() => {
			this.customEventManager.dispatch(j(A.Resized));
		}, 100);
	}
	onBeforeUnload() {
		if (!this.appReset) {
			for (let [e, t] of this.viewsRegistry.entries()) e === "document" ? this.options.documentZoom = t.getCurrentZoomIndex() : e === "responsive" ? this.options.responsiveZoom = t.getCurrentZoomIndex() : e === "editor" && (this.options.editorZoom = t.editorViewObj?.getCurrentZoomIndex() || t.getCurrentZoomIndex());
			this.storageProvider.setItem("options", JSON.stringify(this.options));
		}
	}
	async setView(e) {
		let t = e.target.dataset.view;
		t && this.setViewByName(t);
	}
	setViewByName(e) {
		let t = this.viewsRegistry.get(e);
		!t || this.view === t || (this.view && this.view.onDeactivate(null), this.view = t, this.toolbarView = t.editorViewObj || t, this.view.onActivate(null), this.fileService.loadMEI(!1));
	}
	destroy() {
		this.eventManager.unbindAll();
	}
	async fileInput(e) {
		let t = e.target.files[0];
		if (!t) return;
		let n = new FileReader();
		n.onload = (e) => this.loadData(e.target.result, t.name), n.readAsText(t);
	}
	get container() {
		return this.div;
	}
	get toolbarElement() {
		return this.toolbar;
	}
	get viewsElement() {
		return this.views;
	}
	get statusbarElement() {
		return this.statusbar;
	}
	get dialogElement() {
		return this.dialogDiv;
	}
	get contextUnderlayElement() {
		return this.contextUnderlay;
	}
	get githubManager() {
		return this.getService("github-manager");
	}
	get validator() {
		return this.getService("validator");
	}
	get rngLoader() {
		return this.getService("rng-loader");
	}
	get rngLoaderBasic() {
		return this.getService("rng-loader-basic");
	}
	get pdfWorker() {
		return this.getService("pdf-worker");
	}
	set pdfWorker(e) {
		this.registerService("pdf-worker", e);
	}
	get midiPlayer() {
		return this.getService("midi-player");
	}
	get toolbarObj() {
		return this.getService("toolbar");
	}
	get contextMenuObj() {
		return this.getService("context-menu");
	}
	get viewEditorObj() {
		return this.getService("xml-editor-view");
	}
	getMidiPlayer() {
		return this.midiPlayer;
	}
	getPlugin(e) {
		return this.plugins.get(e);
	}
	getRuntimeVersion() {
		return this.verovioRuntimeVersion;
	}
	goToPreviousPage() {
		this.executeCommand("view.prevPage");
	}
	goToNextPage() {
		this.executeCommand("view.nextPage");
	}
	setZoom(e) {}
	zoomOutView() {
		this.executeCommand("view.zoomOut");
	}
	zoomInView() {
		this.executeCommand("view.zoomIn");
	}
	play() {
		this.executeCommand("midi.play");
	}
	pause() {
		this.executeCommand("midi.pause");
	}
	stop() {
		this.executeCommand("midi.stop");
	}
	playMEI = () => this.executeCommand("midi.playMEI");
	fileImport = (e) => {
		this.executeCommand("file.import");
	};
	fileExport = (e) => {
		this.executeCommand("file.export");
	};
	fileExportPDF = (e) => {
		this.executeCommand("file.exportPDF");
	};
	fileExportMIDI = (e) => {
		this.executeCommand("file.exportMIDI");
	};
	fileCopyToClipboard = (e) => {
		this.executeCommand("file.copyToClipboard");
	};
	fileSelection = (e) => {
		this.executeCommand("file.selection");
	};
	fileLoadRecent = (e) => {
		let t = e.target, n = this.fileStack.load(Number(t.dataset.idx));
		this.loadData(n.data, n.filename);
	};
	githubImport = (e) => {
		this.executeCommand("github.import");
	};
	githubExport = (e) => {
		this.executeCommand("github.export");
	};
	settingsEditor = (e) => {
		this.executeCommand("settings.editor");
	};
	settingsVerovio = (e) => {
		this.executeCommand("settings.verovio");
	};
	helpAbout = (e) => {
		this.executeCommand("help.about");
	};
	helpReset = (e) => {
		this.fileStack.reset(), this.storageProvider.removeItem("options"), this.appReset = !0, location.reload();
	};
	login = (e) => {
		this.executeCommand("github.login");
	};
	logout = (e) => {
		this.executeCommand("github.logout");
	};
	prevPage = (e) => {
		this.goToPreviousPage();
	};
	nextPage = (e) => {
		this.goToNextPage();
	};
	zoomOut = (e) => {
		this.zoomOutView();
	};
	zoomIn = (e) => {
		this.zoomInView();
	};
	static iconFor(e, t) {
		let n = `${t}/icons/mei`, r = {
			note: "note.png",
			rest: "rest.png",
			chord: "chord.png",
			clef: "clef.png",
			keySig: "keySig.png",
			meterSig: "meterSig.png",
			slur: "slur.png",
			tie: "tie.png",
			artic: "artic.png",
			accid: "accid.png",
			dynam: "dynam.png",
			tempo: "tempo.png",
			trill: "trill.png",
			mordent: "mordent.png",
			turn: "turn.png",
			fermata: "fermata.png",
			hairpin: "hairpin.png",
			pedal: "pedal.png",
			octave: "octave.png",
			tuplet: "tuplet.png",
			beam: "beam.png",
			staff: "staff.png",
			measure: "measure.png",
			score: "score.png"
		};
		return r[e] ? `${n}/${r[e]}` : `${n}/symbol.png`;
	}
}, de = class extends B {
	constructor(e, t) {
		t.enableEditor = !1, super(e, t);
	}
}, V = class {
	customEventManager;
	id;
	active;
	app;
	div;
	display;
	constructor(t, n) {
		this.div = t, this.app = n, this.id = v(16), this.active = !1, this.display = "block", this.customEventManager = new e(), this.customEventManager.bind(this, A.Activate, this.onActivate), this.customEventManager.bind(this, A.CursorActivity, this.onCursorActivity), this.customEventManager.bind(this, A.Deactivate, this.onDeactivate), this.customEventManager.bind(this, A.EditData, this.onEditData), this.customEventManager.bind(this, A.EndLoading, this.onEndLoading), this.customEventManager.bind(this, A.LoadData, this.onLoadData), this.customEventManager.bind(this, A.Page, this.onPage), this.customEventManager.bind(this, A.Resized, this.onResized), this.customEventManager.bind(this, A.Select, this.onSelect), this.customEventManager.bind(this, A.StartLoading, this.onStartLoading), this.customEventManager.bind(this, A.Zoom, this.onZoom);
	}
	getDiv() {
		return this.div;
	}
	destroy() {}
	setDisplayFlex() {
		this.display = "flex";
	}
	addFieldSet(e, t = 1) {
		let n = i(this.div, { class: "vrv-legend" });
		n.textContent = e;
		let r = d(n, { class: "icon" }, "▼"), a = i(this.div, { class: "vrv-field-set" });
		return t !== 1 && (a.style.flexGrow = `${t}`), r.addEventListener("click", () => {
			n.classList.toggle("toggled"), a.classList.toggle("toggled");
		}), a;
	}
	onActivate(e) {
		return this.div.style.display = this.display, this.active = !0, !0;
	}
	onCursorActivity(e) {
		return !!this.active;
	}
	onDeactivate(e) {
		return this.div.style.display = "none", this.active = !1, !0;
	}
	onEditData(e) {
		return !(!this.active || e.detail?.caller && this === e.detail.caller);
	}
	onEndLoading(e) {
		return !!this.active;
	}
	onLoadData(e) {
		return !!this.active;
	}
	onPage(e) {
		return !!this.active;
	}
	onResized(e) {
		return !!this.active;
	}
	onSelect(e) {
		return !(!this.active || this === e.detail.caller);
	}
	onStartLoading(e) {
		return !!this.active;
	}
	onZoom(e) {
		return !!this.active;
	}
}, H = class e extends V {
	verovio;
	currentPage;
	currentZoomIndex;
	currentScale;
	boundContextMenu;
	boundMouseMove;
	boundMouseUp;
	boundKeyDown;
	boundKeyUp;
	boundResize;
	eventManager;
	constructor(e, t, n) {
		super(e, t), this.verovio = n, this.eventManager = new T(this), this.bindListeners(), this.currentPage = 1, this.currentZoomIndex = this.app.getCurrentZoomIndex(), this.currentScale = this.app.zoomLevels[this.currentZoomIndex];
	}
	getCurrentPage() {
		return this.currentPage;
	}
	setCurrentPage(e) {
		this.currentPage = e;
	}
	getCurrentZoomIndex() {
		return this.currentZoomIndex;
	}
	setCurrentZoomIndex(e) {
		this.currentZoomIndex = e;
	}
	getCurrentScale() {
		return this.currentScale;
	}
	setCurrentScale(e) {
		this.currentScale = e;
	}
	parseAndScaleSVG(e, t, n) {
		let r = new DOMParser().parseFromString(e, "text/xml");
		return r.firstElementChild.setAttribute("height", `${t}px`), r.firstElementChild.setAttribute("width", `${n}px`), r.firstChild;
	}
	bindListeners() {
		this.boundContextMenu = (e) => this.contextMenuListener(e), this.boundKeyDown = (e) => this.keyDownListener(e), this.boundKeyUp = (e) => this.keyUpListener(e), this.boundMouseMove = (e) => this.mouseMoveListener(e), this.boundMouseUp = (e) => this.mouseUpListener(e), this.boundResize = (e) => this.resizeComponents(e);
	}
	destroy() {
		this.eventManager.unbindAll(), document.removeEventListener("contextmenu", this.contextMenuListener), document.removeEventListener("mousemove", this.boundMouseMove), document.removeEventListener("mouseup", this.boundMouseUp), document.removeEventListener("touchmove", this.boundMouseMove), document.removeEventListener("touchend", this.boundMouseUp), super.destroy();
	}
	onActivate(t) {
		return super.onActivate(t) ? (this.refreshView(e.Refresh.Activate), !0) : !1;
	}
	onLoadData(t) {
		if (!super.onLoadData(t)) return !1;
		let n = t.detail?.mei ?? "", r = t.detail?.lightEndLoading ?? !0, i = t.detail?.reload ?? !1;
		return this.refreshView(e.Refresh.LoadData, r, n, i), !0;
	}
	onResized(t) {
		return super.onResized(t) ? (this.refreshView(e.Refresh.Resized), !0) : !1;
	}
	onZoom(t) {
		return super.onZoom(t) ? (this.currentScale = this.app.zoomLevels[this.currentZoomIndex], this.refreshView(e.Refresh.Zoom), !0) : !1;
	}
	async refreshView(e, t = !1, n = "", r = !1) {
		console.debug("View::updateView should be overwritten");
	}
	contextMenuListener(e) {}
	keyDownListener(e) {}
	keyUpListener(e) {}
	mouseMoveListener(e) {}
	mouseUpListener(e) {}
	resizeComponents(e) {}
};
(function(e) {
	e.Refresh = /* @__PURE__ */ function(e) {
		return e[e.Activate = 0] = "Activate", e[e.Resized = 1] = "Resized", e[e.LoadData = 2] = "LoadData", e[e.Zoom = 3] = "Zoom", e;
	}({});
})(H ||= {});
//#endregion
//#region ts/document/document-view.ts
var fe = class extends IntersectionObserver {
	pruningMargin;
	lastPageIn;
	view;
	constructor(e, t, n) {
		super(e, n), this.pruningMargin = 10, this.lastPageIn = 0, this.view = t;
	}
}, pe = class extends H {
	currentPageHeight;
	currentPageWidth;
	currentDocHeight;
	currentDocWidth;
	currentDocMargin;
	pruning;
	observer;
	docWrapper;
	constructor(e, t, n) {
		super(e, t, n), this.docWrapper = i(this.div, {
			class: "vrv-doc-wrapper",
			style: { position: "absolute" }
		}), this.observer;
		try {
			this.observer = new fe(this.handleObserver, this), this.pruning = 0;
		} catch {
			console.info("IntersectionObserver support is missing - loading all pages");
		}
	}
	async refreshView(e, t = !0, n = "", r = !1) {
		switch (e) {
			case H.Refresh.Activate:
				await this.updateActivate();
				break;
			case H.Refresh.LoadData:
				await this.updateLoadData(!0, n, r);
				break;
			case H.Refresh.Resized:
				await this.updateResized();
				break;
			case H.Refresh.Zoom:
				await this.updateZoom();
				break;
		}
		this.app.loaderService.end(t);
	}
	async updateActivate() {
		for (; this.docWrapper.firstChild;) this.docWrapper.firstChild.remove();
		this.app.verovioOptions.adjustPageHeight = !1, this.app.verovioOptions.breaks = "encoded", this.app.verovioOptions.footer = "auto", this.app.verovioOptions.scale = 100, this.app.verovioOptions.pageHeight = 2970, this.app.verovioOptions.pageWidth = 2100, this.app.verovioOptions.justifyVertically = !0;
	}
	async updateLoadData(e, t, r) {
		if (e) {
			r && (t = await this.verovio.getMEI({})), await this.verovio.loadData(t), await this.verovio.setOptions(this.app.verovioOptions), await this.verovio.redoLayout();
			let e = await this.verovio.getPageCount();
			this.app.setPageCount(e);
		}
		for (; this.docWrapper.firstChild;) this.docWrapper.firstChild.remove();
		await this.updateResized(), this.observer && (this.observer.lastPageIn = 0);
		for (let e = 0; e < this.app.getPageCount(); e++) {
			let t = i(this.docWrapper, { class: "vrv-page-wrapper" });
			if (t.style.height = `${this.currentPageHeight}px`, t.style.width = `${this.currentPageWidth}px`, t.style.marginTop = `${this.currentDocMargin}px`, t.style.marginBottom = `${this.currentDocMargin}px`, t.style.border = `solid ${this.app.options.documentViewPageBorder}px lightgray`, t.dataset.page = (e + 1).toString(), !this.app.options.documentViewSVG) {
				let e = n(t, { class: "" }), r = e.getContext("2d");
				r.canvas.width = this.currentPageWidth, r.canvas.height = this.currentPageHeight;
				let i = Math.max(this.currentScale, 10);
				i = Math.min(i, 25), r.font = `${i}px Helvetica`, r.fillStyle = "grey", r.textAlign = "center", r.fillText("Loading ...", this.currentPageWidth / 2, this.currentPageHeight / 6), t.appendChild(e);
			}
			this.observer ? this.observer.observe(t) : this.renderPage(e + 1);
		}
	}
	async updateResized() {
		if (this.div.style.height = this.div.parentElement.style.height, this.div.style.width = this.div.parentElement.style.width, this.docWrapper) {
			this.currentDocMargin = this.app.options.documentViewMargin * this.currentScale / 100, this.currentPageWidth = this.app.verovioOptions.pageWidth * this.currentScale / 100;
			let e = this.currentPageWidth + 2 * this.currentDocMargin + 2 * this.app.options.documentViewPageBorder, t = parseInt(this.div.parentElement.style.width, 10);
			this.currentDocWidth = Math.max(t, e), this.docWrapper.style.width = `${this.currentDocWidth}px`, this.currentPageHeight = this.app.verovioOptions.pageHeight * this.currentScale / 100;
			let n = (this.currentPageHeight + this.currentDocMargin + 2 * this.app.options.documentViewPageBorder) * this.app.getPageCount() + this.currentDocMargin, r = parseInt(this.div.parentElement.style.height, 10);
			this.currentDocHeight = Math.max(r, n), this.docWrapper.style.height = `${this.currentDocHeight}px`;
		}
	}
	async updateZoom() {
		if (this.app.options.documentViewSVG) {
			await this.updateResized();
			for (let e = 0; e < this.app.getPageCount(); e++) {
				let t = this.docWrapper.children[e];
				t.style.height = `${this.currentPageHeight}px`, t.style.width = `${this.currentPageWidth}px`, t.style.marginTop = `${this.currentDocMargin}px`, t.style.marginBottom = `${this.currentDocMargin}px`, t.firstChild && t.firstChild && (t.firstChild.setAttribute("height", `${this.currentPageHeight}px`), t.firstChild.setAttribute("width", `${this.currentPageWidth}px`));
			}
		} else await this.updateLoadData(!1, "", !1);
	}
	handleObserver(e, t) {
		for (let n of e) n.isIntersecting && (t.view.loadPage(n.target), t.view.loadPage(n.target.nextSibling), t.lastPageIn = parseInt(n.target.dataset.page));
	}
	loadPage(e) {
		e !== null && (e.dataset.loaded || (e.dataset.loaded = "true", this.renderPage(e.dataset.page)));
	}
	pruneDocument() {
		for (let e = 0; e < this.app.getPageCount(); e++) {
			let t = this.docWrapper.children[e];
			(this.observer && e < this.observer.lastPageIn - this.observer.pruningMargin || this.observer && e > this.observer.lastPageIn + this.observer.pruningMargin) && (delete t.dataset.loaded, t.textContent = "");
		}
	}
	async renderPage(e) {
		let t = await this.verovio.renderToSVG(e), n = this.docWrapper.children[e - 1];
		if (this.app.options.documentViewSVG) {
			let n = this.parseAndScaleSVG(t, this.currentPageHeight, this.currentPageWidth);
			this.docWrapper.children[e - 1].appendChild(n), clearTimeout(this.pruning);
			let r = this;
			this.pruning = setTimeout(function() {
				r.pruneDocument();
			}, 200);
		} else {
			let e = n.firstElementChild, r = e.getContext("2d"), i = self.URL || self.webkitURL, a = new Image(), o = new Blob([`${t}`], { type: "image/svg+xml" }), s = i.createObjectURL(o), c = this.app.verovioOptions.pageHeight, l = this.app.verovioOptions.pageWidth;
			e.height = this.currentPageHeight, e.width = this.currentPageWidth, a.onload = function() {
				r.drawImage(a, 0, 0, l, c, 0, 0, e.width, e.height);
			}, a.src = s;
		}
	}
}, me = class {
	id = "document-view";
	app;
	viewObj;
	install(e) {
		this.app = e, e.registerCommand("view.setDocument", () => e.setViewByName("document"));
	}
	init() {
		if (this.app.options.enableDocument !== !1) {
			let e = this.app.viewsElement;
			e && (this.viewObj = new pe(i(e, { class: "vrv-view" }), this.app, this.app.verovio), this.app.customEventManager.addToPropagationList(this.viewObj.customEventManager), this.app.registerView("document", this.viewObj));
		}
	}
}, U = class extends H {
	svgWrapper;
	midiIds;
	constructor(e, t, n) {
		super(e, t, n), this.svgWrapper = i(this.div, { class: "vrv-svg-wrapper" }), this.midiIds = [];
	}
	async refreshView(e, t = !0, n = "", r = !1) {
		switch (e) {
			case H.Refresh.Activate:
				await this.updateActivate();
				break;
			case H.Refresh.LoadData:
				await this.updateLoadData(n, r);
				break;
			case H.Refresh.Resized:
				await this.updateResized();
				break;
			case H.Refresh.Zoom:
				await this.updateZoom();
				break;
		}
		this.app.loaderService.end(t);
	}
	async updateActivate() {
		this.app.verovioOptions.adjustPageHeight = !0, this.app.verovioOptions.breaks = "auto", this.app.verovioOptions.footer = "none", this.app.verovioOptions.scale = this.currentScale, this.app.verovioOptions.pageHeight = this.svgWrapper.clientHeight * (100 / this.app.verovioOptions.scale), this.app.verovioOptions.pageWidth = this.svgWrapper.clientWidth * (100 / this.app.verovioOptions.scale), this.app.verovioOptions.justifyVertically = !1;
		let e = this.app.getMidiPlayer();
		e && e.setView(this), this.midiIds = [], this.app.verovioOptions.pageHeight !== 0 && await this.verovio.setOptions(this.app.verovioOptions);
	}
	async updateLoadData(e, t) {
		t && (e = await this.verovio.getMEI({})), await this.verovio.loadData(e), this.app.setPageCount(await this.verovio.getPageCount()), await this.updateResized();
	}
	async updateResized() {
		this.id !== "editor" && (this.div.style.height = this.div.parentElement.style.height, this.div.style.width = this.div.parentElement.style.width), this.div && this.svgWrapper && (this.updateSVGDimensions(), this.app.verovioOptions.scale = this.currentScale, this.app.verovioOptions.pageHeight = this.svgWrapper.clientHeight * (100 / this.app.verovioOptions.scale), this.app.verovioOptions.pageWidth = this.svgWrapper.clientWidth * (100 / this.app.verovioOptions.scale), this.app.verovioOptions.pageHeight -= this.app.verovioOptions.pageMarginTop * (100 / this.app.verovioOptions.scale), this.app.verovioOptions.pageHeight !== 0 && await this.verovio.setOptions(this.app.verovioOptions), this.app.getPageCount() > 0 && (await this.verovio.setOptions(this.app.verovioOptions), await this.verovio.redoLayout(this.app.verovioOptions), this.app.setPageCount(await this.verovio.getPageCount()), this.currentPage > this.app.getPageCount() && (this.currentPage = this.app.getPageCount()), await this.renderPage()));
	}
	async updateZoom() {
		await this.updateResized();
	}
	async renderPage(e = !1) {
		let t = await this.verovio.renderToSVG(this.currentPage);
		this.svgWrapper.innerHTML = t, e && this.app.loaderService.end(!0);
	}
	async midiUpdate(e) {
		let t = e, n = await this.app.verovio.getElementsAtTime(t), r = this.app.getMidiPlayer();
		if (r && r.getExpansionMap()) {
			let e = r.getExpansionMap(), t = (t) => {
				let n = e[t];
				return n && n.length > 0 ? n[0] : t;
			};
			n.notes &&= n.notes.map((e) => t(e)), n.chords &&= n.chords.map((e) => t(e)), n.rests &&= n.rests.map((e) => t(e)), n.measure && (n.measure = t(n.measure), n.page = await this.app.verovio.getPageWithElement(n.measure));
		}
		if (!(Object.keys(n).length === 0 || n.page === 0) && (n.page != this.currentPage && (this.currentPage = n.page, this.app.loaderService.start("Loading content ...", !0), this.app.customEventManager.dispatch(j(A.Page))), n.notes.length > 0 && this.midiIds != n.notes)) {
			for (let e = 0, t = this.midiIds.length; e < t; e++) {
				let t = this.midiIds[e];
				if (n.notes.indexOf(t) === -1) {
					let e = this.svgWrapper.querySelector("#" + t);
					e && (e.style.filter = "");
				}
			}
			this.midiIds = n.notes;
			for (let e = 0, t = this.midiIds.length; e < t; e++) {
				let t = this.svgWrapper.querySelector("#" + this.midiIds[e]);
				t && (t.style.filter = "url(#highlighting)");
			}
		}
	}
	midiStop() {
		for (let e = 0, t = this.midiIds.length; e < t; e++) {
			let t = this.svgWrapper.querySelector("#" + this.midiIds[e]);
			t && (t.style.filter = "");
		}
		this.midiIds = [];
	}
	updateSVGDimensions() {
		this.svgWrapper.style.height = this.div.style.height, this.svgWrapper.style.width = this.div.style.width;
	}
	onPage(e) {
		return super.onPage(e) ? (this.renderPage(!0), !0) : !1;
	}
	scrollListener(e) {
		let t = e.target;
		this.svgWrapper.scrollTop = t.scrollTop, this.svgWrapper.scrollLeft = t.scrollLeft;
	}
}, he = class {
	id = "responsive-view";
	app;
	viewObj;
	install(e) {
		this.app = e, e.registerCommand("view.setResponsive", () => e.setViewByName("responsive"));
	}
	init() {
		if (this.app.options.enableResponsive !== !1) {
			let e = this.app.viewsElement;
			e && (this.viewObj = new U(i(e, { class: "vrv-view" }), this.app, this.app.verovio), this.app.customEventManager.addToPropagationList(this.viewObj.customEventManager), this.app.registerView("responsive", this.viewObj));
		}
	}
}, ge = class e extends V {
	eventManager;
	listWrapper;
	listWrapperChild;
	element;
	elementId;
	attributes;
	attributesBasic;
	types;
	editedText;
	tab;
	actionManager;
	customMethodsMap = [[/^.*@pname$/, this.customAllPname]];
	static readOnlyAttributes = [
		/.*@xml:id/,
		/.*@startid/,
		/.*@endid/,
		/.*@plist/,
		/.*@copyof/,
		/[staff|layer]@n$/
	];
	constructor(e, t, n, r) {
		super(e, t), this.setDisplayFlex(), this.tab = n, this.actionManager = r, this.eventManager = new T(this), this.listWrapper = i(this.div, { class: "vrv-attribute-list-wrapper" }), this.listWrapperChild = void 0, this.element = "", this.elementId = "", this.attributes = {}, this.attributesBasic = {}, this.types = {}, this.editedText = !1;
	}
	loadAttributesOrText(e) {
		if (this.listWrapper.textContent = "", this.eventManager.unbindAll(), this.listWrapperChild && this.listWrapperChild.remove(), this.element = "", this.attributes = {}, this.attributesBasic = {}, this.types = {}, e.text) this.elementId = e.id, this.loadText(e.text);
		else {
			this.element = e.element, this.elementId = e.id;
			let t = this.app.rngLoader.getTags()[e.element];
			t && (this.attributes = t.attrs, this.types = t.types);
			let n = this.app.rngLoaderBasic.getTags()[e.element];
			n && (this.attributesBasic = n.attrs), e.attributes["xml:id"] = e.id, this.loadAttributes(e.attributes);
		}
	}
	loadText(e) {
		let t = o(this.listWrapper, { class: "vrv-form-input" });
		t.value = e, t.dataset.attName = "text", this.eventManager.bind(t, "input", this.onInputInput), this.eventManager.bind(t, "blur", this.onInputBlur), this.listWrapperChild = t;
	}
	loadAttributes(e) {
		i(this.listWrapper, { class: "vrv-attribute-filter" });
		let t = p(this.listWrapper, { class: "vrv-attribute-table" });
		this.listWrapperChild = t;
		let n = m(t, {});
		Object.entries(e).forEach(([e, t]) => {
			this.loadAttribute(n, e, t);
		}), this.addShowMore(n, !0);
		let r = Object.keys(e), a = Object.keys(this.attributesBasic).filter((e) => !r.includes(e));
		if (a.length > 0) {
			let e = m(t, {});
			e.style.display = "none", a.forEach((t) => {
				this.loadAttribute(e, t, "");
			}), this.addShowMore(e, !1);
		}
		if (r = r.concat(a), a = Object.keys(this.attributes).filter((e) => !r.includes(e)), a.length > 0) {
			let e = m(t, {});
			e.style.display = "none", a.forEach((t) => {
				this.loadAttribute(e, t, "");
			}), this.addShowMore(e, !1);
		}
	}
	loadAttribute(e, t, n) {
		let r = g(e, { class: "vrv-attribute-item" }), i = h(r, { class: "vrv-attribute-name" });
		i.textContent = t;
		let a = h(r, { class: "vrv-attribute-value" }), s = `${this.element}@${t}`, c = this.findCustomOptionMethod(s), l;
		if (c ? l = c.call(this, a, n) : this.attributes[t] ? l = this.attributeOption(a, t, n) : this.types[t] ? l = this.attributeNumber(a, t, n) : (l = o(a, { class: "vrv-form-input" }), l.value = n), l instanceof HTMLSelectElement) {
			let e = l;
			e.dataset.attName = t, this.eventManager.bind(e, "change", this.onSelectChange);
		} else if (l instanceof HTMLInputElement) {
			let e = l;
			e.dataset.attName = t, this.eventManager.bind(e, "input", this.onInputInput);
		}
		this.isReadOnly(s) && l.classList.add("disabled");
	}
	attributeNumber(e, t, n) {
		let r;
		return this.types[t] === "positiveInteger" ? (r = o(e, {
			class: "vrv-form-input",
			type: "number",
			step: "1",
			min: "1"
		}), r.value = n) : this.types[t] === "nonNegativeInteger" ? (r = o(e, {
			class: "vrv-form-input",
			type: "number",
			step: "1",
			min: "0"
		}), r.value = n) : this.types[t] === "decimal" ? (r = o(e, {
			class: "vrv-form-input",
			type: "number",
			step: "0.1"
		}), r.value = n) : (r = o(e, { class: "vrv-form-input" }), r.value = n), r;
	}
	attributeOption(e, t, n) {
		let r = this.attributes[t], i = this.attributesBasic[t];
		i ||= r;
		let a = !1;
		i.length !== r.length && (r = r.filter((e) => !i.includes(e)), a = !0);
		let o = u(e, { class: "vrv-form-input" });
		if (a) {
			this.addOptions(o, [], n);
			let e = l(o, { label: "MEI-basic" });
			this.addOptions(e, i, n, !1);
			let t = l(o, { label: "MEI-all" });
			this.addOptions(t, r, n, !1);
		} else this.addOptions(o, r, n);
		return o;
	}
	addOptions(e, t, n, r = !0) {
		if (r) {
			let t = c(e, { value: "" });
			t.innerText = "";
		}
		t.forEach((t) => {
			let r = c(e, { value: `${t}` });
			r.innerText = t, n === t && (r.selected = !0);
		});
	}
	findCustomOptionMethod(e) {
		for (let [t, n] of this.customMethodsMap) if (t.test(e)) return n;
	}
	isReadOnly(t) {
		for (let n of e.readOnlyAttributes) if (n.test(t)) return !0;
		return !1;
	}
	customAllPname(e, t) {
		let n = u(e, { class: "vrv-form-input" });
		return this.addOptions(n, [
			"c",
			"d",
			"e",
			"f",
			"g",
			"a",
			"b"
		], t), n;
	}
	addShowMore(e, t) {
		let n = d(h(g(e, {}), {
			colspan: "2",
			class: "vrv-show-more"
		}), { class: `close ${t ? "more" : "all"}` });
		this.eventManager.bind(n, "click", this.onShowMore);
	}
	select(e, t) {
		this.app.customEventManager.dispatch(j(A.Select, {
			id: t,
			element: e,
			caller: this
		}));
	}
	cursorActivity(e, t) {
		this.app.customEventManager.dispatch(j(A.CursorActivity, {
			id: e,
			activity: t,
			caller: this
		}));
	}
	editAttributeValue(e, t, n) {
		console.log(this.elementId, e, t), this.actionManager.setAttrValue(e, t, this.elementId), n ? this.actionManager.commit(this.tab) : this.actionManager.editRefresh();
	}
	onClick(e) {
		let t = e.target;
		t.dataset.id && this.select(t.dataset.element, t.dataset.id);
	}
	onInputInput(e) {
		let t = e.target;
		t.dataset.attName && (t.dataset.attName == "text" ? (this.editedText = !0, this.editAttributeValue(t.dataset.attName, t.value, !1)) : this.editAttributeValue(t.dataset.attName, t.value, !0));
	}
	onInputBlur(e) {
		this.editedText && this.actionManager.commit(this.tab), this.editedText = !1;
	}
	onMouseover(e) {
		let t = e.target;
		t.dataset.id && this.cursorActivity(t.dataset.id, "mouseover");
	}
	onMouseout(e) {
		let t = e.target;
		t.dataset.id && this.cursorActivity(t.dataset.id, "mouseout");
	}
	onSelectChange(e) {
		let t = e.target;
		t.dataset.attName && this.editAttributeValue(t.dataset.attName, t.value, !0);
	}
	onShowMore(e) {
		let t = e.target, n = t.closest("tbody").nextElementSibling;
		n && (n.style.display = n.style.display === "none" ? "table-row-group" : "none", t.classList.toggle("close"));
	}
}, W = class extends V {
	eventManager;
	root;
	useBreadCrumbs;
	focusId;
	displayDepth;
	rootElement;
	breadCrumbsWrapper;
	breadCrumbs;
	constructor(e, t) {
		super(e, t), this.breadCrumbsWrapper = i(this.div, { class: "vrv-tree-breadcrumbs-wrapper" }), this.breadCrumbsWrapper.style.display = "none", this.breadCrumbs = i(this.breadCrumbsWrapper, { class: "vrv-tree-breadcrumbs" }), this.clearCrumbs(), this.root = null, this.useBreadCrumbs = !1, this.setDisplayFlex(), this.focusId = "", this.displayDepth = 2, this.eventManager = new T(this);
	}
	hasBreadCrumbs() {
		return this.useBreadCrumbs;
	}
	setBreadCrumbs() {
		this.useBreadCrumbs = !0, this.breadCrumbsWrapper.style.display = "block";
	}
	isInFocus(e) {
		if (!this.hasFocus() || this.id === this.focusId) return !0;
		for (let t of e.children) if (t.id === this.focusId) return !0;
		return !1;
	}
	hasFocus() {
		return this.focusId.length > 0;
	}
	isAncestorOfFocus(e) {
		return this.isAncestorOf(e, this.focusId) !== null;
	}
	isDescendantOfFocus(e) {
		let t = this.findInSubtree(this.root, (e) => e.id === this.focusId);
		return this.isAncestorOf(t, e.id) !== null;
	}
	isAncestorOf(e, t) {
		return this.findInSubtree(e, (e) => e.id === t);
	}
	getDisplayDepth() {
		return this.displayDepth;
	}
	getFocusId() {
		return this.focusId;
	}
	resetFocus() {
		this.focusId = "";
	}
	applyFocus(e) {
		this.eventManager.unbindAll(), this.rootElement.remove(), this.rootElement = i(this.div, { class: "vrv-tree-root" }), this.clearCrumbs(), this.focusId = e, this.root.id === e && (this.focusId = ""), this.root.html(this.rootElement, this, 0, this.useBreadCrumbs), this.breadCrumbsWrapper.scrollLeft = this.breadCrumbsWrapper.scrollWidth;
	}
	addCrumb(e, t) {
		let n = i(this.breadCrumbs, { class: "vrv-tree-breadcrumb" });
		n.textContent = e, n.dataset.id = t, n.dataset.element = e, this.eventManager.bind(n, "click", this.onClick), this.eventManager.bind(n, "mouseover", this.onMouseover), this.eventManager.bind(n, "mouseout", this.onMouseout);
	}
	clearCrumbs() {
		this.breadCrumbs.textContent = "", i(this.breadCrumbs, { class: "vrv-tree-breadcrumb" });
	}
	reset() {
		this.eventManager.unbindAll(), this.root && (this.root.reset(), this.rootElement.remove()), this.clearCrumbs(), this.root = null;
	}
	collapseNode(e) {
		this.traverse((t) => {
			if (t.id === e) {
				if (!t.getDiv().classList.contains("open")) return !0;
				t.getDiv().classList.toggle("open");
				let e = t.getDiv().querySelector(".vrv-node-children");
				return e && (e.style.display = "none"), !0;
			}
			return !1;
		});
	}
	expandNode(e) {
		this.traverse((t) => {
			if (t.id === e) {
				if (t.getDiv().classList.contains("open")) return !0;
				t.getDiv().classList.toggle("open");
				let e = t.getDiv().querySelector(".vrv-node-children");
				return e && (e.style.display = "block"), !0;
			}
			return !1;
		});
	}
	fromJson(e) {
		if (!e || !e.element) throw Error("Invalid JSON data: Missing 'element' property");
		this.root = this.buildTreeFromJson(e), this.rootElement = i(this.div, { class: "vrv-tree-root" }), this.root.html(this.rootElement, this, 0, this.useBreadCrumbs);
	}
	fromXml(e) {
		let t = new DOMParser().parseFromString(e, "application/xml"), n = t.querySelector("parsererror");
		if (n) throw Error("Invalid XML: " + n.textContent);
		let r = t.documentElement;
		this.root = this.buildTreeFromElement(r), this.rootElement = i(this.div, { class: "vrv-tree-root" }), this.root.html(this.rootElement, this, 0, this.useBreadCrumbs);
	}
	toXml() {
		if (!this.root) throw Error("Tree is empty");
		let e = this.toXmlElement();
		return new XMLSerializer().serializeToString(e);
	}
	traverse(e) {
		let t = (n) => {
			if (e(n)) return !0;
			for (let e of n.getChildren()) if (t(e)) return !0;
			return !1;
		};
		t(this.root);
	}
	findInSubtree(e, t) {
		if (t(e)) return e;
		if (Array.isArray(e.children)) for (let n of e.children) {
			let e = this.findInSubtree(n, t);
			if (e) return e;
		}
		return null;
	}
	buildTreeFromJson(e) {
		let { id: t = null, element: n, attributes: r = {}, children: i = [], isTextNode: a = !1, isLeaf: o = !1 } = e, s = new G(t, n, r, [], a, o);
		return Array.isArray(i) && s.setChildren(i.map((e) => this.buildTreeFromJson(e))), s;
	}
	buildTreeFromElement(e) {
		let t = {};
		for (let n of Array.from(e.attributes)) t[n.name] = n.value;
		let n = [];
		for (let t of Array.from(e.childNodes)) if (t.nodeType === Node.ELEMENT_NODE) n.push(this.buildTreeFromElement(t));
		else if (t.nodeType === Node.TEXT_NODE) {
			let e = t.textContent?.trim();
			e && n.push(new G(null, "#text", { textContent: e }, [], !0, !0));
		}
		return new G(t["xml:id"] || null, e.tagName, t, n, !1, n.length === 0);
	}
	toXmlElement() {
		let e = document.implementation.createDocument(null, "", null);
		return this.nodeToElement(this.root, e);
	}
	nodeToElement(e, t) {
		if (e.isTextNode) throw Error("Cannot create an Element from a text node directly.");
		let n = t.createElement(e.element);
		for (let [t, r] of Object.entries(e.attributes)) t !== "textContent" && n.setAttribute(t, r);
		for (let r of e.getChildren()) if (r.isTextNode) {
			let e = t.createTextNode(r.attributes.textContent || "");
			n.appendChild(e);
		} else n.appendChild(this.nodeToElement(r, t));
		return n;
	}
	onClick(e) {}
	onContextmenu(e) {}
	onMouseover(e) {}
	onMouseout(e) {}
}, G = class {
	id;
	element;
	attributes;
	isTextNode;
	isLeaf;
	div;
	label;
	children;
	constructor(e, t, n = {}, r = [], i = !1, a = !1) {
		this.id = e, this.element = t, this.attributes = n, this.children = r, this.isTextNode = i, this.isLeaf = a;
	}
	getDiv() {
		return this.div;
	}
	getLabel() {
		return this.label;
	}
	getChildren() {
		return this.children;
	}
	setChildren(e) {
		this.children = e;
	}
	reset() {
		this.children.forEach((e) => e.reset()), this.div && (this.div.textContent = "");
	}
	html(e, t, n, r = !1) {
		if (n === 0 && !t.isInFocus(this)) {
			t.addCrumb(this.element, this.id), this.children.forEach((r) => {
				t.isAncestorOfFocus(r) && r.html(e, t, n, !0);
			});
			return;
		}
		this.div = e, this.isLeaf && this.div.classList.add("leaf");
		let a = !t.hasFocus() || t.isAncestorOfFocus(this) || t.isDescendantOfFocus(this);
		this.children.length > 0 && n < t.getDisplayDepth() && a && this.div.classList.add("open"), this.div.dataset.id = this.id, this.div.dataset.element = this.element, this.label = i(this.div, { class: "vrv-mei-element vrv-node-label" }), r ? (this.label.style.display = "none", t.addCrumb(this.element, this.id)) : (this.label.dataset.id = this.div.dataset.id, this.label.dataset.element = this.div.dataset.element, t.eventManager.bind(this.div, "click", t.onClick), t.eventManager.bind(this.div, "mouseover", t.onMouseover), t.eventManager.bind(this.div, "mouseout", t.onMouseout), t.eventManager.bind(this.div, "contextmenu", t.onContextmenu), this.label.style.backgroundImage = `url(${B.iconFor(this.element, t.app.host)})`, t.getFocusId() === this.id && (this.label.classList.add("target"), this.label.classList.add("checked")));
		let o = this.element;
		this.attributes && this.attributes.n && (o += ` ${this.attributes.n}`), this.label.textContent = o;
		let s = i(this.div, { class: "vrv-node-children" });
		n >= t.getDisplayDepth() || !a || this.children.forEach((e) => {
			let r = i(s, { class: "vrv-tree-node" });
			e.html(r, t, n + 1);
		});
	}
}, _e = class extends W {
	tab;
	constructor(e, t, n) {
		super(e, t), this.tab = n;
	}
	loadContext(e) {
		this.reset(), this.fromJson(e.context), this.traverse((t) => (t.id === e.object.id && this.selectNode(t), !1)), this.clearCrumbs(), e.ancestors.slice().reverse().forEach((e) => {
			this.addCrumb(e.element, e.id);
		}), this.breadCrumbsWrapper.scrollLeft = this.breadCrumbsWrapper.scrollWidth;
	}
	select(e, t) {
		this.app.customEventManager.dispatch(j(A.Select, {
			id: t,
			element: e,
			caller: this
		}));
	}
	cursorActivity(e, t) {
		this.app.customEventManager.dispatch(j(A.CursorActivity, {
			id: e,
			activity: t,
			caller: this
		}));
	}
	selectNode(e) {
		e.getLabel().classList.add("target"), e.getLabel().classList.add("checked");
		let t = this.root.getDiv().getBoundingClientRect(), n = e.getDiv().getBoundingClientRect().top - t.top + this.root.getDiv().scrollTop;
		this.root.getDiv().scrollTo({ top: n - 50 });
	}
	onClick(e) {
		let t = e.target;
		t.dataset.id && (t.classList.contains("open") ? this.collapseNode(t.dataset.id) : this.select(t.dataset.element, t.dataset.id)), e.stopPropagation();
	}
	onContextmenu(e) {
		this.app.contextMenuObj?.buildFor("test"), this.app.contextMenuObj?.show(e);
	}
	onMouseover(e) {
		let t = e.target;
		t.dataset.id && this.cursorActivity(t.dataset.id, "mouseover");
	}
	onMouseout(e) {
		let t = e.target;
		t.dataset.id && this.cursorActivity(t.dataset.id, "mouseout");
	}
}, K = class extends V {
	eventManager;
	tab;
	listWrapper;
	constructor(e, t, n) {
		super(e, t), this.setDisplayFlex(), this.tab = n, this.eventManager = new T(this), this.listWrapper = i(this.div, { class: "vrv-reference-list-wrapper" });
	}
	loadList(e, t) {
		this.listWrapper.textContent = "", this.eventManager.unbindAll(), e.forEach((e) => {
			let t = i(this.listWrapper, { class: "vrv-reference-list-item vrv-mei-element" });
			t.style.backgroundImage = `url(${B.iconFor(e.element, this.app.host)})`, t.textContent = `${e.element} @ ${e.referenceAttribute}`, t.dataset.id = e.id, t.dataset.element = e.element, this.eventManager.bind(t, "click", this.onClick), this.eventManager.bind(t, "mouseover", this.onMouseover), this.eventManager.bind(t, "mouseout", this.onMouseout);
		});
	}
	select(e, t) {
		this.app.customEventManager.dispatch(j(A.Select, {
			id: t,
			element: e,
			caller: this
		}));
	}
	cursorActivity(e, t) {
		this.app.customEventManager.dispatch(j(A.CursorActivity, {
			id: e,
			activity: t,
			caller: this
		}));
	}
	onClick(e) {
		let t = e.target;
		t.dataset.id && this.select(t.dataset.element, t.dataset.id);
	}
	onMouseover(e) {
		let t = e.target;
		t.dataset.id && this.cursorActivity(t.dataset.id, "mouseover");
	}
	onMouseout(e) {
		let t = e.target;
		t.dataset.id && this.cursorActivity(t.dataset.id, "mouseout");
	}
};
(function(e) {
	e.Direction = /* @__PURE__ */ function(e) {
		return e[e.From = 0] = "From", e[e.To = 1] = "To", e;
	}({});
})(K ||= {});
//#endregion
//#region ts/editor/editor-content-panel.ts
var ve = class extends V {
	contentTree;
	contentTreeObj;
	attributeList;
	attributeListObj;
	EditorAttributeList;
	referencesFrom;
	referencesFromObj;
	referencesTo;
	referencesToObj;
	tab;
	actionManager;
	constructor(e, t, n, r) {
		super(e, t), this.setDisplayFlex(), this.tab = n, this.actionManager = r, this.contentTree = i(this.addFieldSet("Content tree", 3), { class: "vrv-field-set-panel" }), this.contentTreeObj = new _e(this.contentTree, this.app, this.tab), this.contentTreeObj.setBreadCrumbs(), this.customEventManager.addToPropagationList(this.contentTreeObj.customEventManager), this.attributeList = i(this.addFieldSet("Attributes or text", 3), { class: "vrv-field-set-panel" }), this.attributeListObj = new ge(this.attributeList, this.app, this.tab, this.actionManager), this.customEventManager.addToPropagationList(this.attributeListObj.customEventManager), this.referencesFrom = i(this.addFieldSet("Referencing elements"), { class: "vrv-field-set-panel" }), this.referencesFromObj = new K(this.referencesFrom, this.app, this.tab), this.customEventManager.addToPropagationList(this.referencesFromObj.customEventManager), this.referencesTo = i(this.addFieldSet("Referenced elements"), { class: "vrv-field-set-panel" }), this.referencesToObj = new K(this.referencesTo, this.app, this.tab), this.customEventManager.addToPropagationList(this.contentTreeObj.customEventManager);
	}
	async updateContent(e) {
		if (await this.app.verovio.edit({
			action: "context",
			param: { elementId: `${e}` }
		})) {
			let t = await this.app.verovio.editInfo();
			this.contentTreeObj.loadContext(t), e !== "" && (this.attributeListObj.loadAttributesOrText(t.object), this.referencesFromObj.loadList(t.referringElements, K.Direction.From), this.referencesToObj.loadList(t.referencedElements, K.Direction.To));
		}
		this.tab.loaded = !0;
	}
	onActivate(e) {
		return super.onActivate(e) ? (this.app.getPageCount() > 0 && !this.tab.loaded && this.updateContent(""), !0) : !1;
	}
	onEditData(e) {
		return super.onEditData(e) ? (this.updateContent(e.detail.id), !0) : !1;
	}
	onEndLoading(e) {
		return super.onEndLoading(e) ? (this.app.getPageCount() > 0 && !this.tab.loaded && this.updateContent(""), !0) : !1;
	}
	onSelect(e) {
		return super.onSelect(e) ? (this.updateContent(e.detail.id), !0) : !1;
	}
}, ye = class extends W {
	tab;
	constructor(e, t, n) {
		super(e, t), this.tab = n, this.displayDepth = 4;
	}
	loadContext(e) {
		this.reset(), this.fromJson(e);
	}
	onClick(e) {
		let t = e.target;
		t.dataset.id && (t.classList.contains("open") ? this.collapseNode(t.dataset.id) : this.applyFocus(t.dataset.id)), e.stopPropagation();
	}
}, be = class extends V {
	sectionTree;
	sectionTreeObj;
	tab;
	constructor(e, t, n) {
		super(e, t), this.setDisplayFlex(), this.tab = n, this.sectionTree = i(this.addFieldSet("Score structure", 3), { class: "vrv-field-set-panel" }), this.sectionTreeObj = new ye(this.sectionTree, this.app, this.tab), this.sectionTreeObj.setBreadCrumbs(), this.customEventManager.addToPropagationList(this.sectionTreeObj.customEventManager);
	}
	async updateContent() {
		if (this.sectionTreeObj.resetFocus(), await this.app.verovio.edit({
			action: "context",
			param: { document: "scores" }
		})) {
			let e = await this.app.verovio.editInfo();
			this.sectionTreeObj.loadContext(e);
		}
		this.tab.loaded = !0;
	}
	onActivate(e) {
		return super.onActivate(e) ? (this.app.getPageCount() > 0 && !this.tab.loaded && this.updateContent(), !0) : !1;
	}
	onEndLoading(e) {
		return super.onEndLoading(e) ? (this.app.getPageCount() > 0 && !this.tab.loaded && this.updateContent(), !0) : !1;
	}
}, q = class extends V {
	eventManager;
	constructor(e, t) {
		super(e, t), this.eventManager = new T(this);
	}
	updateToolbarGrp(e, t) {
		e !== void 0 && (t ? e.style.display = "block" : e.style.display = "none");
	}
	updateToolbarBtnEnabled(e, t) {
		e !== void 0 && (t ? e.classList.remove("disabled") : e.classList.add("disabled"));
	}
	updateToolbarBtnDisplay(e, t) {
		e !== void 0 && (t ? e.style.display = "block" : e.style.display = "none");
	}
	updateToolbarBtnToggled(e, t) {
		e !== void 0 && (t ? e.classList.add("toggled") : e.classList.remove("toggled"));
	}
	updateToolbarSubmenuBtn(e, t) {
		e !== void 0 && (t ? e.classList.add("vrv-menu-checked") : e.classList.remove("vrv-menu-checked"));
	}
}, xe = class extends q {
	selectedElementType;
	panel;
	layoutControls;
	xmlEditorEnable;
	xmlEditorOrientation;
	xmlEditorValidate;
	xmlEditorForce;
	notes;
	controlEvents;
	undo;
	redo;
	controlEventControls;
	placeAbove;
	placeBelow;
	placeAuto;
	hairpinFormControls;
	formCres;
	formDim;
	stemControls;
	stemDirUp;
	stemDirDown;
	stemDirAuto;
	constructor(e, t, n) {
		let r = `${t.host}/icons/toolbar/editor-xml.png`, a = `${t.host}/icons/toolbar/validate.png`, o = `${t.host}/icons/toolbar/force.png`, s = `${t.host}/icons/editor/undo.png`, c = `${t.host}/icons/editor/redo.png`, l = `${t.host}/icons/editor/stem-dir-up.png`, u = `${t.host}/icons/editor/stem-dir-down.png`, f = `${t.host}/icons/editor/stem-dir-auto.png`, p = `${t.host}/icons/editor/place-below.png`, m = `${t.host}/icons/editor/place-auto.png`, h = `${t.host}/icons/editor/place-above.png`, g = `${t.host}/icons/editor/form-dim.png`, _ = `${t.host}/icons/editor/form-cres.png`;
		super(e, t), this.panel = n, this.active = !0, this.selectedElementType = null, this.layoutControls = i(this.div, { class: "vrv-btn-group" }), i(this.layoutControls, { class: "vrv-h-separator" }), this.xmlEditorEnable = i(this.layoutControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${r})` }
		}), d(this.xmlEditorEnable, { class: "vrv-tooltip" }, "Open or close the XML editor"), this.xmlEditorOrientation = i(this.layoutControls, { class: "vrv-btn-icon-large" }), d(this.xmlEditorOrientation, { class: "vrv-tooltip" }, "Change the divider orientation"), this.xmlEditorValidate = i(this.layoutControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${a})` }
		}), d(this.xmlEditorValidate, { class: "vrv-tooltip" }, "Validate and refresh rendering ('Shift-Ctrl-V')"), this.xmlEditorForce = i(this.layoutControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${o})` }
		}), d(this.xmlEditorForce, { class: "vrv-tooltip" }, "By-pass XML validation and force reload"), i(this.div, { class: "vrv-h-separator" }), this.undo = i(this.div, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${s})` }
		}), d(this.undo, { class: "vrv-tooltip" }, "Undo ('Shift-Ctrl-V')"), this.redo = i(this.div, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${c})` }
		}), d(this.redo, { class: "vrv-tooltip" }, "Redo ('Shift-Ctrl-V')"), i(this.div, { class: "vrv-h-separator" }), this.notes = i(this.div, {
			class: "vrv-btn-text",
			"data-before": "Notes"
		}), i(this.div, { class: "vrv-h-separator" }), this.controlEvents = i(this.div, {
			class: "vrv-btn-text",
			"data-before": "Control events"
		}), this.panel.eventManager.bind(this.xmlEditorEnable, "click", this.panel.onToggle), this.panel.eventManager.bind(this.xmlEditorOrientation, "click", this.panel.onToggleOrientation), this.eventManager.bind(this.xmlEditorValidate, "click", this.onTriggerValidation), this.panel.eventManager.bind(this.xmlEditorForce, "click", this.panel.onForceReload), this.eventManager.bind(this.notes, "click", this.onNotes), this.eventManager.bind(this.controlEvents, "click", this.onControlEvents), this.controlEventControls = i(this.div, { class: "vrv-btn-group" }), i(this.controlEventControls, { class: "vrv-h-separator" }), this.placeAbove = i(this.controlEventControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${h})` }
		}), this.placeBelow = i(this.controlEventControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${p})` }
		}), this.placeAuto = i(this.controlEventControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${m})` }
		}), this.hairpinFormControls = i(this.div, { class: "vrv-btn-group" }), i(this.hairpinFormControls, { class: "vrv-h-separator" }), this.formCres = i(this.hairpinFormControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${_})` }
		}), this.formDim = i(this.hairpinFormControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${g})` }
		}), this.stemControls = i(this.div, { class: "vrv-btn-group" }), i(this.stemControls, { class: "vrv-h-separator" }), this.stemDirUp = i(this.stemControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${l})` }
		}), this.stemDirDown = i(this.stemControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${u})` }
		}), this.stemDirAuto = i(this.stemControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${f})` }
		});
	}
	bindEvents(e) {
		e.eventManager.bind(this.undo, "click", e.undo), e.eventManager.bind(this.redo, "click", e.redo), e.eventManager.bind(this.formCres, "click", e.formCres), e.eventManager.bind(this.formDim, "click", e.formDim), e.eventManager.bind(this.placeAbove, "click", e.placeAbove), e.eventManager.bind(this.placeBelow, "click", e.placeBelow), e.eventManager.bind(this.placeAuto, "click", e.placeAuto), e.eventManager.bind(this.stemDirUp, "click", e.stemDirUp), e.eventManager.bind(this.stemDirDown, "click", e.stemDirDown), e.eventManager.bind(this.stemDirAuto, "click", e.stemDirAuto);
	}
	updateAll() {
		let e = `${this.app.host}/icons/toolbar/layout-h.png`, t = `${this.app.host}/icons/toolbar/layout-v.png`, n = !!this.app.options.editorSplitterHorizontal, r = !!this.panel.isXmlEditorEnabled(), i = !!this.panel.xmlEditorViewObj.isAutoMode(), a = !!this.panel.xmlEditorViewObj.isEdited();
		n ? this.xmlEditorOrientation.style.backgroundImage = `url(${t})` : this.xmlEditorOrientation.style.backgroundImage = `url(${e})`, this.updateToolbarBtnToggled(this.xmlEditorEnable, r), this.updateToolbarBtnDisplay(this.xmlEditorOrientation, r), this.updateToolbarBtnDisplay(this.xmlEditorValidate, r && !i), this.updateToolbarBtnDisplay(this.xmlEditorForce, r), this.updateToolbarBtnEnabled(this.undo, this.panel.editorViewObj.actionManager.canUndo()), this.updateToolbarBtnEnabled(this.redo, this.panel.editorViewObj.actionManager.canRedo()), this.updateToolbarBtnEnabled(this.xmlEditorEnable, !0), this.updateToolbarBtnEnabled(this.xmlEditorOrientation, r), this.updateToolbarBtnEnabled(this.xmlEditorValidate, r), this.updateToolbarBtnEnabled(this.xmlEditorForce, a), this.notes.style.display = "none", this.controlEvents.style.display = "none", this.controlEventControls.style.display = "none", this.stemControls.style.display = "none", this.hairpinFormControls.style.display = "none";
	}
	onActivate(e) {
		return super.onActivate(e) ? (this.updateAll(), !0) : !1;
	}
	onEndLoading(e) {
		return super.onEndLoading(e) ? (this.updateAll(), !0) : !1;
	}
	onSelect(e) {
		return super.onSelect(e) ? (this.selectedElementType = e.detail.elementType, this.updateAll(), !0) : !1;
	}
	onStartLoading(e) {
		return super.onStartLoading(e) ? (this.updateToolbarBtnEnabled(this.xmlEditorOrientation, !1), this.updateToolbarBtnEnabled(this.xmlEditorEnable, !1), this.updateToolbarBtnEnabled(this.xmlEditorValidate, !1), this.updateToolbarBtnEnabled(this.xmlEditorForce, !1), this.updateToolbarBtnEnabled(this.undo, !1), this.updateToolbarBtnEnabled(this.redo, !1), !0) : !1;
	}
	onNotes(e) {
		this.selectedElementType = "NOTES", this.updateAll();
	}
	onControlEvents(e) {
		this.selectedElementType = "CONTROLEVENTS", this.updateAll();
	}
	onTriggerValidation(e) {
		this.panel.xmlEditorViewObj && this.panel.xmlEditorViewObj.isEdited() && this.panel.xmlEditorViewObj.triggerValidation();
	}
}, Se = class {
	eventManager;
	app;
	inProgress;
	editorViewObj;
	canUndoCache;
	canRedoCache;
	constructor(e, t) {
		this.app = t, this.editorViewObj = e, this.eventManager = new T(this), this.inProgress = !1, this.canUndoCache = !1, this.canRedoCache = !1;
	}
	canUndo() {
		return this.canUndoCache;
	}
	canRedo() {
		return this.canRedoCache;
	}
	async commit(e) {
		await this.editorViewObj.verovio.edit({ action: "commit" });
		let t = await this.editorViewObj.verovio.editInfo();
		this.canUndoCache = t.canUndo, this.canRedoCache = t.canRedo, await this.editorViewObj.renderPage(!0), this.inProgress = !1;
		let n = "";
		this.editorViewObj.hasSelection() && (n = this.editorViewObj.getSelection()[0].id), this.app.customEventManager.dispatch(j(A.EditData, {
			id: n,
			caller: e
		}));
	}
	async editRefresh() {
		await this.editorViewObj.verovio.redoPagePitchPosLayout(), await this.editorViewObj.renderPage(!0, !1);
	}
	async drag(e, t) {
		let n = [];
		for (let r of this.editorViewObj.getSelection()) {
			if (!["note"].includes(r.element)) continue;
			let i = {
				action: "drag",
				param: {
					elementId: r.id,
					x: r.x + e,
					y: r.y + t
				}
			};
			n.push(i);
		}
		if (n.length === 0) return;
		let r = {
			action: "chain",
			param: n
		};
		await this.editorViewObj.verovio.edit(r), await this.editRefresh();
	}
	async keyDown(e, t, n) {
		let r = [];
		for (let i of this.editorViewObj.getSelection()) {
			if (!["note"].includes(i.element)) continue;
			let a = {
				action: "keyDown",
				param: {
					elementId: i.id,
					key: e,
					shiftKey: t,
					ctrlKey: n
				}
			};
			r.push(a);
		}
		if (r.length === 0) return;
		this.inProgress && await this.editRefresh(), this.inProgress = !0;
		let i = {
			action: "chain",
			param: r
		};
		await this.editorViewObj.verovio.edit(i);
	}
	async keyUp(e, t, n) {
		this.inProgress && this.commit(this.editorViewObj);
	}
	async insert(e, t) {
		if (!this.editorViewObj.hasSelection()) return;
		let n = [];
		n.push({
			action: "insert",
			param: {
				elementName: e,
				elementId: this.editorViewObj.getSelection()[0].id,
				insertMode: t
			}
		}), console.log(n);
		let r = {
			action: "chain",
			param: n
		};
		await this.editorViewObj.verovio.edit(r), await this.commit(this.editorViewObj);
	}
	async formCres() {
		await this.setAttrValueForTypes("form", "cres", ["hairpin"]);
	}
	async formDim() {
		await this.setAttrValueForTypes("form", "dim", ["hairpin"]);
	}
	async placeAbove() {
		await this.setAttrValueForTypes("place", "above", [
			"dir",
			"dynam",
			"hairpin",
			"tempo",
			"pedal"
		]);
	}
	async placeBelow() {
		await this.setAttrValueForTypes("place", "below", [
			"dir",
			"dynam",
			"hairpin",
			"tempo",
			"pedal"
		]);
	}
	async placeAuto() {
		await this.setAttrValueForTypes("place", "", [
			"dir",
			"dynam",
			"hairpin",
			"tempo",
			"pedal"
		]);
	}
	async stemDirUp() {
		await this.setAttrValueForTypes("stem.dir", "up", ["note", "chord"]);
	}
	async stemDirDown() {
		await this.setAttrValueForTypes("stem.dir", "down", ["note", "chord"]);
	}
	async stemDirAuto() {
		await this.setAttrValueForTypes("stem.dir", "", ["note", "chord"]);
	}
	async undo() {
		this.app.loaderService.start("Undoing ...", !0), await this.editorViewObj.verovio.edit({ action: "undo" });
		let e = await this.editorViewObj.verovio.editInfo();
		this.canUndoCache = e.canUndo, this.canRedoCache = e.canRedo, await this.editorViewObj.renderPage(!0);
	}
	async redo() {
		this.app.loaderService.start("Redoing ...", !0), await this.editorViewObj.verovio.edit({ action: "redo" });
		let e = await this.editorViewObj.verovio.editInfo();
		this.canUndoCache = e.canUndo, this.canRedoCache = e.canRedo, await this.editorViewObj.renderPage(!0);
	}
	async setAttrValue(e, t, n) {
		let r = {
			action: "set",
			param: {
				elementId: n,
				attribute: e,
				value: t
			}
		};
		await this.editorViewObj.verovio.edit(r);
	}
	async setAttrValueForTypes(e, t, n = []) {}
}, Ce = class {
	editorViewObj;
	activated;
	pixPerPix;
	viewTop;
	viewLeft;
	lastEvent;
	scrollTop;
	scrollLeft;
	staffNode;
	initX;
	initY;
	marginLeft;
	marginTop;
	MEIUnit;
	constructor(e) {
		this.editorViewObj = e, this.activated = !1, this.pixPerPix = 0, this.viewTop = 0, this.viewLeft = 0, this.lastEvent = null, this.scrollTop = 0, this.scrollLeft = 0, this.staffNode = null, this.initX = 0, this.initY = 0, this.marginLeft = 0, this.marginTop = 0, this.MEIUnit = 90;
	}
	setLastEvent(e) {
		this.lastEvent = e;
	}
	getLastEvent() {
		return this.lastEvent;
	}
	setScrollTop(e) {
		this.scrollTop = e;
	}
	setScrollLeft(e) {
		this.scrollLeft = e;
	}
	xToMEI(e) {
		return Math.round(e - this.viewLeft + this.scrollLeft) * this.pixPerPix - this.marginLeft;
	}
	yToMEI(e) {
		return Math.round((e - this.viewTop + this.scrollTop) * this.pixPerPix - this.marginTop);
	}
	xToView(e) {
		return (e + this.marginLeft) / this.pixPerPix - this.scrollLeft + this.viewLeft;
	}
	yToView(e) {
		return (e + this.marginTop) / this.pixPerPix - this.scrollTop + this.viewTop;
	}
	init(e, t, n) {
		let r = e.querySelector("svg"), i = r.getAttribute("viewBox").split(" "), a = parseInt(i[3]), o = parseInt(e.getAttribute("height"));
		this.marginLeft = 0, this.marginTop = 0;
		try {
			let e = r.querySelector("g.page-margin").getAttribute("transform"), t = /translate\((\d*),\ (\d*)/g.exec(e);
			this.marginLeft = Number(t[1]), this.marginTop = Number(t[2]);
		} catch {
			console.debug("Loading margin failed");
		}
		this.pixPerPix = a / o, this.viewTop = t, this.viewLeft = n;
	}
	initEvent(e, t) {
		this.editorViewObj.clearSelection(), this.editorViewObj.addNodeToSelection(t), this.editorViewObj.hasSelection() && (this.activated = !0, this.initStaff(t), this.initX = this.xToMEI(e.pageX), this.initY = this.yToMEI(e.pageY));
	}
	initStaff(e) {
		if (this.staffNode = this.editorViewObj.getClosestMEIElement(e, "staff"), !this.staffNode) return;
		let t = this.staffNode.querySelectorAll("g.staff > path");
		if (t.length !== 0) try {
			let e = t[0].getAttribute("d"), n = /M\d*\ (\d*)/g.exec(e), r = Number(n[1]), i = t[t.length - 1].getAttribute("d"), a = /M\d*\ (\d*)/g.exec(i), o = Number(a[1]);
			t.length > 1 && (this.MEIUnit = (o - r) / (t.length - 1) / 2);
		} catch {
			console.debug("Loading staff line position failed");
		}
	}
	distFromLastEvent() {
		let e = this.xToMEI(this.lastEvent.pageX), t = this.yToMEI(this.lastEvent.pageY);
		return [e - this.initX, t - this.initY];
	}
}, J = "data:audio/midi;base64,TVRoZAAAAAYAAQABAeBNVHJrAAADIACQFUCDYIAVQACQFkCDYIAWQACQF0CDYIAXQACQGECDYIAYQACQGUCDYIAZQACQGkCDYIAaQACQG0CDYIAbQACQHECDYIAcQACQHUCDYIAdQACQHkCDYIAeQACQH0CDYIAfQACQIECDYIAgQACQIUCDYIAhQACQIkCDYIAiQACQI0CDYIAjQACQJECDYIAkQACQJUCDYIAlQACQJkCDYIAmQACQJ0CDYIAnQACQKECDYIAoQACQKUCDYIApQACQKkCDYIAqQACQK0CDYIArQACQLECDYIAsQACQLUCDYIAtQACQLkCDYIAuQACQL0CDYIAvQACQMECDYIAwQACQMUCDYIAxQACQMkCDYIAyQACQM0CDYIAzQACQNECDYIA0QACQNUCDYIA1QACQNkCDYIA2QACQN0CDYIA3QACQOECDYIA4QACQOUCDYIA5QACQOkCDYIA6QACQO0CDYIA7QACQPECDYIA8QACQPUCDYIA9QACQPkCDYIA+QACQP0CDYIA/QACQQECDYIBAQACQQUCDYIBBQACQQkCDYIBCQACQQ0CDYIBDQACQRECDYIBEQACQRUCDYIBFQACQRkCDYIBGQACQR0CDYIBHQACQSECDYIBIQACQSUCDYIBJQACQSkCDYIBKQACQS0CDYIBLQACQTECDYIBMQACQTUCDYIBNQACQTkCDYIBOQACQT0CDYIBPQACQUECDYIBQQACQUUCDYIBRQACQUkCDYIBSQACQU0CDYIBTQACQVECDYIBUQACQVUCDYIBVQACQVkCDYIBWQACQV0CDYIBXQACQWECDYIBYQACQWUCDYIBZQACQWkCDYIBaQACQW0CDYIBbQACQXECDYIBcQACQXUCDYIBdQACQXkCDYIBeQACQX0CDYIBfQACQYECDYIBgQACQYUCDYIBhQACQYkCDYIBiQACQY0CDYIBjQACQZECDYIBkQACQZUCDYIBlQACQZkCDYIBmQACQZ0CDYIBnQACQaECDYIBoQACQaUCDYIBpQACQakCDYIBqQACQa0CDYIBrQACQbECDYIBsQINgbAAA/y8A", we = class extends U {
	cursorPointerObj;
	actionManager;
	midiPlayerElement;
	svgOverlay;
	mouseMoveTimer;
	draggingActive;
	mouseOverId;
	lastNote;
	selectedItems;
	constructor(e, t, n) {
		super(e, t, n), this.midiPlayerElement = x(this.div, {}), this.midiPlayerElement.setAttribute("src", J), this.svgOverlay = i(this.div, {
			class: "vrv-svg-overlay",
			style: { position: "absolute" }
		}), this.cursorPointerObj = new Ce(this), this.eventManager.bind(this.svgOverlay, "scroll", this.scrollListener), this.eventManager.bind(this.svgOverlay, "mouseleave", this.mouseLeaveListener), this.eventManager.bind(this.svgOverlay, "mouseenter", this.mouseEnterListener), this.mouseMoveTimer = !1, this.draggingActive = !1, this.mouseOverId = "", this.lastNote = {
			midiPitch: 0,
			oct: "",
			pname: ""
		}, this.actionManager = new Se(this, t), this.app.contextMenuObj?.setActionManager(this.actionManager), this.selectedItems = [];
	}
	getActionManager() {
		return this.actionManager;
	}
	initCursor() {
		let e = this.svgWrapper.querySelector("svg");
		if (!e) return;
		let t = this.div.getBoundingClientRect().top, n = this.div.getBoundingClientRect().left;
		this.cursorPointerObj.init(e, t, n);
	}
	updateSVGDimensions() {
		super.updateSVGDimensions(), this.svgOverlay && (this.svgOverlay.style.height = this.svgWrapper.style.height, this.svgOverlay.style.width = this.svgWrapper.style.width);
	}
	async renderPage(e = !1, t = !0) {
		let n = await this.verovio.renderToSVG(this.currentPage);
		this.svgWrapper.innerHTML = n, this.initCursor(), t && this.createOverlay(), this.highlightSelected(), e && this.app.loaderService.end(!0);
	}
	async select(e, t) {
		this.highlightMouseOverReset();
		let n = await this.verovio.getPageWithElement(t);
		n > 0 && n != this.currentPage && (this.currentPage = n, this.app.customEventManager.dispatch(j(A.Page))), this.addToSelection(e, t);
	}
	async playNoteSound() {
		let e = await this.app.verovio.getElementAttr(this.selectedItems[0].id);
		if (!e.pname || !e.oct || this.lastNote.pname === e.pname && this.lastNote.oct === e.oct) return;
		this.lastNote.pname = e.pname, this.lastNote.oct = e.oct;
		var t = 0;
		switch (e.pname) {
			case "d":
				t = 2;
				break;
			case "e":
				t = 4;
				break;
			case "f":
				t = 5;
				break;
			case "g":
				t = 7;
				break;
			case "a":
				t = 9;
				break;
			case "b":
				t = 11;
				break;
		}
		e.accid && (e.accid == "f" ? t-- : e.accid == "s" && t++);
		let n = t + parseInt(e.oct) * 12;
		n < 0 || n > 96 || this.lastNote.midiPitch !== n && (this.lastNote.midiPitch = n, !(n > 107) && (n < 21 || (this.midiPlayerElement.stop(), this.midiPlayerElement.currentTime = (n - 21) * .5, this.midiPlayerElement.start(), setTimeout(() => {
			this.midiPlayerElement.stop();
		}, 500))));
	}
	clearSelection() {
		this.highlightSelectedReset(), this.selectedItems = [];
	}
	hasSelection() {
		return this.selectedItems.length > 0;
	}
	getSelection() {
		return this.selectedItems;
	}
	addNodeToSelection(e) {
		let t = e;
		if ((e.classList.contains("note") || e.classList.contains("rest")) && (t = e.querySelector("use")), !t) {
			console.debug("Cannot find node with dragging position");
			return;
		}
		let n = null, r = null;
		if (t.hasAttribute("transform")) {
			let e = t.getAttribute("transform").match(/translate\(\s*([^\s,]+)[,\s]+([^\s\)]+)\)/);
			e && (n = parseInt(e[1]), r = parseInt(e[2]));
		}
		this.addToSelection(e.classList[0], e.id, n, r);
	}
	addToSelection(e, t, n = null, r = null) {
		let i = {
			element: e,
			id: t,
			x: n,
			y: r
		};
		this.selectedItems.push(i), this.highlightSelected();
	}
	getClosestMEIElement(e, t = null) {
		return e ? e.nodeName != "g" || e.classList.contains("bounding-box") || e.classList.contains("notehead") || t && !e.classList.contains(t) ? this.getClosestMEIElement(e.parentNode, t) : e : null;
	}
	createOverlay() {
		this.svgOverlay.innerHTML = this.svgWrapper.innerHTML, Array.from(this.svgWrapper.querySelectorAll("g.bounding-box")).forEach((e) => {
			e.parentNode.removeChild(e);
		}), Array.from(this.svgOverlay.querySelectorAll("g, path, text, ellipse, polyline")).forEach((e) => {
			e.style.stroke = "transparent", e.style.fill = "transparent";
		}), Array.from(this.svgOverlay.querySelectorAll(".slur.bounding-box, .tie.bounding-box")).forEach((e) => {
			e.parentNode.removeChild(e);
		}), Array.from(this.svgOverlay.querySelectorAll(".slur path, .tie path, .stem rect, .dots ellipse, .barLineAttr path")).forEach((e) => {
			e.style.strokeWidth = "90";
		}), Array.from(this.svgOverlay.querySelectorAll("g")).forEach((e) => {
			this.eventManager.bind(e, "mousedown", this.mouseDownListener);
		}), Array.from(this.svgOverlay.querySelectorAll("g.staff")).forEach((e) => {
			this.eventManager.bind(e, "mouseenter", this.mouseEnterListener);
		}), this.eventManager.bind(this.svgOverlay, "mousedown", this.mouseDownListener), this.highlightSelected();
	}
	highlightMouseOver(e) {
		this.highlightMouseOverReset();
		let t = this.svgWrapper.querySelector("#" + e);
		t && (t.style.filter = "url(#highlighting)", this.mouseOverId = e);
	}
	highlightMouseOverReset() {
		if (this.mouseOverId !== "") {
			let e = this.svgWrapper.querySelector("#" + this.mouseOverId);
			e && (e.style.filter = "");
		}
		this.mouseOverId = "";
	}
	highlightSelected() {
		this.selectedItems.length === 1 && this.playNoteSound();
		for (let e of this.selectedItems) this.highlightWithColor(this.svgWrapper.querySelector("#" + e.id), "#cd0000");
	}
	highlightSelectedReset() {
		for (let e of this.selectedItems) this.highlightWithColor(this.svgWrapper.querySelector("#" + e.id), "");
	}
	highlightWithColor(e, t) {
		if (e) for (let n of Array.from(e.querySelectorAll("*:not(g)"))) {
			if (n.parentNode.classList.contains("bounding-box")) continue;
			let e = n;
			e.style.fill = t, e.style.stroke = t;
		}
	}
	onCursorActivity(e) {
		return !super.onCursorActivity(e) || e.detail.id === "[unspecified]" ? !1 : (e.detail.activity === "mouseover" ? (this.highlightSelectedReset(), this.highlightMouseOver(e.detail.id)) : e.detail.activity === "mouseout" && (this.highlightMouseOverReset(), this.highlightSelected()), !0);
	}
	onEndLoading(e) {
		return super.onEndLoading(e) ? (this.initCursor(), !0) : !1;
	}
	onSelect(e) {
		return !super.onSelect(e) || (this.clearSelection(), e.detail.id === "[unspecified]") ? !1 : (this.select(e.detail.element, e.detail.id), !0);
	}
	contextMenuListener(e) {
		this.app.contextMenuObj?.show(e), e.preventDefault();
	}
	keyDownListener(e) {
		e.keyCode === 38 || e.keyCode === 40 ? this.actionManager.keyDown(e.keyCode, e.shiftKey, e.ctrlKey) : e.keyCode === 8 || e.keyCode, e.preventDefault();
	}
	keyUpListener(e) {
		e.keyCode === 38 || e.keyCode === 40 ? this.actionManager.keyUp(e.keyCode, e.shiftKey, e.ctrlKey) : e.keyCode === 8 || e.keyCode, e.preventDefault();
	}
	mouseDownListener(e) {
		if (this.draggingActive = !1, this.lastNote = {
			midiPitch: 0,
			oct: "",
			pname: ""
		}, e.stopPropagation(), e.target.parentNode === this.svgOverlay) return;
		let t = this.getClosestMEIElement(e.target);
		if (!t || !t.id) {
			console.log(t, "MEI element not found or with no id");
			return;
		}
		if (this.hasSelection() && e.shiftKey) {
			this.addNodeToSelection(t), document.addEventListener("mousemove", this.boundMouseMove), document.addEventListener("mouseup", this.boundMouseUp);
			return;
		}
		document.removeEventListener("mousemove", this.boundMouseMove), document.removeEventListener("touchmove", this.boundMouseMove), this.app.customEventManager.dispatch(j(A.Select, {
			id: t.id,
			elementType: t.classList[0],
			caller: this
		})), this.cursorPointerObj.initEvent(e, t), document.addEventListener("mousemove", this.boundMouseMove), document.addEventListener("mouseup", this.boundMouseUp), document.addEventListener("touchmove", this.boundMouseMove), document.addEventListener("touchend", this.boundMouseUp);
	}
	mouseEnterListener(e) {
		document.addEventListener("contextmenu", this.boundContextMenu), document.addEventListener("keydown", this.boundKeyDown), document.addEventListener("keyup", this.boundKeyUp);
	}
	mouseLeaveListener(e) {
		document.removeEventListener("contextmenu", this.boundContextMenu), document.removeEventListener("mouseup", this.boundMouseUp), document.removeEventListener("touchend", this.boundMouseUp), document.removeEventListener("mousemove", this.boundMouseMove), document.removeEventListener("touchmove", this.boundMouseMove), document.removeEventListener("keydown", this.boundKeyDown), document.removeEventListener("keyup", this.boundKeyUp);
	}
	mouseMoveListener(e) {
		if (!this.mouseMoveTimer) {
			let t = this;
			this.cursorPointerObj.setLastEvent(e), this.mouseMoveTimer = !0, setTimeout(function() {
				if (t.mouseMoveTimer = !1, t.cursorPointerObj.getLastEvent().buttons == 1) {
					let e = t.cursorPointerObj.distFromLastEvent();
					t.draggingActive = !0, t.actionManager.drag(0, e[1]);
				}
			}, 50);
		}
		e.stopPropagation();
	}
	mouseUpListener(e) {
		if (document.removeEventListener("mouseup", this.boundMouseUp), document.removeEventListener("touchend", this.boundMouseUp), this.draggingActive === !0) {
			this.draggingActive = !1, document.removeEventListener("mousemove", this.boundMouseMove), document.removeEventListener("touchmove", this.boundMouseMove);
			let e = this;
			setTimeout(function() {
				e.clearSelection(), e.actionManager.commit(this);
			}, 80);
		}
	}
	scrollListener(e) {
		let t = e.target;
		this.cursorPointerObj.setScrollTop(t.scrollTop), this.cursorPointerObj.setScrollLeft(t.scrollLeft), this.svgWrapper.scrollTop = t.scrollTop, this.svgWrapper.scrollLeft = t.scrollLeft;
	}
}, Te = class {
	currentOctave;
	actionManager;
	boundKeyUp;
	boundKeyDown;
	app;
	eventManager;
	div;
	octaves;
	octaveNumbers;
	letters;
	keyboardWrapper;
	keys;
	note;
	midiPlayerElement;
	constructor(e, t) {
		let n = `${t.host}/icons/keyboard/left.png`, r = `${t.host}/icons/keyboard/right.png`;
		this.div = e, this.div.textContent = "", this.app = t, this.midiPlayerElement = x(this.div, {}), this.midiPlayerElement.setAttribute("src", J), this.eventManager = new T(this), this.bindListeners();
		let a = i(this.div, {
			class: "vrv-keyboard-navigator",
			style: { backgroundImage: `url(${n})` }
		});
		this.eventManager.bind(a, "click", this.activateLower), this.keyboardWrapper = i(this.div, { class: "vrv-keyboard-wrapper" });
		let o = i(this.div, {
			class: "vrv-keyboard-navigator",
			style: { backgroundImage: `url(${r})` }
		});
		this.eventManager.bind(o, "click", this.activateHigher), this.octaves = i(this.keyboardWrapper, { class: "vrv-keyboard-octaves" }), this.keys = i(this.keyboardWrapper, { class: "vrv-keyboard-keys" }), this.eventManager.bind(this.keys, "mousedown", this.mouseDownListener), this.eventManager.bind(this.keys, "mouseup", this.mouseUpListener), this.letters = [
			"A",
			"W",
			"S",
			"E",
			"D",
			"F",
			"T",
			"G",
			"Y",
			"H",
			"U",
			"J",
			"K",
			"O",
			"L",
			"P",
			";"
		], this.octaveNumbers = [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8
		], this.octaveNumbers.forEach((e) => {
			let t = i(this.octaves, { class: "vrv-keyboard-octave" });
			t.textContent = `C${e}`;
			let n = (e + 1) * 12;
			i(this.keys, {
				class: "vrv-keyboard-key white",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key black",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key white",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key black",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key white",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key white",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key black",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key white",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key black",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key white",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key black",
				"data-midi": `${n++}`
			}), i(this.keys, {
				class: "vrv-keyboard-key white",
				"data-midi": `${n++}`
			});
		}), this.eventManager.bind(this.div, "mouseleave", this.mouseLeaveListener), this.eventManager.bind(this.div, "mouseenter", this.mouseEnterListener), this.currentOctave = 3, this.activate();
	}
	setActionManager(e) {
		this.actionManager = e;
	}
	async playNoteSound(e) {
		Number(e), !(Number(e) > 107) && (Number(e) < 21 || (this.midiPlayerElement.stop(), this.midiPlayerElement.currentTime = (Number(e) - 21) * .5, this.midiPlayerElement.start(), setTimeout(() => {
			this.midiPlayerElement.stop();
		}, 500)));
	}
	bindListeners() {
		this.boundKeyDown = (e) => this.keyDownListener(e), this.boundKeyUp = (e) => this.keyUpListener(e);
	}
	activateLower() {
		this.currentOctave <= 1 || (this.currentOctave--, this.activate());
	}
	activateHigher() {
		this.currentOctave >= this.octaveNumbers.length || (this.currentOctave++, this.activate());
	}
	activate() {
		this.keys.querySelectorAll(".vrv-keyboard-key").forEach((e) => e.classList.remove("selected")), this.octaves.querySelectorAll(".vrv-keyboard-octave").forEach((e) => e.classList.remove("selected"));
		let e = this.keys.children[(this.currentOctave - 1) * 12];
		this.letters.forEach((t) => {
			e &&= (e.setAttribute("data-key", t), e.classList.add("selected"), e.nextElementSibling);
		});
		let t = this.octaves.children[this.currentOctave - 1];
		if (t.classList.add("selected"), this.keys.scrollWidth === 0) return;
		let n = this.keys.clientWidth, r = t.scrollWidth, i = t.offsetLeft - n / 2 + r / 2;
		this.keyboardWrapper.scroll({
			left: i,
			behavior: "smooth"
		});
	}
	keyDownListener(e) {
		if (e.key === "ArrowLeft") this.activateLower();
		else if (e.key === "ArrowRight") this.activateHigher();
		else {
			let t = this.letters.indexOf(e.key.toUpperCase());
			if (t !== -1) {
				let e = (this.currentOctave - 1) * 12 + t;
				this.keys.children[e].classList.add("active"), this.playNoteSound((t + 12 * this.currentOctave).toString());
			}
		}
		e.preventDefault();
	}
	keyUpListener(e) {
		this.keys.querySelectorAll(".vrv-keyboard-key").forEach((e) => e.classList.remove("active")), console.log(e);
	}
	mouseDownListener(e) {
		let t = e.target;
		t.classList.add("active"), t.dataset.midi && this.playNoteSound(t.dataset.midi), e.preventDefault();
	}
	mouseUpListener(e) {
		e.target.classList.remove("active");
	}
	mouseEnterListener(e) {
		document.addEventListener("keydown", this.boundKeyDown), document.addEventListener("keyup", this.boundKeyUp);
	}
	mouseLeaveListener(e) {
		document.removeEventListener("keydown", this.boundKeyDown), document.removeEventListener("keyup", this.boundKeyUp);
	}
}, Ee = class extends V {
	tabSelectors;
	eventManager;
	selectedTab;
	tabs;
	constructor(e, t) {
		super(e, t), this.div.textContent = "", this.tabSelectors = i(this.div, { class: "vrv-tab-selectors" }), this.tabs = [], this.selectedTab = null, this.eventManager = new T(this);
	}
	getSelectedTab() {
		return this.selectedTab;
	}
	addTab(e) {
		let t = new De(i(this.div, { class: "vrv-tab-content" }), this.app, this, e);
		return this.tabs.length === 0 ? (this.selectedTab = t, t.select()) : t.deselect(), this.tabs.push(t), t;
	}
	setHeight(e) {
		this.div.style.minHeight = `${e}px`, this.div.style.maxHeight = `${e}px`;
	}
	select(e) {
		this.selectedTab && this.selectedTab.id === e || (this.tabs.forEach((t) => {
			e === t.id ? this.selectedTab = t : t.deselect();
		}), this.selectedTab.select());
	}
	resetTabs() {
		this.tabs.forEach((e) => {
			e.loaded = !1;
		});
	}
	onActivate(e) {
		return super.onActivate(e) ? (this.selectedTab.customEventManager.dispatch(e), !0) : !1;
	}
	onDeactivate(e) {
		return super.onDeactivate(e) ? (this.dispatchToAll(e), !0) : !1;
	}
	onEditData(e) {
		return !super.onEditData(e) || this.selectedTab === e.detail.caller ? !1 : (this.selectedTab.customEventManager.dispatch(e), !0);
	}
	onEndLoading(e) {
		return super.onEndLoading(e) ? (this.dispatchToAll(e), !0) : !1;
	}
	onLoadData(e) {
		return super.onLoadData(e) ? (this.resetTabs(), this.selectedTab.customEventManager.dispatch(e), !0) : !1;
	}
	onSelect(e) {
		return !super.onSelect(e) || this.selectedTab === e.detail.caller ? !1 : (this.selectedTab.customEventManager.dispatch(e), !0);
	}
	dispatchToAll(e) {
		this.tabs.forEach((t) => {
			t.customEventManager.dispatch(e);
		});
	}
	onSelectTab(e) {
		let t = e.target;
		this.select(t.dataset.tab);
	}
}, De = class extends V {
	tabGroupObj;
	tabSelector;
	loaded;
	constructor(e, t, n, r) {
		super(e, t), this.tabGroupObj = n, this.tabSelector = i(n.tabSelectors, {
			class: "vrv-tab-selector",
			dataset: { tab: `${this.id}` }
		}), this.tabSelector.textContent = r, this.loaded = !1, n.eventManager.bind(this.tabSelector, "click", n.onSelectTab);
	}
	select() {
		this.tabSelector.classList.add("selected"), this.div.style.display = "block", this.customEventManager.dispatch(j(A.Activate));
	}
	deselect() {
		this.tabSelector.classList.remove("selected"), this.div.style.display = "none", this.customEventManager.dispatch(j(A.Deactivate));
	}
	isSelected() {
		return this.tabGroupObj.getSelectedTab() === this;
	}
}, Oe = "vrv", Y = /* @__PURE__ */ function(e) {
	return e[e.Validating = 0] = "Validating", e[e.Valid = 1] = "Valid", e[e.Invalid = 2] = "Invalid", e[e.Unknown = 3] = "Unknown", e;
}(Y || {}), ke = class extends V {
	currentId;
	updateLinting;
	timestamp;
	autoMode;
	autoModeNotification;
	edited;
	formatting;
	CMeditor;
	lintOptions;
	originalText;
	validator;
	rngLoader;
	xmlValid;
	xmlEditorView;
	constructor(e, t, n, r) {
		super(e, t), this.validator = n, this.rngLoader = r, this.currentId = null, this.xmlValid = i(this.div, { class: "vrv-xml-valid" }), this.xmlEditorView = _(this.div, {}), this.updateLinting = null, this.currentId = "", this.timestamp = Date.now(), this.edited = !1, this.autoMode = !1, this.autoModeNotification = !1, this.formatting = !1, this.originalText = "";
		let a = this;
		this.lintOptions = {
			caller: a,
			getAnnotations: a.validate,
			async: !0
		}, this.CMeditor = CodeMirror.fromTextArea(this.xmlEditorView, {
			lineNumbers: !0,
			readOnly: !1,
			autoCloseTags: !0,
			indentUnit: 3,
			mode: "xml",
			theme: Oe,
			foldGutter: !0,
			styleActiveLine: !0,
			hintOptions: { schemaInfo: this.rngLoader.getTags() },
			extraKeys: {
				"'<'": X,
				"'/'": Ae,
				"' '": Z,
				"'='": Z
			},
			gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"]
		}), this.CMeditor.addKeyMap({
			"Shift-Ctrl-V": function(e) {
				a.triggerValidation();
			},
			"Shift-Ctrl-F": function(e) {
				a.formatXML();
			}
		}), this.CMeditor.on("cursorActivity", function(e) {
			a.onXMLCursorActivity(e);
		}), this.CMeditor.on("keyHandled", function(e, t, n) {
			a.keyHandled(e, t, n);
		}), this.CMeditor.on("change", function(e, t, n) {
			t.origin === "setValue" || a.autoMode && !a.formatting ? a.triggerValidation() : (a.suspendValidation(), a.setStatus(Y.Unknown));
		}), this.CMeditor.options.hintOptions.schemaInfo = this.rngLoader.getTags();
	}
	isEdited() {
		return this.edited;
	}
	setEdited(e) {
		this.edited = e;
	}
	isAutoMode() {
		return this.autoMode;
	}
	setMode(e) {
		this.autoMode = e < O * 1024 * 1024, this.autoModeNotification = !this.autoMode;
	}
	isAutoModeNotification() {
		return this.autoModeNotification;
	}
	setAutoModeNotification(e) {
		this.autoModeNotification = e;
	}
	async validate(e, t, n) {
		if (!t || !n.caller || !e) return;
		let r = n.caller;
		if (!r.active || r.formatting) return;
		r.setStatus(Y.Validating), r.updateLinting = t, r.app.loaderService.start("Validating ...", !0);
		let i = "[]";
		i = r.app.options.enableValidation ? await r.validator.validateNG(e) : await r.validator.check(e), r.app.loaderService.end(!0), r.highlightValidation(e, i, r.timestamp);
	}
	async replaceSchema(e) {
		try {
			let t = await (await fetch(e)).text();
			if (this.app.options.enableValidation) {
				let e = await this.validator.setRelaxNGSchema(t);
				console.log("New schema loaded", e);
			}
			return this.rngLoader.setRelaxNGSchema(t), this.CMeditor.options.hintOptions.schemaInfo = this.rngLoader.getTags(), !0;
		} catch (e) {
			return console.log(e), !1;
		}
	}
	setStatus(e) {
		if (!this.xmlValid) return;
		this.xmlValid.classList.remove("wait"), this.xmlValid.classList.remove("ok"), this.xmlValid.classList.remove("error"), this.xmlValid.classList.remove("unknown");
		let t;
		switch (e) {
			case Y.Validating:
				t = "wait";
				break;
			case Y.Valid:
				t = "ok";
				break;
			case Y.Invalid:
				t = "error";
				break;
			case Y.Unknown:
				t = "unknown";
				break;
		}
		this.xmlValid.classList.add(t);
	}
	setCurrent(e) {
		let t = this.CMeditor.getSearchCursor(`xml:id="${e}"`);
		t.findNext(), t.atOccurrence && (this.CMeditor.scrollIntoView({
			line: t.pos.from.line,
			char: 0
		}, this.div.clientHeight / 2), this.CMeditor.setCursor(t.from()));
	}
	highlightValidation(e, t, n) {
		let r = [], i = [], a = 0, o = [];
		try {
			r = e.split("\n"), o = JSON.parse(t);
		} catch (e) {
			console.log("could not parse json:", e);
			return;
		}
		for (; a < o.length;) {
			let e = Math.max(o[a].line - 1, 0);
			i.push({
				from: new CodeMirror.Pos(e, 0),
				to: new CodeMirror.Pos(e, r[e].length),
				severity: "error",
				message: o[a].message
			}), a += 1;
		}
		if (this.updateLinting(this.CMeditor, i), i.length == 0) if (n === this.timestamp) {
			if (this.setStatus(Y.Valid), this.edited = !1, this.originalText === e) return;
			this.originalText = e, this.app.loaderService.start("Updating data ...", this.autoMode), this.app.customEventManager.dispatch(j(A.LoadData, {
				caller: this,
				lightEndLoading: this.autoMode,
				mei: e
			}));
		} else console.log("Validated data is obsolete"), this.setStatus(Y.Unknown), this.edited = !1;
		else this.setStatus(Y.Invalid), this.edited = !0;
	}
	formatXML() {
		console.debug("XMLEditorView::FormatXML"), this.formatting = !0;
		let e = this.CMeditor.getCursor(), t = this.CMeditor.lineCount();
		this.CMeditor.autoFormatRange({
			line: 0,
			ch: 0
		}, { line: t }), this.formatting = !1, this.CMeditor.setCursor(e);
	}
	triggerValidation() {
		this.CMeditor.setOption("lint", this.lintOptions);
	}
	suspendValidation() {
		this.CMeditor.setOption("lint", !1);
	}
	getValue() {
		return this.CMeditor.getValue();
	}
	onXMLCursorActivity(e) {
		if (this.formatting) return;
		let t = e.getCursor(), n = e.getLine(t.line), r = n.match(/.*xml:id=\"([^"]*)\".*/), i = n.match(/[^\>]*\<([^\ ]*).*/);
		r && (this.currentId !== r[1] && this.app.customEventManager.dispatch(j(A.Select, {
			id: r[1],
			elementType: i[1],
			caller: this
		})), this.currentId = r[1]);
	}
	keyHandled(e, t, n) {
		if (this.setEdited(!0), n.key === "Enter") {
			let t = e.getCursor().ch, n = e.getCursor().line, r = e.getLine(n).substr(e.getCursor().ch, 1), i = e.getLine(n - 1);
			if (i.substr(i.length - 1) === ">" && r === "<") {
				let r = e.getOption("tabSize");
				e.doc.replaceRange(" ".repeat(r) + "\n" + " ".repeat(t), e.getCursor()), e.setCursor({
					line: n,
					ch: t + r
				});
			}
		}
	}
	onActivate(e) {
		return super.onActivate(e) ? (this.CMeditor.refresh(), this.CMeditor.setSize(this.div.style.width, this.div.style.height), !0) : !1;
	}
	onLoadData(e) {
		return !super.onLoadData(e) || this === e.detail.caller ? !1 : (this.timestamp = Date.now(), this.originalText = e.detail.mei, this.CMeditor.setValue(this.originalText), this.setCurrent(this.currentId), !0);
	}
	onResized(e) {
		return super.onResized(e) ? (this.CMeditor.setSize(this.div.style.width, this.div.style.height), !0) : !1;
	}
	onSelect(e) {
		return super.onSelect(e) ? (this.currentId = e.detail.id, this.setCurrent(this.currentId), !0) : !1;
	}
};
function X(e, t) {
	return e.getCursor(), (!t || t()) && setTimeout(function() {
		e.state.completionActive || CodeMirror.showHint(e, CodeMirror.hint.xml, {
			schemaInfo: CodeMirror.schemaInfo,
			completeSingle: !1
		});
	}, 100), CodeMirror.Pass;
}
function Ae(e) {
	return X(e, function() {
		let t = e.getCursor();
		return e.getRange(CodeMirror.Pos(t.line, t.ch - 1), t) == "<";
	});
}
function Z(e) {
	return X(e, function() {
		let t = e.getTokenAt(e.getCursor());
		return t.type == "string" && (!/['"]/.test(t.string.charAt(t.string.length - 1)) || t.string.length == 1) ? !1 : CodeMirror.innerMode(e.getMode(), t.state).state.tagName;
	});
}
typeof CodeMirror < "u" && (CodeMirror.extendMode("xml", {
	commentStart: "<!--",
	commentEnd: "-->",
	newlineAfterToken: function(e, t, n) {
		return !1;
	}
}), CodeMirror.defineExtension("commentRange", function(e, t, n) {
	var r = this, i = CodeMirror.innerMode(r.getMode(), r.getTokenAt(t).state).mode;
	r.operation(function() {
		if (e) r.replaceRange(i.commentEnd, n), r.replaceRange(i.commentStart, t), t.line == n.line && t.ch == n.ch && r.setCursor(t.line, t.ch + i.commentStart.length);
		else {
			var a = r.getRange(t, n), o = a.indexOf(i.commentStart), s = a.lastIndexOf(i.commentEnd);
			o > -1 && s > -1 && s > o && (a = a.substr(0, o) + a.substring(o + i.commentStart.length, s) + a.substr(s + i.commentEnd.length)), r.replaceRange(a, t, n);
		}
	});
}), CodeMirror.defineExtension("autoIndentRange", function(e, t) {
	var n = this;
	this.operation(function() {
		for (var r = e.line; r <= t.line; r++) n.indentLine(r, "smart");
	});
}), CodeMirror.defineExtension("autoFormatRange", function(e, t) {
	var n = this, r = n.getMode(), i = n.getRange(e, t).split("\n"), a = CodeMirror.copyState(r, n.getTokenAt(e).state), o = n.getOption("tabSize"), s = "", c = 0, l = e.ch == 0;
	function u() {
		s += "\n", l = !0, ++c;
	}
	for (var d = 0; d < i.length; ++d) {
		for (var f = new CodeMirror.StringStream(i[d], o); !f.eol();) {
			var p = CodeMirror.innerMode(r, a), m = r.token(f, a), h = f.current();
			f.start = f.pos, (!l || /\S/.test(h)) && (s += h, l = !1), !l && p.mode.newlineAfterToken && p.mode.newlineAfterToken(m, h, f.string.slice(f.pos) || i[d + 1] || "", p.state) && u();
		}
		!f.pos && r.blankLine && r.blankLine(a), l || u();
	}
	n.operation(function() {
		n.replaceRange(s, e, t);
		for (var r = e.line + 1, i = e.line + c; r <= i; ++r) n.indentLine(r, "smart");
		n.setSelection(e, n.getCursor(!1));
	});
}));
//#endregion
//#region ts/editor/editor-panel.ts
var je = class extends V {
	eventManager;
	xmlEditorViewObj;
	editorViewObj;
	draggingSplitter;
	draggingX;
	draggingY;
	splitterX;
	splitterY;
	splitterSize;
	resizeTimer;
	toolbar;
	toolbarObj;
	hSplit;
	toolPanel;
	tabGroup;
	tabGroupObj;
	vSplit;
	keyboard;
	HTMLDivElement;
	keyboardObj;
	split;
	scorePanel;
	scorePanelObj;
	contentPanel;
	contentPanelObj;
	editorView;
	splitter;
	xmlEditorEnabled;
	xmlEditorView;
	verovio;
	validator;
	rngLoader;
	boundMouseMove;
	boundMouseUp;
	constructor(e, t, n, r, a) {
		super(e, t), this.verovio = n, this.validator = r, this.rngLoader = a, this.eventManager = new T(this), this.toolbar = i(this.div, { class: "vrv-editor-toolbar" }), this.toolbarObj = new xe(this.toolbar, this.app, this), this.customEventManager.addToPropagationList(this.toolbarObj.customEventManager), this.hSplit = i(this.div, { class: "vrv-h-split" }), this.toolPanel = i(this.hSplit, { class: "vrv-editor-tool-panel" }), this.vSplit = i(this.hSplit, { class: "vrv-v-split" }), this.split = i(this.vSplit, { class: "vrv-split" }), this.keyboard = i(this.vSplit, { class: "vrv-keyboard-panel" }), this.keyboardObj = new Te(this.keyboard, this.app);
		let o = this.app.options.editorSplitterHorizontal ? "vertical" : "horizontal";
		this.split.classList.add(o), this.editorView = i(this.split, {
			class: "vrv-view",
			style: ""
		}), this.editorViewObj = new we(this.editorView, this.app, this.verovio), this.customEventManager.addToPropagationList(this.editorViewObj.customEventManager), this.toolbarObj.bindEvents(this.editorViewObj.actionManager), this.tabGroup = i(this.toolPanel, { class: "vrv-tab-group" }), this.tabGroupObj = new Ee(this.tabGroup, this.app);
		let s = this.tabGroupObj.addTab("Score");
		this.scorePanel = i(s.getDiv(), { class: "vrv-tab-content-panel" }), this.scorePanelObj = new be(this.scorePanel, this.app, s), s.customEventManager.addToPropagationList(this.scorePanelObj.customEventManager);
		let c = this.tabGroupObj.addTab("Content");
		this.tabGroupObj.select(c.id), this.contentPanel = i(c.getDiv(), { class: "vrv-tab-content-panel" }), this.contentPanelObj = new ve(this.contentPanel, this.app, c, this.editorViewObj.actionManager), c.customEventManager.addToPropagationList(this.contentPanelObj.customEventManager), this.splitter = i(this.split, { class: "" }), this.eventManager.bind(this.splitter, "mousedown", this.onDragInit), this.boundMouseMove = (e) => this.onDragMove(e), this.boundMouseUp = (e) => this.onDragUp(e), this.draggingSplitter = !1, this.draggingX = 0, this.draggingY = 0, this.splitterX = 0, this.splitterY = 0, this.xmlEditorEnabled = !1, this.xmlEditorView = i(this.split, { class: "vrv-xml" }), this.xmlEditorViewObj = new ke(this.xmlEditorView, this.app, this.validator, this.rngLoader), this.splitterSize = 60, this.resizeTimer;
	}
	setXmlEditorEnabled(e) {
		this.xmlEditorEnabled = e;
	}
	isXmlEditorEnabled() {
		return this.xmlEditorEnabled;
	}
	updateSplitterSize() {
		if (this.app.options.editorSplitterHorizontal) {
			let e = this.split.clientHeight, t = this.editorView.clientHeight;
			this.splitterSize = Math.round(t * 100 / e);
		} else {
			let e = this.split.clientWidth, t = this.editorView.clientWidth;
			this.splitterSize = Math.round(t * 100 / e);
		}
	}
	updateSize() {
		this.div.style.height = this.div.parentElement.style.height, this.div.style.width = this.div.parentElement.style.width, this.toolPanel.style.display = "none", this.keyboard.style.display = "none", this.app.options.devFeatures && (this.toolPanel.style.display = this.xmlEditorEnabled ? "none" : "block", this.keyboard.style.display = this.xmlEditorEnabled ? "none" : "flex"), this.toolbar.style.display = "block";
		let e = this.div.clientHeight - this.toolbar.offsetHeight - this.keyboard.offsetHeight, t = this.div.clientWidth - this.toolPanel.offsetWidth;
		if (this.split.style.height = `${e}px`, this.split.style.width = `${t}px`, this.keyboard.style.width = `${t}px`, this.xmlEditorView.style.display = "block", this.splitter.style.display = "block", !this.xmlEditorEnabled) {
			this.xmlEditorViewObj.customEventManager.dispatch(j(A.Deactivate)), this.tabGroupObj.customEventManager.dispatch(j(A.Activate)), this.xmlEditorView.style.display = "none", this.xmlEditorView.style.height = "0px", this.xmlEditorView.style.width = "0px", this.splitter.style.display = "none", this.editorView.style.height = `${e}px`, this.editorView.style.width = `${t}px`;
			let n = this.div.clientHeight - this.toolbar.offsetHeight;
			this.tabGroupObj.setHeight(n - 78);
		} else if (this.app.options.editorSplitterHorizontal) {
			let n = Math.floor(e * this.splitterSize / 100), r = Math.ceil(e * (100 - this.splitterSize) / 100 - 10);
			this.editorView.style.height = `${n}px`, this.editorView.style.width = `${t}px`, this.xmlEditorView.style.height = `${r}px`, this.xmlEditorView.style.width = `${t}px`;
		} else {
			let n = Math.floor(t * this.splitterSize / 100), r = Math.ceil(t * (100 - this.splitterSize) / 100 - 10);
			this.editorView.style.height = `${e}px`, this.editorView.style.width = `${n}px`, this.xmlEditorView.style.height = `${e}px`, this.xmlEditorView.style.width = `${r}px`;
		}
		return this.div.style.height = this.div.parentElement.style.height, this.div.style.width = this.div.parentElement.style.width, !0;
	}
	onActivate(e) {
		if (!super.onActivate(e)) return !1;
		e?.detail && e.detail.loadData && this.updateSize(), this.xmlEditorEnabled ? (this.tabGroupObj.customEventManager.dispatch(j(A.Deactivate)), this.xmlEditorViewObj.customEventManager.dispatch(j(A.Activate))) : (this.xmlEditorViewObj.customEventManager.dispatch(j(A.Deactivate)), this.tabGroupObj.customEventManager.dispatch(j(A.Activate)));
	}
	onDeactivate(e) {
		if (!super.onDeactivate(e)) return !1;
		this.propagateEvent(e);
	}
	onSelect(e) {
		if (!super.onSelect(e)) return !1;
		this.propagateEvent(e);
	}
	onStartLoading(e) {
		if (!super.onStartLoading(e)) return !1;
		this.propagateEvent(e);
	}
	onEditData(e) {
		if (!super.onEditData(e)) return !1;
		this.propagateEvent(e);
	}
	onEndLoading(e) {
		if (!super.onEndLoading(e)) return !1;
		this.propagateEvent(e);
	}
	onResized(e) {
		if (!super.onResized(e)) return !1;
		this.updateSize(), this.propagateEvent(e);
	}
	onLoadData(e) {
		if (!super.onLoadData(e)) return !1;
		this.propagateEvent(e), this.updateSize();
	}
	propagateEvent(e) {
		this.xmlEditorEnabled ? this.xmlEditorViewObj.customEventManager.dispatch(e) : this.tabGroupObj.customEventManager.dispatch(e);
	}
	onDragInit(e) {
		document.addEventListener("mousemove", this.boundMouseMove), document.addEventListener("mouseup", this.boundMouseUp), this.draggingX = e.clientX, this.draggingY = e.clientY, this.draggingSplitter = !0, this.splitterY = e.clientY, this.splitterX = e.clientX;
	}
	onDragMove(e) {
		if (this.draggingSplitter === !0) {
			if (this.app.options.editorSplitterHorizontal) {
				let t = this.draggingY - e.clientY, n = this.editorView.clientHeight, r = this.xmlEditorView.clientHeight;
				this.editorView.style.height = `${n - t}px`, this.xmlEditorView.style.height = `${r + t}px`, this.draggingY = e.clientY;
			} else {
				let t = this.draggingX - e.clientX, n = this.editorView.clientWidth, r = this.xmlEditorView.clientWidth;
				this.editorView.style.width = `${n - t}px`, this.xmlEditorView.style.width = `${r + t}px`, this.draggingX = e.clientX;
			}
			this.xmlEditorViewObj.customEventManager.dispatch(j(A.Resized));
		}
	}
	onDragUp(e) {
		this.draggingSplitter = !1, document.removeEventListener("mousemove", this.boundMouseMove), document.removeEventListener("mouseup", this.boundMouseUp), this.app.loaderService.start("Adjusting size ...", !0), this.updateSplitterSize(), this.customEventManager.dispatch(j(A.Resized));
	}
	onToggleOrientation(e) {
		this.app.options.editorSplitterHorizontal = !this.app.options.editorSplitterHorizontal, this.split.classList.toggle("vertical"), this.split.classList.toggle("horizontal"), this.app.loaderService.start("Adjusting size ...", !0), this.app.customEventManager.dispatch(j(A.Resized));
	}
	async onToggle(e) {
		if (this.xmlEditorEnabled) {
			if (this.xmlEditorViewObj.isEdited()) {
				let e = new L(this.app.dialogDiv, this.app, "Un-synchronized changes", {
					okLabel: "Yes",
					icon: "question"
				});
				if (e.setContent(marked.parse(te)), await e.show() === 0) return;
				this.xmlEditorViewObj.setEdited(!1);
			}
			this.xmlEditorEnabled = !1;
		} else if (this.xmlEditorEnabled = !0, this.xmlEditorViewObj.isAutoModeNotification() && !this.xmlEditorViewObj.isAutoMode()) {
			let e = new L(this.app.dialogDiv, this.app, "Live validation off", {
				icon: "warning",
				type: L.Type.Msg
			});
			e.setContent(marked.parse(k)), await e.show(), this.xmlEditorViewObj.setAutoModeNotification(!1);
		}
		if (this.app.loaderService.start("Adjusting the interface ...", !0), this.customEventManager.dispatch(j(A.Activate)), this.xmlEditorEnabled) {
			this.tabGroupObj.resetTabs();
			let e = await this.verovio.getMEI({});
			this.app.customEventManager.dispatch(j(A.LoadData, {
				caller: this.editorView,
				mei: e
			}));
		}
		this.customEventManager.dispatch(j(A.Resized));
	}
	onForceReload(e) {
		this.xmlEditorViewObj && this.xmlEditorViewObj.isEdited() && this.customEventManager.dispatch(j(A.LoadData, {
			caller: this.xmlEditorViewObj,
			mei: this.xmlEditorViewObj.getValue()
		}));
	}
}, Me = class {
	id = "xml-editor";
	app;
	viewObj;
	install(e) {
		this.app = e, e.registerCommand("view.setEditor", () => e.setViewByName("editor"));
	}
	init() {
		if (this.app.options.enableEditor !== !1) {
			let e = this.app.viewsElement;
			e && (this.viewObj = new je(i(e, { class: "vrv-view" }), this.app, this.app.verovio, this.app.validator, this.app.rngLoader), this.app.customEventManager.addToPropagationList(this.viewObj.customEventManager), this.app.registerView("editor", this.viewObj), this.app.registerService("xml-editor-view", this.viewObj));
		}
	}
}, Ne = class extends q {
	viewDocument;
	viewResponsive;
	viewSelector;
	viewEditor;
	subSubMenu;
	editorSubToolbar;
	midiPlayerSubToolbar;
	pageControls;
	nextPage;
	prevPage;
	fileImportMusicXML;
	fileImportCMME;
	fileImport;
	fileMenuBtn;
	fileRecent;
	fileSelection;
	zoomControls;
	zoomIn;
	zoomOut;
	settingsEditor;
	settingsVerovio;
	helpReset;
	helpAbout;
	loginGroup;
	login;
	logout;
	githubMenu;
	githubImport;
	githubExport;
	constructor(e, t) {
		super(e, t), this.active = !0;
		let n = `${t.host}/icons/toolbar/arrow-left.png`, r = `${t.host}/icons/toolbar/arrow-right.png`, a = `${t.host}/icons/toolbar/document.png`, o = `${t.host}/icons/toolbar/editor.png`, s = `${t.host}/icons/toolbar/github-signin.png`, c = `${t.host}/icons/toolbar/layout.png`, l = `${t.host}/icons/toolbar/responsive.png`, u = `${t.host}/icons/toolbar/zoom-in.png`, d = `${t.host}/icons/toolbar/zoom-out.png`, f = `${t.host}/icons/toolbar/settings.png`, p = i(this.div, { class: "vrv-menu" });
		this.viewSelector = i(p, {
			class: "vrv-btn-icon-left",
			style: { backgroundImage: `url(${c})` },
			"data-before": "View"
		});
		let m = i(p, { class: "vrv-menu-content" });
		i(m, { class: "vrv-v-separator" });
		let h = 0;
		this.app.options.enableDocument && (this.viewDocument = i(m, {
			class: "vrv-menu-icon-left",
			style: { backgroundImage: `url(${a})` },
			"data-before": "Document"
		}), this.viewDocument.dataset.view = "document", this.app.eventManager.bind(this.viewDocument, "click", this.app.setView), h += 1), this.app.options.enableResponsive && (this.viewResponsive = i(m, {
			class: "vrv-menu-icon-left",
			style: { backgroundImage: `url(${l})` },
			"data-before": "Responsive"
		}), this.viewResponsive.dataset.view = "responsive", this.app.eventManager.bind(this.viewResponsive, "click", this.app.setView), h += 1), this.app.options.enableEditor && (this.viewEditor = i(m, {
			class: "vrv-menu-icon-left",
			style: { backgroundImage: `url(${o})` },
			"data-before": "Editor"
		}), this.viewEditor.dataset.view = "editor", this.app.eventManager.bind(this.viewEditor, "click", this.app.setView), h += 1), h === 1 && (p.style.display = "none");
		let g = i(this.div, { class: "vrv-menu" });
		t.options.enableEditor || (g.style.display = "none"), this.fileMenuBtn = i(g, {
			class: "vrv-btn-text",
			"data-before": "File"
		});
		let _ = i(g, { class: "vrv-menu-content" });
		i(_, { class: "vrv-v-separator" }), this.fileImport = i(_, {
			class: "vrv-menu-text",
			"data-before": "Import MEI file"
		}), this.fileImport.dataset.ext = "MEI", this.app.eventManager.bind(this.fileImport, "click", this.app.fileImport), this.fileImportMusicXML = i(_, {
			class: "vrv-menu-text",
			"data-before": "Import MusicXML file"
		}), _.appendChild(this.fileImportMusicXML), this.app.eventManager.bind(this.fileImportMusicXML, "click", this.app.fileImport), this.fileImportCMME = i(_, {
			class: "vrv-menu-text",
			"data-before": "Import CMME file"
		}), _.appendChild(this.fileImportCMME), this.app.eventManager.bind(this.fileImportCMME, "click", this.app.fileImport);
		let v = i(_, { class: "vrv-submenu" });
		this.fileRecent = i(v, {
			class: "vrv-submenu-text",
			"data-before": "Recent files"
		}), this.subSubMenu = i(v, { class: "vrv-submenu-content" }), i(_, { class: "vrv-v-separator" });
		let y = i(_, {
			class: "vrv-menu-text",
			"data-before": "Export MEI file"
		});
		y.dataset.ext = "MEI", this.app.eventManager.bind(y, "click", this.app.fileExport);
		let b = i(_, {
			class: "vrv-menu-text",
			"data-before": "Copy MEI to clipboard"
		});
		this.app.eventManager.bind(b, "click", this.app.fileCopyToClipboard), i(_, { class: "vrv-v-separator" });
		let x = i(_, {
			class: "vrv-menu-text",
			"data-before": "Export as PDF"
		});
		this.app.eventManager.bind(x, "click", this.app.fileExportPDF);
		let S = i(_, {
			class: "vrv-menu-text",
			"data-before": "Export as MIDI"
		});
		this.app.eventManager.bind(S, "click", this.app.fileExportMIDI), i(_, { class: "vrv-v-separator" }), this.fileSelection = i(_, {
			class: "vrv-menu-text",
			"data-before": "Apply content selection"
		}), this.app.eventManager.bind(this.fileSelection, "click", this.app.fileSelection), this.githubMenu = i(this.div, {
			class: "vrv-menu",
			style: { display: "none" }
		}), i(this.githubMenu, {
			class: "vrv-btn-text",
			"data-before": "GitHub"
		});
		let C = i(this.githubMenu, { class: "vrv-menu-content" });
		i(C, { class: "vrv-v-separator" }), this.githubImport = i(C, {
			class: "vrv-menu-text",
			"data-before": "Import MEI file from GitHub"
		}), this.app.eventManager.bind(this.githubImport, "click", this.app.githubImport), this.githubExport = i(C, {
			class: "vrv-menu-text",
			"data-before": "Export (commit/push) to GitHub"
		}), this.app.eventManager.bind(this.githubExport, "click", this.app.githubExport), this.pageControls = i(this.div, { class: "vrv-btn-group" }), i(this.pageControls, { class: "vrv-h-separator" }), this.prevPage = i(this.pageControls, {
			class: "vrv-btn-icon-left",
			style: { backgroundImage: `url(${n})` },
			"data-before": "Previous"
		}), this.app.eventManager.bind(this.prevPage, "click", this.app.prevPage), this.nextPage = i(this.pageControls, {
			class: "vrv-btn-icon",
			style: { backgroundImage: `url(${r})` },
			"data-before": "Next"
		}), this.app.eventManager.bind(this.nextPage, "click", this.app.nextPage), this.zoomControls = i(this.div, { class: "vrv-btn-group" }), i(this.zoomControls, { class: "vrv-h-separator" }), this.zoomOut = i(this.zoomControls, {
			class: "vrv-btn-icon-left",
			style: { backgroundImage: `url(${d})` },
			"data-before": "Zoom out"
		}), this.app.eventManager.bind(this.zoomOut, "click", this.app.zoomOut), this.zoomIn = i(this.zoomControls, {
			class: "vrv-btn-icon",
			style: { backgroundImage: `url(${u})` },
			"data-before": "Zoom in"
		}), this.app.eventManager.bind(this.zoomIn, "click", this.app.zoomIn), this.midiPlayerSubToolbar = i(this.div, {}), this.editorSubToolbar = i(this.div, {}), i(this.div, { class: "vrv-h-separator" });
		let w = i(this.div, { class: "vrv-menu" });
		t.options.enableEditor || (w.style.display = "none"), i(w, {
			class: "vrv-btn-icon-left",
			style: { backgroundImage: `url(${f})` },
			"data-before": "Settings"
		});
		let T = i(w, { class: "vrv-menu-content" });
		i(T, { class: "vrv-v-separator" }), this.settingsEditor = i(T, {
			class: "vrv-menu-text",
			"data-before": "Editor options"
		}), this.app.eventManager.bind(this.settingsEditor, "click", this.app.settingsEditor), this.settingsVerovio = i(T, {
			class: "vrv-menu-text",
			"data-before": "Verovio options"
		}), this.app.eventManager.bind(this.settingsVerovio, "click", this.app.settingsVerovio), i(this.div, { class: "vrv-h-separator" });
		let E = i(this.div, { class: "vrv-menu" });
		t.options.enableEditor || (E.style.display = "none"), i(E, {
			class: "vrv-btn-text",
			"data-before": "Help"
		});
		let D = i(E, { class: "vrv-menu-content" });
		i(D, { class: "vrv-v-separator" }), this.helpAbout = i(D, {
			class: "vrv-menu-text",
			"data-before": "About this application"
		}), this.app.eventManager.bind(this.helpAbout, "click", this.app.helpAbout), this.helpReset = i(D, {
			class: "vrv-menu-text",
			"data-before": "Reset to default"
		}), this.app.eventManager.bind(this.helpReset, "click", this.app.helpReset), this.loginGroup = i(this.div, { class: "vrv-btn-group-right" }), t.options.enableEditor || (this.loginGroup.style.display = "none"), i(this.loginGroup, { class: "vrv-h-separator" }), this.logout = i(this.loginGroup, {
			class: "vrv-btn-text",
			style: { display: "none" },
			"data-before": "Logout"
		}), this.app.eventManager.bind(this.logout, "click", this.app.logout), this.login = i(this.loginGroup, {
			class: "vrv-btn-icon",
			style: { backgroundImage: `url(${s})` },
			"data-before": "Github"
		}), this.app.eventManager.bind(this.login, "click", this.app.login), Array.from(this.div.querySelectorAll("div.vrv-menu")).forEach((e) => {
			this.eventManager.bind(e, "mouseover", this.onMouseOver);
		}), Array.from(this.div.querySelectorAll("div.vrv-menu-text")).forEach((e) => {
			this.eventManager.bind(e, "click", this.onClick);
		});
	}
	getMidiPlayerSubToolbar() {
		return this.midiPlayerSubToolbar;
	}
	updateRecent() {
		this.subSubMenu.textContent = "";
		let e = this.app.fileStack.fileList();
		for (let t = 0; t < e.length; t++) {
			let n = i(this.subSubMenu, {
				class: "vrv-menu-text",
				"data-before": e[t].filename
			});
			n.dataset.idx = e[t].idx.toString(), this.app.eventManager.bind(n, "click", this.app.fileLoadRecent), this.eventManager.bind(n, "click", this.onClick);
		}
	}
	updateAll() {
		let e = this.app.getToolbarView();
		if (!e) return;
		this.updateToolbarBtnEnabled(this.prevPage, e.getCurrentPage() > 1), this.updateToolbarBtnEnabled(this.nextPage, e.getCurrentPage() < this.app.getPageCount()), this.updateToolbarBtnEnabled(this.zoomOut, this.app.getPageCount() > 0 && e.getCurrentZoomIndex() > 0), this.updateToolbarBtnEnabled(this.zoomIn, this.app.getPageCount() > 0 && e.getCurrentZoomIndex() < this.app.zoomLevels.length - 1);
		let t = this.app.getView();
		if (!t) return;
		let n = t.id, r = n === "responsive", i = n === "editor", a = n === "document", o = this.app.options.selection && Object.keys(this.app.options.selection).length !== 0;
		this.updateToolbarGrp(this.pageControls, !a), this.updateToolbarGrp(this.midiPlayerSubToolbar, i || r), this.updateToolbarGrp(this.editorSubToolbar, i), this.updateToolbarSubmenuBtn(this.viewDocument, a), this.updateToolbarSubmenuBtn(this.viewResponsive, r), this.updateToolbarSubmenuBtn(this.viewEditor, i), this.updateToolbarSubmenuBtn(this.fileSelection, o), this.app.githubManager ? this.app.githubManager.isLoggedIn() && (this.githubMenu.style.display = "block", this.updateToolbarBtnDisplay(this.logout, !0), this.login.setAttribute("data-before", this.app.githubManager.getName()), this.login.classList.add("inactivated")) : this.loginGroup.style.display = "none", this.updateRecent();
	}
	onMouseOver(e) {
		Array.from(this.div.querySelectorAll("div.vrv-menu-content")).forEach((e) => {
			e.classList.remove("clicked");
		});
	}
	onClick(e) {
		Array.from(this.div.querySelectorAll("div.vrv-menu-content")).forEach((e) => {
			e.classList.add("clicked");
		});
	}
	onActivate(e) {
		return super.onActivate(e) ? (this.updateAll(), !0) : !1;
	}
	onEndLoading(e) {
		return super.onEndLoading(e) ? (this.updateAll(), !0) : !1;
	}
	onStartLoading(e) {
		return super.onStartLoading(e) ? (this.updateToolbarBtnEnabled(this.prevPage, !1), this.updateToolbarBtnEnabled(this.nextPage, !1), this.updateToolbarBtnEnabled(this.zoomOut, !1), this.updateToolbarBtnEnabled(this.zoomIn, !1), !0) : !1;
	}
}, Pe = class {
	id = "standard-toolbar";
	app;
	toolbarObj;
	install(e) {
		this.app = e, e.registerCommand("view.zoomIn", () => this.app.zoomInView()), e.registerCommand("view.zoomOut", () => this.app.zoomOutView()), e.registerCommand("view.nextPage", () => this.app.goToNextPage()), e.registerCommand("view.prevPage", () => this.app.goToPreviousPage());
	}
	init() {
		if (this.app.options.enableToolbar !== !1) {
			let e = this.app.toolbarElement;
			e && (this.toolbarObj = new Ne(e, this.app), this.app.customEventManager.addToPropagationList(this.toolbarObj.customEventManager), this.app.registerService("toolbar", this.toolbarObj), this.toolbarObj.onActivate(null), this.toolbarObj.updateAll(), this.renderContributions(), this.app.ready.then(() => {
				this.app.loaderService.getCount() === 0 && this.toolbarObj.onEndLoading(j(A.EndLoading));
			}));
		}
	}
	renderContributions() {
		let e = this.app.getContributions("toolbar.actions"), t = this.app.toolbarElement;
		if (e.length > 0 && t) {
			let n = i(t, {
				class: "vrv-toolbar-extra",
				style: {
					display: "flex",
					alignItems: "center",
					marginLeft: "10px"
				}
			});
			e.forEach((e) => {
				let t = i(n, {
					class: "vrv-btn-text",
					"data-before": e.label,
					id: e.id
				});
				t.onclick = () => this.app.executeCommand(e.command);
			});
		}
	}
}, Fe = class {
	playing;
	pausing;
	currentTime;
	currentTimeStr;
	totalTime;
	totalTimeStr;
	view;
	progressBarTimer;
	expansionMap;
	midiPlayerElement;
	midiUI;
	customEventManager;
	constructor(e, t, n) {
		this.pausing = !1, this.playing = !1, this.midiUI = t || null, this.midiUI && this.midiUI.setMidiPlayer(this), this.customEventManager = n || null, this.midiPlayerElement = x(e, {}), this.midiPlayerElement.addEventListener("load", () => this.play()), this.midiPlayerElement.addEventListener("note", () => this.onUpdateNoteTime(this.midiPlayerElement.currentTime)), this.midiPlayerElement.addEventListener("stop", (e) => this.onStop(e)), this.currentTime = 0, this.currentTimeStr = "0.00", this.totalTime = 0, this.totalTimeStr = "0.00", this.progressBarTimer = null, this.view = null, this.expansionMap = {};
	}
	isPlaying() {
		return this.playing;
	}
	isPausing() {
		return this.pausing;
	}
	getCurrentTime() {
		return this.currentTime;
	}
	getCurrentTimeStr() {
		return this.currentTimeStr;
	}
	getTotalTime() {
		return this.totalTime;
	}
	getTotalTimeStr() {
		return this.totalTimeStr;
	}
	setView(e) {
		this.view = e;
	}
	setExpansionMap(e) {
		this.expansionMap = e || {};
	}
	getExpansionMap() {
		return this.expansionMap;
	}
	playFile(e) {
		this.midiPlayerElement.setAttribute("src", e);
	}
	play() {
		this.midiPlayerElement.start(), this.totalTime = this.midiPlayerElement.duration * 1e3, this.totalTimeStr = this.samplesToTime(this.totalTime), this.currentTime = this.midiPlayerElement.currentTime * 1e3, this.currentTimeStr = this.samplesToTime(this.currentTime), this.startTimer(), this.pausing = !1, this.playing = !0, this.customEventManager && this.customEventManager.dispatch(j(A.EditData)), this.midiUI && this.midiUI.update(this);
	}
	stop() {
		this.currentTime = 0, this.currentTimeStr = "0.00", this.totalTime = 0, this.totalTimeStr = "0.00", this.midiPlayerElement.stop(), this.stopTimer(), this.pausing = !1, this.playing = !1, this.customEventManager && this.customEventManager.dispatch(j(A.EditData)), this.midiUI && this.midiUI.update(this), this.view && this.view.midiStop();
	}
	pause() {
		this.midiPlayerElement.stop(), this.stopTimer(), this.pausing = !0, this.playing = !1, this.customEventManager && this.customEventManager.dispatch(j(A.EditData)), this.midiUI && this.midiUI.update(this), this.view && this.view.midiStop();
	}
	seekToPercent(e) {
		if (!this.midiPlayerElement.playing) return;
		let t = this.totalTime * e;
		this.stopTimer(), this.midiPlayerElement.currentTime = t / 1e3;
	}
	onUpdateNoteTime(e) {
		let t = e * 1e3;
		this.currentTime < t && (this.currentTime = t, this.onUpdate(this.currentTime));
	}
	onUpdate(e) {
		this.currentTime = e, this.currentTimeStr = this.samplesToTime(this.currentTime), this.midiUI && this.midiUI.update(this), this.view && this.view.midiUpdate(e);
	}
	startTimer() {
		this.progressBarTimer === null && (this.progressBarTimer = setInterval(() => {
			if (this.totalTime > 0 && this.currentTime >= this.totalTime) {
				this.midiPlayerElement.stop();
				return;
			}
			this.onUpdate(this.currentTime), this.currentTime += 50;
		}, 50));
	}
	stopTimer() {
		this.progressBarTimer !== null && (clearInterval(this.progressBarTimer), this.progressBarTimer = null);
	}
	samplesToTime(e) {
		let t = Math.floor(e / 1e3), n = t % 60;
		return (t / 60 | 0) + ":" + (n === 0 ? "00" : n < 10 ? "0" + n : n);
	}
	onStop(e) {
		let t = !!(e && e.detail && e.detail.finished);
		this.stopTimer(), this.pausing = !1, this.playing = !1, t && (this.currentTime = this.totalTime, this.currentTimeStr = this.samplesToTime(this.currentTime)), this.customEventManager && this.customEventManager.dispatch(j(A.EditData)), this.midiUI && this.midiUI.update(this), this.view && this.view.midiStop();
	}
}, Q = class extends q {
	midiPlayer;
	pageDragStart;
	barDragStart;
	barWidth;
	midiControls;
	play;
	pause;
	stop;
	progressControl;
	midiCurrentTime;
	midiBar;
	midiBarPercent;
	midiTotalTime;
	constructor(e, t, n) {
		let r = `${t.host}/icons/toolbar/play.png`, a = `${t.host}/icons/toolbar/pause.png`, o = `${t.host}/icons/toolbar/stop.png`;
		super(e, t), this.midiPlayer = null, this.active = !0, this.pageDragStart = 0, this.barDragStart = 0, this.barWidth = 200;
		let s = n;
		!s && this.app.toolbarObj && (s = this.app.toolbarObj.getMidiPlayerSubToolbar()), s ||= e, this.midiControls = i(s, { class: "vrv-btn-group" }), i(this.midiControls, { class: "vrv-h-separator" }), this.play = i(this.midiControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${r})` }
		}), this.pause = i(this.midiControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${a})` }
		}), this.stop = i(this.midiControls, {
			class: "vrv-btn-icon-large",
			style: { backgroundImage: `url(${o})` }
		}), this.progressControl = i(this.midiControls, { class: "vrv-midi-progress" }), i(this.progressControl, { class: "vrv-h-separator" }), this.midiCurrentTime = i(this.progressControl, { class: "vrv-midi-current-time" }), this.midiBar = i(this.progressControl, { class: "vrv-midi-bar" }), this.midiBarPercent = i(this.midiBar, { class: "vrv-midi-bar-percent" }), this.midiTotalTime = i(this.progressControl, { class: "vrv-midi-total-time" }), this.eventManager.bind(this.play, "click", this.onPlay), this.eventManager.bind(this.pause, "click", this.onPause), this.eventManager.bind(this.stop, "click", this.onStop), this.eventManager.bind(this.midiBar, "mousedown", this.onProgressBarDown), this.eventManager.bind(this.midiBar, "mousemove", this.onProgressBarMove), this.eventManager.bind(this.midiBar, "mouseup", this.onProgressBarUp), this.updateToolbarBtnDisplay(this.pause, !1), this.updateToolbarBtnDisplay(this.stop, !1), this.updateToolbarGrp(this.progressControl, !1);
	}
	setMidiPlayer(e) {
		this.midiPlayer = e;
	}
	update() {
		this.updateAll();
	}
	updateProgressBar() {
		this.midiTotalTime.textContent = this.midiPlayer.getTotalTimeStr(), this.midiCurrentTime.textContent = this.midiPlayer.getCurrentTimeStr();
		let e = this.midiPlayer.getTotalTime() ? this.midiPlayer.getCurrentTime() / this.midiPlayer.getTotalTime() * 100 : 0;
		this.midiBarPercent.style.width = `${e}%`;
	}
	updateDragging(e) {
		let t = this.barDragStart + (e - this.pageDragStart);
		if (t >= 0 && t <= this.barWidth) {
			let e = t / this.barWidth;
			this.midiPlayer.seekToPercent(e);
		}
	}
	updateAll() {
		this.updateProgressBar(), this.updateToolbarGrp(this.midiControls, this.app.getPageCount() > 0), this.updateToolbarBtnDisplay(this.play, !this.midiPlayer.isPlaying() || this.midiPlayer.isPausing()), this.updateToolbarBtnDisplay(this.pause, !this.midiPlayer.isPausing() && this.midiPlayer.isPlaying()), this.updateToolbarBtnDisplay(this.stop, this.midiPlayer.isPlaying() || this.midiPlayer.isPausing()), this.updateToolbarGrp(this.progressControl, this.midiPlayer.isPlaying() || this.midiPlayer.isPausing());
	}
	onPlay(e) {
		this.midiPlayer.isPausing() ? this.midiPlayer.play() : this.app.playMEI();
	}
	onPause(e) {
		this.midiPlayer.pause();
	}
	onStop(e) {
		this.midiPlayer.stop();
	}
	onProgressBarDown(e) {
		this.midiPlayer.getTotalTime() !== 0 && (this.pageDragStart = e.pageX, this.barDragStart = e.offsetX, this.updateDragging(e.pageX));
	}
	onProgressBarMove(e) {
		this.pageDragStart !== 0 && (this.midiPlayer.pause(), this.updateDragging(e.pageX));
	}
	onProgressBarUp(e) {
		this.pageDragStart !== 0 && this.midiPlayer.getTotalTime() !== 0 && (this.pageDragStart = 0, this.midiPlayer.play());
	}
	onActivate(e) {
		return super.onActivate(e) ? (this.updateAll(), !0) : !1;
	}
	onEditData(e) {
		return super.onEditData(e) ? (this.updateAll(), !0) : !1;
	}
	onEndLoading(e) {
		return super.onEndLoading(e) ? (this.updateAll(), !0) : !1;
	}
}, Ie = class {
	id = "midi-player";
	app;
	midiPlayer;
	midiToolbarObj;
	install(e) {
		this.app = e, e.registerCommand("midi.play", () => this.midiPlayer?.play()), e.registerCommand("midi.pause", () => this.midiPlayer?.pause()), e.registerCommand("midi.stop", () => this.midiPlayer?.stop()), e.registerCommand("midi.playMEI", this.playMEI.bind(this));
	}
	init() {
		if (this.app.options.enableMidiToolbar !== !1) {
			let e = this.app.toolbar;
			e && (this.midiToolbarObj = new Q(e, this.app), this.midiPlayer = new Fe(this.midiToolbarObj.getDiv(), this.midiToolbarObj, this.app.customEventManager), this.app.customEventManager.addToPropagationList(this.midiToolbarObj.customEventManager), this.app.registerService("midi-player", this.midiPlayer));
		}
	}
	async playMEI() {
		if (!this.midiPlayer) return;
		let e = await this.app.verovio.renderToExpansionMap();
		this.midiPlayer.setExpansionMap(e);
		let t = "data:audio/midi;base64," + await this.app.verovio.renderToMIDI();
		this.midiPlayer.playFile(t);
	}
}, Le = class {
	name;
	login;
	user;
	selectedUser;
	selectedOrganization;
	selectedAccountName;
	selectedBranchName;
	selectedRepo;
	selectedRepoName;
	selectedPath;
	gh;
	app;
	constructor(e) {
		this.app = e, this.name = "GitHub", this.login = "unknown", this.user = null, this.selectedUser = null, this.selectedOrganization = null, this.selectedAccountName = "", this.selectedBranchName = "", this.selectedRepo = null, this.selectedRepoName = "", this.selectedPath = ["."], this.gh = null;
		let t = this.getSessionCookie("ghtoken");
		t &&= JSON.parse(atob(t)).ghtoken, t !== null && (this.gh = new GitHub({ token: t }), this.initUser());
	}
	getName() {
		return this.name;
	}
	getLogin() {
		return this.login;
	}
	getUser() {
		return this.user;
	}
	getSelectedUser() {
		return this.selectedUser;
	}
	getSelectedOrganization() {
		return this.selectedOrganization;
	}
	getSelectedRepo() {
		return this.selectedRepo;
	}
	getSelectedBranchName() {
		return this.selectedBranchName;
	}
	getSelectedAccountName() {
		return this.selectedAccountName;
	}
	getSelectedRepoName() {
		return this.selectedRepoName;
	}
	getSelectedPath() {
		return this.selectedPath;
	}
	selectedPathPop() {
		this.selectedPath.pop();
	}
	getPathString() {
		return this.selectedPath.join("/");
	}
	appendToPath(e) {
		this.selectedPath.push(e), this.storeSelection();
	}
	slicePathTo(e) {
		this.selectedPath = this.selectedPath.slice(0, e), this.storeSelection();
	}
	isLoggedIn() {
		return this.gh !== null;
	}
	getSessionCookie(e) {
		let t = document.cookie.match("(^|;) ?" + e + "=([^;]*)(;|$)");
		return t ? t[2] : null;
	}
	storeSelection() {
		this.app.options.github = {
			login: this.login,
			account: this.selectedAccountName,
			repo: this.selectedRepoName,
			branch: this.selectedBranchName,
			path: this.selectedPath
		};
	}
	resetSelectedPath() {
		this.selectedPath = ["."];
	}
	async writeFile(e, t) {
		try {
			let n = await this.app.verovio.getMEI({});
			await this.selectedRepo.writeFile(this.selectedBranchName, e, n, t, {}), this.app.notificationService.show("File was successfully pushed to GitHub");
		} catch (e) {
			console.error(e), this.app.notificationService.show("Something went wrong when pushing to GitHub");
		}
	}
	async selectAccount(e) {
		e === this.login ? (this.selectedOrganization = null, this.selectedUser = this.gh.getUser()) : (this.selectedUser = null, this.selectedOrganization = this.gh.getOrganization(e)), this.selectedAccountName = e, this.selectedBranchName = "", this.selectedRepo = null, this.selectedRepoName = "", this.resetSelectedPath(), this.storeSelection();
	}
	async selectBranch(e) {
		e !== "" && (this.selectedBranchName = e, this.resetSelectedPath(), this.storeSelection());
	}
	async selectRepo(e) {
		if (e !== "") try {
			this.selectedRepo = this.gh.getRepo(this.selectedAccountName, e), this.selectedBranchName = (await this.selectedRepo.getDetails()).data.default_branch, this.selectedRepoName = e, this.resetSelectedPath(), this.storeSelection();
		} catch (e) {
			console.error(e);
		}
	}
	async initUser() {
		this.user = this.gh.getUser();
		let e = await this.user.getProfile();
		this.login = e.data.login, this.name = e.data.name === null ? e.data.login : e.data.name, this.selectedUser = this.user, this.selectedAccountName = this.login;
		let t = this.app.options.github;
		t && t.login === this.login && (await this.selectAccount(t.account), await this.selectRepo(t.repo), await this.selectBranch(t.branch), this.selectedPath = t.path);
	}
}, $ = class extends L {
	data;
	filename;
	githubManager;
	iconsBranch;
	iconsInstitution;
	iconsFile;
	iconsFolder;
	iconsRepo;
	iconsUser;
	tabs;
	tabUser;
	tabRepo;
	tabBranch;
	tabFile;
	loading;
	list;
	selection;
	breadCrumbs;
	constructor(e, t, n, r, a) {
		super(e, t, n, r), this.iconsBranch = `${t.host}/icons/dialog/branch.png`, this.iconsInstitution = `${t.host}/icons/dialog/institution.png`, this.iconsFile = `${t.host}/icons/dialog/file.png`, this.iconsFolder = `${t.host}/icons/dialog/folder.png`, this.iconsRepo = `${t.host}/icons/dialog/repo.png`, this.iconsUser = `${t.host}/icons/dialog/user.png`, this.data = null, this.filename = "", this.githubManager = a, this.tabs = i(i(this.content, { class: "vrv-tab-group" }), { class: "vrv-tab-selectors" }), this.tabUser = i(this.tabs, {
			class: "vrv-tab-selector active",
			dataset: { tab: "user" }
		}), this.tabUser.textContent = "User / Organizations", this.eventManager.bind(this.tabUser, "click", this.selectTab), this.tabRepo = i(this.tabs, {
			class: "vrv-tab-selector",
			dataset: { tab: "rep" }
		}), this.tabRepo.textContent = "Repositories", this.eventManager.bind(this.tabRepo, "click", this.selectTab), this.tabBranch = i(this.tabs, {
			class: "vrv-tab-selector",
			dataset: { tab: "branch" }
		}), this.tabBranch.textContent = "Branches", this.eventManager.bind(this.tabBranch, "click", this.selectTab), this.tabFile = i(this.tabs, {
			class: "vrv-tab-selector",
			dataset: { tab: "file" }
		}), this.tabFile.textContent = "Files", this.eventManager.bind(this.tabFile, "click", this.selectTab), this.loading = i(this.content, { class: "vrv-dialog-gh-loading" }), this.list = i(this.content, { class: "vrv-dialog-gh-list" }), this.selection = i(this.content, { class: "vrv-dialog-gh-selection" }), this.breadCrumbs = i(this.content, { class: "vrv-path-breadcrumbs" }), this.okBtn.style.display = "none", this.githubManager.getSelectedBranchName() === "" ? this.listRepos() : this.listFiles();
	}
	getData() {
		return this.data;
	}
	getFilename() {
		return this.filename;
	}
	updateSelectionAndBreadcrumbs() {
		this.selection.style.display = "none", this.selection.textContent = "", this.selection.style.display = "none", this.breadCrumbs.textContent = "";
		let e = this.githubManager.getSelectedOrganization() === null ? this.iconsUser : this.iconsInstitution;
		if (!this.addSelection(this.githubManager.getSelectedAccountName(), e) || !this.addSelection(this.githubManager.getSelectedRepoName(), this.iconsRepo) || !this.addSelection(this.githubManager.getSelectedBranchName(), this.iconsBranch)) return;
		let t = this.githubManager.getSelectedPath();
		if (!(t.length < 2)) {
			this.breadCrumbs.style.display = "flex";
			for (let e = 0; e < t.length; e++) this.addCrumb(t[e], e + 1);
		}
	}
	loadingStart(e) {
		Array.from(this.tabs.querySelectorAll(".vrv-tab-selector")).forEach((e) => {
			e.classList.remove("selected");
		}), e.classList.add("selected"), this.list.textContent = "", this.list.style.display = "none", this.loading.style.display = "block";
	}
	loadingEnd() {
		this.list.textContent = "", this.list.style.display = "flex", this.loading.style.display = "none";
	}
	addItemToList(e, t, n, r, a) {
		let o = i(this.list, {
			class: "vrv-dialog-gh-item",
			style: { backgroundImage: `url(${t})` },
			"data-before": `${e}`
		}), s = Object.keys(n);
		for (let e = 0; e < s.length; e++) o.dataset[s[e]] = n[s[e]];
		r && o.classList.add("checked"), this.eventManager.bind(o, "click", a);
	}
	addSelection(e, t) {
		if (e === "") return !1;
		this.selection.style.display = "flex";
		let n = i(this.selection, {
			class: "vrv-dialog-gh-selection-item",
			style: { backgroundImage: `url(${t})` }
		});
		return n.textContent = e, !0;
	}
	addCrumb(e, t) {
		let n = i(this.breadCrumbs, { class: "vrv-path-breadcrumbs" });
		n.textContent = e, n.dataset.value = t.toString(), this.eventManager.bind(n, "click", this.selectCrumb);
	}
	async selectFile(e) {
		let t = e.target;
		if (t.dataset.type === "dir") t.dataset.name === ".." ? this.githubManager.selectedPathPop() : this.githubManager.appendToPath(t.dataset.name), await this.listFiles();
		else {
			let e = this.githubManager.getSelectedBranchName(), n = this.githubManager.getPathString() + "/" + t.dataset.name;
			this.data = (await this.githubManager.getSelectedRepo().getContents(e, n, !0)).data, this.filename = t.dataset.name, this.ok();
		}
	}
	async listFiles() {
		if (this.githubManager.getSelectedRepo() === null) {
			this.app.notificationService.show("Select a repository first");
			return;
		}
		this.loadingStart(this.tabFile);
		let e = this.githubManager.getSelectedBranchName(), t = this.githubManager.getPathString(), n = await this.githubManager.getSelectedRepo().getContents(e, t);
		n.data.sort((e, t) => e.type > t.type ? 1 : -1), this.loadingEnd(), this.githubManager.getSelectedPath().length > 1 && this.addItemToList("..", this.iconsFolder, {
			name: "..",
			type: "dir"
		}, !1, this.selectFile);
		for (let e = 0; e < n.data.length; e++) {
			let t = n.data[e].name, r = n.data[e].type, i = r === "dir" ? this.iconsFolder : this.iconsFile;
			this.addItemToList(t, i, {
				name: t,
				type: r
			}, !1, this.selectFile);
		}
		this.updateSelectionAndBreadcrumbs();
	}
	async listUsers() {
		this.loadingStart(this.tabUser);
		let e = await this.githubManager.getUser().listOrgs();
		this.loadingEnd();
		let t = this.githubManager.getSelectedAccountName() === this.githubManager.getLogin();
		this.addItemToList(this.githubManager.getLogin(), this.iconsUser, { login: this.githubManager.getLogin() }, t, this.selectUser);
		for (let t = 0; t < e.data.length; t++) {
			let n = e.data[t].login, r = this.githubManager.getSelectedAccountName() === n;
			this.addItemToList(n, this.iconsInstitution, { login: n }, r, this.selectUser);
		}
		this.updateSelectionAndBreadcrumbs();
	}
	async listRepos() {
		this.loadingStart(this.tabRepo);
		let e;
		e = this.githubManager.getSelectedOrganization() === null ? await this.githubManager.getSelectedUser().listRepos({ type: "owner" }) : await this.githubManager.getSelectedOrganization().getRepos(), e.data.sort((e, t) => e.name > t.name ? 1 : -1), this.loadingEnd();
		for (let t = 0; t < e.data.length; t++) {
			let n = e.data[t].name, r = this.githubManager.getSelectedRepoName() === n;
			this.addItemToList(n, this.iconsRepo, { name: n }, r, this.selectRepo);
		}
		this.updateSelectionAndBreadcrumbs();
	}
	async listBranches() {
		if (this.githubManager.getSelectedRepo() === null) {
			this.app.notificationService.show("Select a repository first");
			return;
		}
		this.loadingStart(this.tabBranch);
		let e = await this.githubManager.getSelectedRepo().listBranches();
		e.data.sort((e, t) => e.name > t.name ? 1 : -1), this.loadingEnd();
		for (let t = 0; t < e.data.length; t++) {
			let n = e.data[t].name, r = this.githubManager.getSelectedBranchName() === n;
			this.addItemToList(n, this.iconsBranch, { name: n }, r, this.selectBranch);
		}
		this.updateSelectionAndBreadcrumbs();
	}
	async selectUser(e) {
		let t = e.target;
		await this.githubManager.selectAccount(t.dataset.login), this.listRepos();
	}
	async selectRepo(e) {
		let t = e.target;
		await this.githubManager.selectRepo(t.dataset.name), this.listBranches();
	}
	async selectBranch(e) {
		let t = e.target;
		await this.githubManager.selectBranch(t.dataset.name), this.listFiles();
	}
	selectCrumb(e) {
		let t = e.target;
		this.githubManager.slicePathTo(Number(t.dataset.value)), this.listFiles();
	}
	selectTab(e) {
		switch (e.target.dataset.tab) {
			case "user":
				this.listUsers();
				break;
			case "repo":
				this.listRepos();
				break;
			case "branch":
				this.listBranches();
				break;
			case "file":
				this.listFiles();
				break;
		}
	}
}, Re = class extends $ {
	fields;
	inputFile;
	inputMessage;
	constructor(e, t, n, r, a) {
		r.okLabel = "Commit and push", super(e, t, n, r, a), this.okBtn.style.display = "flex", this.okBtn.classList.add("disabled"), this.fields = i(this.content, {
			class: "vrv-dialog-form",
			style: { display: "none" }
		}), this.appendLabel(this.fields, "Filename"), this.inputFile = o(this.fields, { class: "vrv-dialog-input" }), this.inputFile.placeholder = "Name of an existing or of a new file", this.eventManager.bind(this.inputFile, "input", this.enableOk), this.appendLabel(this.fields, "Commit message"), this.inputMessage = _(this.fields, { class: "vrv-dialog-input" }), this.inputMessage.placeholder = "The commit message to be sent to GitHub", this.eventManager.bind(this.inputMessage, "input", this.enableOk);
	}
	async selectFile(e) {
		let t = e.target;
		t.dataset.type === "dir" ? (t.dataset.name === ".." ? this.githubManager.selectedPathPop() : this.githubManager.appendToPath(t.dataset.name), this.listFiles()) : this.inputFile.value = t.dataset.name;
	}
	isValid() {
		return this.inputFile.value !== "" && this.inputMessage.value !== "";
	}
	updateSelectionAndBreadcrumbs() {
		super.updateSelectionAndBreadcrumbs(), this.githubManager.getSelectedBranchName() === "" ? this.fields.style.display = "none" : this.fields.style.display = "grid";
	}
	ok() {
		if (!this.isValid()) return;
		let e = this.githubManager.getPathString() + "/" + this.inputFile.value, t = this.inputMessage.value;
		this.githubManager.writeFile(e, t), super.ok();
	}
	enableOk(e) {
		this.okBtn.classList.toggle("disabled", !this.isValid());
	}
}, ze = class {
	id = "github";
	app;
	githubManager;
	constructor(e) {
		this.options = e;
	}
	install(e) {
		this.app = e, this.githubManager = new Le(e), e.registerService("github-manager", this.githubManager), e.registerCommand("github.import", this.import.bind(this)), e.registerCommand("github.export", this.export.bind(this)), e.contribute("toolbar.actions", {
			id: "github-import",
			label: "Import from GitHub",
			command: "github.import",
			icon: "github"
		});
	}
	async import() {
		if (this.app.options.useCustomDialogs) {
			let e = new CustomEvent("onGithubImportRequest", { cancelable: !0 });
			if (this.app.dispatchEvent(e), e.defaultPrevented) return;
		}
		let e = new $(this.app.dialogDiv, this.app, "Import an MEI file from GitHub", {}, this.githubManager);
		await e.show() === 1 && this.app.fileService.loadData(e.getData(), e.getFilename());
	}
	async export() {
		if (this.app.options.useCustomDialogs) {
			let e = new CustomEvent("onGithubExportRequest", { cancelable: !0 });
			if (this.app.dispatchEvent(e), e.defaultPrevented) return;
		}
		await new Re(this.app.dialogDiv, this.app, "Export an MEI file to GitHub", {}, this.githubManager).show();
	}
}, Be = class extends V {
	statusText;
	versionText;
	constructor(e, t) {
		super(e, t), this.active = !0, this.statusText = i(this.div, { class: "vrv-status-text" }), this.versionText = i(this.div, { class: "vrv-status-version" });
	}
	setVerovioVersion(e) {
		this.versionText.textContent = e ? `Verovio ${e}` : "";
	}
	onEndLoading(e) {
		return super.onEndLoading(e) ? (this.statusText.textContent = "Completed", !0) : !1;
	}
	onStartLoading(e) {
		if (!super.onStartLoading(e)) return !1;
		let t = e.detail.light ? e.detail.msg : "In progress ...";
		return this.statusText.textContent = t, !0;
	}
}, Ve = class {
	id = "statusbar";
	app;
	statusbarObj;
	install(e) {
		this.app = e;
	}
	init() {
		if (this.app.options.enableStatusbar !== !1) {
			let e = this.app.statusbarElement;
			e && (this.statusbarObj = new Be(e, this.app), this.app.customEventManager.addToPropagationList(this.statusbarObj.customEventManager), this.statusbarObj.setVerovioVersion(this.app.getRuntimeVersion()), this.app.ready.then(() => {
				this.app.loaderService.getCount() === 0 && this.statusbarObj.onEndLoading(j(A.EndLoading));
			}));
		}
	}
}, He = class extends V {
	actionManager;
	underlay;
	eventManager;
	constructor(e, t, n) {
		super(e, t), this.underlay = n, this.eventManager = new T(this);
	}
	setActionManager(e) {
		this.actionManager = e;
	}
	show(e) {
		this.div.style.top = e.clientY + "px", this.div.style.left = e.clientX + "px", this.div.style.display = "inline-block", this.underlay.style.display = "block";
	}
	hide() {
		this.underlay.style.display = "none", this.div.style.display = "none";
	}
	onDismiss(e) {
		this.hide();
	}
	buildFor(e) {
		this.eventManager.unbindAll(), this.eventManager.bind(this.div, "click", this.hide), this.eventManager.bind(this.underlay, "click", this.onDismiss);
		let t = i(i(this.div, { class: "vrv-menu" }), { class: "vrv-menu-content" }), n = i(t, { class: "vrv-submenu" });
		i(n, {
			class: "vrv-submenu-text",
			"data-before": "Insert before"
		});
		let r = i(n, { class: "vrv-submenu-content" });
		["note", "rest"].forEach((e) => {
			let t = i(r, {
				class: "vrv-menu-text",
				"data-before": e
			});
			t.dataset.elementName = e, t.dataset.insertMode = "insertBefore", this.eventManager.bind(t, "click", this.insertNote);
		});
		let a = i(t, { class: "vrv-submenu" });
		i(a, {
			class: "vrv-submenu-text",
			"data-before": "Insert after"
		}), r = i(a, { class: "vrv-submenu-content" }), ["note", "rest"].forEach((e) => {
			let t = i(r, {
				class: "vrv-menu-text",
				"data-before": e
			});
			t.dataset.elementName = e, t.dataset.insertMode = "insertAfter", this.eventManager.bind(t, "click", this.insertNote);
		});
		let o = i(t, { class: "vrv-submenu" });
		i(o, {
			class: "vrv-submenu-text",
			"data-before": "Append child"
		}), r = i(o, { class: "vrv-submenu-content" }), ["note", "rest"].forEach((e) => {
			let t = i(r, {
				class: "vrv-menu-text",
				"data-before": e
			});
			t.dataset.elementName = e, t.dataset.insertMode = "appendChild", this.eventManager.bind(t, "click", this.insertNote);
		});
	}
	insertNote(e) {
		let t = e.target;
		this.actionManager.insert(t.dataset.elementName, t.dataset.insertMode);
	}
}, Ue = class {
	id = "context-menu";
	app;
	contextMenuObj;
	install(e) {
		this.app = e;
	}
	init() {
		if (this.app.options.enableContextMenu !== !1) {
			let e = this.app.contextMenu, t = this.app.contextUnderlayElement;
			e && t && (this.contextMenuObj = new He(e, this.app, t), this.app.customEventManager.addToPropagationList(this.contextMenuObj.customEventManager), this.app.registerService("context-menu", this.contextMenuObj));
		}
	}
}, We = class {
	id = "validation";
	app;
	install(e) {
		this.app = e;
	}
	init() {
		let e = this.app.verovioService;
		e && (this.app.registerService("validator", e.validator), this.app.registerService("rng-loader", e.rngLoader), this.app.registerService("rng-loader-basic", e.rngLoaderBasic));
	}
}, Ge = class {
	id = "pdf-export";
	app;
	install(e) {
		this.app = e, e.registerCommand("file.exportPDF", () => {
			this.app.loaderService.start("Generating PDF file ..."), this.app.fileService.generatePDF(this.app.output);
		});
	}
	init() {}
};
//#endregion
export { B as App, B as VerovioEditor, A as AppEvent, Ue as ContextMenuPlugin, me as DocumentViewPlugin, ze as GitHubPlugin, R as LocalStorageProvider, Ie as MidiPlayerPlugin, z as NoStorageProvider, Ge as PdfExportPlugin, he as ResponsiveViewPlugin, Pe as StandardToolbarPlugin, Ve as StatusbarPlugin, We as ValidationPlugin, de as VerovioApp, Me as XmlEditorPlugin, j as createAppEvent };
