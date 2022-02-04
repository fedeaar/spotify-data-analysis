import { Chart } from 'chart.js';

import { ARTISTS } from "../../main";
import { MSDOption } from "../../components/MSD/MSD";
import { Settings } from '../../components/Settings';
import { percentFormatter } from '../../utils/IntlFormats';


export class ChartTonalidad {

    canvas: HTMLCanvasElement;
    config: {
        datasetStyle: {
            borderWidth: number
        }
    }
    ton = {
        menor: 0,
        mayor: 1
    }
    chart?: Chart;

    constructor (canvas: HTMLCanvasElement, config?: ChartTonalidad ['config']) {

        this.config = {
            datasetStyle: {
                borderWidth: 1
            },
            ...config
        }
        this.canvas = canvas;
    }

    /* === plot === */
    plot (selected: MSDOption[], settings: Settings["settings"]["tonalidad"]) {

        if (this.chart instanceof Chart) {
            this.chart.destroy();
        }
        const datasets = this.createDatasets(selected, settings);  
        this.chart = new Chart(this.canvas, {
            type: 'bar',
            data: {
                labels: [ 
                    "F", 
                    "C", 
                    "G", 
                    "D",
                    "A", 
                    "E", 
                    "B", 
                    "F#Gb", 
                    "C#Db", 
                    "G#Ab", 
                    "D#Eb", 
                    "A#Bb"
                ],
                'datasets': datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        ticks:{
                            format: {
                                style: settings.modalidad === "porcentaje" ? 'percent' : undefined
                            }
                        }
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
                            label: (ctx: any) => {
                                const label = `${ctx.dataset.label}: ${settings.modalidad === "porcentaje" ?
                                        percentFormatter.format(ctx.raw) :
                                        ctx.formattedValue}`
                                return label
                            }
                        }
                    }
                }
            }
        });
    }

    createDatasets (selected: MSDOption[], settings: Settings["settings"]["tonalidad"]) {
        let datasets = [], datasetsMaj = [], datasetsMen = [];
        for (let option of selected) {
            if (!option.data.id) continue;

            const artist = ARTISTS[option.data.id] as Dataset; // def. en main.ts 
            const total = settings.modalidad === "porcentaje" ? 
                [...artist.key_counts[0], ...artist.key_counts[1]].reduce((a, b) => a + b, 0) : 
                undefined;
            if (settings.comparar === "artistas") datasets.push(...this.newDataset(artist, artist.artist_id, option, total));
            else {
                for (let i = 0; i < artist.albums?.length || 0; ++i) {
                    const album = artist.albums[i];
                    const dataset = this.newDataset(album, artist.artist_id, option, total);
                    datasetsMaj.push(dataset[0]);
                    datasetsMen.push(dataset[1]);
                }
            }
        }
        datasets.push(...datasetsMaj, ...datasetsMen);
        return datasets;
    }

    newDataset (source: Dataset | Dataset["albums"][0], artist_id:string, option: MSDOption, total?: number) {
        return [
            {
                album_id: (source as Dataset["albums"][0]).album_id,
                artist_id: artist_id,

                // @ts-expect-error
                label: `${source.album_name ?? source.artist_name}, mayor`,
                data: source.key_counts[this.ton.mayor].map(x => x / (total ?? 1)),
                
                backgroundColor: option.data.color,
                borderColor:  option.data.color,
                borderWidth: this.config.datasetStyle.borderWidth,
                
                stack: option.data.id
            },
            {
                album_id: (source as  Dataset["albums"][0]).album_id,
                artist_id: artist_id,

                // @ts-expect-error
                label: `${source.album_name ?? source.artist_name}, menor`,
                data: source.key_counts[this.ton.menor].map(x => x / (total ?? 1)),

                backgroundColor: option.data.color + "99",
                borderColor:  option.data.color + "99",
                borderWidth: this.config.datasetStyle.borderWidth,

                stack: option.data.id
            }
        ];
    }
}

