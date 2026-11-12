import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RegisterInput } from '../api/model/registerInput';

export interface InscriptionData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  pronoun: RegisterInput.PronounEnum;
  phone: string;
  birthday: string;
}

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  /** Completes registration locally without contacting the unavailable backend. */
  register(data: InscriptionData): Observable<void> {
    void data;
    return of(undefined);
  }
}
