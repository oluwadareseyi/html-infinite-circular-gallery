import Page from "../../classes/Page";
import Scrolling from "../../components/Scrolling";
import { delay } from "../../utils/math";

export default class extends Page {
  constructor() {
    super({
      classes: {
        active: "home--active",
      },
      element: ".home",
      elements: {
        list: ".home__list",
        wrapper: ".home__wrapper",
        items: ".home__item",
      },
    });
  }

  show() {
    this.element.classList.add(this.classes.active);

    this.list.enable();

    return super.show();
  }

  async hide() {
    this.element.classList.remove(this.classes.active);

    await delay(400);

    return super.hide();
  }

  create() {
    super.create();

    this.createList();
  }

  createList() {
    this.list = new Scrolling({
      element: document.body,
      elements: {
        list: this.elements.list,
        items: this.elements.items,
      },
    });
  }

  onTouchDown(event) {
    super.onTouchDown(event);
    this.list.onTouchDown(event);
  }

  onTouchMove(event) {
    super.onTouchMove(event);
    this.list.onTouchMove(event);
  }

  onTouchUp(event) {
    super.onTouchUp(event);
    this.list.onTouchUp(event);
  }

  onWheel(event) {
    super.onWheel(event);
    this.list.onWheel(event);
  }

  onResize() {
    this.list.onResize();

    super.onResize();
  }

  update() {
    super.update();

    this.list.update();
  }
}
