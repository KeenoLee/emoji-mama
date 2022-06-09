import tensorflow as tf
import numpy as np


imgSize = 224
class_names = ['beverages', 'books', 'bottles', 'cards', 'chairs', 'glasses', 'keyboards', 'keys', 'mouses', 'notebooks', 'pants', 'pens', 'phones', 'rings', 'shoes', 'televisions', 'tissues', 'topwears', 'umbrellas', 'watches']
model_dir = "./model/myTrainingModelv3.h5"
predict_Model = tf.keras.models.load_model(model_dir)

imgPath = "./datasets/cards/cards-42.jpg"
image = tf.keras.preprocessing.image.load_img(
    imgPath, color_mode="rgb", target_size=(imgSize,imgSize)
)

input_arr = tf.keras.preprocessing.image.img_to_array(image)
input_arr = np.array([input_arr])

prediction = predict_Model.predict(input_arr)
prediction_Argsort = np.argsort(prediction[0])[::-1]

result_label = class_names[ prediction_Argsort[0] ]
result_poss = prediction[0][ prediction_Argsort[0] ] * 100
print(prediction)
print(f"Is that {result_label} ({result_poss}% possibility)")