import numpy as np, pandas as pd
import tensorflow as tf
import tf.keras

def load_data(source, type):
    if type == "csv":
        return pd.read_csv(source)
    elif type == "xlsx":
        return pd.read_excel(source)
    elif type == "np":
        # We can ignore this case for now we only use pandas for loading
        # NumPy binary file (file.npy)
        return np.load(source) 
batch = 32
assert ("column" in data.columns), "Specified target column not found"
y = data["column"]

# Ideally all these are input by user in the "TRAIN" block
model.compile(
    optimizer=keras.optimizers.Adam, 
    loss=keras.losses.BinaryCrossentropy(), 
    metrics=[
        keras.metrics.BinaryAccuracy(),
        kears.metrics.FalseNegatives()
    ]
)

# x and y will be obtained from input layer block
# batch-size and epochs will be input by user
model.fit(x, y, batch_size=32, epochs=10)

# exported model contained forward pass and can be served via TF-Serving
model.export("myModel.h5")