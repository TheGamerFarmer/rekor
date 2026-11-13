import { TestBed } from '@angular/core/testing';
import { InscriptionService } from './inscription.service';

describe('InscriptionService', () => {
  let service: InscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InscriptionService],
    });
    service = TestBed.inject(InscriptionService);
  });

  it('completes registration without calling the backend', () => {
    let completed = false;

    service
      .register({
        associationName: 'Gières Volley-Ball',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'Motdepasse1!',
        pronoun: 'Elle',
        phone: '0600000000',
        birthday: '',
      })
      .subscribe({ complete: () => (completed = true) });

    expect(completed).toBe(true);
  });

  it('does not expose a backend error', () => {
    expect(() =>
      service.register({
        associationName: 'Gières Volley-Ball',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'Motdepasse1!',
        pronoun: 'Elle',
        phone: '0600000000',
        birthday: '',
      }),
    ).not.toThrow();
  });
});
