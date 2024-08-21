import numpy as np
import tensorflow as tf
import tf.keras

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