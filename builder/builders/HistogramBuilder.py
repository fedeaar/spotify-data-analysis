""" HistogramBuilder.py is a module for generating 'histogram' json files.
The interface 'AttributeHistogram' is defined in types.d.ts """

import builder.handlers.ArtistasDB as dbAR
import builder.handlers.AnalisisDB as dbAN
import builder.utils.Helper as helper
import builder.utils.Stats as stats
import builder.paths as paths

DBAR = dbAR.ArtistasDB()
DBAN = dbAN.AnalisisDB()
PATH = paths.artistas_histograms


def batch_build(path: str = PATH):
    """builds 2018 - 2021 features, measures, and tonality density histogram datasets"""
    batch_build_features(path)
    batch_build_measures(path)
    build_tonality(path)


def batch_build_features(path: str = PATH):
    """builds 2018 - 2021 'feature' density histogram datasets for all features."""
    for feature in dbAN.FEATURES:
        build_features(feature, path)


def batch_build_measures(path: str = PATH):
    """builds 2018 - 2021 'measure' density histogram datasets for all measures."""
    build_loudness(path)
    build_duration(path)
    build_tempo(path)


def build_tonality(path: str = PATH):
    """builds 2018 - 2021 key density histogram datasets"""
    def order(x: list) -> list:
        return [x[(5 + 7 * i) % 12] for i in range(12)]

    build('key',
          start_y=2018, stop_y=2022,
          bins=[x for x in range(13)],
          labels=order(dbAN.TONALITY),
          colors=["#0000ff", "#ff00ff", "#ffff00", "#ff0000"],
          hidden=[False, True, True, False],
          order_fn=lambda x: order(x),
          path=path)


def build_mode(path: str = PATH):
    """builds 2018 - 2021 mode density histogram datasets"""
    build("mode",
          start_y=2018, stop_y=2022,
          bins=[0, 1, 2],
          labels=['menor', 'mayor'],
          colors=["#0000ff", "#ff00ff", "#ffff00", "#ff0000"],
          hidden=[False, True, True, False],
          path=path)


def build_features(feature: str, path: str = PATH):
    """builds 2018 - 2021 'feature' density histogram datasets"""
    build(feature,
          start_y=2018, stop_y=2022,
          bins=[x / 20 for x in range(21)],
          colors=["#0000ff", "#ff00ff", "#ffff00", "#ff0000"],
          hidden=[False, True, True, False],
          path=path)


def build_loudness(path: str = PATH):
    """builds 2018 - 2021 loudness density histogram datasets"""
    build('loudness',
          start_y=2018, stop_y=2022,
          bins=[x for x in range(-36, 7)],
          colors=["#0000ff", "#ff00ff", "#ffff00", "#ff0000"],
          hidden=[False, True, True, False],
          path=path)


def build_duration(path: str = PATH):
    """builds 2018 - 2021 duration_ms density histogram datasets"""
    bins = [x for x in range(0, 605000, 5000)]
    build('duration_ms',
          bins=bins,
          start_y=2013, stop_y=2022,
          labels=[str(round(x/1000)) + 's' for x in bins],
          colors=["#0000ff", "#ff00ff", "#ffff00", "#ff0000", "#0000ff", "#ff00ff", "#ffff00", "#ff0000", "#ff0000"],
          hidden=[False, True, True, True, True, True, True, True, False],
          path=path)


def build_tempo(path: str = PATH):
    """builds 2018 - 2021 tempo density histogram datasets"""
    build('tempo',
          bins=[x for x in range(40, 221, 5)],
          start_y=2018, stop_y=2022,
          colors=["#0000ff", "#ff00ff", "#ffff00", "#ff0000"],
          hidden=[False, True, True, False],
          path=path)


def build(track_attribute: str,
          start_y: int, stop_y: int,
          bins: list or int or str = 'auto',
          labels: list = None, colors: list = None, hidden: list = None,
          order_fn=None,
          path: str = PATH
          ):
    """ builds a multi-year 'histograms' json. Ie. a set of yearly density histogram datasets.

    :param track_attribute: an artistas.db track's table column name.
    :param bins: the bins of the histogram. Note that each bin constitutes the range [a, b), meaning the last element
        of bins will serve only as the edge of the previous element. default = 'auto'
    :param start_y: starting year (inclusive)
    :param stop_y: ending year (exclusive)
    :param labels: optional labeling for the bins.
    :param colors: optional hex colors for each year.
    :param hidden: optional setting for chart js on-load visibility. A bool value for each year.
    :param order_fn: optional reordering function for categorical histograms.
    :param path: relative path where to store the json file.
    """
    print(f"building {track_attribute}.json")
    data = {
        "labels": labels if labels else bins if isinstance(bins, list) else None,
        "data": {}
    }
    used_bins = []
    for year in range(start_y, stop_y):
        hist, used_bins = _generate_data(track_attribute, bins, str(year), str(year + 1), density=False)
        hist_density = _generate_data(track_attribute, bins, str(year), str(year + 1))[0]
        data['data'][year] = {
            "hist": order_fn(hist) if order_fn else hist,
            "hist_density": order_fn(hist_density) if order_fn else hist_density,
            "color": colors[year - start_y] if colors else None,
            "hidden": hidden[year - start_y] if hidden else None
        }
    if not data['labels']:
        data['labels'] = used_bins

    helper.save_json(data, path, track_attribute)


def _generate_data(track_attribute: str, bins: list or str or int,
                   start: str, stop: str,
                   density: bool = True) -> tuple:
    df = DBAR.to_dataframe(
        f"""
            SELECT * 
            FROM {dbAR.TABLES['TRACKS']} LEFT JOIN {dbAR.TABLES['ALBUMS']} 
            ON   {dbAR.TABLES['TRACKS']}.{dbAR.KEYS['ALBUMS']} = {dbAR.TABLES['ALBUMS']}.{dbAR.KEYS['ALBUMS']} 
            WHERE release_date >= '{start}' AND release_date < '{stop}'
        """
    )
    values, bins = stats.hist(df, track_attribute, bins, density)
    if density:
        total = sum(values)
        values = [round(x/total, 4) for x in values]
    return values, bins
