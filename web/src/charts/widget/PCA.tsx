import { Chart } from "chart.js";
import { ARTISTS } from "../../main";
import { MSDOption } from "../../components/MSD/MSD";
import { Settings } from "../../components/Settings";


export class ChartPCA {

    /* === declarations === */
    canvas:  HTMLCanvasElement;
    chart?:  Chart;
    registers?: { [id: string]: number }
    
    
    /* === constructor === */
    constructor (canvas: HTMLCanvasElement) {

        this.canvas = canvas;
    }
    
    /* === plot === */
    plot (selected: MSDOption[], settings: Settings["settings"]["PCA"]) {

        if (this.chart instanceof Chart) {
            this.chart.destroy();
        }
        const datasets = this.createDatasets(selected);
        const options = this.createOptions();
        
        this.chart = new Chart (this.canvas, {
            type: "scatter",
            data: { 
                "datasets": datasets 
            },
            options: options
        });
    }

    createOptions () {
        return {
            responsive: true,   
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => {
                            const label = [
                                `${ctx.raw.track_name} (${ctx.parsed.x}, ${ctx.parsed.y})`,
                                `${ctx.dataset.label} - ${ctx.dataset.artist_name}`
                            ]
                            return label
                        }
                    }
                }
            }
        }
    }

    createDatasets (selected: MSDOption[]) {

        if (!ARTISTS) throw new Error ("uninitialzed ARTISTS global.");
        
        let datasets = [];
        for (let option of selected) {
            if (!option.data.id) continue;
            
            const artist = ARTISTS[option.data.id] as Dataset; // def. en main.ts
            for (let i = 0; i < artist.albums?.length || 0; ++i) {
                const album = artist.albums[i];    
                datasets.push(this.newDataset(artist, album, option.data.color ?? ""));
            }
        }
        return datasets;
    }

    newDataset (artist: Dataset, album: Dataset["albums"][0], color: string) {

        return {
            "artist_name": artist.artist_name,
            "artist_id": artist.artist_id,
            "album_id": album.album_id,
            "label": album.album_name,
            "data": album.tracks,
            "backgroundColor": color,
            "borderColor": color,
            "pointRadius": 5, 
            "pointHoverRadius": 10
        }
    }
}