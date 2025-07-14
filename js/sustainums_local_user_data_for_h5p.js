import LocalStorageHandler from './local_storage_handler.js';
import H5PHolder from './h5p_holder.js';

/** @constant {number} MIN_SAVE_FREQUENCY_MS Minumum save frequence in ms. */
const MIN_SAVE_FREQUENCY_MS = 1000;

export default class SustainumsLocalUserDataForH5P {

  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {number|boolean} [params.saveFrequency] Save frequency in seconds.
   * @param {boolean} [params.isUserLoggedIn] User logged in status.
   * @param {number} [params.wpBlogId] WordPress blog ID.
   */
  constructor(params = {}) {
    this.isActive = false;
    this.initializedIds = [];
    this.initializationQueue = [];
    this.saveTimeouts = {};
    this.h5pHolders = {};

    this.saveFrequency = SustainumsLocalUserDataForH5P.sanitizeSaveFrequency(window.H5PIntegration?.saveFreq);
    if (typeof this.saveFrequency !== 'number') {
      return; // State should not be saved.
    }

    this.localStorageHandler = new LocalStorageHandler({
      identifierTemplate:
        `WP-bid-${window.sustainumsLocalUserDataForH5P?.wpBlogId ?? ''}-H5P-cid-{contentId}-sid-{subContentId}`,
    });

    if (document.readyState === 'loading') {
      document.addEventListener('readystatechange', () => {
        if (!this.isActive && ['interactive', 'complete'].includes(document.readyState)) {
          this.attemptToStart();
        }
      });
    }
    else {
      this.attemptToStart();
    }
  }

  /**
   * Sanitize save frequency.
   * @param {number|boolean} frequencyCandidate Frequency candidate.
   * @returns {number|boolean} Sanitized frequency.
   */
  static sanitizeSaveFrequency = (frequencyCandidate = false) => {
    frequencyCandidate = parseInt(frequencyCandidate);
    if (isNaN(frequencyCandidate)) {
      frequencyCandidate = false;
    }
    else {
      // eslint-disable-next-line no-magic-numbers
      frequencyCandidate = Math.max(MIN_SAVE_FREQUENCY_MS, frequencyCandidate * 1000);
    }

    return frequencyCandidate;
  };

  /**
   * Check if H5P is running.
   * @returns {boolean} True if H5P is running, false otherwise.
   */
  static isH5PRunning() {
    return window.H5P?.externalDispatcher !== undefined;
  }

  /**
   * Attempt to start.
   */
  attemptToStart() {
    if (!SustainumsLocalUserDataForH5P.isH5PRunning()) {
      return;
    }

    this.isActive = true;

    [...window.document.querySelectorAll('.h5p-iframe, .h5p-content')].forEach((holder) => {
      const contentId = holder.dataset.contentId;
      if (!contentId) {
        return;
      }

      this.initializeH5PHolders(holder, contentId);

      if (window.sustainumsLocalUserDataForH5P.isUserLoggedIn) {
        return; // If user is logged in, state from database takes precedence.
      }

      this.setPreviousStateFromLocalStorage(contentId);

    });
  }

  /**
   * Initialize H5P Holders.
   * @param {HTMLElement} holder Div or iframe element that holds H5P content.
   * @param {string} contentId Content Id.
   */
  initializeH5PHolders(holder, contentId) {
    this.h5pHolders[contentId] = new H5PHolder(
      { holder: holder },
      {
        onInitialized: () => {
          this.h5pHolders[contentId].startGetCurrentStateProcess(
            this.saveFrequency,
            (state) => {
              if (H5P.isEmpty?.(state)) {
                return;
              }

              this.saveState(this.getJsonContent(contentId), state, contentId);
            }
          );
        }
      }
    );
  }

  /**
   * Set previous state from local storage.
   * @param {string} contentId Content Id.
   */
  setPreviousStateFromLocalStorage(contentId) {
    const state = this.localStorageHandler.getUserData(this.getJsonContent(contentId), contentId);
    if (!state) {
      return;
    }

    // Content parameters have changed, reset state like H5P core would for database-stored state.
    if (state?.reset === 'RESET') {
      this.h5pHolders[contentId].queueResetMessage(() => {
        this.localStorageHandler.removeUserData(contentId);
      });
      return;
    }

    // Overwrite state data in H5PIntegration that will fuel the previous state for the H5P instance.
    window.H5PIntegration.contents[`cid-${contentId}`].contentUserData =
      window.H5PIntegration.contents[`cid-${contentId}`].contentUserData.map((userData) => {
        if (!Object.keys(userData).includes('state')) {
          return userData;
        }

        userData.state = JSON.stringify(state);
        return userData;
      });
  }

  /**
   * Save state.
   * @param {string} jsonContent H5P parameters in stringified JSON format.
   * @param {object|object[]} state State object to save.
   * @param {string} contentId Content Id.
   */
  saveState(jsonContent, state, contentId) {
    if (!state || !contentId) {
      return;
    }

    this.localStorageHandler.setUserData(jsonContent, state, contentId, 0);
  }

  /**
   * Get JSON content from H5PIntegration.
   * @param {string} contentId Content Id.
   * @returns {string} Content parameters in stringified JSON format.
   */
  getJsonContent(contentId) {
    return window.H5PIntegration?.contents?.[`cid-${contentId}`]?.jsonContent ?? '';
  }
}
