""" Database.py serves as a base interface for sqlite communication and casting to and from pandas' dataframes. """

from typing import Iterable
import sqlite3 as sq
import pandas as pd


class Database:

    def __init__(self, database_path: str):
        """ a base interface for SQLite communications and casting to and from pandas' dataframe.
        :param database_path: the relative path to the database.
        """
        self.db = database_path
        # flags
        self.bypassIntegrityErrors = False
        self.verbose = False

    def bypass_integrity_errors(self, state: bool):
        """ sets handling of SQL integrity errors.
        :param state: True for bypass, False for raise.
        """
        self.bypassIntegrityErrors = state

    def toggle_verbose(self, state: bool = None) -> None:
        """ toggles print statements for method calls. """
        self.verbose = state if state else not self.verbose

    def push(self, commands: [(str, Iterable) or str]) -> None:
        """ executes and commits a series of SQLite statements.
        :param commands: a series of SQL statements or (statement, '?'-replacements) pairs.
        """
        db = sq.connect(self.db)
        cursor = db.cursor()
        for command in commands:
            if self.verbose:
                print(f"pushing: {command}")
            try:
                if isinstance(command, tuple):
                    cursor.execute(command[0], command[1])
                else:
                    cursor.execute(command)
            except sq.IntegrityError as error:
                if self.bypassIntegrityErrors:
                    continue
                else:
                    raise error
        if self.verbose:
            print(f"commiting.")
        db.commit()
        db.close()

    def push_from(self, path: str) -> None:
        """ executes and commits a series of SQLite statements from a file.
        :param path: the relative path to the file.
        """
        command = ''
        with open(path, 'r', encoding='utf-8') as file:
            for line in file:
                command += line
        commands = command.split(';')
        self.push(commands)

    def query(self, command: (str, Iterable) or str) -> list:
        """ queries the database. ie, does not commit commands after execution.
        :param command: a SQLite statement.
        :return: a list of database rows / tuples.
        """
        if self.verbose:
            print(f"quering: {command}")
        db = sq.connect(self.db)
        cursor = db.cursor()
        if isinstance(command, tuple):
            cursor.execute(command[0], command[1])
        else:
            cursor.execute(command)
        result = cursor.fetchall()
        db.close()
        return result

    def push_df(self, table_name: str, df: pd.DataFrame, if_exists: str = 'append') -> None:
        """ stores a dataframe in the database. Simple wrapper for df.to_sql() method.
        :param table_name: where to store the dataframe.
        :param df: the dataframe.
        :param if_exists: df.to_sql() if_exists param wrapper. Possible: 'fail', 'replace', 'append'.
            Default = 'append'.
        """
        db = sq.connect(self.db)
        df.to_sql(table_name, db, if_exists=if_exists)
        db.close()

    def to_dataframe(self, select_command: str) -> pd.DataFrame:
        """ transforms a database selection into a pandas' dataframe.
        :param select_command: an SQLite select command.
        """
        db = sq.connect(self.db)
        df = pd.read_sql(select_command, db)
        db.close()
        return df
