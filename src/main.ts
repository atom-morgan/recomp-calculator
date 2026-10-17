import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initAnalytics } from './app/analytics';

initAnalytics();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
