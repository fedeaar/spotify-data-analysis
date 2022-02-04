""" ArtistasDB serves as a handler for the 'artistas' database schema. """
import os
import glob
import sqlite3

import builder.paths as paths
import builder.handlers.Database as db
import builder.handlers.SpotifyAPI as api
import builder.utils.Helper as helper


TABLES = {
    "ARTISTS": 'artists',
    "ALBUMS": 'albums',
    "TRACKS": 'tracks',
    "GENRES": 'genres',
    "RELATED": 'related',
    "LISTENERS": 'listeners'
}

KEYS = {
    "ARTISTS": 'artist_id',
    "ALBUMS": 'album_id',  # other keys: artist_id
    "TRACKS": 'track_id',  # other keys: album_id and artist_id
    "GENRES": 'artist_id',  # other keys: genre
    "RELATED": 'artist_id',  # other keys: other
    "LISTENERS": 'artist_id'  # other keys: city and country
}

ARTISTS = {
    "ARTIST_ID": 0,
    "ARTIST_NAME": 1,
    "BIO": 2,
    "POPULARIDAD": 3,
    "FOLLOWERS": 4,
    "SAVED_ALBUMS": 5,
    "TOTAL_ALBUMS": 6,
    "SPOTIFY_URL": 7,
    "IMG_640X": 8,
    "IMG_320X": 9,
    "IMG_60X": 10,
    "LAST_UPDATED": 11
}

ALBUMS = {
    "ARTIST_ID": 0,
    "ALBUM_ID": 1,
    "ALBUM_NAME": 2,
    "ALBUM_GROUP": 3,
    "ALBUM_TYPE": 4,
    "RELEASE_DATE": 5,
    "RELEASE_DATE_PRECISION": 6,
    "TOTAL_TRACKS": 7,
    "SPOTIFY_URL": 8,
    "IMG_640X": 9,
    "IMG_320X": 10,
    "IMG_60X": 11,
    "LAST_UPDATED": 12
}

TRACKS = {
    "ARTIST_ID": 0,
    "ALBUM_ID": 1,
    "TRACK_ID": 2,
    "TRACK_NAME": 3,
    "DISC_NUMBER": 4,
    "TRACK_NUMBER": 5,
    "EXPLICIT": 6,
    "DURATION_MS": 7,
    "KEY": 8,
    "MODE": 9,
    "TIME_SIGNATURE": 10,
    "TEMPO": 11,
    "DANCEABILITY": 12,
    "ENERGY": 13,
    "VALENCE": 14,
    "LOUDNESS": 15,
    "SPEECHINESS": 16,
    "ACOUSTICNESS": 17,
    "INSTRUMENTALNESS": 18,
    "LIVENESS": 19,
    "SPOTIFY_URL": 20,
    "LAST_UPDATED": 21
}

GENRES = {
    "ARTIST_ID": 0,
    "GENRE": 1,
    "LAST_UPDATED": 2
}

RELATED = {
    "ARTIST_ID": 0,
    "OTHER_ARTIST": 1,
    "RELATIONSHIP": 2,
    "LAST_UPDATED": 3
}

LISTENERS = {
    "ARTIST_ID": 0,
    "CITY": 1,
    "COUNTRY": 2,
    "LISTENERS": 3,
    "LAST_UPDATED": 4
}


class ArtistasDB(db.Database):

    def __init__(self, database_path: str = paths.artistas_db):
        """ a handler for 'artistas' databases and interfacing with the SpotifyAPI.GET class.
        :param database_path: the relative path to the database.
        """
        super().__init__(database_path)
        # handlers
        self.api = api.GET()  # spotipy
        self.formatter = _Format()

    # --- create ---
    def create_entry(self, artist_id: str, cache_on_error: bool = True, continue_on_error: bool = True, _values: tuple = None) -> None:
        """ creates a complete entry for an artist in the database's tables.
        :param artist_id: the spotify artist's id.
        :param cache_on_error: if true, stores a copy of the fetched data on error for later retrial with the retry()
            method.
        :param continue_on_error: if true, execution is not stopped on sql errors.
        :param _values: external loading of artist, bio, listeners, albums, and related objects. For dump retry.
        """
        artist_json, artist_bio, artist_listeners, albums_json, related_json = self.api.all(artist_id) if not _values \
            else _values
        self.formatter.set_id(artist_id)
        try:
            if self.verbose:
                print(f'creating artist entry for {artist_id}.')
            self._create_artist_entry(artist_json, albums_json, artist_bio)
            if self.verbose:
                print(f'creating album entries for {artist_id}.')
            self._create_album_entries(albums_json)
            if self.verbose:
                print(f'creating track entries for {artist_id}.')
            self._create_track_entries(albums_json)
            if self.verbose:
                print(f'creating genre entries for {artist_id}.')
            self._create_genres_entries(artist_json)
            if self.verbose:
                print(f'creating related entries for {artist_id}.')
            self._create_related_entries(artist_json, albums_json, related_json)
            if self.verbose:
                print(f'creating listener entries for {artist_id}.')
            self._create_listener_entries(artist_listeners)
            self._clear_dump(artist_id)
        except Exception as e:
            if not _values and cache_on_error:  # safe dump
                dump = {
                    "artist_id": artist_id,
                    "artist": artist_json,
                    "bio": artist_bio,
                    "listeners": artist_listeners,
                    "albums": albums_json,
                    "related": related_json
                }
                helper.save_json(dump, paths.logs, f"push_error_dump_{artist_id}")
            if continue_on_error and isinstance(e, (sqlite3.IntegrityError, sqlite3.OperationalError)):
                pass
            else:
                raise e

    def batch_create(self, artist_ids: list, cache_on_error: bool = True, continue_on_error: bool = True) -> None:
        """ creates a complete entry for each given artist in the database's tables.
        :param artist_ids: the list of artists spotify's ids.
        :param cache_on_error: if true, stores a copy of any fetched data on error for later retrial with the retry()
            method.
        :param continue_on_error: if true, execution is not stopped on sql errors.
        """
        for artist_id in artist_ids:
            if self.query(f"""
                SELECT {KEYS["ARTISTS"]} 
                FROM {TABLES["ARTISTS"]} 
                WHERE {KEYS['ARTISTS']} = '{artist_id}'
            """):
                continue
            self.create_entry(artist_id, cache_on_error, continue_on_error)

    def _create_artist_entry(self, artist_json: dict, albums_json: dict, bio: str) -> None:
        rows = self.formatter.format_artist(artist_json, albums_json, bio)
        insert_artist = [
            (f"INSERT INTO {TABLES['ARTISTS']} VALUES ({('?, ' * len(ARTISTS))[:-2]})", rows)
        ]
        self.push(insert_artist)

    def _create_album_entries(self, albums_json: dict) -> None:
        rows = self.formatter.format_albums(albums_json)
        insert_albums = [
            (f"INSERT INTO {TABLES['ALBUMS']} VALUES ({('?, ' * len(ALBUMS))[:-2]})", x) for x in rows
        ]
        self.push(insert_albums)

    def _create_track_entries(self, albums_json: dict) -> None:
        rows = self.formatter.format_tracks(albums_json)
        insert_tracks = [
            (f"INSERT INTO {TABLES['TRACKS']} VALUES ({('?, ' * len(TRACKS))[:-2]})", x) for x in rows
        ]
        self.push(insert_tracks)

    def _create_genres_entries(self, artist_json: dict) -> None:
        rows = self.formatter.format_genre(artist_json)
        insert_genres = [
            (f"INSERT INTO {TABLES['GENRES']} VALUES ({('?, ' * len(GENRES))[:-2]})", x) for x in rows
        ]
        self.push(insert_genres)

    def _create_related_entries(self, artist_json: dict, albums_json: dict, related_json: dict) -> None:
        rows = self.formatter.format_related(artist_json, albums_json, related_json)
        insert_related = [
            (f"INSERT INTO {TABLES['RELATED']} VALUES ({('?, ' * len(RELATED))[:-2]})", x) for x in rows
        ]
        self.bypassIntegrityErrors = True
        # duplicate key pairs may be formed from different sources. Detecting them before would be slow.
        self.push(insert_related)
        self.bypassIntegrityErrors = False

    def _create_listener_entries(self, listeners: [(str, str, int)]) -> None:
        rows = self.formatter.format_listeners(listeners)
        insert_listeners = [
            (f"INSERT INTO {TABLES['LISTENERS']} VALUES ({('?, ' * len(LISTENERS))[:-2]})", x) for x in rows
        ]
        self.push(insert_listeners)

    # --- delete ---
    def delete_entry(self, artist_id: str) -> None:
        """ deletes all entries for an artist in the database's tables.
        :param artist_id: the spotify artist's id.
        """
        if self.verbose:
            print(f'deleting artist entry for {artist_id}.')
        self._delete_artist_entry(artist_id)
        if self.verbose:
            print(f'deleting album entries for {artist_id}.')
        self._delete_albums_entries(artist_id)
        if self.verbose:
            print(f'deleting tracks entries for {artist_id}.')
        self._delete_tracks_entries(artist_id)
        if self.verbose:
            print(f'deleting genres entries for {artist_id}.')
        self._delete_genres_entries(artist_id)
        if self.verbose:
            print(f'deleting related entries for {artist_id}.')
        self._delete_related_entries(artist_id)
        if self.verbose:
            print(f'deleting listeners entries for {artist_id}.')
        self._delete_listeners_entries(artist_id)

    def _delete_artist_entry(self, artist_id: str) -> None:
        self.push([f"DELETE FROM {TABLES['ARTISTS']} WHERE {KEYS['ARTISTS']} = '{artist_id}'"])

    def _delete_albums_entries(self, artist_id: str) -> None:
        self.push([f"DELETE FROM {TABLES['ALBUMS']} WHERE {KEYS['ARTISTS']} = '{artist_id}'"])

    def _delete_tracks_entries(self, artist_id: str) -> None:
        self.push([f"DELETE FROM {TABLES['TRACKS']} WHERE {KEYS['ARTISTS']} = '{artist_id}'"])

    def _delete_genres_entries(self, artist_id: str) -> None:
        self.push([f"DELETE FROM {TABLES['GENRES']} WHERE {KEYS['ARTISTS']} = '{artist_id}'"])

    def _delete_related_entries(self, artist_id: str) -> None:
        self.push([f"DELETE FROM {TABLES['RELATED']} WHERE {KEYS['ARTISTS']} = '{artist_id}'"])

    def _delete_listeners_entries(self, artist_id: str) -> None:
        self.push([f"DELETE FROM {TABLES['LISTENERS']} WHERE {KEYS['ARTISTS']} = '{artist_id}'"])

    # --- update ---
    def update_entry(self, artist_id: str):
        """ updates all entries for an artist in the database's tables.
        :param artist_id: the spotify artist's id.
        """
        artist_json, artist_bio, artist_listeners, albums_json, related_json = self.api.all(artist_id)
        self.formatter.set_id(artist_id)
        if self.verbose:
            print(f'updating artist entry for {artist_id}')
        self._update_artist_entry(artist_id, artist_json, albums_json, artist_bio)
        if self.verbose:
            print(f'updating albums and tracks entries for {artist_id}')
        self._update_albums_and_tracks_entries(artist_id, albums_json)
        if self.verbose:
            print(f'updating genre entries for {artist_id}')
        self._update_genres_entries(artist_id, artist_json)
        if self.verbose:
            print(f'updating related entries for {artist_id}')
        self._update_related_entries(artist_id, artist_json, albums_json, related_json)
        if self.verbose:
            print(f'updating related entries for {artist_id}')
        self._update_listeners_entries(artist_id, artist_listeners)

    def batch_update(self, artist_ids: list, older_than: int = 60 * 60 * 24) -> None:
        """ updates all entries for the given artists in the database's tables.
        :param artist_ids: the spotify artists' ids.
        :param older_than: update entries only older than the given seconds. Default = 86400 (a day)
        """
        for (index, artist_id) in enumerate(artist_ids):
            current = self.query(f"""
                  SELECT last_updated
                  FROM   {TABLES["ARTISTS"]} 
                  WHERE  {KEYS['ARTISTS']} = '{artist_id}'
              """)[0]
            if helper.seconds_from_now(current) > older_than:
                self.update_entry(artist_id)

    def update_all(self) -> None:
        """ updates all entries in the database. """
        artists = [x[0] for x in self.query(f"SELECT {KEYS['ARTISTS']} FROM {TABLES['ARTISTS']}")]
        self.batch_update(artists)

    def _update_artist_entry(self, artist_id: str, artist_json: dict, albums_json: dict, artist_bio: str) -> None:
        self._delete_artist_entry(artist_id)
        self._create_artist_entry(artist_json, albums_json, artist_bio)

    def _update_albums_and_tracks_entries(self, artist_id: str, albums_json: dict) -> None:
        total_albums = self.query(f"""
            SELECT total_albums 
            FROM {TABLES["ARTISTS"]} 
            WHERE {KEYS['ARTISTS']} = '{artist_id}'
        """)[0]
        if total_albums != albums_json['total']:
            new_albums = {'items': []}
            for album in albums_json['items']:
                if not self.query(f"""
                    SELECT {KEYS['ALBUMS']} 
                    FROM {TABLES['ALBUMS']} 
                    WHERE {KEYS['ALBUMS']}='{album['id']}'
                """):
                    new_albums['items'].append(album)
            if new_albums:
                self._create_album_entries(new_albums)
                self._create_track_entries(new_albums)

    def _update_genres_entries(self, artist_id: str, artist_json: dict) -> None:
        self._delete_genres_entries(artist_id)
        self._create_genres_entries(artist_json)

    def _update_related_entries(self, artist_id: str, artist_json: dict, albums_json: dict, related_json: dict) -> None:
        self._delete_related_entries(artist_id)
        self._create_related_entries(artist_json, albums_json, related_json)

    def _update_listeners_entries(self, artist_id: str, listeners: [(str, str, int)]) -> None:
        self._delete_listeners_entries(artist_id)
        self._create_listener_entries(listeners)

    def retry(self):
        f"""create_entry() variables are cached in {paths.logs} on error, as to avoid uneeded requests to the spotify 
        web api. This method retries creating previously failed entries from the cache. """
        dumps = glob.glob(f"{paths.logs}/push_error_dump*.json")
        for d in dumps:
            f = helper.load_json(d)
            self.bypassIntegrityErrors = True
            self.delete_entry(f['artist_id'])
            self.create_entry(f['artist_id'],
                              _values=(f['artist'], f['bio'], f['listeners'], f['albums'], f['related']))
            self.bypassIntegrityErrors = False
            os.remove(d)

    def clear_dump(self, artist_id: str = None) -> None:
        """ deletes stored dump files for the given artist id.
        :param artist_id: the artist_id for which to delete the dump file. If none, clears all dump files.
        """
        dumps = glob.glob(f"{paths.logs}/push_error_dump{artist_id if artist_id else '*'}.json")
        for d in dumps:
            os.remove(d)


class _Format:

    def __init__(self, artist_id: str = None):
        self.artist_id = artist_id

    def set_id(self, artist_id: str) -> None:
        self.artist_id = artist_id

    def format_artist(self, json_artist: dict, json_albums: dict, bio: str) -> tuple:
        if not self.artist_id:
            raise NameError('method called with null self.artist_id.')
        artist_row = [
            self.artist_id,
            helper.clean_str(json_artist['name']),
            bio,
            json_artist['popularity'],
            json_artist['followers']['total'],
            len(json_albums['items']),
            json_albums['total'],
            json_artist['external_urls']['spotify']
        ]
        images = [x['url'] for x in json_artist['images']]
        images = images + [None] * (3 - len(images))  # normalize
        artist_row.extend(images[:3])
        artist_row.append(helper.current_time())
        return tuple(artist_row)

    def format_albums(self, albums_json: dict) -> tuple:
        albums_rows = []
        for album in albums_json['items']:
            album_row = [
                self.artist_id,
                album['id'],
                album['name'],
                album['album_group'],
                album['album_type'],
                album['release_date'],
                album['release_date_precision'],
                album['total_tracks'],
                album['external_urls']['spotify']
            ]
            images = [x['url'] for x in album['images']]
            images = images + [None] * (3 - len(images))
            album_row.extend(images[:3])
            album_row.append(helper.current_time())
            albums_rows.append(tuple(album_row))

        return tuple(albums_rows)

    def format_tracks(self, albums_json: dict) -> tuple:
        tracks_rows = []
        for album in albums_json['items']:
            for track in album['tracks']['items']:
                track_row = [
                    self.artist_id,
                    album['id'],
                    track['id'],
                    track['name'],
                    track['disc_number'],
                    track['track_number'],
                    track['explicit'],
                    track['duration_ms']
                ]
                features = track['features'][0]
                if features:
                    track_row.extend([
                        features['key'],
                        features['mode'],
                        features['time_signature'],
                        features['tempo'],
                        features['danceability'],
                        features['energy'],
                        features['valence'],
                        features['loudness'],
                        features['speechiness'],
                        features['acousticness'],
                        features['instrumentalness'],
                        features['liveness']
                    ])
                else:
                    track_row.extend([None] * 12)
                track_row.append(track['external_urls']['spotify'])
                track_row.append(helper.current_time())
                tracks_rows.append(tuple(track_row))
        return tuple(tracks_rows)

    def format_related(self, artist_json: dict, albums_json: dict, artist_related: dict) -> tuple:
        def entry(_from: list, category: str):
            return [
                (artist_json['id'], x['id'], category, helper.current_time())
                for x in _from if x['id'] != artist_json['id']
            ]
        related_rows = []
        related_rows.extend(entry(artist_related['artists'], 'related'))
        for album in albums_json['items']:
            related_rows.extend(entry(album['artists'], 'co-authors'))
            for track in album['tracks']['items']:
                related_rows.extend(entry(track['artists'], 'appears-on'))
        return tuple(related_rows)

    def format_genre(self, artist_json: dict) -> tuple:
        return tuple([(artist_json['id'], helper.clean_str(x), helper.current_time()) for x in artist_json['genres']])

    def format_listeners(self, artist_listeners: list) -> tuple:
        return tuple([(self.artist_id, val[0], val[1], val[2], helper.current_time()) for val in artist_listeners])
