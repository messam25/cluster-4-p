import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseCompatService {
  private db: any = null;

  firestore(): any {
    if (this.db) {
      return this.db;
    }
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase compat scripts are missing from index.html');
    }
    if (!firebase.apps?.length) {
      firebase.initializeApp(environment.firebase);
    }
    this.db = firebase.firestore();
    return this.db;
  }

  auth(): any {
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase compat scripts are missing from index.html');
    }
    if (!firebase.apps?.length) {
      firebase.initializeApp(environment.firebase);
    }
    return firebase.auth();
  }
}
