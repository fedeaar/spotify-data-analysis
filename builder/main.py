import builder.handlers.ArtistasDB as dbAR
import builder.handlers.AnalisisDB as dbAN
import builder.handlers.invitedDB as dbIN
import builder.handlers.SpotifyAPI as API

import builder.utils.Helper as helper
import builder.utils.Stats as stats
import builder.paths as paths

import builder.builders.DatasetBuilder as datasetB
import builder.builders.GenresBuilder as genresB
import builder.builders.HistogramBuilder as histogramB
import builder.builders.PopularityBuilder as popularityB
import builder.builders.ReleaseSeriesBuilder as releaseSB
import builder.builders.TonalitySeries as tonalitySB
import builder.builders.FridaySeriesBuilder as fridaySB
import builder.builders.invitedArtistsBuilder as invitedSB

if __name__ == '__main__':
    histogramB.build_duration()
    pass


