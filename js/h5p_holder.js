/** @constant {number} XAPI_EVENT_DELAY_MS Delay before XAPI event leads to state saving. */
const XAPI_EVENT_DELAY_MS = 3000; // Used in H5P core, probably to give content type time to update state after XAPI.

export default class H5PHolder {

  /**
   * @class
   * @param {object} params Parameters.
   * @param {HTMLElement} params.holder H5P holder
   * @param {object} [callbacks] Callbacks.
   * @param {function} [callbacks.onInitialized] Callback when H5P instance is initialized.
   */
  constructor(params = {}, callbacks = {}) {
    this.callbacks = callbacks;
    this.callbacks.onInitialized = this.callbacks.onInitialized ?? (() => {});

    this.contentId = params.holder.dataset.contentId;
    this.checkForInstance = this.checkForInstance.bind(this);

    if (params.holder.tagName === 'DIV') {
      this.window = window;
    }
    else if (params.holder.tagName === 'IFRAME') {
      try {
        this.window = params.holder.contentWindow;
      }
      catch (error) {
        this.window = null;
      }
    }

    // H5P core triggers external 'initialized' event per instance, but does not tell for what instance
    H5P.externalDispatcher.on('initialized', this.checkForInstance);
  }

  /**
   * Check for H5P instance.
   */
  checkForInstance() {
    if (this.instance || !this.window?.H5P) {
      return; // Instance already found or H5P not loaded.
    }

    this.instance = this.window.H5P.instances.find((instance) => instance.contentId.toString() === this.contentId);
    if (!this.instance) {
      return;
    }

    this.container = this.window?.document.querySelector('.h5p-container') ?? null;

    H5P.externalDispatcher.off('initialized', this.checkForInstance);

    if (typeof this.callbacks.onResetConfirmed === 'function') {
      // Content parameters changed and user needs to confirm reset.
      this.displayResetMessage();
    }

    this.callbacks.onInitialized();
  }

  /**
   * Start interval-based + event-based process to get current state from H5P instance.
   * Uses the same events like H5P core + improvements pending implementation
   * @see {@link https://github.com/h5p/h5p-php-library/pull/107}
   * @param {number} saveFrequencyMS Frequency in milliseconds to save state.
   * @param {function} callback Callback to handle current state.
   */
  startGetCurrentStateProcess(saveFrequencyMS, callback) {
    if (typeof this.instance?.getCurrentState !== 'function') {
      return;
    }

    ['visibilitychange', 'pagehide', 'beforeunload'].forEach((eventName) => {
      this.window.addEventListener(eventName, () => {
        this.handleGetCurrentStateProcess(saveFrequencyMS, callback);
      });
    });

    this.instance.on?.('xAPI', (event) => {
      const verb = event.getVerb();
      if (['answered', 'completed', 'progressed'].includes(verb)) {
        window.setTimeout(() => {
          this.handleGetCurrentStateProcess(saveFrequencyMS, callback);
        }, XAPI_EVENT_DELAY_MS);
      }
    });

    this.handleGetCurrentStateProcess(saveFrequencyMS, callback);
  }

  /**
   * Handle get current state process.
   * @param {number} saveFrequencyMS Frequency in milliseconds to save state.
   * @param {function} callback Callback to handle current state.
   */
  handleGetCurrentStateProcess(saveFrequencyMS, callback) {
    if (!this.instance || typeof this.instance.getCurrentState !== 'function') {
      return;
    }

    callback(this.instance.getCurrentState());

    clearTimeout(this.getCurrentStateTimeout);
    this.getCurrentStateTimeout = window.setTimeout(() => {
      this.handleGetCurrentStateProcess(saveFrequencyMS, callback);
    }, saveFrequencyMS);
  }

  /**
   * Queue reset message to be displayed once the content is initialized.
   * @param {function} callback Callback to handle reset confirmation.
   */
  queueResetMessage(callback) {
    this.callbacks.onResetConfirmed = callback;
  }

  /**
   * Display reset message the way H5P core would.
   */
  displayResetMessage() {
    if (!this.container || !this.instance) {
      return;
    }

    const title = `<p>${H5P.t('contentChanged')}</p>`;
    const message = `<p>${H5P.t('startingOver')}</p>`;
    const OKButton = '<div class="h5p-dialog-ok-button" tabIndex="0" role="button">OK</div>';

    const dialog = new H5P.Dialog(
      'content-user-data-reset',
      'Data Reset',
      `${title}${message}${OKButton}`,
      H5P.jQuery(this.container)
    );

    H5P.jQuery(dialog)
      .on('dialog-opened', () => {
        const OKButton = this.container.parentNode.querySelector('.h5p-dialog-ok-button');
        if (OKButton) {
          OKButton.addEventListener('click', () => {
            dialog.close();
          });
        }

        this.instance?.trigger('resize');
      })
      .on('dialog-closed', () => {
        this.callbacks.onResetConfirmed(this.contentId);
        this.callbacks.onResetConfirmed = null;
        this.instance?.trigger('resize');
      });

    dialog.open();
  }
}
