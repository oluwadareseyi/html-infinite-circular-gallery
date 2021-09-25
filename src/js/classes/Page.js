import AutoBind from "auto-bind";
import Prefix from "prefix";
import NormalizeWheel from "normalize-wheel";

import { clamp, lerp } from "../utils/math";

export default class Page {
  constructor({ classes, element, elements }) {
    AutoBind(this);

    this.classes = {
      ...classes,
    };

    this.selector = element;
    this.selectorChildren = { ...elements };
    this.create();

    this.scroll = {
      ease: 0.1,
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
    };

    this.transformPrefix = Prefix("transform");
  }

  create() {
    if (this.selector instanceof HTMLElement) {
      this.element = this.selector;
    } else {
      this.element = document.querySelector(this.selector);
    }

    this.elements = {};

    Object.keys(this.selectorChildren).forEach((key) => {
      const entry = this.selectorChildren[key];

      if (
        entry instanceof HTMLElement ||
        entry instanceof NodeList ||
        Array.isArray(entry)
      ) {
        this.elements[key] = entry;
      } else {
        this.elements[key] = this.element.querySelectorAll(entry);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = this.element.querySelector(entry);
        }
      }
    });
  }

  transform(element, y) {
    element.style[this.transformPrefix] = `translate3d(0, ${-Math.round(
      y
    )}px, 0)`;
  }

  show() {
    this.scroll.position = 0;
    this.scroll.current = 0;
    this.scroll.target = 0;

    return Promise.resolve();
  }

  hide() {
    return Promise.resolve();
  }

  /**
   * Events
   */

  onResize() {
    this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight;
  }

  onWheel(event) {
    const normalized = NormalizeWheel(event);
    const speed = normalized.pixelY;

    this.scroll.target += speed;
  }

  onTouchDown(event) {
    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientY : event.clientY;
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const y = event.touches ? event.touches[0].clientY : event.clientY;
    const distance = (this.start - y) * 2;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp(event) {
    this.isDown = false;
  }

  /**
   * Update
   */

  update() {
    this.scroll.target = clamp(0, this.scroll.limit, this.scroll.target);

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    if (this.scroll.current < 0.1) {
      this.scroll.current = 0;
    }

    if (this.elements.wrapper) {
      this.transform(this.elements.wrapper, this.scroll.current);
    }
  }
}
