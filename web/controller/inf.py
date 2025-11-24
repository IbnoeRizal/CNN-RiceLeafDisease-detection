import os
import tensorflow as tf
from PIL import Image
import numpy as np
from werkzeug.datastructures import FileStorage
from flask import jsonify

class DetectRiceleafDisease:
    MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'rice-leaf-model-full2.keras'))
    MODEL = tf.keras.models.load_model(MODEL_PATH)
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    CLASSIFICATION: tuple[str,...] = (
        'bacterial leaf blight',
        'brown spot', 
        'healthy',
        'leaf blast',
        'leaf scald',
        'narrow brown spot')

    @classmethod
    def allowed_file(cls, filename: str) -> bool:
        return (
            '.' in filename and
            filename.rsplit('.', 1)[1].lower() in cls.ALLOWED_EXTENSIONS
        )
    
    @staticmethod
    def detectDisease(file: FileStorage) :
        try:
            img = Image.open(file.stream).convert('RGB').resize((128,128), Image.Resampling.LANCZOS)
        except Exception:
            return ({'error': "can't load the image"})
        
        # convert ke numpy array
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, 0)  # shape (1,128,128,3)

        prediction = DetectRiceleafDisease.MODEL.predict(img_array)

        return jsonify([
            {"label": label, "confidence": float(conf)}
            for label, conf in zip(DetectRiceleafDisease.CLASSIFICATION,prediction[0])
        ])