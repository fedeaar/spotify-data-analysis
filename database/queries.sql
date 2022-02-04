/* top 10 por followers */
SELECT artist_name, popularidad, followers 
FROM artists 
ORDER BY followers 
DESC LIMIT 10;


/* total canciones [2000, 2022) */
SELECT count(track_id) 
FROM tracks LEFT JOIN albums 
ON tracks.album_id = albums.album_id 
WHERE release_date >= '2000';

/* total artistas con generos en ref a otros paises */
SELECT count(DISTINCT artist_id) 
FROM genres 
WHERE 
    UPPER(genre) like UPPER('%mexic%') 
    OR UPPER(genre) like UPPER('%italia%')
    OR UPPER(genre) like UPPER('%paraguay%')
    OR UPPER(genre) like UPPER('%uruguay%')
    OR UPPER(genre) like UPPER('%chile%')
    OR UPPER(genre) like UPPER('%venez%');

/* cantidad de singles y albumes 2013 - 2017 */
SELECT count(album_id), album_type
FROM albums 
WHERE 
	release_date_precision = 'day'
	AND release_date >= '2013' 
	AND release_date < '2018'
GROUP BY album_type;

/* cantidad de singles y albumes desde 2018 */
SELECT count(album_id), album_type
FROM albums 
WHERE 
	release_date_precision = 'day'
	AND release_date >= '2018'
GROUP BY album_type;

/* datos para promedio duration_ms */
SELECT count(track_id), sum(duration_ms)
FROM tracks
LEFT JOIN albums
ON tracks.album_id = albums.album_id 
WHERE 
	release_date_precision = 'day'
	AND release_date >= '2021' 
	AND release_date < '2022';


/* Top tracks por duracion */
SELECT duration_ms, track_name, album_name, artist_name
FROM tracks
LEFT JOIN albums ON tracks.album_id = albums.album_id
LEFT JOIN artists ON tracks.artist_id = artists.artist_id
ORDER by duration_ms DESC 
LIMIT 10;

/* mas albumes publicados / sencillos */
SELECT count(album_id), artist_name 
FROM albums
LEFT JOIN artists 
ON albums.artist_id = artists.artist_id
WHERE album_type = 'album' /* 'single' */
GROUP BY albums.artist_id
ORDER BY count(album_id) DESC;

/* mas tracks por album */
SELECT count(tracks.track_id), album_name, artist_name, tracks.album_id
FROM tracks
LEFT JOIN albums ON tracks.album_id = albums.album_id
LEFT JOIN artists ON tracks.artist_id = artists.artist_id
GROUP by tracks.album_id
ORDER by count(tracks.track_id) DESC;