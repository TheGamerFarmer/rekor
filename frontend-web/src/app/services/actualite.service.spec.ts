import { TestBed } from '@angular/core/testing';
import { ActualiteService } from './actualite.service';
import { actualites } from '../components/component-actualite/actualites.data';

describe('ActualiteService', () => {
  const values = {
    titre: 'Nouvelle actualité',
    summary: 'Résumé',
    image: '/images/volley2.jpg',
    date: '2026-12-01',
    association: 'Gières Volley-Ball',
    corps: 'Contenu',
  };

  beforeEach(() => {
    localStorage.removeItem('rekor-actualites');
  });

  afterEach(() => {
    localStorage.removeItem('rekor-actualites');
  });

  it('adds news before the defaults and restores it with its identifier', () => {
    const service = TestBed.inject(ActualiteService);
    service.add(values);
    expect(service.actualites()[0]).toEqual({ id: 5, ...values });
    expect(service.actualites()).toHaveLength(actualites.length + 1);
    TestBed.resetTestingModule();
    const restored = TestBed.inject(ActualiteService);
    expect(restored.findById(5)).toEqual({ id: 5, ...values });
    restored.add(values);
    expect(restored.actualites()[0].id).toBe(6);
  });

  it('reports invalid stored data and refuses to overwrite it', () => {
    localStorage.setItem('rekor-actualites', '{invalid');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const service = TestBed.inject(ActualiteService);
    expect(service.hasStorageError()).toBe(true);
    expect(service.actualites()).toEqual(actualites);
    expect(() => service.add(values)).toThrow();
    expect(localStorage.getItem('rekor-actualites')).toBe('{invalid');
    consoleError.mockRestore();
  });

  it('does not publish the news when persistence fails', () => {
    const service = TestBed.inject(ActualiteService);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full');
    });
    expect(() => service.add(values)).toThrow();
    expect(service.actualites()).toEqual(actualites);
    setItem.mockRestore();
  });
});
