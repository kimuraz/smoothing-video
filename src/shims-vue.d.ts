/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module "*.xml" {
  const doc: any; // Change this to an actual XML type
  export default doc;
}