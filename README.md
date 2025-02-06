# Photoshop - Image Editing Application

This project is a web-based image editing application that allows users to apply various filters, perform rotations, cropping, and other image manipulations.  The application utilizes a ReactJS frontend for user interaction and a Flask backend with OpenCV (cv2) for image processing.

## Features

* **Frontend (ReactJS):**
    * Image upload and preview.
    * Interactive cropping and rotation tools.
    * Real-time preview of cropping and rotation changes.
    * Compression functionality.
    * User interface for selecting and applying filters.
    * Display of processed images.
* **Backend (Flask & OpenCV):**
    * Image processing using OpenCV (cv2).
    * Implementation of various image filters (e.g., grayscale, blur, edge detection, etc.).  *(List specific filters implemented here)*
    * Handling image compression requests.
    * Serving processed images to the frontend.

## Technologies Used

* **Frontend:** ReactJS
* **Backend:** Flask (Python)
* **Image Processing:** OpenCV (cv2)
* **Other:** *(Mention any other libraries or technologies used, e.g., specific UI libraries, state management tools, etc.)*

## Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/photoshop.git](https://www.google.com/search?q=https://github.com/YOUR_USERNAME/photoshop.git)  *(Replace with your repository URL)*

cd photoshop/frontend  *(Navigate to the frontend directory)*
npm install  *(Install frontend dependencies)*
npm start  *(Start the frontend development server)*


cd photoshop/backend  *(Navigate to the backend directory)*
pip install -r requirements.txt *(Install backend dependencies - Create a requirements.txt file listing Flask, OpenCV, and other Python packages)*
python app.py  *(Start the Flask backend server)*
