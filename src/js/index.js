import AutoBind from "auto-bind";
import each from "lodash/each";
import Detection from "./classes/Detection";

import Home from "./pages/Home";
class App {
  constructor() {
    AutoBind(this);

    this.url = window.location.pathname;

    this.mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    this.createHome();

    this.pages = {
      "/": this.home,
    };

    this.page = this.pages[this.url];

    this.page.show(this.url);

    this.addEventListeners();
    this.addLinksEventsListeners();
    this.update();

    this.onResize();
  }

  createHome() {
    this.home = new Home();
  }

  async onChange({ push = true, url = null }) {
    url = url.replace(window.location.origin, "");

    if (this.isFetching || this.url === url) return;

    this.isFetching = true;

    this.url = url;

    if (this.canvas) {
      this.canvas.onChange(this.url);
    }

    await this.page.hide();

    if (push) {
      window.history.pushState({}, document.title, url);
    }

    this.page = this.pages[this.url];

    await this.page.show(this.url);

    this.isFetching = false;
  }

  /**
   * Events
   */

  onResize() {
    if (this.home) {
      this.home.onResize();
    }
  }

  onWheel(event) {
    if (this.page && this.page.onWheel) {
      this.page.onWheel(event);
    }
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: false,
    });
  }

  onTouchDown(event) {
    event.stopPropagation();

    if (!Detection.isMobile() && event.target.tagName === "A") return;

    this.mouse.x = event.touches ? event.touches[0].clientX : event.clientX;
    this.mouse.y = event.touches ? event.touches[0].clientY : event.clientY;

    if (this.page && this.page.onTouchDown) {
      this.page.onTouchDown(event);
    }
  }

  onTouchMove(event) {
    event.stopPropagation();

    this.mouse.x = event.touches ? event.touches[0].clientX : event.clientX;
    this.mouse.y = event.touches ? event.touches[0].clientY : event.clientY;

    if (this.page && this.page.onTouchMove) {
      this.page.onTouchMove(event);
    }
  }

  onTouchUp(event) {
    event.stopPropagation();

    this.mouse.x = event.changedTouches
      ? event.changedTouches[0].clientX
      : event.clientX;
    this.mouse.y = event.changedTouches
      ? event.changedTouches[0].clientY
      : event.clientY;

    if (this.page && this.page.onTouchUp) {
      this.page.onTouchUp(event);
    }
  }

  /**
   * Loop
   */
  update() {
    if (this.page) {
      this.page.update();
    }

    window.requestAnimationFrame(this.update);
  }

  /**
   * Listeners
   */
  addLinksEventsListeners() {
    const links = document.querySelectorAll("a");

    each(links, (link) => {
      const isLocal = link.href.indexOf(window.location.origin) > -1;

      if (isLocal) {
        link.onclick = (event) => {
          event.preventDefault();

          this.onChange({
            url: link.href,
          });
        };
      } else if (
        link.href.indexOf("mailto") === -1 &&
        link.href.indexOf("tel") === -1
      ) {
        link.rel = "noopener";
        link.target = "_blank";
      }
    });
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize, { passive: true });
    window.addEventListener("popstate", this.onPopState, { passive: true });

    window.addEventListener("mousewheel", this.onWheel, { passive: true });
    window.addEventListener("wheel", this.onWheel, { passive: true });

    window.addEventListener("mousedown", this.onTouchDown, { passive: true });
    window.addEventListener("mousemove", this.onTouchMove, { passive: true });
    window.addEventListener("mouseup", this.onTouchUp, { passive: true });

    window.addEventListener("touchstart", this.onTouchDown, { passive: true });
    window.addEventListener("touchmove", this.onTouchMove, { passive: true });
    window.addEventListener("touchend", this.onTouchUp, { passive: true });
  }
}

new App();
