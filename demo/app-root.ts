import {
  customElement,
  html,
  internalProperty,
  LitElement,
  TemplateResult,
} from 'lit-element';

import { BrowserResponseCache } from '../src/browser-response-cache';

@customElement('app-root')
export class AppRoot extends LitElement {
  private browserResponseCache = new BrowserResponseCache({
    defaultCacheTTL: 5000,
    cacheMaintenanceInterval: 1000,
  });

  @internalProperty()
  private timeRemaining = 5;

  @internalProperty()
  private cacheActive = false;

  render(): TemplateResult {
    return html`
      <p>
        Open the network panel and click Fetch. The cache is set to 5 seconds so
        you should see an initial fetch, then if you continue to click Fetch, it
        shouldn't perform another fetch for 5 seconds.
      </p>

      <p><input type="button" value="Fetch" @click=${this.doFetch} /></p>

      ${this.cacheActive
        ? html` <p>Time until cache clears: ${this.timeRemaining}s</p> `
        : html` Cache empty `}
    `;
  }

  private async doFetch(): Promise<void> {
    const result = await this.browserResponseCache.getResponse({
      url: '/demo/testfile.json',
    });
    if (!this.cacheActive) this.startTimer();
    const json = await result?.json();
    console.debug('json', json);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private timerInterval?: any;

  private startTimer(): void {
    this.timeRemaining = 5;
    this.cacheActive = true;
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining === 1) {
        this.cacheActive = false;
        clearInterval(this.timerInterval);
        return;
      }
      this.timeRemaining -= 1;
    }, 1000);
  }
}
