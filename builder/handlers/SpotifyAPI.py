""" SpotifyAPI.py is a spotipy-based interface for getting data from spotify. Both from spotify's web api and from
web scrapping. Note that the scrapping-related functions may break if spotify modifies the source webpages' structure.
"""

import credentials
import builder.utils.Helper as helper

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import spotipy.exceptions

import re
import json
import warnings


# --- classes ---
class GET:

    def __init__(self, credentials_dict: dict = credentials.credentials):
        """ defines a series of getters for spotify's web api and web pages. \n
        :param credentials_dict: contains the CLIENT_ID and CLIENT_SECRET keys for spotify's api authentication.
        """
        auth_manager = SpotifyClientCredentials(
            client_id=credentials_dict['CLIENT_ID'],
            client_secret=credentials_dict['CLIENT_SECRET']
        )
        self.spotify = spotipy.Spotify(auth_manager=auth_manager)
        # flags:
        self.verbose = False

    def toggle_verbose(self, state: bool = None) -> None:
        """ toggles print statements for method calls. """
        self.verbose = state if state else not self.verbose

    def albums(self, artist_id: str, types: tuple = ('album', 'single'), get_tracks: bool = True) -> dict:
        """ GET wrapper for spotipy's artist_albums() method.
        :param artist_id: the spotify artist's id
        :param types: what kind of albums to retrieve. Possible types are 'album', 'single' and 'compilation'.
            Default = ('album', 'single')
        :param get_tracks: should a "tracks":~spotify's tracks object~ key-value pair be added to each album?
        :return: all album objects for the artist_id that satisfy the given types restriction.
        """
        if self.verbose:
            print(f'getting albums for {artist_id}.')

        json_albums = helper.try_request(lambda: self.spotify.artist_albums(artist_id))
        # Separate filter as artist_albums()'s album_type parameter does not allow for multiple type constraints.
        json_albums['items'] = [x for x in json_albums['items'] if x['album_type'] in types]
        # get the rest of the albums.
        for offset in range(20, json_albums['total'], 20):
            try:
                more_albums = helper.try_request(lambda: self.spotify.artist_albums(artist_id, offset=offset))['items']
                json_albums['items'].extend([x for x in more_albums if x['album_type'] in types])
            except spotipy.exceptions.SpotifyException:  # most likely 404 error
                continue
        # get the album's tracks
        if get_tracks:
            for album in json_albums['items']:
                album['tracks'] = self.tracks(album['id'])

        return json_albums

    def tracks(self, album_id: str, get_features: bool = True) -> dict:
        """ GET wrapper for spotipy's album_tracks() method. \n
        :param album_id: the spotify album's id
        :param get_features: should a "features":~spotify's audio-analysis object~ key-value pair be added to each
            track?
        :return: all track objects for the given album_id.
        """
        if self.verbose:
            print(f'getting tracks for: {album_id}.')

        json_tracks = helper.try_request(lambda: self.spotify.album_tracks(album_id))
        total = json_tracks['total']
        for offset in range(50, total, 50):
            try:
                more_tracks = helper.try_request(lambda: self.spotify.album_tracks(album_id, offset=offset))["items"]
                json_tracks["items"].extend(more_tracks)
            except spotipy.exceptions.SpotifyException:  # most likely 404 error
                continue
        # get the album's features
        if get_features:
            for track in json_tracks['items']:
                track['features'] = self.track_features(track['id'])

        return json_tracks

    def track_features(self, track_id: str) -> dict:
        """ GET wrapper for spotipy's audio_features() method. \n
        :param track_id: the spotify track's id.
        :return: the audio features object for the given track_id.
        """
        if self.verbose:
            print(f'getting track features for {track_id}.')
        try:
            audio_features = helper.try_request(lambda: self.spotify.audio_features(track_id))
            return audio_features
        except spotipy.exceptions.SpotifyException:  # no audio features for this track.
            return {}

    def artist(self, artist_id: str) -> dict:
        """ GET wrapper for spotipy's artist() method. \n
        :param artist_id: the spotify artist's id.
        :return: the artist object for the given id.
        """
        if self.verbose:
            print(f'getting artist {artist_id}.')

        json_artist = helper.try_request(lambda: self.spotify.artist(artist_id))
        return json_artist

    def artist_entity(self, artist_id: str) -> dict:  # TODO: fix
        """ scrapping method for spotify's 'entity' object. BROKEN. \n
        :param artist_id: the spotify artist's id.
        :return: the artist's entity object for the given id.
        """
        if self.verbose:
            print(f'getting artist entity for {artist_id}.')

        address = f'https://open.spotify.com/artist/{artist_id}'
        html = helper.try_request(lambda: helper.get_html(address))
        script = html.find('script', text=lambda x: x and 'Spotify.Entity' in x)
        search = re.search(r"Entity\s*=\s*(.*?};)\s*\n", str(script), flags=re.DOTALL)
        json_artist_entity = None if not search else json.loads(search[1][:-1])

        if not json_artist_entity:
            warnings.warn(f"No entity object found at {address}. This may signal the scrapping procedure has broken.")

        return json_artist_entity

    def artist_listeners(self, artist_id: str) -> list:  # TODO fix
        """ scrapping method for a spotify's artist top five 'listeners'. BROKEN. \n
        :param artist_id: the spotify artist's id.
        :return: an artist listeners' list composed of (city: str, country: str, listeners: int)
        """
        if self.verbose:
            print(f'getting artist listeners for {artist_id}')

        address = f'https://open.spotify.com/artist/{artist_id}'
        html = helper.try_request(lambda: helper.get_html(address))
        div_class = "view more-by horizontal-list"
        try:
            text = html.findAll(class_=div_class)[0].text
        except IndexError:
            return []
        for replace in ['\t', '\n', 'Where people listen']:
            text = text.replace(replace, '')
        listeners = text.split('LISTENERS')[:-1]
        out = []
        for i, sub_text in enumerate(listeners):
            number = ''
            for char in sub_text:
                if char.isnumeric():
                    number += char
                    sub_text = sub_text.replace(char, '')
            values = sub_text.split(',')
            try:
                out.append((values[0], values[1], int(number)))
            except IndexError:
                continue

        if not out:
            warnings.warn(f"No listeners found at {address}. This may signal the scrapping procedure has broken.")

        return out

    def artist_bio(self, artist_id: str) -> str:  # TODO: fix
        """ scrapping method for a spotify artist's bio. \n
        :param artist_id: the spotify artist's id.
        """
        if self.verbose:
            print(f'getting artist bio for {artist_id}')

        entity = self.artist_entity(artist_id)
        return "" if not entity else entity['artist']['profile']['biography']['text']

    def artist_rss(self, artist_id: str) -> list:  # TODO: fix
        """ scrapping method for a spotify artist's rss. \n
        :param artist_id: the spotify artist's id.
        """
        if self.verbose:
            print(f'getting artist rss for {artist_id}')

        entity = self.artist_entity(artist_id)
        return [] if not entity else entity['artist']['profile']['externalLinks']['items']

    def artist_related(self, artist_id: str) -> dict:
        """ GET wrapper for spotipy's artist_related_artists() method. \n
        :param artist_id: the spotify artist's id.
        :return: the artist's related object.
        """
        if self.verbose:
            print(f'getting related artists for {artist_id}.')

        json_related = helper.try_request(lambda: self.spotify.artist_related_artists(artist_id))
        return json_related

    def artist_top_tracks(self, artist_id: str) -> dict:
        """ GET wrapper for spotipy's artist_top_tracks() method. \n
        :param artist_id: the spotify artist's id.
        :return: the artist's top tracks object.
        """
        if self.verbose:
            print(f'getting top tracks for {artist_id}.')

        json_top_tracks = helper.try_request(lambda: self.spotify.artist_top_tracks(artist_id))
        return json_top_tracks

    def all(self, artist_id: str) -> [dict, str, list, dict, dict]:
        """ getter for all methods. \n
        :param artist_id: the spotify artist's id.
        :return: the artist's object, bio, listeners, albums and related artists.
        """
        artist_json = self.artist(artist_id)
        artist_bio = self.artist_bio(artist_id)
        artist_listeners = self.artist_listeners(artist_id)
        albums_json = self.albums(artist_id)
        related_json = self.artist_related(artist_id)
        return artist_json, artist_bio, artist_listeners, albums_json, related_json
