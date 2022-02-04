""" GenresBuilder.py is a module for generating a genre bar-chart json file.
The interface 'GenresDistribution' is defined in types.d.ts """

import builder.handlers.ArtistasDB as dbAR
import builder.utils.Helper as helper
import builder.paths as paths
DBAR = dbAR.ArtistasDB()

GENRES = {
    "afrobeat": [
        "latin afrobeat"
    ],
    "ambient": [
        "ambient techno",
        "argentine ambient",
        "compositional ambient"
    ],
    "avant garde": [
        "early avant garde"
    ],
    "blues": [
        "blues latinoamericano"
    ],
    "cantautor": [
        "cantautor",
        "cantautora argentina"
    ],
    "clasica": [
        "latin classical",
        "orchestral soundtrack"
    ],
    "cristiano": [
        "latin christian",
        "latin worship"
    ],
    "cumbia": [
        "cumbia 420",
        "cumbia andina mexicana",
        "cumbia paraguaya",
        "cumbia pop",
        "cumbia santafesina",
        "cumbia surena",
        "cumbia villera",
        "nu-cumbia"
    ],
    "electronica": [
        "deconstructed club",
        "deep progressive house",
        "deep progressive trance",
        "electronica argentina",
        "ethnotronica",
        "experimental club",
        "experimental house",
        "focus trance",
        "folktronica",
        "house argentino",
        "latintronica",
        "mexican electronic",
        "microhouse",
        "minimal dub",
        "organic electronic",
        "organic house",
        "raw techno",
        "techno argentina"
    ],
    "folclore": [
        "bolero",
        "canto popular uruguayo",
        "chamame",
        "chicha",
        "choro",
        "cuarteto",
        "fado",
        "folclore jujeno",
        "folclore salteno",
        "folclore santiagueno",
        "folclore tucumano",
        "folklore argentino",
        "folklore cuyano",
        "folklore nuevo argentino",
        "folklore surero",
        "funana",
        "musica andina",
        "musica andina chilena",
        "musica indigena latinoamericana",
        "musica mapuche",
        "musica popular colombiana",
        "musica puntana",
        "nueva cancion",
        "nuevo folklore argentino",
        "nuevo folklore mexicano",
        "polca paraguaya",
        "ranchera",
        "son jarocho",
        "trova",
        "zamba"
    ],
    "funk": [
        "latin funk"
    ],
    "grunge": [
        "grunge argentina"
    ],
    "hip hop": [
        "argentine hip hop"
    ],
    "indie": [
        "argentine indie",
        "argentine indie rock",
        "chilean indie",
        "indie cordoba",
        "indie folk argentino",
        "indie nordeste argentino",
        "indie platense",
        "indie tucumano",
        "manso indie",
        "mexican indie",
        "rosario indie"
    ],
    "jazz": [
        "argentine jazz",
        "ecm-style jazz",
        "electro jazz",
        "harmonica jazz",
        "nu jazz"
    ],
    "latin": [
        "deep latin alternative",
        "latin",
        "latin soundtrack"
    ],
    "metal": [
        "argentine heavy metal",
        "argentine metal",
        "black metal argentino",
        "celtic metal",
        "death  n  roll",
        "deep folk metal",
        "folk metal latinoamericano",
        "gothic metal",
        "gothic symphonic metal",
        "instrumental progressive metal",
        "latin metal",
        "latincore",
        "melodic thrash",
        "mexican metal",
        "progressive doom",
        "progressive sludge",
        "psych gaze",
        "queercore",
        "retro metal",
        "shred",
        "spanish metal",
        "symphonic deathcore",
        "symphonic metal",
        "symphonic power metal",
        "technical deathcore",
        "trancecore",
        "trash rock"
    ],
    "pop": [
        "argentine telepop",
        "experimental pop",
        "hyperpop en espanol",
        "latin pop",
        "latin arena pop",
        "latin viral pop",
        "mexican pop",
        "modern dream pop",
        "pop ambient",
        "pop argentino",
        "pop electronico",
        "pop romantico",
        "pop venezolano",
        "spanish electropop",
        "spanish new wave",
        "spanish pop",
        "world",
        "world chill",
        "world devotional"
    ],
    "punk": [
        "argentine punk",
        "gypsy punk",
        "post-punk argentina",
        "post-punk latinoamericano",
        "post-rock latinoamericano"
    ],
    "rap": [
        "rap conciencia",
        "rap cristiano",
        "rap latina",
        "rap underground argentino",
        "rap underground espanol"
    ],
    "reggae": [
        "argentine reggae",
        "reggae en espanol"
    ],
    "reggaeton": [
        "reggaeton"
    ],
    "rock": [
        "acid rock",
        "argentine alternative rock",
        "argentine hardcore",
        "argentine rock",
        "classic garage rock",
        "dark rock",
        "deep surf music",
        "hard stoner rock",
        "italian progressive rock",
        "latin alternative",
        "latin american heavy psych",
        "latin rock",
        "latin shoegaze",
        "latin surf rock",
        "math rock latinoamericano",
        "mexican rock",
        "paraguayan rock",
        "rock cristiano",
        "rock en espanol",
        "rock nacional",
        "rock urbano mexicano",
        "rockabilly en espanol",
        "space rock",
        "spanish pop rock",
        "stoner rock",
        "surf music"
    ],
    "r&b": [
        "r&b argentino",
        "r&b en espanol"
    ],
    "ska": [
        "latin ska",
        "ska",
        "ska argentino",
        "ska jazz",
        "ska revival",
        "traditional ska"
    ],
    "tango": [
        "neotango",
        "nuevo tango",
        "tango",
        "tango cancion",
        "vintage tango"
    ],
    "trap": [
        "emo trap en espanol",
        "trap argentino",
        "trap chileno",
        "trap latino",
        "trap triste"
    ],
    "tropical": [
        "tropical",
        "tropical alternativo"
    ],
    "_misc": [
        "5th wave emo",
        "accordion",
        "background music",
        "balearic",
        "bandoneon",
        "bases de freestyle",
        "boom bap espanol",
        "cancion infantil latinoamericana",
        "cancion melodica",
        "chapman stick",
        "charango",
        "cover acustico",
        "coverchill",
        "drift",
        "electra",
        "fallen angel",
        "freakbeat",
        "guitarra argentina",
        "jazz guitar",
        "musica para ninos",
        "neo-proto",
        "nightrun",
        "nu age",
        "nu gaze",
        "shamanic",
        "soundtrack",
        "vegan straight edge",
        "video game music"
    ]
}  # clasificación de generos manual (27/01/22)


def build(path: str = paths.generated):
    genres = _generate_data()
    represented = DBAR.query(f"SELECT count(DISTINCT {dbAR.KEYS['ARTISTS']}) FROM {dbAR.TABLES['TRACKS']}")[0][0]
    total = DBAR.query(f"SELECT count({dbAR.KEYS['ARTISTS']}) FROM {dbAR.TABLES['ARTISTS']}")[0][0]
    genres_dist = {
        "genres": genres,
        "represented": represented,
        "total": total
    }
    helper.save_json(genres_dist, path, 'genresDist')


def _generate_data() -> dict:
    df = DBAR.to_dataframe(f"""
        SELECT * 
        FROM {dbAR.TABLES['TRACKS']}
    """)
    res = {k: {"subgenres": v, "total": 0} for (k, v) in GENRES.items()}
    artists = df.groupby('artist_id')
    for name, artist in artists:  # RIP
        set_genres = []
        for subgenre in artist['genre']:
            for _genre in res:
                done = False
                for _subgenre in res[_genre]["subgenres"]:
                    if subgenre == _subgenre:
                        if _genre not in set_genres:
                            res[_genre]["total"] += 1
                            set_genres.append(_genre)
                        done = True
                        break
                if done:
                    break
    return res
