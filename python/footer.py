# model.fit and model.compile has been handled by train-setup.json block

# score is obtained in model.evaluate

print("Test loss:", score[0])
print("Test accuracy:", score[1])

# MORE HELPER FUNCTIONS

# exported model contained forward pass and can be served via TF-Serving
model.export("myModel.h5")