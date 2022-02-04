import requests
import json
from bs4 import BeautifulSoup as BS
import datetime


# --- globals ---
CSVFMT = ' ; '
CSVSKIP = '#'
ENCODE = 'utf-8'


# --- funciones generales ---
def clean_str(text: str) -> str:
    """simple string sanitization for some db uses. NOT for injection sanitization."""
    return str(text).strip().lower().translate(str.maketrans("()'", '-- '))


# --- funciones CSV ---
def save_list(path: str, datalist: list, unique_column: int = None) -> None:
    """ incrementaly saves lists into a csv-like format file.
    :param path: the relative path to the file.
    :param datalist: the data to store.
    :param unique_column: skip saving if there exists a row with the same column value at this index.
    """
    with open(path, 'a+', encoding=ENCODE) as file:
        if not unique_column or not in_csv(path, datalist[unique_column], unique_column):
            save = ''.join(str(x) + CSVFMT for x in datalist)[:-len(CSVFMT)] + '\n'
            file.write(save)


def load_csv(path: str) -> list:
    """loadss a csv into a list.
    :param path: the relative path to the csv file.
    """
    out = []
    with open(path, 'r', encoding=ENCODE) as file:
        for i, line in enumerate(file):
            split = line.split(CSVFMT)
            if split[0] not in CSVSKIP:
                out.append(split)
    return out


def in_csv(path: str, data: str, index: int) -> bool:
    """ searches csv for a given string.
    :param path: the relative path to the file.
    :param data: the string to search.
    :param index: where to start searching.
    :return: True if data in path.
    """
    file = load_csv(path)
    for line in file:
        if clean_str(line[index]) == clean_str(data):
            return True
    return False


# --- funciones JSON ---
def load_json(path: str) -> dict:
    """loads a json into a dict.
    :param path: the relative path to the json file.
    """
    return json.load(open(path), encoding='utf-8')


def save_json(data: dict, path: str, filename: str) -> None:
    """stores a json in the given path.
    :param data: the object to save.
    :param path: the relative folder path (no '/' ending).
    :param filename: the name for the file to create.
    """
    json.dump(data, open(f'{path}/{filename}.json', "w", encoding='utf-8'), indent=4)


def delete_key(dictionary: dict, key: str, parent: str) -> dict:
    """ deletes all instances of a key inside specific parent dicts.
    :param dictionary: the base dict.
    :param key: the key to delete.
    :param parent: the parent's dict key.
    :return: the mutated dict.
    """
    def bfs(tree):
        nodes = []
        for branch in tree.keys():
            leaf = tree[branch]
            if isinstance(leaf, dict):
                if branch == parent:
                    del leaf[key]
                    return True
                nodes.append(leaf)
        for node in nodes:
            if bfs(node):
                return True

    bfs(dictionary)
    return dictionary


# --- funciones HTML ---
def get_html(url: str) -> BS:
    """requests html from the given url.
    :param url: the request address.
    :returns a beautiful soup object."""
    req = requests.get(url)
    return BS(req.content, 'html.parser')


def try_request(request, tries: int = 10):
    """simple ConnectionError handling for requests.
    :param request: the request function to execute.
    :param tries: the maximum amount of trials.
    """
    for i in range(tries):
        try:
            return request()
        except ConnectionError as e:
            print(f"{e}\n retrying.")
            continue


# --- funciones datetime ---
def current_time() -> datetime:
    """ :return: the current time. """
    return datetime.datetime.now()


def seconds_from_now(time: str or datetime, _format: str = "%Y-%m-%d %H:%M:%S.%f") -> float:
    """ calculates the elapsed time between a given date and now in seconds.
    :param time: a string or datetime object.
    :param _format: how time is formatted (if a string), following datetime conventions.
    :return: the elapsed time in seconds.
    """
    if isinstance(time, str):
        time = datetime.datetime.strptime(time, _format)
    return (current_time() - time).total_seconds()
