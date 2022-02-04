""" TonalitySeries.py is a module for generating a tonality series json file.
The interface 'TonalitySeries' is defined in types.d.ts """

import builder.handlers.ArtistasDB as dbAR
import builder.handlers.AnalisisDB as dbAN

import builder.utils.Helper as helper
import builder.utils.Stats as stats
import builder.paths as paths

DBAR = dbAR.ArtistasDB()
PATH = paths.generated
COLORS = ['#00429d', '#3761ab', '#5681b9', '#73a2c6', '#93c4d2', '#b9e5dd',
          '#ffd3bf', '#ffa59e', '#f4777f', '#dd4c65', '#be214d', '#93003a']


def build(path: str = PATH):
    generated = _generate_data()
    data = {
        "labels": stats.date_range('2000', '2022', '1Y', "%Y"),
        "keys": {
            dbAN.TONALITY[i]: {
                "color": COLORS[i],
                "hist":  generated[i]
            } for i in range(12)
        }
    }
    helper.save_json(data, path, "tonalitySeries")


def _generate_data(start='2000-01-01', stop='2022', grouping='1Y'):
    df = DBAR.to_dataframe(f"""
        SELECT release_date, key
        FROM {dbAR.TABLES['TRACKS']} 
        INNER JOIN {dbAR.TABLES['ALBUMS']} 
        ON {dbAR.TABLES['TRACKS']}.{dbAR.KEYS['ALBUMS']} = {dbAR.TABLES['ALBUMS']}.{dbAR.KEYS['ALBUMS']}
        WHERE release_date >= '{start}' AND release_date < '{stop}';   
    """)
    stats.to_datetime(df)

    counts = []
    # conseguir cantidades:
    for i in range(12):
        grouped = stats.groupby_date(df[df['key'] == i], 'release_date', grouping=grouping)
        monthly_key_count = stats.normalize_date_range(grouped['key'].agg('count'), start, stop, grouping=grouping)
        counts.append(monthly_key_count.tolist())
    # normalizar:
    for i in range(len(counts[0])):
        total = sum([key_count[i] for key_count in counts])
        for key_count in counts:
            key_count[i] = round(key_count[i] / total, 4) if total != 0 else 0

    return counts

