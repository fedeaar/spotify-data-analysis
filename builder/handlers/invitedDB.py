import pprint

import builder.handlers.Database as db
import builder.paths as paths
import builder.handlers.SpotifyAPI as api

schema = """
CREATE TABLE invitedArtists (
    album_id TEXT PRIMARY KEY,
    n_invited REAL
);
"""


class InvitedDB(db.Database):

    def __init__(self, database_path: str = paths.invited_db):
        """ a handler for 'artistas' databases and interfacing with the SpotifyAPI.GET class.
        :param database_path: the relative path to the database.
        """
        super().__init__(database_path)
        # handlers
        self.api = api.GET()  # spotipy

    def create_entry(self, artist_id: str, album_id: str):
        tracks_json = self.api.tracks(album_id, False)
        invited_artists = 0
        for item in tracks_json["items"]:
            for artist in item["artists"]:
                if artist['id'] != artist_id:
                    invited_artists += 1
        self.push([("INSERT INTO invitedArtists VALUES (?, ?)", (album_id, invited_artists))])

    def batch_create(self, id_tuples):
        self.bypass_integrity_errors(True)
        self.toggle_verbose(True)
        for ids in id_tuples:
            if len(self.query(f"SELECT album_id FROM invitedArtists WHERE album_id = '{ids[1]}'")) != 0:
                continue
            self.create_entry(*ids)
        self.bypass_integrity_errors(False)
        self.toggle_verbose(False)
