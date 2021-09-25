import NormalizeWheel from "normalize-wheel";
import Prefix from "prefix";
import GSAP from "gsap";

import each from "lodash/each";

import Component from "../classes/Component";

import { getOffset } from "../utils/dom";
import { lerp } from "../utils/math";

export default class extends Component {
  constructor({ element, elements }) {
    super({
      element,
      elements,
    });

    this.transformPrefix = Prefix("transform");

    this.scroll = {
      ease: 0.1,
      position: 0,
      current: 0,
      target: 0,
      last: 0,
      clamp: 0,
      velocity: 1,
    };

    each(this.elements.items, (element) => {
      const offset = getOffset(element);

      element.extra = 0;
      element.width = offset.width;
      element.offset = offset.left;
      element.position = 0;
    });

    this.length = this.elements.items.length;

    this.width = this.elements.items[0].width;
    this.widthTotal = this.elements.list.getBoundingClientRect().width;
  }

  enable() {
    this.isEnabled = true;

    this.update();
  }

  disable() {
    this.isEnabled = false;
  }

  onTouchDown(event) {
    if (!this.isEnabled) return;

    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientX : event.clientX;
  }

  onTouchMove(event) {
    if (!this.isDown || !this.isEnabled) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = (this.start - x) * 2;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp(event) {
    if (!this.isEnabled) return;

    this.isDown = false;
  }

  onWheel(event) {
    if (!this.isEnabled) return;

    const normalized = NormalizeWheel(event);
    const speed = normalized.pixelY * 0.5;

    this.scroll.target += speed;
  }

  transform(element, x, rotation = 0, normal) {
    const y = Math.abs(rotation * (normal / (window.innerWidth / 2)));
    // prettier-ignore
    element.style[this.transformPrefix] = `translate3d(${Math.floor(x)}px, ${y * 2.2}%, 0) rotate(${rotation}deg)`;
  }

  onResize() {
    each(this.elements.items, (element) => {
      this.transform(element, 0);

      const offset = getOffset(element);

      element.extra = 0;
      element.width = offset.width;
      element.offset = offset.left;
      element.position = 0;
    });

    this.width = this.elements.items[0].getBoundingClientRect().width;
    this.widthTotal = this.elements.list.getBoundingClientRect().width;

    this.scroll = {
      ease: 0.1,
      position: 0,
      current: 0,
      target: 0,
      last: 0,
    };
  }

  update() {
    if (!this.isEnabled) return;

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    const scrollClamp = Math.round(this.scroll.current % this.widthTotal);

    if (this.scroll.current < this.scroll.last) {
      this.direction = "down";
      this.scroll.velocity = -1;
    } else {
      this.direction = "up";
      this.scroll.velocity = 1;
    }

    each(this.elements.items, (element, index) => {
      element.position = -this.scroll.current - element.extra;

      const offset = element.position + element.offset + element.width;

      // if (index === 3 && this.scroll.current !== this.scroll.last) {
      const normalizedPosition =
        (((element.getBoundingClientRect().left / window.innerWidth) * 2 - 1) *
          window.innerWidth) /
          2 +
        element.width / 2;

      this.rotation = GSAP.utils.mapRange(
        -window.innerWidth / 2,
        window.innerWidth / 2,
        -20,
        20,
        Math.min(normalizedPosition, window.innerWidth / 2)
      );

      element.isBefore = offset < 0;
      element.isAfter = offset > this.widthTotal;

      if (this.direction === "up" && element.isBefore) {
        element.extra = element.extra - this.widthTotal;

        element.isBefore = false;
        element.isAfter = false;
      }

      if (this.direction === "down" && element.isAfter) {
        element.extra = element.extra + this.widthTotal;

        element.isBefore = false;
        element.isAfter = false;
      }

      element.clamp = element.extra % scrollClamp;

      this.transform(
        element,
        element.position,
        this.rotation,
        normalizedPosition
      );
    });

    this.scroll.last = this.scroll.current;
    this.scroll.clamp = scrollClamp;
  }
}
