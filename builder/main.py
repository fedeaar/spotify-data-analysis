import builder.handlers.ArtistasDB as dbAR
import builder.handlers.AnalisisDB as dbAN
import builder.handlers.invitedDB as dbIN
import builder.handlers.SpotifyAPI as API

import builder.utils.Helper as helper
import builder.utils.Stats as stats
import builder.paths as paths

import builder.builders.DatasetBuilder as datasetBuilder
import builder.builders.GenresBuilder as genresBuilder
import builder.builders.HistogramBuilder as histogramBuilder
import builder.builders.PopularityBuilder as popularityBuilder
import builder.builders.ReleaseSeriesBuilder as releaseSeriesBuilder
import builder.builders.TonalitySeries as tonalitySeriesBuilder

import sqlite3 as sq

if __name__ == '__main__':
    x = dbIN.InvitedDB()
    y = dbAR.ArtistasDB()
    z = y.query("SELECT artist_id, album_id FROM albums WHERE release_date >= '2013' AND release_date < '2022';")
    x.batch_create(z)
    pass


