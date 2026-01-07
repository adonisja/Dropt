# OCR Cost Analysis
## Dropt - Financial Feasibility Study

---

## Executive Summary

This document analyzes the cost of implementing OCR functionality in Dropt across different technology choices and usage scenarios. Based on projected usage patterns, **GPT-4 Vision** offers the best balance of accuracy and cost for MVP, while **Google Cloud Vision** becomes more cost-effective at scale.

**Key Findings**:
- MVP (100 users): **$30-90/month**
- Production (10,000 users): **$1,500-3,000/month**
- Cost per student per semester: **$0.15-0.30**

---

## 1. OCR Technology Options

### Option 1: Tesseract OCR (Open Source)

**Pricing**: Free
**Deployment**: Self-hosted or serverless function

**Costs**:
- Server/compute: ~$20-50/month (AWS EC2 t3.small or Lambda)
- Storage: ~$5-10/month (S3 for images)
- **Total**: $25-60/month (fixed cost)

**Pros**:
- No per-image costs
- Full control over data
- Predictable costs

**Cons**:
- Lower accuracy (~70-80% for complex layouts)
- Requires significant preprocessing
- No table/form detection
- Manual parsing needed for structure

**Best For**: MVP testing, budget-constrained early phase

---

### Option 2: GPT-4 Vision API

**Pricing** (as of January 2025):
- Input: $0.01 per image (1024×1024 or smaller)
- Input: $0.03 per image (larger than 1024×1024)

**Cost Calculation**:

| Usage Scenario | Images/Month | Cost/Month |
|----------------|--------------|------------|
| MVP (100 users, 3 images each) | 300 | $3-9 |
| Beta (500 users, 3 images each) | 1,500 | $15-45 |
| Launch (5,000 users, 3 images each) | 15,000 | $150-450 |
| Scale (50,000 users, 3 images each) | 150,000 | $1,500-4,500 |

**Additional Costs**:
- Storage: ~$5-20/month (S3)
- Compute: ~$10-30/month (API server)
- **Total**: Add ~$15-50/month to above costs

**Pros**:
- Excellent accuracy (~90-95% for structured documents)
- Understands context (can extract rubric structure intelligently)
- No need for separate parsing logic
- Handles various document formats well
- Returns structured JSON directly

**Cons**:
- More expensive per image than specialized OCR tools
- Dependent on OpenAI API availability
- Rate limits may apply

**Best For**: MVP through growth phase, best user experience

---

### Option 3: Google Cloud Vision API

**Pricing** (as of January 2025):
- Text Detection: $1.50 per 1,000 images (first 1,000 free per month)
- Document Text Detection: $1.50 per 1,000 images
- With handwriting: $3.50 per 1,000 images

**Cost Calculation**:

| Usage Scenario | Images/Month | Cost/Month |
|----------------|--------------|------------|
| MVP (100 users, 3 images each) | 300 | Free (under 1,000) |
| Beta (500 users, 3 images each) | 1,500 | $0.75 |
| Launch (5,000 users, 3 images each) | 15,000 | $21 |
| Scale (50,000 users, 3 images each) | 150,000 | $210 |

**Additional Costs**:
- Storage: ~$5-20/month (Google Cloud Storage)
- Compute: ~$20-50/month (Cloud Functions/Cloud Run)
- Parsing service: ~$10-30/month (to structure extracted text)
- **Total**: Add ~$35-100/month to above costs

**Pros**:
- Very cost-effective at scale
- High accuracy (~85-90%)
- Excellent table detection
- Reliable uptime (Google infrastructure)
- Good free tier for testing

**Cons**:
- Requires separate parsing logic to structure data
- Less context-aware than GPT-4 Vision
- Need to handle multiple API calls for complex documents

**Best For**: Production at scale (>5,000 users), cost-sensitive scenarios

---

### Option 4: AWS Textract

**Pricing** (as of January 2025):
- Text Detection: $1.50 per 1,000 pages
- Tables & Forms Detection: $15 per 1,000 pages
- Queries feature: $15 per 1,000 pages

**Cost Calculation** (using Tables & Forms for syllabus rubrics):

| Usage Scenario | Pages/Month | Cost/Month |
|----------------|-------------|------------|
| MVP (100 users, 3 images each) | 300 | $4.50 |
| Beta (500 users, 3 images each) | 1,500 | $22.50 |
| Launch (5,000 users, 3 images each) | 15,000 | $225 |
| Scale (50,000 users, 3 images each) | 150,000 | $2,250 |

**Additional Costs**:
- Storage: ~$5-20/month (S3)
- Compute: ~$20-50/month (Lambda functions)
- Parsing service: ~$10-30/month
- **Total**: Add ~$35-100/month to above costs

**Pros**:
- Excellent for forms and tables (perfect for syllabi)
- Extracts key-value pairs automatically
- High accuracy for structured documents
- AWS ecosystem integration

**Cons**:
- Most expensive option
- Overkill for simple text extraction
- Requires AWS expertise

**Best For**: Enterprise clients, high-accuracy requirements for complex forms

---

## 2. Recommended Approach by Phase

### Phase 1: MVP (100-500 users)
**Recommended**: **GPT-4 Vision**
- **Cost**: $20-100/month total
- **Rationale**:
  - Best accuracy out of the box
  - Fastest to implement (no complex parsing)
  - Cost is negligible at this scale
  - Great for demos and pitches

**Alternative**: Tesseract (if budget is very tight)
- **Cost**: $25-60/month (fixed)
- **Rationale**: Free per-image cost, but requires more dev time

---

### Phase 2: Beta (500-5,000 users)
**Recommended**: **GPT-4 Vision**
- **Cost**: $165-545/month total
- **Rationale**:
  - Still affordable
  - Proven accuracy from MVP
  - User experience is priority

**Consider switching to**: Google Cloud Vision if costs exceed $500/month
- **Cost**: $56-121/month total
- **Savings**: ~75% reduction in OCR costs
- **Trade-off**: Need to build parsing logic

---

### Phase 3: Growth (5,000-50,000 users)
**Recommended**: **Google Cloud Vision**
- **Cost**: $56-310/month total
- **Rationale**:
  - Significant cost savings
  - Still high accuracy
  - Proven scalability

**Hybrid Approach**: Use GPT-4 Vision for low-confidence results
- Process with Google Cloud Vision first (~$210/month for 150k images)
- If confidence <80%, reprocess with GPT-4 Vision (~$300/month for 10% = 15k images)
- **Total**: ~$510/month (vs $1,500-4,500 with only GPT-4)

---

### Phase 4: Scale (50,000+ users)
**Recommended**: **Google Cloud Vision + Custom ML Model**
- **Cost**: $210-400/month + ML model training ($5,000 one-time)
- **Rationale**:
  - Train custom model on Dropt-specific syllabi
  - Further reduce API costs
  - Optimize for common patterns

---

## 3. Cost Breakdown by User Activity

### Assumptions
- Average student uploads 3 images per semester:
  1. Syllabus (1 image)
  2. Grade screenshots (2 images average)

- Re-upload rate: 10% (students retake photos due to quality issues)
- Effective uploads per student: 3.3 images

### Per-Student Cost Analysis

| Technology | Cost per Student per Semester |
|------------|------------------------------|
| Tesseract | $0.00 (only server costs) |
| GPT-4 Vision | $0.03-0.10 |
| Google Cloud Vision | $0.005 |
| AWS Textract | $0.05 |

### Revenue Implications

If pricing Dropt at **$5-10 per student per semester**:
- OCR cost represents **0.05%-2%** of revenue
- Extremely affordable at scale

---

## 4. Additional Infrastructure Costs

### Image Storage (AWS S3)

| Usage | Storage (GB) | Cost/Month |
|-------|--------------|------------|
| 1,000 images | 2 GB | $0.05 |
| 10,000 images | 20 GB | $0.46 |
| 100,000 images | 200 GB | $4.60 |
| 1M images | 2 TB | $46 |

**Storage Policy**: Delete images after 30 days → reduces long-term costs

---

### API Server / Compute

**Option A: Serverless (AWS Lambda / Google Cloud Functions)**
- **Cost**: $0.20 per 1M requests + compute time
- **For 150k OCR jobs/month**: ~$20-40/month
- **Pros**: Auto-scaling, pay-per-use
- **Cons**: Cold start latency

**Option B: Dedicated Server (AWS EC2 / Google Cloud Compute)**
- **Cost**: $20-100/month (t3.small to t3.medium)
- **Pros**: Consistent performance, no cold starts
- **Cons**: Fixed cost even at low usage

**Recommendation**: Serverless for MVP, dedicated server at scale

---

### Database (PostgreSQL)

| Usage | Database Size | Cost/Month |
|-------|---------------|------------|
| 1,000 users | 500 MB | $15 (RDS t3.micro) |
| 10,000 users | 5 GB | $30 (RDS t3.small) |
| 100,000 users | 50 GB | $100 (RDS t3.medium) |

---

## 5. Total Cost Projections

### MVP (100 users)

| Component | Cost/Month |
|-----------|------------|
| GPT-4 Vision API | $15 |
| Image Storage (S3) | $1 |
| API Server (Lambda) | $10 |
| Database (RDS) | $15 |
| **Total** | **$41** |

**Per-user cost**: $0.41/month

---

### Beta (500 users)

| Component | Cost/Month |
|-----------|------------|
| GPT-4 Vision API | $60 |
| Image Storage (S3) | $3 |
| API Server (Lambda) | $20 |
| Database (RDS) | $15 |
| **Total** | **$98** |

**Per-user cost**: $0.20/month

---

### Launch (5,000 users)

| Component | Google Cloud Vision | GPT-4 Vision |
|-----------|---------------------|--------------|
| OCR API | $56 | $600 |
| Image Storage | $5 | $5 |
| API Server | $30 | $40 |
| Database | $30 | $30 |
| **Total** | **$121** | **$675** |

**Per-user cost**: $0.024/month (GCV) vs $0.135/month (GPT-4)

**Recommendation**: Switch to Google Cloud Vision at this scale

---

### Scale (50,000 users)

| Component | Google Cloud Vision | Hybrid Approach |
|-----------|---------------------|-----------------|
| OCR API | $245 | $510 |
| Image Storage | $20 | $20 |
| API Server | $80 | $100 |
| Database | $100 | $100 |
| **Total** | **$445** | **$730** |

**Per-user cost**: $0.009/month (GCV) vs $0.015/month (Hybrid)

---

## 6. ROI Analysis

### Scenario: Freemium Model
- Free tier: Manual entry only
- Premium tier: $8/semester with OCR
- Premium conversion rate: 30%

**Revenue (5,000 users)**:
- Paying users: 1,500
- Revenue: 1,500 × $8 = $12,000/semester (4 months)
- Monthly revenue: $3,000

**Costs (5,000 users)**:
- Total infrastructure: $121/month (with Google Cloud Vision)
- OCR cost as % of revenue: 4%

**Profit margin**: 96% (minus other costs like dev, hosting, marketing)

---

### Scenario: University License
- $500/semester for 500 students (unlimited use)
- University pays flat rate

**Revenue**: $500/semester = $125/month per university
**Cost**: $98/month (500 users with GPT-4 Vision)

**Profit margin**: 21% just from OCR (additional revenue from multiple universities)

---

## 7. Cost Optimization Strategies

### 1. Intelligent Image Preprocessing
- Compress images before sending to OCR API
- Use lower resolution for simple documents
- **Savings**: 30-40% reduction in costs (smaller images = cheaper)

### 2. Caching & Deduplication
- Detect duplicate syllabi (same course, same semester)
- Cache OCR results for common documents
- **Savings**: 10-20% reduction in API calls

### 3. Progressive Enhancement
- Start with free Tesseract OCR
- Only use premium API (GPT-4) if confidence is low
- **Savings**: 50-70% hybrid approach savings

### 4. Batch Processing
- Queue non-urgent uploads and process during off-peak hours
- Negotiate bulk discounts with API providers
- **Savings**: 5-10% with volume discounts

### 5. User-Uploaded Corrections
- Use corrected data to train custom model
- Reduce reliance on external APIs over time
- **Long-term savings**: 60-80% after custom model deployment

---

## 8. Break-Even Analysis

### Assumptions
- Development cost: $15,000 (3 months × 1 dev × $5k/month)
- OCR infrastructure: $100-500/month (average $300/month)
- Pricing: $8 per student per semester
- Conversion rate: 25%

### Break-Even Calculation

**Fixed costs (first year)**:
- Development: $15,000
- Infrastructure (12 months): $3,600
- **Total**: $18,600

**Revenue per 1,000 users**:
- Paying users: 250 (25% conversion)
- Revenue: 250 × $8 = $2,000 per semester
- Annual revenue: $4,000 (assuming 2 semesters)

**Break-even point**: 18,600 ÷ 4,000 = **4.65 → ~5,000 users**

**Timeline to break-even**: 6-12 months (depending on user acquisition rate)

---

## 9. Risk Analysis

### Technology Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| API price increase | High | Multi-provider strategy, custom model as backup |
| API downtime | High | Fallback to alternative OCR service |
| Accuracy degradation | Medium | A/B testing, user feedback loop |
| Rate limiting | Medium | Queue system, distributed processing |

### Financial Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Lower conversion rate than expected | High | Adjust pricing, improve value prop |
| Higher usage than projected | Medium | Volume discounts, optimization strategies |
| Competition undercuts pricing | Medium | Differentiate with better features |

---

## 10. Recommendations

### Short-Term (Months 1-6)
1. **Use GPT-4 Vision for MVP**
   - Best accuracy
   - Fastest time-to-market
   - Cost is negligible at small scale

2. **Implement basic caching**
   - Deduplicate common syllabi
   - Cache professor-specific templates

3. **Monitor usage patterns**
   - Track actual images per user
   - Identify optimization opportunities

---

### Medium-Term (Months 6-12)
1. **Switch to Google Cloud Vision at 5,000+ users**
   - 70-80% cost savings
   - Build custom parsing logic (one-time dev cost)

2. **Implement hybrid approach**
   - Google Cloud Vision for first pass
   - GPT-4 Vision for low-confidence results

3. **Negotiate volume discounts**
   - Approach Google/OpenAI for bulk pricing
   - Explore enterprise contracts

---

### Long-Term (Year 2+)
1. **Train custom OCR model**
   - Use accumulated data from user corrections
   - Deploy on-premise or via AWS SageMaker
   - Reduce external API dependency

2. **Explore edge computing**
   - Process OCR directly on mobile devices (iOS Core ML / Android ML Kit)
   - Eliminate server-side processing costs entirely

3. **Build competitive moat**
   - Proprietary syllabus parsing models
   - University-specific fine-tuning

---

## 11. Conclusion

**OCR is financially viable and strategically valuable for Dropt.**

Key Takeaways:
1. **MVP cost is minimal** ($40-100/month for 100-500 users)
2. **Scale cost is reasonable** ($400-700/month for 50,000 users)
3. **Per-user cost is negligible** ($0.01-0.15 per student)
4. **ROI is strong** (OCR represents <5% of revenue at scale)
5. **Technology path is clear** (GPT-4 Vision → Google Cloud Vision → Custom Model)

**Recommendation**: Proceed with OCR as a core feature. Start with GPT-4 Vision for best UX, then optimize costs as you scale.

---

## Appendix: Cost Calculator

### Interactive Formula
```
Monthly OCR Cost = (
  (Users × Images_per_user × (1 + Reupload_rate)) × API_cost_per_image
) + Storage_cost + Compute_cost

Example (5,000 users, Google Cloud Vision):
= (5,000 × 3 × 1.1) × $0.0015 + $5 + $30
= 16,500 × $0.0015 + $35
= $24.75 + $35
= $59.75/month
```

### Customizable Scenarios
Build your own cost model at: [Google Sheets Calculator](#) (link to shareable sheet)
