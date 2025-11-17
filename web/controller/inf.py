import os
import tensorflow as tf
from PIL import Image
import numpy as np
from werkzeug.datastructures import FileStorage

class DetectRiceleafDisease:
    MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'rice-leaf-model-full2.keras'))
    MODEL = tf.keras.models.load_model(MODEL_PATH)
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

    @classmethod
    def allowed_file(cls, filename: str) -> bool:
        return (
            '.' in filename and
            filename.rsplit('.', 1)[1].lower() in cls.ALLOWED_EXTENSIONS
        )
    
    @staticmethod
    def detectDisease(file: FileStorage) -> str:
        try:
            img = Image.open(file.stream).convert('RGB').resize((128,128), Image.Resampling.LANCZOS)
        except Exception:
            return "can't load the image"
        
        # convert ke numpy array
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, 0)  # shape (1,128,128,3)

        prediction = np.argmax(DetectRiceleafDisease.MODEL.predict(img_array))

        match prediction:
            case 0: return 'bacterial leaf blight'
            case 1: return 'brown spot'
            case 2: return 'healthy'
            case 3: return 'leaf blast'
            case 4: return 'leaf scald'
            case 5: return 'narrow brown spot'
        
        return 'ml error'