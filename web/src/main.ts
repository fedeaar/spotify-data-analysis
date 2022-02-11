
import { MSD, MSDOption } from "./components/MSD/MSD";
import { TL, TLConstructor } from "./components/ToggleList/toggleList";

import { ChartTonalidad } from "./charts/widget/Tonalidad";
import { ChartPCA } from './charts/widget/PCA';
import { ChartAtributos } from "./charts/widget/Atributos";
import { ChartMedidas } from "./charts/widget/Medidas";
import { Settings } from './components/Settings';


/* Global structure *\
-----------------------------------------------------------------------------------------------------------*/

// main DOM elements

const searchBarElement = document.getElementById("nav-search-bar") as HTMLElement;

const settingsElement = document.getElementById("SETTINGS") as HTMLElement;

const tabAboutElement = document.getElementById("tab-about") as HTMLElement;
const tabPCAelement = document.getElementById("tab-PCA") as HTMLElement;
const tabAtributosElement = document.getElementById("tab-atributos") as HTMLElement;
const tabMedicionesElement = document.getElementById("tab-medidas") as HTMLElement;
const tabTonalidadElement = document.getElementById("tab-tonalidad") as HTMLElement;

const aboutElement = document.getElementById("about-window") as HTMLElement;
const plotPCAelement = document.getElementById("plot-PCA") as HTMLElement;
const plotAtributosElement = document.getElementById("plot-atributos") as HTMLElement;
const plotMedicionesElement = document.getElementById("plot-medidas") as HTMLElement;
const plotTonalidadElement = document.getElementById("plot-tonalidad") as HTMLElement;

const canvasPCAelement = document.getElementById("canvas-PCA") as HTMLCanvasElement;
const canvasAtributosElement = document.getElementById("canvas-atributos") as HTMLCanvasElement;
const canvasMedicionesElementTempo = document.getElementById("canvas-medidas-tempo") as HTMLCanvasElement;
const canvasMedicionesElementLoudness = document.getElementById("canvas-medidas-loudness") as HTMLCanvasElement;
const canvasMedicionesElementDuration = document.getElementById("canvas-medidas-duration_ms") as HTMLCanvasElement;
const canvasTonalidadElement = document.getElementById("canvas-tonalidad") as HTMLCanvasElement;

const acordeonElement = document.getElementById("opciones-acordeon") as HTMLElement;

const main_window = document.getElementById("main-window") as HTMLElement;

// globals

const DBINDEXPATH = "../../../database/generated/artistas.json";
const DBPATH = "../../../database/generated/datasets";

export var ARTISTS: ArtistsObject;
const URLPARAMS = parseURL();
var CURRENT: MSDOption[] = [];
var CURRENTTAB = URLPARAMS.tab || 'PCA';
switch (CURRENTTAB) {
case 'tonalidad': 
    tabSelect(tabTonalidadElement, plotTonalidadElement);
    break;
case 'predictores':
    tabSelect(tabAtributosElement, plotAtributosElement);
    break; 
case 'mediciones': 
    tabSelect(tabMedicionesElement, plotMedicionesElement);
    break;
case 'ACP': 
default: 
    break;
}

// DOM classes

const settings = new Settings();
settingsElement.appendChild(settings.element);

const searchBar = new MSD();
searchBarElement.appendChild(searchBar.element);

const toggleList = new TL();
acordeonElement.appendChild(toggleList.element);

const chartPCA = new ChartPCA(canvasPCAelement);
const chartAtributos = new ChartAtributos(canvasAtributosElement);
const chartMedidas = new ChartMedidas(canvasMedicionesElementTempo, canvasMedicionesElementLoudness, canvasMedicionesElementDuration);
const chartTonalidad = new ChartTonalidad(canvasTonalidadElement);


/* Global Events *\
-----------------------------------------------------------------------------------------------------------*/

// search event

searchBar.element.addEventListener("MSD", async (event: CustomEventInit) => {

    CURRENT = event.detail.selectedOptions;
    await loadCurrent();
    if (CURRENT.length > 0) tabSelect(tabPCAelement, plotPCAelement);
    update();
});

// settings event
settings.element.addEventListener("settingsChange", (event: CustomEventInit) => {

    update();
})

// tab select event
tabAboutElement.addEventListener("click", () => {
    tabSelect(tabAboutElement, aboutElement);
});
tabPCAelement.addEventListener("click", () => {
    tabSelect(tabPCAelement, plotPCAelement);
});
tabAtributosElement.addEventListener("click", () => {
    tabSelect(tabAtributosElement, plotAtributosElement);
});
tabTonalidadElement.addEventListener("click", () => {
    tabSelect(tabTonalidadElement, plotTonalidadElement);
});
tabMedicionesElement.addEventListener("click", () => {
    tabSelect(tabMedicionesElement, plotMedicionesElement);
});


/* Resource loading *\
-----------------------------------------------------------------------------------------------------------*/

async function loadJSON (path: string): Promise<any> {
    
    let response = await fetch(path);
    let json = await response.json();
    return json;
}

async function loadArtistJSON (artist_id: string): Promise<void> {
    
    if (typeof ARTISTS[artist_id] !== "string") return;

    const json = await loadJSON(`${DBPATH}/${artist_id}.json`);
    ARTISTS[artist_id] = json;
}

async function loadCurrent (): Promise<void> {

    for (const option of CURRENT) {
        if (!option.data.id) throw new Error ("no id value stored in option.");
        await loadArtistJSON(option.data.id);
    }
}

// initial load

async function initialLoad (): Promise<void> {
    
    ARTISTS = await loadJSON(DBINDEXPATH);
    if (!ARTISTS) throw Error ("failed to initialize ARTISTS.");
}

export function init (): void {

    initialLoad().then(() => populateSearchBar());
}



/* DOM main update *\
-----------------------------------------------------------------------------------------------------------*/

function update (): void {
    
    const TLConstructors = []
    for (const option of CURRENT) {
        const constructor = MSDOptionToTLConstructor(option);
        TLConstructors.push(constructor);
    }
    toggleList.createInnerElements(TLConstructors);
    build();
}

function build (): void {

    buildPCA();
    buildAtributos();
    buildMedidas();
    buildTonalidad();
}

function buildPCA (): void {

    chartPCA.plot(CURRENT, settings.settings.PCA);
    if (chartPCA.chart) {

        toggleList.link(chartPCA.chart, 'PCA');
    }
}

function buildAtributos (): void {

    chartAtributos.plot(CURRENT, settings.settings.atributos);
    if (chartAtributos.chart) {

        toggleList.link(chartAtributos.chart, 'atributos');
    }
}

function buildMedidas (): void {

    chartMedidas.plot(CURRENT, settings.settings.medidas);
    if (chartMedidas.chartTempo) {

        toggleList.link(chartMedidas.chartTempo, 'medidas-Tempo');
    }
    if (chartMedidas.chartLoudness) {

        toggleList.link(chartMedidas.chartLoudness, 'medidas-Loudness');
    }
    if (chartMedidas.chartDuration) {

        toggleList.link(chartMedidas.chartDuration, 'medidas-Duration');
    }
}

function buildTonalidad (): void {

    chartTonalidad.plot(CURRENT, settings.settings.tonalidad);
    if (chartTonalidad.chart) {

        toggleList.link(chartTonalidad.chart, 'tonalidad');
    }
}


/*  helper *\
-----------------------------------------------------------------------------------------------------------*/

function tabSelect (tabElement: HTMLElement, displayElement: HTMLElement): void {

    plotPCAelement.style.display = "none";
    plotAtributosElement.style.display = "none";
    plotTonalidadElement.style.display = "none";
    plotMedicionesElement.style.display = "none";
    aboutElement.style.display = "none";
    
    tabPCAelement.classList.remove("active");
    tabAtributosElement.classList.remove("active");
    tabTonalidadElement.classList.remove("active");
    tabMedicionesElement.classList.remove("active");
    tabAboutElement.classList.remove("active");

    if (displayElement.id === 'about-window') {
        main_window.style.display = "none";
        displayElement.style.display = "block";
    } else {
        displayElement.style.display = "flex";
        main_window.style.display = "flex";
    }
    tabElement.classList.add("active");
}

function populateSearchBar (): void {

    for (let key in ARTISTS) { 
        
        let value = ARTISTS[key];
        if (typeof value !== "string") value = value.artist_name; // should never happen.

        const newOption = new MSDOption (searchBar, { label: value, id: key});
        searchBar.addOption(newOption, false);
        if (URLPARAMS.artistas?.includes(key)) newOption.clickEvent(true, false);
    }
    searchBar.trigger("change");
    searchBar.trigger("update");
}

function MSDOptionToTLConstructor (option: MSDOption): TLConstructor {

    if (!option.data.id) throw new Error ("no id value stored in option.");

    const constructor = {
        id:    option.data.id || "",
        label: option.data.label || "",
        color: option.data.color, 
        albums: [] as { id: string; name: string; }[]
    }
    if ((ARTISTS[option.data.id] as Dataset).albums)
        for (const album of (ARTISTS[option.data.id] as Dataset).albums) { 
            constructor.albums.push({ id: album.album_id, name: album.album_name });
        }   
    return constructor;
}

function parseURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {
        artistas: urlParams.has('a') ? urlParams.get('a')?.split(',').slice(0, 5) : undefined,
        tab: urlParams.has('t') ? urlParams.get('t') : undefined
    }
    return params;
}