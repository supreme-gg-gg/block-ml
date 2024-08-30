# Header.py contains all the imports and function definitions (helper / utils)

import numpy as np, pandas as pd
import tensorflow as tf, tf.keras
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix

def load_data(source, type):
    if type == "csv":
        return pd.read_csv(source)
    elif type == "xlsx":
        return pd.read_excel(source)
    elif type == "np":
        # We can ignore this case for now we only use pandas for loading
        # NumPy binary file (file.npy)
        return np.load(source)
    
def export_model(model, source, type, optimizer):
    if type == "hdf5":
        model.save(source, include_optimizer=optimizer)
    elif type == "saved_model":
        model.save(source, save_format="tf", include_optimizer=optimizer)

# This can only be run after history is obtained from model training
# Unfortunately we could not make multiselector work in Blockly...
def plot_history(metric, history):

    if metric == "all":
        plt.plot(history["accuracy"], label="accuracy")
        plt.plot(history["loss"], label="loss")
        plt.plot(history["precision"], label="precision")
        plt.plot(history["recall"], label="recall")
    elif metric not in history:
        print(f"Warning: {metric} not found in history")
    else:
        plt.plot(history[metric], label=metric)
    
    plt.xlabel("Epochs")
    plt.ylabel("value")
    plt.title("Training history")
    plt.legend(loc="upper right")
    plt.show()

def show_accuracy(history, final, overTime):
    if (final) :
        final_acc = history["accuracy"][-1]
        print(f"Final Training Accuracy: {final_acc}")
    
    if (overTime):
        plot_history(["accuracy"], history)

# You can only use this function after you used model.train
# You must also have already indicated the label column in model.train (i.e. must be supervised learning)
def plot_confusion_matrix(y_true, y_pred, labels):

    '''
    For now, by default we use the test set to make prediction 
    and compare it to the y-values in the test set.
    '''

    # Assuming y_true and y_pred are defined somewhere in the user code
    cm = confusion_matrix(y_true, y_pred, labels=labels)

    fig, ax = plt.subplots()
    cax = ax.matshow(cm, cmap='Blues')
    plt.title('${title}')
    fig.colorbar(cax)

    ax.set_xticks(range(len(labels)))
    ax.set_yticks(range(len(labels)))
    ax.set_xticklabels(labels)
    ax.set_yticklabels(labels)
    plt.xlabel('Predicted')
    plt.ylabel('Actual')

    for (i, j), val in np.ndenumerate(cm):
        ax.text(j, i, f'{val}', ha='center', va='center')

    plt.show()

# we can add other ways to visulize / analyse the result
def evaluate_model(test_data):
    score = model.evaluate(test_data)
    print("Test loss:", score[0])
    print("Test accuracy:", score[1])
