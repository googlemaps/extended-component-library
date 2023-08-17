// import 'jasmine'; (google3-only)

import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Environment} from '../testing/environment.js';
import {FakeMapElement} from '../testing/fake_gmp_components.js';
import {Deferred} from '../utils/deferred.js';

import {MapController} from './map_controller.js';

@customElement('gmpx-test-map-controller-host')
class TestMapControllerHost extends LitElement {
  mapController = new MapController(this);
}

describe('MapController', () => {
  const env = new Environment();

  beforeAll(() => {
    env.defineFakeMapElement();
  });

  async function prepareMapElement(): Promise<FakeMapElement> {
    const root = env.render(html`<gmp-map></gmp-map>`);
    await env.waitForStability();
    return root.querySelector('gmp-map')!;
  }

  it('has the map undefined before connecting', async () => {
    const host = new TestMapControllerHost();
    expect(host.mapController.map).toBeUndefined();
  });

  it('has the map promise unresolved before connecting', async () => {
    const host = new TestMapControllerHost();
    await expectAsync(host.mapController.mapPromise).toBePending();
  });

  it('gets a direct parent map', async () => {
    const mapElement = await prepareMapElement();
    const host = mapElement.appendChild(new TestMapControllerHost());
    expect(host.mapController.map).toBe(mapElement.innerMap);
  });

  it('gets a grandparent map', async () => {
    const mapElement = await prepareMapElement();
    const div = mapElement.appendChild(document.createElement('div'));
    const host = div.appendChild(new TestMapControllerHost());
    expect(host.mapController.map).toBe(mapElement.innerMap);
  });

  it('gets a map from inside a shadow DOM', async () => {
    const mapElement = await prepareMapElement();
    const div = mapElement.appendChild(document.createElement('div'));
    const divShadow = div.attachShadow({mode: 'open'});
    const host = divShadow.appendChild(new TestMapControllerHost());

    expect(host.mapController.map).toBe(mapElement.innerMap);
  });

  it('gets a map from inside two shadow DOMs', async () => {
    const mapElement = await prepareMapElement();
    const div = mapElement.appendChild(document.createElement('div'));
    const divShadow = div.attachShadow({mode: 'open'});
    const span = divShadow.appendChild(document.createElement('span'));
    const spanShadow = span.attachShadow({mode: 'open'});
    const host = spanShadow.appendChild(new TestMapControllerHost());

    expect(host.mapController.map).toBe(mapElement.innerMap);
  });

  it('resolves the promise', async () => {
    const mapElement = await prepareMapElement();
    const host = mapElement.appendChild(new TestMapControllerHost());
    await expectAsync(host.mapController.mapPromise)
        .toBeResolvedTo(mapElement.innerMap);
  });

  it('resets when disconnecting', async () => {
    const mapElement = await prepareMapElement();
    const host = mapElement.appendChild(new TestMapControllerHost());
    mapElement.removeChild(host);

    expect(host.mapController.map).toBeUndefined();
    await expectAsync(host.mapController.mapPromise).toBePending();
  });

  it('gets the new map when moved to a different map', async () => {
    const root = env.render(html`<gmp-map></gmp-map><gmp-map></gmp-map>`);
    await env.waitForStability();
    const [mapElement1, mapElement2] = root.querySelectorAll('gmp-map');
    const host = mapElement1.appendChild(new TestMapControllerHost());
    mapElement2.appendChild(host);

    expect(host.mapController.map).toBe(mapElement2.innerMap);
    await expectAsync(host.mapController.mapPromise)
        .toBeResolvedTo(mapElement2.innerMap);
  });

  it('waits for <gmp-map> to be defined', async () => {
    const whenGmpMapDefined = new Deferred<typeof FakeMapElement>();
    spyOn(customElements, 'get').and.returnValue(undefined);
    spyOn(customElements, 'whenDefined')
        .and.returnValue(whenGmpMapDefined.promise);

    const mapElement = await prepareMapElement();
    const host = mapElement.appendChild(new TestMapControllerHost());
    const mapPromise = host.mapController.mapPromise;
    await env.waitForStability();
    whenGmpMapDefined.resolve(FakeMapElement);
    await env.waitForStability();

    expect(host.mapController.map).toBe(mapElement.innerMap);
    await expectAsync(mapPromise).toBeResolvedTo(mapElement.innerMap);
  });

  it('handles connect -> disconnect -> define <gmp-map>', async () => {
    const whenGmpMapDefined = new Deferred<typeof FakeMapElement>();
    spyOn(customElements, 'get').and.returnValue(undefined);
    spyOn(customElements, 'whenDefined')
        .and.returnValue(whenGmpMapDefined.promise);

    const mapElement = await prepareMapElement();
    const host = mapElement.appendChild(new TestMapControllerHost());
    mapElement.removeChild(host);
    await env.waitForStability();
    whenGmpMapDefined.resolve(FakeMapElement);
    await env.waitForStability();

    expect(host.mapController.map).toBeUndefined();
    await expectAsync(host.mapController.mapPromise).toBePending();
  });

  it('gets the map when the host is rendered in markup', async () => {
    const root = env.render(html`
      <gmp-map>
        <gmpx-test-map-controller-host>
        </gmpx-test-map-controller-host>
      </gmp-map>
    `);
    await env.waitForStability();
    const mapElement = root.querySelector<FakeMapElement>('gmp-map')!;
    const host = root.querySelector<TestMapControllerHost>(
        'gmpx-test-map-controller-host')!;

    expect(host.mapController.map).toBe(mapElement.innerMap);
  });

  it('sets the viewport manager', async () => {
    const mapElement = await prepareMapElement();
    const host = mapElement.appendChild(new TestMapControllerHost());
    const viewportManager = host.mapController.viewportManager;

    expect(viewportManager).toBeDefined();
    expect(viewportManager!.map).toBe(mapElement);
  });

  it('updates the viewport manager when moved to a different map', async () => {
    const root = env.render(html`<gmp-map></gmp-map><gmp-map></gmp-map>`);
    await env.waitForStability();
    const [mapElement1, mapElement2] = root.querySelectorAll('gmp-map');
    const host = mapElement1.appendChild(new TestMapControllerHost());
    mapElement2.appendChild(host);

    expect(host.mapController.viewportManager!.map).toBe(mapElement2);
  });
});
