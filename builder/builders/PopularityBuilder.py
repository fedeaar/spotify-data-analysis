""" PopularityBuilder.py is a module for generating a followers json file.
The interface 'FollowersDist' is defined in types.d.ts """

import numpy as np

import builder.handlers.ArtistasDB as dbAR
import builder.handlers.AnalisisDB as dbAN
import builder.utils.Helper as helper
import builder.utils.Stats as stats
import builder.paths as paths

DBAR = dbAR.ArtistasDB()
DBAN = dbAN.AnalisisDB()
PATH = paths.generated

COLORS = ['#f42d3c', '#e22735', '#d0212d', '#bf1b26', '#ae161f', '#9d1018', '#8d0912', '#7d040a', '#6d0000']


def build(path: str = PATH):
    """creates a followersDist json file."""
    print(f"building followersDist.json")

    raw = [0] + [round(10**(x/100)) for x in range(0, 8*92, 10)]
    bins = [x for i, x in enumerate(raw) if x not in raw[:i]]

    idxs = [0, bins.index(10), bins.index(100), bins.index(1000), bins.index(10000), bins.index(100000),
            bins.index(1000000), bins.index(10000000), len(bins) - 1]
    colors = list(np.concatenate([[COLORS[i - 1]] * (idxs[i] - idxs[i - 1]) for i in range(1, 9)]))

    data = {
        "labels": bins,
        "data": {
            "hist": _generate_data(bins, density=False)[0],
            "hist_density": _generate_data(bins)[0],
            "color": colors
        }
    }
    helper.save_json(data, path, 'followersDist')


def _generate_data(bins, density: bool = True) -> tuple:
    df = DBAR.to_dataframe(
        f"""
            SELECT * 
            FROM {dbAR.TABLES['ARTISTS']}
        """
    )
    values, bins = stats.hist(df, 'followers', bins)
    if density:
        total = sum(values)
        values = [round(x/total, 4) for x in values]
    return values, bins
