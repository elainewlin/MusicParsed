declare module "*.mustache" {
  function render(view: {}): string;
  export = render;
}
