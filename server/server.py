from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import os
import base64
import numpy as np
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app)
CORS(app)

limiter = Limiter(
    get_remote_address, 
    app=app,
    default_limits=["200 per day", "50 per hour"]
)

load_dotenv()
DB_PASS = os.getenv("DB_PASSKEY")
MONGO_DB_URI = "mongodb+srv://khanjunaid80121:"+DB_PASS+"@cluster0.exfs3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Helper function to decode base64 image
def decode_base64_image(base64_string):
    image_data = base64.b64decode(base64_string.split(',')[1])
    np_array = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(np_array, cv2.IMREAD_COLOR)

# Helper function to encode image to base64
def encode_image_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

# Apply adjustments
@app.route('/adjust', methods=["POST"])
@limiter.limit("20 per minute")
def apply_adjustments():
    data = request.get_json()
    client_ip = request.headers.getlist('X-Forwarded-For')[0] if 'X-Forwarded-For' in request.headers else request.remote_addr
    
    try:
        client = MongoClient(MONGO_DB_URI, server_api=ServerApi('1'))
        db = client['Photoshop']
        collection = db['logs']
        
        image = decode_base64_image(data['image'])
        
        # Apply exposure adjustment
        if 'exposure' in data:
            exposure = float(data['exposure']) / 100  # Scale to reasonable range
            image = cv2.convertScaleAbs(image, alpha=1 + exposure, beta=exposure * 50)
        
        # Apply contrast adjustment
        if 'contrast' in data:
            contrast = float(data['contrast'])
            f = 131 * (contrast + 127) / (127 * (131 - contrast))
            alpha_c = f
            gamma_c = 127 * (1 - f)
            image = cv2.addWeighted(image, alpha_c, image, 0, gamma_c)
        
        # Apply highlights adjustment (affects brighter areas)
        if 'highlights' in data:
            highlights = float(data['highlights'])
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            # Create mask for bright areas
            _, bright_mask = cv2.threshold(l, 180, 255, cv2.THRESH_BINARY)
            # Adjust brightness
            adjustment = highlights * 0.5
            l = cv2.add(l, adjustment, mask=bright_mask)
            lab = cv2.merge([l, a, b])
            image = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        
        # Apply shadows adjustment (affects darker areas)
        if 'shadows' in data:
            shadows = float(data['shadows'])
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            # Create mask for dark areas
            _, dark_mask = cv2.threshold(l, 80, 255, cv2.THRESH_BINARY_INV)
            # Adjust brightness
            adjustment = shadows * 0.5
            l = cv2.add(l, adjustment, mask=dark_mask)
            lab = cv2.merge([l, a, b])
            image = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        
        collection.insert_one({
            "timestamp": datetime.now(),
            "status": "Success",
            "client_ip": client_ip,
            "operation": "adjustments"
        })
        
        return jsonify({
            "message": "Adjustments applied successfully",
            "image": encode_image_to_base64(image)
        }), 200
        
    except Exception as e:
        print('Error:', e)
        return jsonify({"message": "Error in processing adjustments"}), 500


# Crop image
@app.route('/crop', methods=["POST"])
@limiter.limit("20 per minute")
def crop_image():
    data = request.get_json()
    client_ip = request.headers.getlist('X-Forwarded-For')[0] if 'X-Forwarded-For' in request.headers else request.remote_addr
    
    try:
        client = MongoClient(MONGO_DB_URI, server_api=ServerApi('1'))
        db = client['Photoshop']
        collection = db['logs']
        
        image = decode_base64_image(data['image'])
        
        # Get crop coordinates
        x = int(data.get('x', 0))
        y = int(data.get('y', 0))
        width = int(data.get('width', image.shape[1]))
        height = int(data.get('height', image.shape[0]))
        
        # Ensure coordinates are within bounds
        h, w = image.shape[:2]
        x = max(0, min(x, w))
        y = max(0, min(y, h))
        width = min(width, w - x)
        height = min(height, h - y)
        
        # Crop the image
        cropped = image[y:y+height, x:x+width]
        
        collection.insert_one({
            "timestamp": datetime.now(),
            "status": "Success",
            "client_ip": client_ip,
            "operation": "crop"
        })
        
        return jsonify({
            "message": "Image cropped successfully",
            "image": encode_image_to_base64(cropped)
        }), 200
        
    except Exception as e:
        print('Error:', e)
        return jsonify({"message": "Error in cropping image"}), 500


# Rotate image
@app.route('/rotate', methods=["POST"])
@limiter.limit("20 per minute")
def rotate_image():
    data = request.get_json()
    client_ip = request.headers.getlist('X-Forwarded-For')[0] if 'X-Forwarded-For' in request.headers else request.remote_addr
    
    try:
        client = MongoClient(MONGO_DB_URI, server_api=ServerApi('1'))
        db = client['Photoshop']
        collection = db['logs']
        
        image = decode_base64_image(data['image'])
        angle = float(data.get('angle', 0))
        
        # Get image dimensions
        height, width = image.shape[:2]
        center = (width // 2, height // 2)
        
        # Calculate rotation matrix
        rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        
        # Calculate new bounding dimensions
        cos = np.abs(rotation_matrix[0, 0])
        sin = np.abs(rotation_matrix[0, 1])
        new_width = int((height * sin) + (width * cos))
        new_height = int((height * cos) + (width * sin))
        
        # Adjust rotation matrix for translation
        rotation_matrix[0, 2] += (new_width / 2) - center[0]
        rotation_matrix[1, 2] += (new_height / 2) - center[1]
        
        # Rotate image
        rotated = cv2.warpAffine(image, rotation_matrix, (new_width, new_height), borderValue=(255, 255, 255))
        
        collection.insert_one({
            "timestamp": datetime.now(),
            "status": "Success",
            "client_ip": client_ip,
            "operation": "rotate"
        })
        
        return jsonify({
            "message": "Image rotated successfully",
            "image": encode_image_to_base64(rotated)
        }), 200
        
    except Exception as e:
        print('Error:', e)
        return jsonify({"message": "Error in rotating image"}), 500


# Flip image
@app.route('/flip', methods=["POST"])
@limiter.limit("20 per minute")
def flip_image():
    data = request.get_json()
    client_ip = request.headers.getlist('X-Forwarded-For')[0] if 'X-Forwarded-For' in request.headers else request.remote_addr
    
    try:
        client = MongoClient(MONGO_DB_URI, server_api=ServerApi('1'))
        db = client['Photoshop']
        collection = db['logs']
        
        image = decode_base64_image(data['image'])
        flip_code = int(data.get('flip_code', 1))  # 1: horizontal, 0: vertical, -1: both
        
        flipped = cv2.flip(image, flip_code)
        
        collection.insert_one({
            "timestamp": datetime.now(),
            "status": "Success",
            "client_ip": client_ip,
            "operation": "flip"
        })
        
        return jsonify({
            "message": "Image flipped successfully",
            "image": encode_image_to_base64(flipped)
        }), 200
        
    except Exception as e:
        print('Error:', e)
        return jsonify({"message": "Error in flipping image"}), 500


@app.route('/filter',methods=["POST","GET"])
@limiter.limit("10 per minute")
def apply_filter():
    data = request.get_json()
    if 'X-Forwarded-For' in request.headers:
        client_ip = request.headers.getlist('X-Forwarded-For')[0]
    else:
        client_ip = request.remote_addr
    if 'filter' not in data or 'image' not in data:
        return jsonify({"message": "Missing 'filter' or 'image' in request data"}), 400
    try:
        clientIP = request.remote_addr
        client = MongoClient(MONGO_DB_URI, server_api=ServerApi('1'))
        db = client['Photoshop']
        collection = db['logs']
        base64_image = data['image']
        image_data = base64.b64decode(base64_image.split(',')[1])
        np_array = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        
        if data['filter']=='grayscale':
            processed_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            processed_image = cv2.cvtColor(processed_image, cv2.COLOR_GRAY2BGR)
            
        elif data['filter']=='negative':
            processed_image = cv2.bitwise_not(image)
            
        elif data['filter']=='blur':
            processed_image = cv2.GaussianBlur(image, (15, 15), 0)
            
        elif data['filter']=='sharpen':
            kernel = np.array([[0, -1, 0],
                           [-1, 5, -1],
                           [0, -1, 0]])
            processed_image = cv2.filter2D(image, -1, kernel)
            
        elif data['filter']=='pencil_sketch':
            processed_image, _ = cv2.pencilSketch(image, sigma_s=60, sigma_r=0.07, shade_factor=0.05)
            
        elif data['filter'] == "hdr":
            processed_image = cv2.detailEnhance(image, sigma_s=12, sigma_r=0.15)
        
        elif data['filter']=='emboss':
            kernel = np.array([[-2, -1, 0],
                               [-1,  1, 1],
                               [ 0,  1, 2]])
            processed_image =  cv2.filter2D(image, -1, kernel)
            
        elif data['filter']=='cartoon':
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            blurred = cv2.medianBlur(gray, 5)
            edges = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9)
            color = cv2.bilateralFilter(image, 9, 250, 250)
            processed_image = cv2.bitwise_and(color, color, mask=edges)
        
        elif data['filter'] == "sepia":
            kernel = np.array([[0.272, 0.534, 0.131],
                           [0.349, 0.686, 0.168],
                           [0.393, 0.769, 0.189]])
            processed_image = cv2.transform(image, kernel)
            
        elif data['filter'] == "oil_painting":
            processed_image = cv2.stylization(image, sigma_s=60, sigma_r=0.6)
        
        elif data['filter'] == "glow":
            blurred = cv2.GaussianBlur(image, (15, 15), 0)
            processed_image = cv2.addWeighted(image, 2.5, blurred, -1.5, 0)
        
        elif data['filter'] == "pixelate":
            height, width = image.shape[:2]
            ksize = 10 
            small = cv2.resize(image, (width // ksize, height // ksize))
            processed_image = cv2.resize(small, (width, height), interpolation=cv2.INTER_NEAREST)
    
        elif data['filter'] == "vignette":
            rows, cols = image.shape[:2]
            X_resultant_matrix = cv2.getGaussianKernel(cols, 200)
            Y_resultant_matrix = cv2.getGaussianKernel(rows, 200)
            resultant_matrix = Y_resultant_matrix * X_resultant_matrix.T
            mask = 255 * resultant_matrix / np.linalg.norm(resultant_matrix)
            mask = cv2.resize(mask, (cols, rows))
            mask = cv2.merge([mask, mask, mask])
            processed_image = cv2.addWeighted(image, 1.5, mask.astype(np.uint8), -0.5, 0)
            
        elif data['filter'] == 'canny': 
            processed_image = cv2.Canny(image, 100, 200)
            processed_image = cv2.cvtColor(processed_image, cv2.COLOR_GRAY2BGR)
            
        elif data['filter'] == 'heatmap':
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            processed_image = cv2.applyColorMap(gray, cv2.COLORMAP_JET)
            
        elif data['filter'] == 'hsv':
            hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            hsv_image[:, :, 1] = np.clip(hsv_image[:, :, 1] * 1.5, 0, 255).astype(np.uint8)
            processed_image = cv2.cvtColor(hsv_image, cv2.COLOR_HSV2BGR)
            
        elif data['filter'] == 'flip_horizontal':
            processed_image = cv2.flip(image, 1)
            
        elif data['filter'] == 'flip_vertical':
            processed_image = cv2.flip(image, 0)
            
        elif data['filter'] == 'transpose':
            processed_image = cv2.transpose(image)
            
        elif data['filter'] == 'flip_both':
            processed_image = cv2.flip(image, -1)

        elif data['filter'] == 'perspective_warp':
            rows, cols, ch = image.shape
            pts1 = np.float32([[0, 0], [cols-1, 0], [0, rows-1], [cols-1, rows-1]])
            pts2 = np.float32([[0, 0], [cols-1, 0], [int(0.33*cols), rows-1], [int(0.66*cols), rows-1]])
            M = cv2.getPerspectiveTransform(pts1, pts2)
            processed_image = cv2.warpPerspective(image, M, (cols, rows))

        elif data['filter'] == 'mosaic_mirror':
            flipped_horizontal = cv2.flip(image, 1)
            flipped_vertical = cv2.flip(image, 0)
            flipped_both = cv2.flip(image, -1)
            top = np.hstack((image, flipped_horizontal))
            bottom = np.hstack((flipped_vertical, flipped_both))
            processed_image = np.vstack((top, bottom))

        elif data['filter'] == 'solarize':
            threshold = 128
            processed_image = np.where(image < threshold, image, 255 - image)
            processed_image = processed_image.astype(np.uint8)
            
        elif data['filter'] == 'posterize':
            levels = 4
            processed_image = np.floor(image / (256 / levels)) * (256 / levels)
            processed_image = processed_image.astype(np.uint8)
            
        else:
            collection.insert_one({
                "timestamp": datetime.now(),
                "status": "Error",
                "client_ip": client_ip,
                "filter_name": data["filter"],
                "error_type": "Unsupported filter"
            })
            return jsonify({"message": "Unsupported filter"}), 400       
        
        _, buffer = cv2.imencode('.jpg', processed_image)
        processed_base64_image = base64.b64encode(buffer).decode('utf-8')
        
        collection.insert_one({
            "timestamp": datetime.now(),
            "status": "Success",
            "client_ip": client_ip,
            "filter_name": data["filter"]
        })

        return jsonify({
            "message":"Processed Successfully",
            "image": f"data:image/jpeg;base64,{processed_base64_image}"
        }), 200
        
    except Exception as e:
        print('Error:',e)
        collection.insert_one({"Status":"Error","errorType":str(e),"client_IP":clientIP,"filter":data['filter']})
        return jsonify({"message":"Error in processing image"}), 500
    

if __name__=='__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
