declare interface ArtistsObject {
    [spotifyId: string]: string | Dataset
}


declare interface Dataset {
    artist_id: string,
    artist_name: string,
    features_summary: FeaturesSummary,
    measures_summary: MeasuresSummary,
    key_counts: KeyCounts,
    albums: {
        album_id: string,
        album_name: string,
        features_summary: FeaturesSummary,
        measures_summary: MeasuresSummary,
        key_counts: KeyCounts,
        tracks: {
            track_id: string,
            track_name: string,
            x: PCAX;
            y: PCAY;
            features: Features,
            measures: Measures,
            key: Key
            mode: Mode
        }[]
    }[]
}

declare interface AttributeHistogram {
    labels: (string | number)[]
    data: {
        [year: string]: {
            hist: number[],
            hist_density: number[],
            color: string[],
            hidden: boolean[]
        }
    }
}

declare interface GenresDistribution {
    genres: {
        [genre: string]: {
            subgenres: string[],
            total: number
        }
    }
    represented: number,
    total: number
}

declare interface ReleaseSeries {
    albums: number[],
    singles: number[],
    labels: string[]
}

declare interface TonalitySeries {
    "labels": string[],
    "keys": {
        'C': TonalityConstructor,
        'C#Db': TonalityConstructor,
        'D': TonalityConstructor,
        'D#Eb': TonalityConstructor,
        'E': TonalityConstructor,
        'F': TonalityConstructor,
        'F#Gb': TonalityConstructor,
        'G': TonalityConstructor,
        'G#Ab': TonalityConstructor,
        'A': TonalityConstructor,
        'A#Bb': TonalityConstructor,
        'B': TonalityConstructor
    }
}

declare interface FollowersDist {
    labels: number[];
    data: {
        hist: number[];
        hist_density: number[];
        color: string[];
    }
}


// other - Dataset
declare type min = number;
declare type q1 = number;
declare type median = number;
declare type q3 = number;
declare type max = number;
declare type mean = number;
declare type std = number;
declare type count = number;
declare type Summary<Attribute> = [min, q1, median, q3, max, mean, std, count]

declare type Attribute = danceability | energy | valence | speechiness | acousticness | 
    instrumentalness | liveness | tempo | loudness | duration

declare type danceability = number;
declare type energy = number;
declare type valence = number;
declare type speechiness = number;
declare type acousticness = number;
declare type instrumentalness = number;
declare type liveness = number;
declare type Features = [
    danceability,
    energy,
    valence,
    speechiness,
    acousticness,
    instrumentalness,
    liveness
]
declare type FeaturesSummary = [
    Summary<danceability>,
    Summary<energy>,
    Summary<valence>,
    Summary<speechiness>,
    Summary<acousticness>,
    Summary<instrumentalness>,
    Summary<liveness>
]

declare type tempo = number;
declare type loudness = number;
declare type duration = number;
declare type Measures = [
    tempo,
    loudness,
    duration
]
declare type MeasuresSummary = [
    Summary<tempo>,
    Summary<loudness>,
    Summary<duration>
]

declare type Count<key> = number;
declare type key_c = 0;
declare type key_db = 1;
declare type key_d = 2;
declare type key_eb = 3;
declare type key_e = 4;
declare type key_f = 5;
declare type key_gb = 6;
declare type key_g = 7;
declare type key_ab = 8;
declare type key_a = 9;
declare type key_bb = 10;
declare type key_b = 11;
declare type Key = key_c | key_db | key_d | key_eb | key_e | key_f | key_gb | key_g | 
    key_ab | key_a | key_bb | key_b
declare type Mode = Minor | Mayor
declare type Minor = 0
declare type Mayor = 1
declare type KeyCount<Mode> = [
    Count<key_f>,
    Count<key_c>,
    Count<key_g>,
    Count<key_d>,
    Count<key_a>,
    Count<key_e>,
    Count<key_b>,
    Count<key_gb>,
    Count<key_db>,
    Count<key_ab>,
    Count<key_eb>,
    Count<key_bb>
];
declare type KeyCounts = [KeyCount<Minor>, KeyCount<Mayor>]

declare type PCAX = number;
declare type PCAY = number;


// other - TonalitySeries
declare type TonalityConstructor = {
    "color": string,
    "hist": number[]
}