import { Chart } from 'chart.js';

import { ARTISTS } from "../../main";
import { MSDOption } from "../../components/MSD/MSD";
import { Settings } from '../../components/Settings';
import { numberFormatter, percentFormatter } from '../../utils/IntlFormats';


const predictores = {
    danceability: 0,
    energy: 1,
    valence: 2,
    speechiness: 3,
    acousticness: 4,
    instrumental: 5,
    liveness: 6
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

export class ChartAtributos {

    canvas: HTMLCanvasElement;
    chart?: Chart;

    constructor (canvas: HTMLCanvasElement) {

        this.canvas = canvas;
    }

    plot (selected: MSDOption[], settings: Settings["settings"]["atributos"]) {

        if (this.chart instanceof Chart) {
            this.chart.destroy();
        }
        const datasets = this.createDatasets(selected, settings);
        const options = this.createOptions();
        //@ts-expect-error: custom chart type and dataset
        this.chart = new Chart(this.canvas, {
            type: 'boxplot',
            data: {
                labels:[
                    'danceability' ,
                    'energy' ,
                    'valence' ,
                    'speechiness' ,
                    'acousticness' ,
                    'instrumental' ,
                    'liveness'
                ],
                'datasets': datasets
            },
            options: options
        });
    }

    createOptions () {

        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks:{
                        format: {
                            style: 'percent'
                        }
                    },
                    min: 0,
                    max: 1
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
                                `max: ${percentFormatter.format(ctx.raw.max)}`,
                                `q3: ${percentFormatter.format(ctx.raw.q3)}`,
                                `mediana: ${percentFormatter.format(ctx.raw.median)}`,
                                `q1: ${percentFormatter.format(ctx.raw.q1)}`,
                                `min: ${percentFormatter.format(ctx.raw.min)}`,
                                `media: ${percentFormatter.format(ctx.raw.mean)}`,
                                `std: ${percentFormatter.format(ctx.raw.std)}`,
                                `total: ${numberFormatter.format(ctx.raw.count)}`
                            ]
                            return label
                        }
                    }
                }
            }
        }
    }

    createDatasets (selected: MSDOption[], settings: Settings["settings"]["atributos"]) {

        if (!ARTISTS) throw new Error ('uninitialzed ARTISTS global.');
        let datasets = [];
        for (let option of selected) {
            if (!option.data.id) continue;

            const artist = ARTISTS[option.data.id] as Dataset;  // def en main.ts   
            if (settings.comparar === "artistas") 
                datasets.push(this.newDataset(artist, artist.artist_id, artist.artist_name, option.data.color ?? ''));
            else
                for (let i = 0; i < artist.albums?.length || 0; ++i) {
                    const album = artist.albums[i];
                    datasets.push(this.newDataset(album, artist.artist_id, artist.artist_name, option.data.color ?? ''));
                } 
        } 
        return datasets;
    }

    newDataset (source: Dataset | Dataset['albums'][0], artist_id: string, artist_name: string, color: string) {
      
        return {
            album_id: (source as Dataset['albums'][0]).album_id,
            album_name: (source as Dataset['albums'][0]).album_name,
            artist_name: artist_name,
            artist_id: artist_id,
            data: [{
                    min: source.features_summary[predictores.danceability][summary.min], 
                    q1: source.features_summary[predictores.danceability][summary.q1], 
                    median: source.features_summary[predictores.danceability][summary.median], 
                    q3: source.features_summary[predictores.danceability][summary.q3], 
                    max: source.features_summary[predictores.danceability][summary.max], 
                    mean: source.features_summary[predictores.danceability][summary.mean],
                    std: source.features_summary[predictores.danceability][summary.std],
                    count: source.features_summary[predictores.danceability][summary.count],
                    outliers: [
                        source.features_summary[predictores.danceability][summary.min], 
                        source.features_summary[predictores.danceability][summary.max]
                    ]
                }, {
                    min: source.features_summary[predictores.energy][summary.min], 
                    q1: source.features_summary[predictores.energy][summary.q1], 
                    median: source.features_summary[predictores.energy][summary.median], 
                    q3: source.features_summary[predictores.energy][summary.q3], 
                    max: source.features_summary[predictores.energy][summary.max], 
                    mean: source.features_summary[predictores.energy][summary.mean],
                    std: source.features_summary[predictores.energy][summary.std],
                    count: source.features_summary[predictores.energy][summary.count],
                    outliers: [
                        source.features_summary[predictores.energy][summary.min], 
                        source.features_summary[predictores.energy][summary.max]
                    ]
                }, {
                    min: source.features_summary[predictores.valence][summary.min], 
                    q1: source.features_summary[predictores.valence][summary.q1], 
                    median: source.features_summary[predictores.valence][summary.median], 
                    q3: source.features_summary[predictores.valence][summary.q3], 
                    max: source.features_summary[predictores.valence][summary.max], 
                    mean: source.features_summary[predictores.valence][summary.mean],
                    std: source.features_summary[predictores.valence][summary.std],
                    count: source.features_summary[predictores.valence][summary.count],
                    outliers: [
                        source.features_summary[predictores.valence][summary.min], 
                        source.features_summary[predictores.valence][summary.max]
                    ]
                }, {
                    min: source.features_summary[predictores.speechiness][summary.min], 
                    q1: source.features_summary[predictores.speechiness][summary.q1], 
                    median: source.features_summary[predictores.speechiness][summary.median], 
                    q3: source.features_summary[predictores.speechiness][summary.q3], 
                    max: source.features_summary[predictores.speechiness][summary.max], 
                    mean: source.features_summary[predictores.speechiness][summary.mean],
                    std: source.features_summary[predictores.speechiness][summary.std],
                    count: source.features_summary[predictores.speechiness][summary.count],
                    outliers: [
                        source.features_summary[predictores.speechiness][summary.min], 
                        source.features_summary[predictores.speechiness][summary.max]
                    ]
                }, {
                    min: source.features_summary[predictores.acousticness][summary.min], 
                    q1: source.features_summary[predictores.acousticness][summary.q1], 
                    median: source.features_summary[predictores.acousticness][summary.median], 
                    q3: source.features_summary[predictores.acousticness][summary.q3], 
                    max: source.features_summary[predictores.acousticness][summary.max], 
                    mean: source.features_summary[predictores.acousticness][summary.mean],
                    std: source.features_summary[predictores.acousticness][summary.std],
                    count: source.features_summary[predictores.acousticness][summary.count],
                    outliers: [
                        source.features_summary[predictores.acousticness][summary.min], 
                        source.features_summary[predictores.acousticness][summary.max]
                    ]
                }, {
                    min: source.features_summary[predictores.instrumental][summary.min], 
                    q1: source.features_summary[predictores.instrumental][summary.q1], 
                    median: source.features_summary[predictores.instrumental][summary.median], 
                    q3: source.features_summary[predictores.instrumental][summary.q3], 
                    max: source.features_summary[predictores.instrumental][summary.max], 
                    mean: source.features_summary[predictores.instrumental][summary.mean],
                    std: source.features_summary[predictores.instrumental][summary.std],
                    count: source.features_summary[predictores.instrumental][summary.count],
                    outliers: [
                        source.features_summary[predictores.instrumental][summary.min], 
                        source.features_summary[predictores.instrumental][summary.max]
                    ]
                }, {
                    min: source.features_summary[predictores.liveness][summary.min], 
                    q1: source.features_summary[predictores.liveness][summary.q1], 
                    median: source.features_summary[predictores.liveness][summary.median], 
                    q3: source.features_summary[predictores.liveness][summary.q3], 
                    max: source.features_summary[predictores.liveness][summary.max], 
                    mean: source.features_summary[predictores.liveness][summary.mean],
                    std: source.features_summary[predictores.liveness][summary.std],
                    count: source.features_summary[predictores.liveness][summary.count],
                    outliers: [
                        source.features_summary[predictores.liveness][summary.min], 
                        source.features_summary[predictores.liveness][summary.max]
                    ]
                }
            ],
            label: 'features',
            yAxisID: 'y',
            backgroundColor: color + "aa",
            borderColor: color,
            borderWidth: 1,
            outlierBackgroundColor: color,
            outlierRadius: 2,
            padding: 10,
            itemRadius: 0
        };
    }
}
