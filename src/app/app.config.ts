import { ApplicationConfig, InjectionToken, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const APP_CONFIG = new InjectionToken('Application Config');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_CONFIG, useValue: environment },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)]
};
