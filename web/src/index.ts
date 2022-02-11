// dependencies
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Chart, registerables } from 'chart.js';
import { BoxPlotController } from '@sgratzl/chartjs-chart-boxplot';
Chart.register(...registerables, BoxPlotController);

// css 
import './estructura.css'
import './style.css'
import './charts/widget/charts.css'

// main 
import { init }  from './main';
init();


