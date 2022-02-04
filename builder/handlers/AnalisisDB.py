""" AnalisisDB serves as a handler for the 'analisis' database schema. """

import builder.paths as paths
import builder.handlers.Database as db
import builder.handlers.ArtistasDB as arDB
import builder.utils.Helper as helper
import builder.utils.Stats as stats

import pandas as pd

# --- globals ---
FEATURES = ['danceability', 'energy', 'valence', 'speechiness', 'acousticness', 'instrumentalness', 'liveness']
MEASURES = ['loudness', 'duration_ms', 'tempo']
CATEGORIES = ['key', 'mode', 'time_signature']
TONALITY = ['C', 'C#Db', 'D', 'D#Eb', 'E', 'F', 'F#Gb', 'G', 'G#Ab', 'A', 'A#Bb', 'B']
MODE = ['minor', 'mayor']
TIME_SIGNATURE = [1, 2, 3, 4, 5]


# --- enums ---
TABLES = {
    "ARTISTS": 'artists',
    "ALBUMS": 'albums',
    "PCA_METADATA": 'pca_metadata',
    "TRACKS": 'tracks'
}

KEYS = {
    "ARTISTS": 'artist_id',
    "ALBUMS": 'album_id',
    "PCA_METADATA": None,
    "TRACKS": 'track_id'
}

ARTISTS = {
    "ARTIST_ID": 0,

    "KEY_COUNT_C_MINOR": 1,
    "KEY_COUNT_DB_MINOR": 2,
    "KEY_COUNT_D_MINOR": 3,
    "KEY_COUNT_EB_MINOR": 4,
    "KEY_COUNT_E_MINOR": 5,
    "KEY_COUNT_F_MINOR": 6,
    "KEY_COUNT_GB_MINOR": 7,
    "KEY_COUNT_G_MINOR": 8,
    "KEY_COUNT_AB_MINOR": 9,
    "KEY_COUNT_A_MINOR": 10,
    "KEY_COUNT_BB_MINOR": 11,
    "KEY_COUNT_B_MINOR": 12,

    "KEY_COUNT_C_MAYOR": 13,
    "KEY_COUNT_DB_MAYOR": 14,
    "KEY_COUNT_D_MAYOR": 15,
    "KEY_COUNT_EB_MAYOR": 16,
    "KEY_COUNT_E_MAYOR": 17,
    "KEY_COUNT_F_MAYOR": 18,
    "KEY_COUNT_GB_MAYOR": 19,
    "KEY_COUNT_G_MAYOR": 20,
    "KEY_COUNT_AB_MAYOR": 21,
    "KEY_COUNT_A_MAYOR": 22,
    "KEY_COUNT_BB_MAYOR": 23,
    "KEY_COUNT_B_MAYOR": 24,

    "LOUDNESS_COUNT": 25,
    "LOUDNESS_MEAN": 26,
    "LOUDNESS_STD": 27,
    "LOUDNESS_MIN": 28,
    "LOUDNESS_1Q": 29,
    "LOUDNESS_MEDIAN": 30,
    "LOUDNESS_3Q": 31,
    "LOUDNESS_MAX": 32,

    "DURATION_COUNT": 33,
    "DURATION_MEAN": 34,
    "DURATION_STD": 35,
    "DURATION_MIN": 36,
    "DURATION_1Q": 37,
    "DURATION_MEDIAN": 38,
    "DURATION_3Q": 39,
    "DURATION_MAX": 40,

    "TEMPO_COUNT": 41,
    "TEMPO_MEAN": 42,
    "TEMPO_STD": 43,
    "TEMPO_MIN": 44,
    "TEMPO_1Q": 45,
    "TEMPO_MEDIAN": 46,
    "TEMPO_3Q": 47,
    "TEMPO_MAX": 48,

    "DANCEABILITY_COUNT": 49,
    "DANCEABILITY_MEAN": 50,
    "DANCEABILITY_STD": 51,
    "DANCEABILITY_MIN": 52,
    "DANCEABILITY_1Q": 53,
    "DANCEABILITY_MEDIAN": 54,
    "DANCEABILITY_3Q": 55,
    "DANCEABILITY_MAX": 56,

    "ENERGY_COUNT": 57,
    "ENERGY_MEAN": 58,
    "ENERGY_STD": 59,
    "ENERGY_MIN": 60,
    "ENERGY_1Q": 61,
    "ENERGY_MEDIAN": 62,
    "ENERGY_3Q": 63,
    "ENERGY_MAX": 64,

    "VALENCE_COUNT": 65,
    "VALENCE_MEAN": 66,
    "VALENCE_STD": 67,
    "VALENCE_MIN": 68,
    "VALENCE_1Q": 69,
    "VALENCE_MEDIAN": 70,
    "VALENCE_3Q": 71,
    "VALENCE_MAX": 72,

    "SPEECHINESS_COUNT": 73,
    "SPEECHINESS_MEAN": 74,
    "SPEECHINESS_STD": 75,
    "SPEECHINESS_MIN": 76,
    "SPEECHINESS_1Q": 77,
    "SPEECHINESS_MEDIAN": 78,
    "SPEECHINESS_3Q": 79,
    "SPEECHINESS_MAX": 80,

    "ACOUSTICNESS_COUNT": 81,
    "ACOUSTICNESS_MEAN": 82,
    "ACOUSTICNESS_STD": 83,
    "ACOUSTICNESS_MIN": 84,
    "ACOUSTICNESS_1Q": 85,
    "ACOUSTICNESS_MEDIAN": 86,
    "ACOUSTICNESS_3Q": 87,
    "ACOUSTICNESS_MAX": 88,

    "INSTRUMENTALNESS_COUNT": 89,
    "INSTRUMENTALNESS_MEAN": 90,
    "INSTRUMENTALNESS_STD": 91,
    "INSTRUMENTALNESS_MIN": 92,
    "INSTRUMENTALNESS_1Q": 93,
    "INSTRUMENTALNESS_MEDIAN": 94,
    "INSTRUMENTALNESS_3Q": 95,
    "INSTRUMENTALNESS_MAX": 96,

    "LIVENESS_COUNT": 97,
    "LIVENESS_MEAN": 98,
    "LIVENESS_STD": 99,
    "LIVENESS_MIN": 100,
    "LIVENESS_1Q": 101,
    "LIVENESS_MEDIAN": 102,
    "LIVENESS_3Q": 103,
    "LIVENESS_MAX": 104,

    "LAST_UPDATED": 105
}

ALBUMS = {
    "ARTIST_ID": 0,
    "ALBUM_ID": 1,

    "KEY_COUNT_C_MINOR": 2,
    "KEY_COUNT_DB_MINOR": 3,
    "KEY_COUNT_D_MINOR": 4,
    "KEY_COUNT_EB_MINOR": 5,
    "KEY_COUNT_E_MINOR": 6,
    "KEY_COUNT_F_MINOR": 7,
    "KEY_COUNT_GB_MINOR": 8,
    "KEY_COUNT_G_MINOR": 9,
    "KEY_COUNT_AB_MINOR": 10,
    "KEY_COUNT_A_MINOR": 11,
    "KEY_COUNT_BB_MINOR": 12,
    "KEY_COUNT_B_MINOR": 13,

    "KEY_COUNT_C_MAYOR": 14,
    "KEY_COUNT_DB_MAYOR": 15,
    "KEY_COUNT_D_MAYOR": 16,
    "KEY_COUNT_EB_MAYOR": 17,
    "KEY_COUNT_E_MAYOR": 18,
    "KEY_COUNT_F_MAYOR": 19,
    "KEY_COUNT_GB_MAYOR": 20,
    "KEY_COUNT_G_MAYOR": 21,
    "KEY_COUNT_AB_MAYOR": 22,
    "KEY_COUNT_A_MAYOR": 23,
    "KEY_COUNT_BB_MAYOR": 24,
    "KEY_COUNT_B_MAYOR": 25,

    "LOUDNESS_COUNT": 26,
    "LOUDNESS_MEAN": 27,
    "LOUDNESS_STD": 28,
    "LOUDNESS_MIN": 29,
    "LOUDNESS_1Q": 30,
    "LOUDNESS_MEDIAN": 31,
    "LOUDNESS_3Q": 32,
    "LOUDNESS_MAX": 33,

    "DURATION_COUNT": 34,
    "DURATION_MEAN": 35,
    "DURATION_STD": 36,
    "DURATION_MIN": 37,
    "DURATION_1Q": 38,
    "DURATION_MEDIAN": 39,
    "DURATION_3Q": 40,
    "DURATION_MAX": 41,

    "TEMPO_COUNT": 42,
    "TEMPO_MEAN": 43,
    "TEMPO_STD": 44,
    "TEMPO_MIN": 45,
    "TEMPO_1Q": 46,
    "TEMPO_MEDIAN": 47,
    "TEMPO_3Q": 48,
    "TEMPO_MAX": 49,

    "DANCEABILITY_COUNT": 50,
    "DANCEABILITY_MEAN": 51,
    "DANCEABILITY_STD": 52,
    "DANCEABILITY_MIN": 53,
    "DANCEABILITY_1Q": 54,
    "DANCEABILITY_MEDIAN": 55,
    "DANCEABILITY_3Q": 56,
    "DANCEABILITY_MAX": 57,

    "ENERGY_COUNT": 58,
    "ENERGY_MEAN": 59,
    "ENERGY_STD": 60,
    "ENERGY_MIN": 61,
    "ENERGY_1Q": 62,
    "ENERGY_MEDIAN": 63,
    "ENERGY_3Q": 64,
    "ENERGY_MAX": 65,

    "VALENCE_COUNT": 66,
    "VALENCE_MEAN": 67,
    "VALENCE_STD": 68,
    "VALENCE_MIN": 69,
    "VALENCE_1Q": 70,
    "VALENCE_MEDIAN": 71,
    "VALENCE_3Q": 72,
    "VALENCE_MAX": 73,

    "SPEECHINESS_COUNT": 74,
    "SPEECHINESS_MEAN": 75,
    "SPEECHINESS_STD": 76,
    "SPEECHINESS_MIN": 77,
    "SPEECHINESS_1Q": 78,
    "SPEECHINESS_MEDIAN": 79,
    "SPEECHINESS_3Q": 80,
    "SPEECHINESS_MAX": 81,

    "ACOUSTICNESS_COUNT": 82,
    "ACOUSTICNESS_MEAN": 83,
    "ACOUSTICNESS_STD": 84,
    "ACOUSTICNESS_MIN": 85,
    "ACOUSTICNESS_1Q": 86,
    "ACOUSTICNESS_MEDIAN": 87,
    "ACOUSTICNESS_3Q": 88,
    "ACOUSTICNESS_MAX": 89,

    "INSTRUMENTALNESS_COUNT": 90,
    "INSTRUMENTALNESS_MEAN": 91,
    "INSTRUMENTALNESS_STD": 92,
    "INSTRUMENTALNESS_MIN": 93,
    "INSTRUMENTALNESS_1Q": 94,
    "INSTRUMENTALNESS_MEDIAN": 95,
    "INSTRUMENTALNESS_3Q": 96,
    "INSTRUMENTALNESS_MAX": 97,

    "LIVENESS_COUNT": 98,
    "LIVENESS_MEAN": 99,
    "LIVENESS_STD": 100,
    "LIVENESS_MIN": 101,
    "LIVENESS_1Q": 102,
    "LIVENESS_MEDIAN": 103,
    "LIVENESS_3Q": 104,
    "LIVENESS_MAX": 105,

    "LAST_UPDATED": 106
}

TRACKS = {
    "INDEX": 0,

    "ARTIST_ID": 1,
    "ALBUM_ID": 2,
    "TRACK_ID": 3,
    
    "GPC_X": 4,
    "GPC_Y": 5,

    "LAST_UPDATED": 6
}

PCA_METADATA = {
    "VAR_X": 0,
    "VAR_Y": 1,

    "LAST_UPDATED": 2
}


# --- classes ---
class AnalisisDB(db.Database):

    def __init__(self, database_path: str = paths.analisis_db, linked_path: str = paths.artistas_db):
        """ a handler for 'analisis' databases and interfacing with the SpotifyAPI.GET class and 'artistas' db.
        :param database_path: the relative path to the database.
        """
        super().__init__(database_path)
        # handlers
        self.linked = arDB.ArtistasDB(linked_path)
        self.formatter = _Format()

    # --- create ---
    def create_entry(self, artist_id: str) -> None:
        """ creates a complete entry for an artist in the database's tables.
        :param artist_id: the spotify artist's id.
        """
        if self.verbose:
            print(f"fetching {artist_id} from db.")
        df = self.linked.to_dataframe(f"""
            SELECT 
                {TABLES['TRACKS']}.{KEYS['ARTISTS']}, 
                {TABLES['TRACKS']}.{KEYS['ALBUMS']}, 
                {TABLES['TRACKS']}.{KEYS['TRACKS']}, 
                {''.join([x + ', ' for x in MEASURES])}
                {''.join([x + ', ' for x in CATEGORIES])}
                {''.join([x + ', ' for x in FEATURES])[:-2]}
            FROM {TABLES['TRACKS']} 
            INNER JOIN {TABLES['ARTISTS']} 
            ON {TABLES['TRACKS']}.{KEYS['ARTISTS']} = {TABLES['ARTISTS']}.{KEYS['ARTISTS']}
            WHERE {TABLES['TRACKS']}.{KEYS['ARTISTS']} = '{artist_id}';
        """).dropna()
        self.formatter.set_id(artist_id)
        if self.verbose:
            print(f"creating summary entry for {artist_id}.")
        self._create_artist_entry(df)
        if self.verbose:
            print(f"creating summary entry of albums for {artist_id}.")
        self._create_albums_entry(df)

    def create_tracks_pca(self) -> None:
        """ calculates and populates the tracks table with PCA information. """
        if self.verbose:
            print(f"creating summary entry for tracks in db.")
        df = self.linked.to_dataframe(f"""
            SELECT 
                {KEYS['ARTISTS']}, 
                {KEYS['ALBUMS']}, 
                {KEYS['TRACKS']}, 
                {''.join([x + ', ' for x in FEATURES + MEASURES])[:-2]}
            FROM {TABLES['TRACKS']}
        """).dropna()
        pca_df, var = stats.artistas_pca(df, FEATURES + MEASURES, [KEYS['ARTISTS'], KEYS['ALBUMS'], KEYS['TRACKS']])
        self.push_df('tracks', pca_df, 'replace')
        self.push([f"""INSERT INTO {TABLES['PCA_METADATA']} VALUES ({var[0]}, {var[1]}, '{helper.current_time()}')"""])

    def batch_create(self) -> None:
        """ creates an artist entry and album entries for each artist. """
        artist_ids = self.linked.to_dataframe(f"""
            SELECT {KEYS['ARTISTS']} 
            FROM {TABLES['ARTISTS']} 
            WHERE saved_albums > 0;
        """).dropna()[KEYS['ARTISTS']].tolist()
        for artist_id in artist_ids:
            if self.query(f"""
                SELECT {KEYS['ARTISTS']} 
                FROM {TABLES['ARTISTS']} 
                WHERE {KEYS['ARTISTS']} = '{artist_id}'
            """):
                continue
            self.create_entry(artist_id)

    def _create_artist_entry(self, df: pd.DataFrame) -> None:
        summary = df[FEATURES + MEASURES].describe().round(3).to_dict()
        counts = df[['key', 'mode']].value_counts().to_dict()
        artist_row = self.formatter.format_summary(summary, counts)
        insert_artist = [(f"INSERT INTO artists VALUES ({('?, ' * len(ARTISTS))[:-2]})", artist_row)]
        self.push(insert_artist)

    def _create_albums_entry(self, df: pd.DataFrame) -> None:
        grouped = df.groupby('album_id')
        albums_rows = []
        for album_id, group in grouped:
            summary = group[FEATURES + MEASURES].describe().round(3).to_dict()
            counts = group[['key', 'mode']].value_counts().to_dict()
            albums_rows.append(self.formatter.format_summary(summary, counts, album_id))
        insert_albums = [(f"INSERT INTO albums VALUES ({('?, ' * len(ALBUMS))[:-2]})", x) for x in albums_rows]
        self.push(insert_albums)


class _Format:

    def __init__(self, artist_id: str = None):
        self.artist_id = artist_id

    def set_id(self, artist_id: str) -> None:
        self.artist_id = artist_id

    def format_summary(self, feature_summary: dict, key_count: dict, album_id: str = None) -> tuple:
        if not self.artist_id:
            raise NameError('method called with null self.artist_id.')

        row = [self.artist_id]
        if album_id:
            row.append(album_id)
        # generate count columns
        for j in range(len(MODE)):
            for i in range(len(TONALITY)):
                if key_count.get((float(i), float(j))):
                    row.append(key_count[(float(i), float(j))])
                else:
                    row.append(0)
        # generate summary columns
        for x in MEASURES + FEATURES:
            if feature_summary[x].get('mean'):
                row.extend([
                    feature_summary[x]['count'],
                    feature_summary[x]['mean'],
                    feature_summary[x]['std'],
                    feature_summary[x]['min'],
                    feature_summary[x]['25%'],
                    feature_summary[x]['50%'],
                    feature_summary[x]['75%'],
                    feature_summary[x]['max'],
                ])
            else:
                row.extend([None]*8)
        # timestamp
        row.append(helper.current_time())
        return tuple(row)
