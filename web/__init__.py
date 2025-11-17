import os
from dotenv import load_dotenv
from flask import Flask
from flask import request, render_template
from werkzeug.utils import secure_filename

from web.controller.inf import DetectRiceleafDisease as DR

load_dotenv()

app = Flask(__name__)
app.config['DEBUG'] = os.getenv('FLASK_DEBUG',0) == 1


@app.route('/', methods=['get'])
def home():
    return render_template('home.html')

@app.route('/upload',methods=['post'])
def upload():
    if 'file' not in request.files:
        return 'bad request, no image received', 400
    
    tempfile = request.files['file']
    
    if tempfile.filename in (None, ''):
        return 'bad request, no file name',400
    
    tempfile.filename = secure_filename(tempfile.filename)
    
    if not DR.allowed_file(tempfile.filename):
        return 'bad request, file is not allowed', 400
    
    return DR.detectDisease(tempfile), 200