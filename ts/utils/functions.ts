export function appendAnchorTo(
  parent: HTMLElement,
  options: object,
): HTMLAnchorElement {
  return <HTMLAnchorElement>appendHTMLElementTo(parent, options, "a");
}

export function appendCanvasTo(
  parent: HTMLElement,
  options: object,
): HTMLCanvasElement {
  return <HTMLCanvasElement>appendHTMLElementTo(parent, options, "canvas");
}

export function appendDetailsTo(
  parent: HTMLElement,
  options: object,
): HTMLDetailsElement {
  return <HTMLDetailsElement>appendHTMLElementTo(parent, options, "details");
}

export function appendDivTo(
  parent: HTMLElement,
  options: object,
): HTMLDivElement {
  return <HTMLDivElement>appendHTMLElementTo(parent, options, "div");
}

export function insertDivBefore(
  parent: HTMLElement,
  options: object,
  before: HTMLElement,
): HTMLDivElement {
  return <HTMLDivElement>(
    insertHTMLElementBefore(parent, options, "div", before)
  );
}

export function appendFieldSetTo(
  parent: HTMLElement,
  options: object,
): HTMLFieldSetElement {
  return <HTMLFieldSetElement>appendHTMLElementTo(parent, options, "fieldset");
}

export function appendInputTo(
  parent: HTMLElement,
  options: object,
): HTMLInputElement {
  return <HTMLInputElement>appendHTMLElementTo(parent, options, "input");
}

export function appendLegendTo(
  parent: HTMLElement,
  options: object,
): HTMLLegendElement {
  return <HTMLLegendElement>appendHTMLElementTo(parent, options, "legend");
}

export function appendLinkTo(
  parent: HTMLElement,
  options: object,
): HTMLLinkElement {
  return <HTMLLinkElement>appendHTMLElementTo(parent, options, "link");
}

export function appendOptionTo(
  parent: HTMLElement,
  options: object,
): HTMLOptionElement {
  return <HTMLOptionElement>appendHTMLElementTo(parent, options, "option");
}

export function appendOptGroupTo(
  parent: HTMLSelectElement,
  options: object,
): HTMLOptGroupElement {
  return <HTMLOptGroupElement>appendHTMLElementTo(parent, options, "optgroup");
}

export function appendSelectTo(
  parent: HTMLElement,
  options: object,
): HTMLSelectElement {
  return <HTMLSelectElement>appendHTMLElementTo(parent, options, "select");
}

export function appendSpanTo(
  parent: HTMLElement,
  options: object,
  text: string = "",
): HTMLSpanElement {
  let span = appendHTMLElementTo(parent, options, "span");
  span.textContent = text;
  return <HTMLSpanElement>span;
}

export function appendSummaryTo(
  parent: HTMLElement,
  options: object,
): HTMLElement {
  return <HTMLElement>appendHTMLElementTo(parent, options, "summary");
}

export function appendTableTo(
  parent: HTMLElement,
  options: object,
): HTMLTableElement {
  return <HTMLTableElement>appendHTMLElementTo(parent, options, "table");
}

export function appendTBodyTo(
  parent: HTMLElement,
  options: object,
): HTMLElement {
  return <HTMLElement>appendHTMLElementTo(parent, options, "tbody");
}

export function appendTdTo(
  parent: HTMLTableRowElement,
  options: object,
): HTMLTableCellElement {
  return <HTMLTableCellElement>appendHTMLElementTo(parent, options, "td");
}

export function appendTrTo(
  parent: HTMLElement,
  options: object,
): HTMLTableRowElement {
  return <HTMLTableRowElement>appendHTMLElementTo(parent, options, "tr");
}

export function appendTextAreaTo(
  parent: HTMLElement,
  options: object,
): HTMLTextAreaElement {
  return <HTMLTextAreaElement>appendHTMLElementTo(parent, options, "textarea");
}

export function randomHex(digits: number): string {
  return Math.floor((1 + Math.random()) * Math.pow(16, digits))
    .toString(16)
    .substring(1);
}

export function appendHTMLElementTo(
  parent: HTMLElement,
  options: object,
  tag: string,
): HTMLElement {
  const element = document.createElement(tag);
  setAttributes(element, options);
  parent.appendChild(element);
  return element;
}

function insertHTMLElementBefore(
  parent: HTMLElement,
  options: object,
  tag: string,
  before: HTMLElement,
): HTMLElement {
  const element = document.createElement(tag);
  setAttributes(element, options);
  parent.insertBefore(element, before);
  return element;
}

/**
 * interface for the html-midi-player custom element
 */

export interface MidiPlayerElement extends HTMLElement {
  start(): void;
  pause(): void;
  stop(): void;
  currentTime: number;
  duration: number;
  playing: boolean;
}

export function appendMidiPlayerTo(
  parent: HTMLElement,
  options: object,
): MidiPlayerElement {
  const midiPlayer = <MidiPlayerElement>(
    appendHTMLElementTo(parent, options, "midi-player")
  );
  midiPlayer.setAttribute("sound-font", "");
  midiPlayer.style.display = "none";
  return midiPlayer;
}

/**
 * Set attributes of a DOM element. The `style` property is special-cased to
 * accept an object whose own attributes are assigned to element.style.
 */
function setAttributes(element: HTMLElement, attributes: object) {
  for (const prop in attributes) {
    if (prop === "style") {
      setStyle(element, attributes[prop]);
    } else if (prop === "dataset") {
      setDataset(element, attributes[prop]);
    } else {
      element.setAttribute(prop, attributes[prop]);
    }
  }
}

function setStyle(element: HTMLElement, style: object) {
  for (const cssProp in style) {
    if (!style.hasOwnProperty(cssProp)) continue;

    element.style[cssProp] = style[cssProp];
  }
}

function setDataset(element: HTMLElement, dataset: object) {
  for (const value in dataset) {
    element.dataset[value] = dataset[value];
  }
}
