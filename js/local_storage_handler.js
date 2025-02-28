export default class LocalStorageHandler {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {string} [params.identifierTemplate] Template for the identifier.
   */
  constructor(params = {}) {
    this.identifierTemplate = params.identifierTemplate ?? 'H5P-cid-{contentId}-sid-{subContentId}';
  }

  /**
   * Get user data.
   * @param {string} jsonContent JSON content aka parameters of H5P content.
   * @param {number} [contentId] Content ID.
   * @param {number} [subContentId] Subcontent ID.
   * @returns {object|undefined} User data.
   */
  getUserData(jsonContent, contentId, subContentId = 0) {
    if (!contentId || !LocalStorageHandler.isLocalStorageSupported()) {
      return;
    }

    const identifier = this.getIdentifier(contentId, subContentId);
    const stored = window.localStorage.getItem(identifier);

    if (!stored) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(stored);
    }
    catch (error) {
      return;
    }

    if (!parsed?.state || !parsed?.checksum) {
      return;
    }

    const checksum = LocalStorageHandler.getNumericalHash(jsonContent);
    if (checksum !== parsed.checksum) {
      return { reset: 'RESET' };
    }

    return JSON.parse(parsed.state);
  }

  /**
   * Set user data.
   * @param {string} jsonContent JSON content aka parameters of H5P content.
   * @param {object} data Data to store.
   * @param {string} contentId Content ID.
   * @param {string} [subContentId] Subcontent ID.
   */
  setUserData(jsonContent, data, contentId, subContentId = 0) {
    if (!data || !contentId || !LocalStorageHandler.isLocalStorageSupported()) {
      return;
    }

    const identifier = this.getIdentifier(contentId, subContentId);

    const toStore = JSON.stringify({
      checksum: LocalStorageHandler.getNumericalHash(jsonContent),
      state: JSON.stringify(data)
    });

    window.localStorage.setItem(identifier, toStore);
  }

  /**
   * Remove user data.
   * @param {number} contentId Content ID.
   * @param {number} [subContentId] Subcontent ID.
   */
  removeUserData(contentId, subContentId = 0) {
    if (!contentId || !LocalStorageHandler.isLocalStorageSupported()) {
      return;
    }

    const identifier = this.getIdentifier(contentId, subContentId);
    window.localStorage.removeItem(identifier);
  };

  /**
   * Check if local storage is supported.
   * @returns {boolean} True if local storage is supported, false otherwise.
   */
  static isLocalStorageSupported() {
    let isSupported = false;
    try {
      isSupported = !!window.localStorage;
    }
    catch (error) {
      isSupported = false;
    }

    return isSupported;
  }

  /**
   * Get numerical hash.
   * @param {string} [text] Text to hash.
   * @returns {number} Hash.
   */
  static getNumericalHash(text = '') {
    // eslint-disable-next-line no-magic-numbers
    return text.split('').reduce((result, current) => (((result << 5) - result) + current.charCodeAt(0)) | 0, 0);
  }

  /**
   * Get identifier.
   * @param {number} contentId Content ID.
   * @param {number} subContentId Subcontent ID.
   * @returns {string} Identifier.
   */
  getIdentifier(contentId = 0, subContentId = 0) {
    return this.identifierTemplate.replace('{contentId}', contentId).replace('{subContentId}', subContentId);
  }
}
