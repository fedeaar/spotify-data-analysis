""" InvitedSeriesBuilder.py is a module for generating a invited-artists release frecuency series json file.
The interface 'InvitedSeries' is defined in types.d.ts """
import datetime

import builder.handlers.invitedDB as dbIN
import builder.utils.Stats as stats
import builder.utils.Helper as helper
import builder.paths as paths
import sqlite3 as sq
import pandas as pd

DBIN = dbIN.InvitedDB()
PATH = paths.generated


def build(path: str = PATH, start='2013-01-01', stop='2021-12-31', grouping='1M', precision='day') -> None:
    series = {
        "releases":  _generate_data(start, stop, grouping, precision),
        "labels":  stats.date_range(start, stop, grouping)
    }
    assert len(series["releases"]) == len(series["labels"])
    helper.save_json(series, path, 'invitedSeries')


def _generate_data(start='2013-01-01', stop='2021-12-31', grouping='1M', precision='day'):
    db = sq.connect(DBIN.db)
    db.execute(f"ATTACH '{paths.artistas_db}' AS adb")
    df = pd.read_sql(f"""
        SELECT release_date, n_invited 
        FROM invitedArtists 
        LEFT JOIN adb.albums ON adb.albums.album_id = invitedArtists.album_id
        WHERE
            release_date >= '{start}' AND
            release_date <  '{stop}'  AND
            release_date_precision = '{precision}';
    """, db)
    db.close()
    stats.to_datetime(df)
    series = stats.groupby_date(df, grouping=grouping)["n_invited"]
    invited_series = []
    for group in series:
        invited_an_artist = 0
        for date in group[1]:
            invited_an_artist += date > 0
        invited_series.append(invited_an_artist / len(group[1]))
    return invited_series
