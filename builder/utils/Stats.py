import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA


def artistas_pca(df: pd.DataFrame, features_cols: list, id_cols: list) -> (pd.DataFrame, [float]):
    """ calculates k=2 pca from the given features. Creates a results df.
    :param df: the original df.
    :param features_cols: the columns to use for the pca.
    :param id_cols: the unique identifier columns.
    :return: resulting df and the explained variance ratio of each principal component.
    """
    # modified from : https://towardsdatascience.com/pca-using-python-scikit-learn-e653f8989e60
    x = df.loc[:, features_cols].values    # Separating out the features
    y = df.loc[:, id_cols]                 # Separating out the target
    x = StandardScaler().fit_transform(x)  # Standardizing the features
    pca = PCA(n_components=2)
    principal_components = pca.fit_transform(x)
    principal_df = pd.DataFrame(
        data=principal_components,
        columns=['global_primary_component_x', 'global_primary_component_y']
    ).round(2)
    final_df = pd.concat([y, principal_df], axis=1)
    return final_df, pca.explained_variance_ratio_


def hist(df: pd.DataFrame, column: str, bins: int or str or list = 'auto', density: bool = False) -> tuple:
    """ calculates an histogram from the given parameters.
    :param df: the base dataframe.
    :param column: the column to use for the histogram.
    :param bins: wrapper for numpy's histogram bins parameter.
    :param density: wrapper for numpy's histogram density parameter.
    :return: the resulting histogram and the used bins.
    """
    count, n_bins = np.histogram(df[column].dropna(), density=density, bins=bins)
    return count.tolist(), n_bins.tolist()


def to_datetime(dataframe, date_column='release_date', date_format='%Y-%m-%d') -> None:
    """ sets the dataframe index to a datetime column.
    :param dataframe: the base dataframe.
    :param date_column: the column to use as the new index.
    :param date_format: how date_column is formatted (if a string), following datetime conventions.
    """
    if isinstance(date_column, str):
        dataframe[date_column] = pd.to_datetime(dataframe[date_column], format=date_format)
    dataframe.set_index(date_column)


def date_range(start, stop, grouping='1M', strformat=None) -> [str]:
    """ wrapper for pandas' date_range().strftime().tolist()
    :param start: the starting date
    :param stop: the end date
    :param grouping: the interval between dates, following datetime conventions.
    :param strformat: the resulting dates' format.
    :return: a date range.
    """
    if not strformat:
        if grouping == '1M':
            strformat = "%Y-%m"
        elif grouping == '1Y':
            strformat = "%Y"
        else:
            raise ValueError("no strformat deduced for grouping type. Set param. strformat directly.")
    return pd.date_range(start, stop, freq=f'{grouping}').strftime(strformat).tolist()


def normalize_date_range(dataframe, start, stop, grouping='1M') -> pd.DataFrame:
    """ normalizes a dataframe's dates.
    :param dataframe: the base dataframe.
    :param start: the starting date
    :param stop: the end date
    :param grouping: the interval between dates, following datetime conventions.
    """
    idx = pd.date_range(start, stop, freq=f'{grouping}')
    dataframe.index = pd.DatetimeIndex(dataframe.index)
    return dataframe.reindex(idx, fill_value=0)


def groupby_date(dataframe, date_column='release_date', grouping='1M') -> pd.DataFrame:
    """ groups a df by a date frequency.
    :param dataframe: the base dataframe.
    :param date_column: the column to group by.
    :param grouping: the frequency between dates, following datetime conventions.
    :return: the grouped dates.
    """
    return dataframe.groupby(pd.Grouper(key=date_column, freq=f'{grouping}'))
