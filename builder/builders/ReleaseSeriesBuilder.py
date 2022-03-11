""" releaseSeriesBuilder.py is a module for generating a release series json file.
The interface 'ReleaseSeries' is defined in types.d.ts """

import builder.handlers.ArtistasDB as dbAR
import builder.utils.Stats as stats
import builder.utils.Helper as helper
import builder.paths as paths

DBAR = dbAR.ArtistasDB()
PATH = paths.generated


def build(path: str = PATH, start='2013-01-01', stop='2021-12-31', grouping='1M', precision='day') -> None:
    series = {
        "albumes":  _generate_data(start, stop, 'album', grouping, precision),
        "singles": _generate_data(start, stop, 'single', grouping, precision),
        "labels":  stats.date_range(start, stop, grouping)
    }
    helper.save_json(series, path, 'releaseSeries')


def _generate_data(start='2000-01-01', stop='2021-12-31', album_type='single', grouping='1M', precision='day'):
    command = f"""
        SELECT release_date FROM {dbAR.TABLES['ALBUMS']}
        WHERE
            album_type   = '{album_type}' AND
            release_date >= '{start}'     AND
            release_date <  '{stop}'      AND
            release_date_precision = '{precision}';
    """
    df = DBAR.to_dataframe(command)
    stats.to_datetime(df)
    series = stats.groupby_date(df, grouping=grouping)['release_date'].count()
    return series.tolist()
