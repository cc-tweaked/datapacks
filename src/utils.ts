/**
 * Small helper-function for building class names.
 *
 * This is especially useful when some classes should be conditionally appled, as you can write:
 * {@code classNames(f(x) ? "some-class" : undefined)}
 */
export const classNames = (...classes: Array<string | undefined>): string => classes.filter(x => !!x).join(" ");

/**
 * Save a Blob to a file
 *
 * @param name The name of the file to download.
 * @param blob The blob to save to
 */
export const saveBlob = (name: string, blob: Blob): void => {
  // Somewhat inspired by https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js
  // Goodness knows how well this works on non-modern browsers.
  const element = document.createElement("a");
  const url = URL.createObjectURL(blob);

  element.download = name;
  element.rel = "noopener";
  element.href = url;

  setTimeout(() => URL.revokeObjectURL(url), 60e3);
  setTimeout(() => {
    try {
      element.dispatchEvent(new MouseEvent("click"));
    } catch (_e) {
      const mouseEvent = document.createEvent("MouseEvents");
      mouseEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      element.dispatchEvent(mouseEvent);
    }
  }, 0);
};

export const prettyJson = (x: unknown): string => JSON.stringify(x, null, "  ");

export const assertNever = (_: never): never => {
  throw Error("Impossible: never");
}
