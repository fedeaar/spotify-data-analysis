## La huella digital de la música argentina 
Éste repositorio reune todo el materia utilizado para crear esta [nota](https://fedeaar.github.io/spotify-data-analysis/web/dist/) y esta [aplicación](https://fedeaar.github.io/spotify-data-analysis/web/dist/widget/widget.html).
Ambas son una exploración de un dataset generado a partir de diversas llamadas a la api de Spotify y una serie de modulos complementarios. 

El dataset se compone de datos sobre 5083 artistas argentinos, siguiendo el siguiente schema:
```sql
CREATE TABLE artists (
    artist_id TEXT PRIMARY KEY,
    artist_name TEXT,
    bio TEXT,
    popularidad INT,
    followers INT,
    saved_albums INT,
    total_albums INT,
    spotify_url TEXT,
    image_640x640 TEXT,
    image_320x320 TEXT,
    image_60x60 TEXT,
    last_updated TEXT
);
CREATE TABLE albums (
    artist_id TEXT,
    album_id TEXT PRIMARY KEY,
    album_name TEXT,
    album_group TEXT,
    album_type TEXT,
    release_date TEXT,
    release_date_precision TEXT,
    total_tracks INT,
    spotify_url TEXT,
    image_640x640 TEXT,
    image_320x320 TEXT,
    image_60x60 TEXT,
    last_updated TEXT,

    FOREIGN KEY (artist_id) REFERENCES artists (artist_id)
);
CREATE TABLE tracks (
    artist_id TEXT,
    album_id TEXT,
    track_id TEXT PRIMARY KEY,
    track_name TEXT,
    disc_number INT,
    track_number INT,
    explicit INT,
    duration_ms INT,
    key INT,
    mode INT,
    time_signature INT,
    tempo REAL,
    danceability REAL,
    energy REAL,
    valence REAL,
    loudness REAL,
    speechiness REAL,
    acousticness REAL,
    instrumentalness REAL,
    liveness REAL,
    spotify_url TEXT,
    last_updated TEXT,

    FOREIGN KEY (artist_id) REFERENCES artists (artist_id),
    FOREIGN KEY (album_id) REFERENCES albums (album_id)
);
CREATE TABLE genres (
    artist_id TEXT,
    genre TEXT,
    last_updated TEXT,

    FOREIGN KEY (artist_id) REFERENCES artists (artist_id)
);
CREATE TABLE related (
    artist_id TEXT,
    other_artist TEXT,
    relationship TEXT,
    last_updated TEXT,

    PRIMARY KEY (artist_id, other_artist),
    FOREIGN KEY (artist_id) REFERENCES artists (artist_id),
    FOREIGN KEY (other_artist) REFERENCES artists (artist_id)
);
CREATE TABLE listeners (
    artist_id TEXT,
    city TEXT,
    country TEXT,
    listeners INT,
    last_updated TEXT,

    PRIMARY KEY (artist_id, city, country),
    FOREIGN KEY (artist_id) REFERENCES artists (artist_id)
);
```
También se creo un segundo dataset que recopila números de resumen para el promedio de los distintos atributos de cada track (por artista y por álbum), y un análisis PCA para los tracks, en base a este primer dataset.

Se pueden encontrar versiones csv de ambos datasets en: [./database/csv](https://github.com/fedeaar/spotify-data-analysis/tree/main/database/csv).

## Estructura del repo:
### ./Builder
#### ./builder/handlers:
Estos módulos manejan el flujo de datos entre la api de Spotify y las bases de datos.

#### ./builder/builders:
Estos módulos manejan la construcción de los archivos JSON utilizados para los gráficos de la nota y de la aplicación.

#### ./builder/utils: 
Estos módulos porveen utilidades generales.

### ./database
Contiene las bases de datos y los JSON generados.

### ./web
Contiene el source para la nota y la aplicación.
