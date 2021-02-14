import { html, fixture, expect } from '@open-wc/testing';

import { BrowserResponseCache } from '../src/BrowserResponseCache.js';
import '../browser-response-cache.js';

describe('BrowserResponseCache', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture<BrowserResponseCache>(html`<browser-response-cache></browser-response-cache>`);

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<BrowserResponseCache>(html`<browser-response-cache></browser-response-cache>`);
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el = await fixture<BrowserResponseCache>(html`<browser-response-cache title="attribute title"></browser-response-cache>`);

    expect(el.title).to.equal('attribute title');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BrowserResponseCache>(html`<browser-response-cache></browser-response-cache>`);

    await expect(el).shadowDom.to.be.accessible();
  });
});
