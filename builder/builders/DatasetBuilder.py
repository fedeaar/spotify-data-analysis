""" DatasetBuilder.py is a module for generating 'dataset' json files.
The interface 'Dataset' is defined in types.d.ts """

import glob
import warnings

import builder.handlers.AnalisisDB as dbAN
import builder.handlers.ArtistasDB as dbAR
import builder.utils.Helper as helper
import builder.paths as paths


# --- globals ---
ARTISTAS_DB = dbAR.ArtistasDB()
ANALISIS_DB = dbAN.AnalisisDB()
PATH = paths.artistas_dataset


# --- functions ---
def batch_build(path: str = PATH) -> None:
    """ builds a dataset json for each artist in artistas db.
    :param path: the relative path for the generated json files.
    """
    artists = [x[0] for x in ARTISTAS_DB.query(f"SELECT {dbAR.KEYS['ARTISTS']} FROM {dbAR.TABLES['ARTISTS']};")]
    for artist_id in artists:
        build(artist_id, path)


def build_index(generated_path: str = PATH, path: str = paths.generated) -> None:
    """ builds an index 'artistas.json' containing 'artist_id: artist_name' key value pairs for generated 'dataset'
    files.
    :param generated_path: the relative path to the generated files.
    :param path: where to save the index file.
    """
    files = glob.glob(f"{generated_path}/*.json")
    data = {}
    for file in files:
        json = helper.load_json(file)
        data[file[28:-5]] = json['artist_name']
    helper.save_json(data, path, "artistas2")


def build(artist_id: str, path: str = PATH) -> None:
    """ builds a 'dataset' json.
    :param artist_id: the artist's spotify id.
    :param path: the relative path for the generated json file.
    """
    artist_name = ARTISTAS_DB.query(
        f"SELECT artist_name FROM {dbAR.TABLES['ARTISTS']} WHERE {dbAR.KEYS['ARTISTS']}  = '{artist_id}';"
    )[0][0]
    analisis_row = ANALISIS_DB.query(
        f"SELECT * FROM {dbAN.TABLES['ARTISTS']} WHERE {dbAN.KEYS['ARTISTS']}  = '{artist_id}';"
    )
    if len(analisis_row) == 0:
        warnings.warn(f'skipping {artist_id}: artist summary not in database.')
    else:
        analisis_row = analisis_row[0]
        data = {
            'artist_id': artist_id,
            'artist_name': artist_name,
            'features_summary': _build_features(analisis_row),
            'measures_summary': _build_measures(analisis_row),
            'key_counts': _build_key_counts(analisis_row),
            'albums': _build_albums(artist_id)
        }
        helper.save_json(data, path, artist_id)


def _build_albums(artist_id) -> list:
    albums = []
    rows = ANALISIS_DB.query(f"SELECT * FROM {dbAN.TABLES['ALBUMS']} WHERE {dbAN.KEYS['ARTISTS']}  = '{artist_id}';")
    for i, row in enumerate(rows):
        album_id = row[dbAN.ALBUMS["ALBUM_ID"]]
        album_name = ARTISTAS_DB.query(f"""
            SELECT album_name 
            FROM {dbAR.TABLES["ALBUMS"]} 
            WHERE {dbAR.KEYS["ALBUMS"]}  = '{album_id}';
        """)[0][0]
        data = {
            'album_id': album_id,
            'album_name': album_name,
            'features_summary': _build_features(row, False),
            'measures_summary': _build_measures(row, False),
            'key_counts': _build_key_counts(row, False),
            'tracks': _build_tracks(album_id)
        }
        albums.append(data)
    return albums


def _build_tracks(album_id: str) -> list:
    tracks = []
    rows = ANALISIS_DB.query(f"SELECT * FROM {dbAN.TABLES['TRACKS']} WHERE {dbAN.KEYS['ALBUMS']}  = '{album_id}';")
    for track_row in rows:
        track_id = track_row[dbAN.TRACKS["TRACK_ID"]]
        track_artist_row = ARTISTAS_DB.query(
            f"SELECT * FROM {dbAR.TABLES['TRACKS']} WHERE {dbAR.KEYS['TRACKS']}  = '{track_id}';"
        )[0]
        data = {
            'track_id': track_id,
            'track_name': track_artist_row[dbAR.TRACKS['TRACK_NAME']],
            'x': track_row[dbAN.TRACKS["GPC_X"]],
            'y': track_row[dbAN.TRACKS["GPC_Y"]],
            'features': [
                track_artist_row[dbAR.TRACKS['DANCEABILITY']],
                track_artist_row[dbAR.TRACKS['ENERGY']],
                track_artist_row[dbAR.TRACKS['VALENCE']],
                track_artist_row[dbAR.TRACKS['SPEECHINESS']],
                track_artist_row[dbAR.TRACKS['ACOUSTICNESS']],
                track_artist_row[dbAR.TRACKS['INSTRUMENTALNESS']],
                track_artist_row[dbAR.TRACKS['LIVENESS']]
            ],
            'measures': [
                track_artist_row[dbAR.TRACKS['TEMPO']],
                track_artist_row[dbAR.TRACKS['LOUDNESS']],
                track_artist_row[dbAR.TRACKS['DURATION_MS']]
            ],
            'key': track_artist_row[dbAR.TRACKS['KEY']],
            'mode': track_artist_row[dbAR.TRACKS['MODE']],
        }
        tracks.append(data)
    return tracks


def _build_features(row: tuple, from_artists: bool = True) -> list:
    table = dbAN.ARTISTS if from_artists else dbAN.ALBUMS
    return [
        [  # danceability
            row[table['DANCEABILITY_MIN']],
            row[table['DANCEABILITY_1Q']],
            row[table['DANCEABILITY_MEDIAN']],
            row[table['DANCEABILITY_3Q']],
            row[table['DANCEABILITY_MAX']],
            row[table['DANCEABILITY_MEAN']],
            row[table['DANCEABILITY_STD']],
            row[table['DANCEABILITY_COUNT']]
        ],
        [  # energy
            row[table["ENERGY_MIN"]],
            row[table["ENERGY_1Q"]],
            row[table["ENERGY_MEDIAN"]],
            row[table["ENERGY_3Q"]],
            row[table["ENERGY_MAX"]],
            row[table["ENERGY_MEAN"]],
            row[table["ENERGY_STD"]],
            row[table["ENERGY_COUNT"]]
        ],
        [  # valence
            row[table["VALENCE_MIN"]],
            row[table["VALENCE_1Q"]],
            row[table["VALENCE_MEDIAN"]],
            row[table["VALENCE_3Q"]],
            row[table["VALENCE_MAX"]],
            row[table["VALENCE_MEAN"]],
            row[table["VALENCE_STD"]],
            row[table["VALENCE_COUNT"]]
        ],
        [  # speechiness
            row[table["SPEECHINESS_MIN"]],
            row[table["SPEECHINESS_1Q"]],
            row[table["SPEECHINESS_MEDIAN"]],
            row[table["SPEECHINESS_3Q"]],
            row[table["SPEECHINESS_MAX"]],
            row[table["SPEECHINESS_MEAN"]],
            row[table["SPEECHINESS_STD"]],
            row[table["SPEECHINESS_COUNT"]]
        ],
        [  # acousticness
            row[table["ACOUSTICNESS_MIN"]],
            row[table["ACOUSTICNESS_1Q"]],
            row[table["ACOUSTICNESS_MEDIAN"]],
            row[table["ACOUSTICNESS_3Q"]],
            row[table["ACOUSTICNESS_MAX"]],
            row[table["ACOUSTICNESS_MEAN"]],
            row[table["ACOUSTICNESS_STD"]],
            row[table["ACOUSTICNESS_COUNT"]]
        ],
        [  # instrumentalness
            row[table["INSTRUMENTALNESS_MIN"]],
            row[table["INSTRUMENTALNESS_1Q"]],
            row[table["INSTRUMENTALNESS_MEDIAN"]],
            row[table["INSTRUMENTALNESS_3Q"]],
            row[table["INSTRUMENTALNESS_MAX"]],
            row[table["INSTRUMENTALNESS_MEAN"]],
            row[table["INSTRUMENTALNESS_STD"]],
            row[table["INSTRUMENTALNESS_COUNT"]]
        ],
        [  # liveness
            row[table["LIVENESS_MIN"]],
            row[table["LIVENESS_1Q"]],
            row[table["LIVENESS_MEDIAN"]],
            row[table["LIVENESS_3Q"]],
            row[table["LIVENESS_MAX"]],
            row[table["LIVENESS_MEAN"]],
            row[table["LIVENESS_STD"]],
            row[table["LIVENESS_COUNT"]]
        ]
    ]


def _build_measures(row: tuple, from_artists: bool = True) -> list:
    table = dbAN.ARTISTS if from_artists else dbAN.ALBUMS
    return [
        [  # tempo
            row[table['TEMPO_MIN']],
            row[table['TEMPO_1Q']],
            row[table['TEMPO_MEDIAN']],
            row[table['TEMPO_3Q']],
            row[table['TEMPO_MAX']],
            row[table['TEMPO_MEAN']],
            row[table['TEMPO_STD']],
            row[table['TEMPO_COUNT']]
        ],
        [  # loudness
            row[table['LOUDNESS_MIN']],
            row[table['LOUDNESS_1Q']],
            row[table['LOUDNESS_MEDIAN']],
            row[table['LOUDNESS_3Q']],
            row[table['LOUDNESS_MAX']],
            row[table['LOUDNESS_MEAN']],
            row[table['LOUDNESS_STD']],
            row[table['LOUDNESS_COUNT']]
        ],
        [  # duration
            row[table['DURATION_MIN']],
            row[table['DURATION_1Q']],
            row[table['DURATION_MEDIAN']],
            row[table['DURATION_3Q']],
            row[table['DURATION_MAX']],
            row[table['DURATION_MEAN']],
            row[table['DURATION_STD']],
            row[table['DURATION_COUNT']]
        ]
    ]


def _build_key_counts(row: tuple, from_artists: bool = True) -> list:
    table = dbAN.ARTISTS if from_artists else dbAN.ALBUMS
    return [
        [  # menor
            row[table["KEY_COUNT_F_MINOR"]],
            row[table["KEY_COUNT_C_MINOR"]],
            row[table["KEY_COUNT_G_MINOR"]],
            row[table["KEY_COUNT_D_MINOR"]],
            row[table["KEY_COUNT_A_MINOR"]],
            row[table["KEY_COUNT_E_MINOR"]],
            row[table["KEY_COUNT_B_MINOR"]],
            row[table["KEY_COUNT_GB_MINOR"]],
            row[table["KEY_COUNT_DB_MINOR"]],
            row[table["KEY_COUNT_AB_MINOR"]],
            row[table["KEY_COUNT_EB_MINOR"]],
            row[table["KEY_COUNT_BB_MINOR"]]
        ],
        [  # mayor
            row[table["KEY_COUNT_F_MAYOR"]],
            row[table["KEY_COUNT_C_MAYOR"]],
            row[table["KEY_COUNT_G_MAYOR"]],
            row[table["KEY_COUNT_D_MAYOR"]],
            row[table["KEY_COUNT_A_MAYOR"]],
            row[table["KEY_COUNT_E_MAYOR"]],
            row[table["KEY_COUNT_B_MAYOR"]],
            row[table["KEY_COUNT_GB_MAYOR"]],
            row[table["KEY_COUNT_DB_MAYOR"]],
            row[table["KEY_COUNT_AB_MAYOR"]],
            row[table["KEY_COUNT_EB_MAYOR"]],
            row[table["KEY_COUNT_BB_MAYOR"]]
        ]
    ]
