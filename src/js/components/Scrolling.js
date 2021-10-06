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

    this.velocity = 2;
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

  transform(element, x, rotation = 0, normal = 0) {
    const y = Math.abs(rotation * (normal / (window.innerWidth / 2)));
    const ratio = window.innerWidth <= 425 ? 0.8 : 2.2;
    // prettier-ignore
    element.style[this.transformPrefix] = `translate3d(${Math.floor(x)}px, ${y * ratio}%, 0) rotate(${rotation}deg)`;
  }

  onResize() {
    each(this.elements.items, (element) => {
      this.transform(element, 0, 0, 0);

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

    this.scroll.target += this.velocity;

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    const scrollClamp = Math.round(this.scroll.current % this.widthTotal);

    if (this.scroll.current < this.scroll.last) {
      this.direction = "down";
      this.velocity = -2;
    } else {
      this.direction = "up";
      this.velocity = 2;
    }

    each(this.elements.items, (element, index) => {
      element.position = -this.scroll.current - element.extra;

      const offset = element.position + element.offset + element.width + 30;

      // if (index === 3 && this.scroll.current !== this.scroll.last) {
      const normalizedPosition =
        (((element.getBoundingClientRect().left / window.innerWidth) * 2 - 1) *
          window.innerWidth) /
          2 +
        element.width / 2;

      this.rotation = GSAP.utils.mapRange(
        -window.innerWidth / 2,
        window.innerWidth / 2,
        -10,
        10,
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
