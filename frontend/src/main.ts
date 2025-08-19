import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { Chart, ArcElement, DoughnutController, Legend, Tooltip, } from 'chart.js';

Chart.register(ArcElement, DoughnutController, Legend, Tooltip);
ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
