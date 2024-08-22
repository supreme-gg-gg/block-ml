import numpy as np, pandas as pd
import tensorflow as tf
import tf.keras
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split

def load_data(source, type):
    if type == "csv":
        return pd.read_csv(source)
    elif type == "xlsx":
        return pd.read_excel(source)
    elif type == "np":
        # We can ignore this case for now we only use pandas for loading
        # NumPy binary file (file.npy)
        return np.load(source) 