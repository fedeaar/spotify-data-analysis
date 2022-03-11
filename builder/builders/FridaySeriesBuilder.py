""" FridaySeriesBuilder.py is a module for generating a friday release frecuency series json file.
The interface 'FridaySeries' is defined in types.d.ts """
import datetime

import builder.handlers.ArtistasDB as dbAR
import builder.utils.Stats as stats
import builder.utils.Helper as helper
import builder.paths as paths

DBAR = dbAR.ArtistasDB()
PATH = paths.generated


def build(path: str = PATH, start='2013-01-01', stop='2021-12-31', grouping='1M', precision='day') -> None:
    series = {
        "releases":  _generate_data(start, stop, grouping, precision),
        "labels":  stats.date_range(start, stop, grouping)
    }
    assert len(series["releases"]) == len(series["labels"])
    helper.save_json(series, path, 'fridaySeries')


def _generate_data(start='2013-01-01', stop='2021-12-31', grouping='1M', precision='day'):
    command = f"""
        SELECT release_date FROM {dbAR.TABLES['ALBUMS']}
        WHERE
            release_date >= '{start}' AND
            release_date <  '{stop}'  AND
            release_date_precision = '{precision}';
    """
    df = DBAR.to_dataframe(command)
    stats.to_datetime(df)
    series = stats.groupby_date(df, grouping=grouping)['release_date']
    friday_series = []
    for group in series:
        fridays = 0
        for date in group[1]:
            fridays += date.weekday() == 4
        friday_series.append(fridays / len(group[1]))
    return friday_series
