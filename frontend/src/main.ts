import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Registrar Chart.js components para ng2-charts
import {
  Chart,
  ArcElement,
  DoughnutController,
  Legend,
  Tooltip,
} from 'chart.js';

Chart.register(ArcElement, DoughnutController, Legend, Tooltip);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
