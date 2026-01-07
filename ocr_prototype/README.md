# OCR Prototype for Dropt
## Quick Start Demo

This prototype demonstrates the OCR functionality for extracting syllabus data from images.

## Structure

```
ocr_prototype/
├── README.md              (this file)
├── backend/
│   ├── ocr_service.py    (main OCR service)
│   ├── image_preprocessor.py
│   ├── data_parser.py
│   └── requirements.txt
├── frontend/
│   ├── UploadComponent.jsx
│   ├── ValidationUI.jsx
│   └── package.json
└── sample_images/
    ├── sample_syllabus.png
    └── sample_grades.png
```

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python ocr_service.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Technology Stack
- **Backend**: Python + FastAPI + OpenAI GPT-4 Vision
- **Frontend**: React + react-dropzone
- **Image Processing**: Pillow (PIL)
