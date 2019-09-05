const AppUtils = {
  // Check if the running platform is windows
  isWindowsPlatform() {
    const platformName = window.navigator.platform;
    let regex = /^win/i;
    return regex.test(platformName);
  },
  // Check if the running platform is mac
  isMacPlatform() {
    const platformName = window.navigator.platform;
    let regex = /^mac/i;
    return regex.test(platformName);
  },
  // Check if the app is running inside electron
  isRunningInsideElectron() {
    return window && window.process && window.process.type === 'renderer';
  },
  /**
   * Scroll to a `ref` within a HTML element.
   *
   * @param {HTMLElement} targetRef - the ref in the parent element to scroll to.
   * @param {HTMLElement} parentElement - provides context to targetRef
   */
  scrollToRef(targetRef, parentElement) {
    parentElement.scrollTop = targetRef.offsetTop - parentElement.offsetTop;
  },

  /**
   * For situations where the ref required is not available, scroll to a `ref` within a HTML element with the element id.
   * Deprecate this if upgrading to React 16, or higher, in favor of the new ref features.
   *
   * @param {*} targetRefId - HTML id of element to scroll to ie: "FAQ_GPOS"
   * @param {*} parentElementId - provides context for targetRefId
   */
  scrollToOtherRef(targetRefId, parentElementId) {
    const getById = (id) => {
      return document.getElementById(id);
    };

    this.scrollToRef(getById(targetRefId), getById(parentElementId));
  },
  /**
   * "Rounds down" a number to x number of digits specified by digits via string splicing.
   *
   * @param {*} num - original num to round down
   * @param {*} digits - number of digits after the decimal to keep
   * @returns
   */
  trimNum(num, digits) {
    let numString = num.toString();
    let decimalIndex = numString.indexOf('.');
    let subString = decimalIndex > 0 ? numString.substring(0, decimalIndex + (digits+1)) : num;
    return parseFloat(subString);
  }
};

export default AppUtils;