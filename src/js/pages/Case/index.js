import Page from "../../classes/Page";
import { delay } from "../../utils/math";

export default class extends Page {
  constructor() {
    super({
      classes: {
        active: "cases--active",
        caseActive: "case--active",
        mediaActive: "case__gallery__media__placeholder--active",
      },
      element: ".home",
      elements: {
        list: ".home__list",
        items: ".home__item",
      },
      element: ".cases",
      elements: {
        wrapper: "#trolli",
        cases: ".case",
      },
    });
  }

  show(url) {
    this.element.classList.add(this.classes.active);
    const id = url.replace("/case/", "").replace("/", "");

    this.elements.wrapper = Array.from(this.elements.cases).find(
      (item) => item.id === id
    );
    this.elements.wrapper.classList.add(this.classes.caseActive);
  }

  async hide() {
    this.elements.wrapper.classList.remove(this.classes.caseActive);

    this.element.classList.remove(this.classes.active);

    await delay(400);

    this.elements.wrapper = null;

    return super.hide();
  }

  onResize() {
    super.onResize();
  }
}
