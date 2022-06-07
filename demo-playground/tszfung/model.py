import os
import numpy as np
import tensorflow as tf

def load_data_as_arr(class_name: str, image_size: int):
    classes = ['glasses', 'pants', 'phones', 'shoes', 'topwears', 'watches']
    train_dataset_path = '../../datasets'
    img_list = []
    label_list = []

    for idx, c in enumerate(classes):
        class_dir_path = os.path.join(train_dataset_path, c)
        for filename in os.listdir(class_dir_path):
            filepath = os.path.join(class_dir_path, filename)
            print(filepath)
            img = tf.keras.utils.load_img(filepath, target_size = (image_size, image_size))
            img = tf.keras.utils.img_to_array(img)
            img_list.append(img)
            label_list.append(idx)
    return np.array(img_list), np.array(label_list)
