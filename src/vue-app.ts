import ArcoVue from "@arco-design/web-vue";
import "@arco-design/web-vue/dist/arco.css";
import type { App } from "vue";

export default function setup(app: App): void {
  app.use(ArcoVue);
}
