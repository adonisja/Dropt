# OCR Implementation Specification
## Dropt - Smart Data Entry System

---

## 1. Overview

The OCR (Optical Character Recognition) system enables students to quickly populate course data by uploading photos or screenshots of syllabi, grade reports, and other academic documents. This eliminates manual data entry and reduces onboarding time from 10+ minutes to under 30 seconds.

---

## 2. Use Cases

### Primary Use Cases

#### A. Syllabus Upload
**Input**: Photo/screenshot of course syllabus
**Expected Output**:
```json
{
  "course_name": "MATH 201 - Calculus II",
  "instructor": "Dr. Smith",
  "grading_rubric": [
    { "category": "Homework", "weight": 20, "drop_policy": "lowest 2 dropped" },
    { "category": "Quizzes", "weight": 15, "drop_policy": null },
    { "category": "Midterm 1", "weight": 20, "drop_policy": null },
    { "category": "Midterm 2", "weight": 20, "drop_policy": null },
    { "category": "Final Exam", "weight": 25, "drop_policy": null }
  ],
  "total_points": 1000,
  "grading_scale": {
    "A": "90-100", "B": "80-89", "C": "70-79", "D": "60-69", "F": "0-59"
  }
}
```

#### B. Grade Report Screenshot
**Input**: Screenshot from Canvas/Blackboard grade page
**Expected Output**:
```json
{
  "assignments": [
    { "name": "HW 1", "score": 18, "max_score": 20, "category": "Homework" },
    { "name": "HW 2", "score": 19, "max_score": 20, "category": "Homework" },
    { "name": "Quiz 1", "score": 45, "max_score": 50, "category": "Quizzes" },
    { "name": "Midterm 1", "score": 82, "max_score": 100, "category": "Midterm 1" }
  ],
  "current_grade": 82.5,
  "current_grade_letter": "B"
}
```

#### C. Graded Assignment Feedback
**Input**: Photo of graded paper with professor comments
**Expected Output**:
```json
{
  "score": 85,
  "max_score": 100,
  "feedback": "Good work on problem 3. Need to show more steps in problem 5.",
  "areas_for_improvement": ["Show detailed work", "Problem-solving methodology"]
}
```

---

## 3. Technical Architecture

### System Flow

```
┌─────────────────┐
│  User uploads   │
│  image/PDF      │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Frontend           │
│  - Resize image     │
│  - Format check     │
│  - Compression      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Upload to Storage  │
│  (S3/Cloudinary)    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  OCR Service        │
│  - Image preprocess │
│  - Text extraction  │
│  - Structure parse  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  AI Parser          │
│  (GPT-4 Vision)     │
│  - Extract data     │
│  - Structure JSON   │
│  - Confidence score │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Validation UI      │
│  - Show extracted   │
│  - Highlight fields │
│  - Allow edits      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Save to Database   │
│  - Store data       │
│  - Link to student  │
│  - Track accuracy   │
└─────────────────────┘
```

---

## 4. Component Specifications

### 4.1 Frontend Components

#### A. Image Upload Component
**Technology**: React + react-dropzone or Uppy

**Features**:
- Drag & drop zone
- Click to browse
- Mobile camera direct capture
- Multiple file format support (PNG, JPG, PDF, HEIC)
- Preview before upload
- Basic client-side validation

**Code Example**:
```jsx
import { useDropzone } from 'react-dropzone';

function SyllabusUpload() {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.heic'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10485760, // 10MB
    onDrop: (acceptedFiles) => {
      handleUpload(acceptedFiles[0]);
    }
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-8">
      <input {...getInputProps()} />
      <p>Drag syllabus here or click to upload</p>
      <button>Take Photo</button>
    </div>
  );
}
```

#### B. Validation UI Component
**Purpose**: Display extracted data with confidence indicators

**Features**:
- Side-by-side view (original image + extracted data)
- Color-coded confidence levels:
  - 🟢 Green: High confidence (>90%)
  - 🟡 Yellow: Medium confidence (70-90%)
  - 🔴 Red: Low confidence (<70%)
- Editable fields
- "Confirm" or "Re-scan" options

**Mockup**:
```
┌─────────────────────────────────────────────┐
│  Original Image          Extracted Data      │
│  ┌──────────────┐       ┌──────────────┐    │
│  │              │       │ Course: MATH  │🟢  │
│  │  [Syllabus]  │  ←→   │ 201           │    │
│  │              │       │               │    │
│  │              │       │ Homework: 20% │🟢  │
│  └──────────────┘       │ Quizzes: 15%  │🟡  │
│                         │ Midterm: 20%  │🔴  │
│                         └──────────────┘    │
│  [Re-scan] [Confirm & Continue]             │
└─────────────────────────────────────────────┘
```

### 4.2 Backend Services

#### A. Image Preprocessing Service
**Technology**: Python (Pillow/OpenCV) or Node.js (Sharp)

**Tasks**:
1. Resize images to optimal size (max 2048px width/height)
2. Convert to standard format (JPEG/PNG)
3. Enhance contrast/brightness for better OCR
4. Deskew rotated images
5. Remove noise/artifacts

**Code Example (Python)**:
```python
from PIL import Image, ImageEnhance
import cv2

def preprocess_image(image_path):
    # Load image
    img = Image.open(image_path)

    # Resize if too large
    max_size = 2048
    if max(img.size) > max_size:
        img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.5)

    # Convert to OpenCV format for deskewing
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    # Deskew if needed
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi/180, 200)

    # ... deskewing logic ...

    return img
```

#### B. OCR Extraction Service
**Technology Options**:

1. **GPT-4 Vision API** (Recommended)
```python
import openai
import base64

def extract_syllabus_data(image_path):
    # Encode image
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')

    # Call GPT-4 Vision
    response = openai.ChatCompletion.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Extract the grading rubric from this syllabus.
                        Return JSON with: course_name, grading_rubric (array of
                        {category, weight, drop_policy}), grading_scale.
                        Include confidence scores (0-100) for each field."""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=1000
    )

    return response.choices[0].message.content
```

2. **Google Cloud Vision API**
```python
from google.cloud import vision

def extract_text_google(image_path):
    client = vision.ImageAnnotatorClient()

    with open(image_path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)
    response = client.document_text_detection(image=image)

    # Process response to extract structured data
    text = response.full_text_annotation.text
    return parse_syllabus_text(text)
```

3. **AWS Textract**
```python
import boto3

def extract_tables_aws(image_path):
    textract = boto3.client('textract')

    with open(image_path, 'rb') as document:
        response = textract.analyze_document(
            Document={'Bytes': document.read()},
            FeatureTypes=['TABLES', 'FORMS']
        )

    return parse_textract_response(response)
```

#### C. Structured Data Parser
**Purpose**: Convert raw OCR text into structured JSON

**Approach**: Use GPT-4 or custom NLP rules

**Example Prompt for GPT-4**:
```
You are a syllabus parser. Extract grading information from the following text.

Text:
{ocr_extracted_text}

Return ONLY valid JSON in this format:
{
  "course_name": "string",
  "grading_rubric": [
    {
      "category": "string",
      "weight": number (percentage),
      "drop_policy": "string or null",
      "confidence": number (0-100)
    }
  ],
  "grading_scale": {
    "A": "range",
    "B": "range",
    ...
  },
  "total_points": number or null
}

If you cannot find a field, use null and set confidence to 0.
```

---

## 5. Database Schema Updates

### New Table: ocr_uploads

```sql
CREATE TABLE ocr_uploads (
    upload_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(student_id),
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'syllabus', 'grade_screenshot', 'rubric'
    upload_timestamp TIMESTAMP DEFAULT NOW(),
    processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    extracted_data JSONB, -- Store extracted JSON
    confidence_scores JSONB, -- Store confidence per field
    manual_corrections JSONB, -- Track user edits
    original_filename TEXT,
    file_size_bytes INTEGER,
    image_dimensions VARCHAR(20) -- e.g., "1920x1080"
);

CREATE INDEX idx_ocr_student ON ocr_uploads(student_id);
CREATE INDEX idx_ocr_status ON ocr_uploads(processing_status);
```

---

## 6. API Endpoints

### POST /api/ocr/upload
**Purpose**: Upload image/PDF for OCR processing

**Request**:
```javascript
// Multipart form-data
{
  file: File,
  file_type: 'syllabus' | 'grade_screenshot' | 'rubric',
  course_id: string (optional)
}
```

**Response**:
```json
{
  "upload_id": "uuid",
  "status": "processing",
  "estimated_time_seconds": 5
}
```

### GET /api/ocr/result/:upload_id
**Purpose**: Get OCR processing results

**Response**:
```json
{
  "upload_id": "uuid",
  "status": "completed",
  "extracted_data": {
    "course_name": "MATH 201",
    "grading_rubric": [...],
    "grading_scale": {...}
  },
  "confidence_scores": {
    "course_name": 95,
    "grading_rubric": 88,
    "grading_scale": 92
  },
  "processing_time_ms": 3421
}
```

### POST /api/ocr/validate
**Purpose**: User confirms or corrects extracted data

**Request**:
```json
{
  "upload_id": "uuid",
  "validated_data": {
    "course_name": "MATH 201 - Calculus II",
    "grading_rubric": [...]
  },
  "corrections": [
    {
      "field": "grading_rubric[0].weight",
      "original_value": 20,
      "corrected_value": 25,
      "reason": "user_correction"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "course_id": "uuid",
  "rubric_id": "uuid"
}
```

---

## 7. Error Handling

### Common Errors

| Error Code | Description | User Message | Retry Strategy |
|------------|-------------|--------------|----------------|
| OCR_001 | Image too blurry | "Image quality too low. Try taking a clearer photo." | Allow re-upload |
| OCR_002 | No text detected | "No text found. Make sure the document is visible." | Allow re-upload |
| OCR_003 | Low confidence | "Having trouble reading this. Please verify extracted data." | Show validation UI |
| OCR_004 | Processing timeout | "Processing took too long. Please try again." | Auto-retry once |
| OCR_005 | Unsupported format | "File format not supported. Use PNG, JPG, or PDF." | Block upload |
| OCR_006 | File too large | "File too large (max 10MB). Try compressing the image." | Block upload |

---

## 8. Performance Optimization

### Caching Strategy
- Cache common syllabi patterns (e.g., standard university grading scales)
- Store template rubrics by course code
- Reuse extracted data for same syllabus uploaded by multiple students

### Async Processing
```javascript
// Use job queue for long-running OCR tasks
import Bull from 'bull';

const ocrQueue = new Bull('ocr-processing');

ocrQueue.process(async (job) => {
  const { upload_id, image_path } = job.data;

  try {
    // Preprocess
    const processedImage = await preprocessImage(image_path);

    // OCR extraction
    const extractedText = await extractText(processedImage);

    // Parse structured data
    const structuredData = await parseText(extractedText);

    // Save to database
    await saveOCRResult(upload_id, structuredData);

    return { success: true, upload_id };
  } catch (error) {
    await markAsFailed(upload_id, error);
    throw error;
  }
});
```

### Rate Limiting
- Limit OCR API calls to avoid hitting vendor quotas
- Implement per-user upload limits (e.g., 10 uploads per hour)

---

## 9. Quality Assurance

### Confidence Scoring
**Formula**:
```
Overall Confidence = (
  field1_confidence * field1_importance +
  field2_confidence * field2_importance +
  ...
) / total_importance_weight

Example:
course_name: 95% confidence, importance: 0.1
grading_rubric: 88% confidence, importance: 0.7
grading_scale: 92% confidence, importance: 0.2

Overall = (95*0.1 + 88*0.7 + 92*0.2) / 1.0 = 89.5%
```

### Manual Review Triggers
Automatically flag for human review if:
- Overall confidence < 75%
- Critical field (grading_rubric) confidence < 80%
- Extracted data has structural errors (e.g., weights don't sum to 100%)

### Feedback Loop
```python
def track_ocr_accuracy(upload_id, original_data, corrected_data):
    """Track user corrections to improve OCR accuracy"""

    corrections = []
    for field in original_data.keys():
        if original_data[field] != corrected_data[field]:
            corrections.append({
                'field': field,
                'original': original_data[field],
                'corrected': corrected_data[field],
                'document_type': 'syllabus'
            })

    # Store corrections for ML training
    save_corrections_for_training(corrections)

    # Update confidence model
    update_confidence_model(upload_id, corrections)
```

---

## 10. Security & Privacy

### Data Protection
- Encrypt images at rest (AES-256)
- Encrypt images in transit (TLS 1.3)
- Auto-delete uploaded images after 30 days (GDPR compliance)
- Anonymize data for ML training

### Access Control
```python
def verify_upload_access(user_id, upload_id):
    """Ensure users can only access their own uploads"""
    upload = db.get_upload(upload_id)

    if upload.student_id != user_id:
        raise UnauthorizedError("Cannot access this upload")

    return upload
```

### FERPA Compliance
- No PII stored in extracted data
- User consent required before storing images
- Secure deletion process for user data
- No third-party data sharing without consent

---

## 11. Testing Strategy

### Unit Tests
```python
def test_extract_grading_rubric():
    """Test rubric extraction from sample syllabus"""
    sample_image = "test_assets/sample_syllabus.png"

    result = extract_syllabus_data(sample_image)

    assert result['course_name'] == "MATH 201"
    assert len(result['grading_rubric']) == 5
    assert result['grading_rubric'][0]['category'] == "Homework"
    assert result['grading_rubric'][0]['weight'] == 20
```

### Integration Tests
- Test full pipeline from upload → OCR → validation → database
- Test with various image qualities (blurry, rotated, low contrast)
- Test with different document formats (PDF, PNG, JPG, HEIC)

### User Acceptance Testing
- Pilot with 50 students
- Measure accuracy rate (% of fields correctly extracted)
- Measure time savings vs manual entry
- Gather qualitative feedback on UX

---

## 12. Monitoring & Analytics

### Key Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| OCR Success Rate | % of uploads successfully processed | >95% |
| Average Confidence | Mean confidence across all fields | >85% |
| Processing Time | Time from upload to result | <5 sec |
| User Correction Rate | % of fields manually corrected | <15% |
| Error Rate | % of failed OCR attempts | <5% |
| Time Saved | Avg time saved vs manual entry | >9 min |

### Logging
```javascript
// Log OCR events for debugging
logger.info('OCR processing started', {
  upload_id,
  file_type,
  file_size,
  timestamp: Date.now()
});

logger.info('OCR processing completed', {
  upload_id,
  confidence_score,
  processing_time_ms,
  fields_extracted: Object.keys(result).length
});
```

---

## 13. Cost Analysis

See [OCR_COST_ANALYSIS.md](OCR_COST_ANALYSIS.md) for detailed cost breakdown.

**Summary**:
- MVP: Tesseract (free) or GPT-4 Vision (~$0.01-0.03 per image)
- Production: Google Cloud Vision (~$1.50 per 1000 images) or AWS Textract (~$1.50 per 1000 pages)

---

## 14. Rollout Plan

### Phase 1: Internal Testing (Week 1-2)
- Test with team members' own syllabi
- Identify common failure cases
- Refine prompts and preprocessing

### Phase 2: Closed Beta (Week 3-4)
- 20-30 students from target university
- Support 3-5 common course types
- Daily monitoring and quick bug fixes

### Phase 3: Open Beta (Week 5-8)
- 200-500 students
- Expand to more course types
- Implement feedback loop for improvements

### Phase 4: General Release (Week 9+)
- Public launch with all features
- Continuous monitoring and optimization

---

## 15. Future Enhancements

1. **Batch Processing**: Upload entire folder of syllabi at once
2. **Smart Templates**: Learn patterns from previous uploads to improve accuracy
3. **Handwriting Recognition**: Support handwritten feedback/grades
4. **Multi-language Support**: Support syllabi in Spanish, Chinese, etc.
5. **Chrome Extension**: Direct upload from LMS grade pages
6. **Real-time Processing**: Show OCR results as user takes photo (live preview)
7. **Accessibility**: Audio descriptions of extracted data for visually impaired users

---

## Conclusion

The OCR system is a core differentiator for Dropt, reducing friction in data entry and making the platform accessible to more students. By combining cutting-edge AI (GPT-4 Vision) with robust validation workflows, we can achieve high accuracy while maintaining user trust.

**Key Success Factors**:
- High extraction accuracy (>85%)
- Fast processing (<5 seconds)
- Intuitive validation UI
- Continuous improvement through feedback loop
