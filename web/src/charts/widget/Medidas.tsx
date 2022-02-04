import { Chart } from 'chart.js';

import { ARTISTS } from "../../main";
import { MSDOption } from "../../components/MSD/MSD";
import { Settings } from '../../components/Settings';
import { milisToTime, numberFormatter, percentFormatter } from '../../utils/IntlFormats';


const medidas = {
    tempo: 0,
    loudness: 1,
    duration_ms: 2
}

const summary = {
    min: 0, 
    q1: 1, 
    median: 2, 
    q3: 3, 
    max: 4,
    mean: 5, 
    std: 6, 
    count: 7
}

export class ChartMedidas {

    canvasTempo: HTMLCanvasElement;
    canvasLoudness: HTMLCanvasElement;
    canvasDuration: HTMLCanvasElement;
    chartTempo?: Chart;
    chartLoudness?: Chart;
    chartDuration?: Chart;

    constructor (t: HTMLCanvasElement, l: HTMLCanvasElement, d: HTMLCanvasElement) {

        this.canvasTempo = t;
        this.canvasLoudness = l;
        this.canvasDuration = d;
    }

    plot (selected: MSDOption[], settings: Settings["settings"]["medidas"]) {

        if (this.chartTempo instanceof Chart) {
            this.chartTempo.destroy();
        }
        if (this.chartLoudness instanceof Chart) {
            this.chartLoudness.destroy();
        }
        if (this.chartDuration instanceof Chart) {
            this.chartDuration.destroy();
        }

        const datasets = this.createDatasets(selected, settings, 0);
        const options = this.createOptions(medidas.tempo);
        //@ts-expect-error: custom chart type and dataset
        this.chartTempo = new Chart(this.canvasTempo, {
            type: 'boxplot',
            data: {
                labels:[
                    'tempo'
                ],
                'datasets': datasets
            },
            //@ts-expect-error
            options: options
        });

        
        const datasetsB = this.createDatasets(selected, settings, 1);
        const optionsB = this.createOptions(medidas.loudness);
        //@ts-expect-error: custom chart type and dataset
        this.chartLoudness = new Chart(this.canvasLoudness, {
            type: 'boxplot',
            data: {
                labels:[
                    'loudness'
                ],
                'datasets': datasetsB
            },
            //@ts-expect-error
            options: optionsB
        });

        const datasetsC = this.createDatasets(selected, settings, 2);
        const optionsC = this.createOptions(medidas.duration_ms);
        //@ts-expect-error: custom chart type and dataset
        this.chartDuration = new Chart(this.canvasDuration, {
            type: 'boxplot',
            data: {
                labels:[
                    'duration_ms'
                ],
                'datasets': datasetsC
            },
            //@ts-expect-error
            options: optionsC
        });
    }

    createOptions (t: number) {

        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: (value: number, index: number, data: any) => {
                            const tick =
                                t === 0 ? value + ' bpm':
                                t === 1 ? value + ' db':
                                milisToTime(value);
                            return tick
                        }
                    }
                    // ticks:{
                    //     format: {
                    //         style: 'percent'
                    //     }
                    // },
                    // min: 0,
                    // max: 1
                    // min: t === 0? 0 : t === 1? -36: 0,
                    // max: t === 0? 0 : t === 1? 6: undefined,
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (ctx: any) => {
                            const title = ctx[0].dataset.album_name ?? ctx[0].dataset.artist_name
                            return title
                        },
                        label: (ctx: any) => {
                            const label = [
                                ctx.label,
                                `max: ${
                                    t === 0? `${numberFormatter.format(ctx.raw.max)} bpm`:
                                    t === 1? `${numberFormatter.format(ctx.raw.max)} db`:
                                    `${milisToTime(ctx.raw.max)}`
                                }`,
                                `q3: ${
                                    t === 0? `${numberFormatter.format(ctx.raw.q3)} bpm`:
                                    t === 1? `${numberFormatter.format(ctx.raw.q3)} db`:
                                    `${milisToTime(ctx.raw.q3)}`
                                }`,
                                `mediana: ${
                                    t === 0? `${numberFormatter.format(ctx.raw.median)} bpm`:
                                    t === 1? `${numberFormatter.format(ctx.raw.median)} db`:
                                    `${milisToTime(ctx.raw.median)}`
                                }`,
                                `q1: ${
                                    t === 0? `${numberFormatter.format(ctx.raw.q1)} bpm`:
                                    t === 1? `${numberFormatter.format(ctx.raw.q1)} db`:
                                    `${milisToTime(ctx.raw.q1)}`
                                }`,
                                `min: ${
                                    t === 0? `${numberFormatter.format(ctx.raw.min)} bpm`:
                                    t === 1? `${numberFormatter.format(ctx.raw.min)} db`:
                                    `${milisToTime(ctx.raw.min)}`
                                }`,
                                `media: ${
                                    t === 0? `${numberFormatter.format(ctx.raw.mean)} bpm`:
                                    t === 1? `${numberFormatter.format(ctx.raw.mean)} db`:
                                    `${milisToTime(ctx.raw.mean)}`
                                }`,
                                `std: ${
                                    t === 0? `${numberFormatter.format(ctx.raw.std)} bpm`:
                                    t === 1? `${numberFormatter.format(ctx.raw.std)} db`:
                                    `${milisToTime(ctx.raw.std)}`
                                }`,
                                `total: ${
                                    t === 0? `${numberFormatter.format(ctx.raw.count)}`:
                                    t === 1? `${numberFormatter.format(ctx.raw.count)}`:
                                    `${numberFormatter.format(ctx.raw.count)}`
                                }`
                            ]
                            return label
                        }
                    }
                }
            }
        }
    }

    createDatasets (selected: MSDOption[], settings: Settings["settings"]["medidas"], d: number) {

        if (!ARTISTS) throw new Error ('uninitialzed ARTISTS global.');
        
        let datasets = [];
        for (let option of selected) {
            if (!option.data.id) continue;

            const artist = ARTISTS[option.data.id] as Dataset;  // def en main.ts   
            if (settings.comparar === "artistas") {
                datasets.push(this.newDataset(artist, artist.artist_id, artist.artist_name, option.data.color ?? '', d));
            }
            else 
                for (let i = 0; i < artist.albums?.length || 0; ++i) {
                    const album = artist.albums[i];
                    datasets.push(this.newDataset(album, artist.artist_id, artist.artist_name, option.data.color ?? '', d));
                } 
        } 
        return datasets;
    }

    newDataset (source: Dataset | Dataset['albums'][0], artist_id: string, artist_name: string, color: string, d: number) {
        return {
            album_id: (source as Dataset['albums'][0]).album_id,
            album_name: (source as Dataset['albums'][0]).album_name,
            artist_name: artist_name,
            artist_id: artist_id,
            data: [{
                    min: source.measures_summary[d][summary.min], 
                    q1: source.measures_summary[d][summary.q1], 
                    median: source.measures_summary[d][summary.median], 
                    q3: source.measures_summary[d][summary.q3], 
                    max: source.measures_summary[d][summary.max], 
                    mean: source.measures_summary[d][summary.mean],
                    std: source.measures_summary[d][summary.std],
                    count: source.measures_summary[d][summary.count],
                    outliers: [source.measures_summary[d][summary.min], source.measures_summary[d][summary.max]]
                }],
            label: 'features',
            backgroundColor: color + "aa",
            borderColor: color,
            borderWidth: 1,
            outlierBackgroundColor: color,
            outlierRadius: 2,
            padding: 10,
        };
    }
}

