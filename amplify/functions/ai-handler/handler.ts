import { Handler } from 'aws-lambda';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIEvent {
  action: 'generateAdvice' | 'extractData' | 'generateEmail';
  payload: any;
}

export const handler: Handler = async (event: any) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log("Initializing Gemini Model: gemini-2.5-flash"); // Debug log to verify deployment
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // AppSync passes arguments in event.arguments
  let { action, payload } = event.arguments || event;
  console.log(`[AI Handler] Received action: ${action}`);

  // Parse payload if it's a string (which it will be for AWSJSON type)
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      console.warn('Failed to parse payload as JSON:', e);
    }
  }

  try {
    switch (action) {
      case 'generateAdvice':
        return JSON.stringify(await handleGenerateAdvice(model, payload));
      case 'generateEmail':
        return JSON.stringify(await handleGenerateEmail(model, payload));
      case 'extractData':
        return JSON.stringify(await handleExtractData(model, payload));
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("AI Handler Error:", error);
    throw error;
  }
};

async function handleGenerateAdvice(model: any, context: any) {
    // Calculate additional context
    const gradeGap = context.currentGrade - context.passingGrade;
    const isNearPassing = Math.abs(gradeGap) <= 10;
    const isPassing = context.currentGrade >= context.passingGrade;
    const courseType = context.isRequired ? "required course" : "elective";
    const stressCategory = context.stressLevel <= 3 ? "low" : context.stressLevel <= 6 ? "moderate" : "high";
    const workloadCategory = context.hoursSpent <= 3 ? "minimal" : context.hoursSpent <= 8 ? "moderate" : "heavy";

    const prompt = `You are an expert academic strategist and student success coach. Your goal is to provide a deep, tactical, and highly personalized analysis for a student in ${context.courseName}.

## STUDENT CONTEXT:
- **Course**: ${context.courseName} (${courseType})
- **Current Status**: ${context.currentGrade.toFixed(1)}% (${isPassing ? 'Passing' : 'Failing'})
- **Target**: Passing is ${context.passingGrade}% (Gap: ${gradeGap.toFixed(1)}%)
- **Risk Profile**: ${context.riskLevel} Risk
- **Environment**: ${context.stressLevel}/10 Stress (${stressCategory}), ${context.hoursSpent} hrs/week effort (${workloadCategory})

## YOUR MISSION:
Provide a detailed, "tough love" but supportive strategic plan. Do not be generic. The student needs a concrete roadmap, not just encouragement.

### 1. REALITY CHECK (The "What")
- Analyze the grade/effort ratio. Are they working hard but not smart? Or under-working?
- Explicitly state the urgency based on the ${context.riskLevel} risk.
- If failing: "You are X points away from safety. This is critical."
- If passing: "You are safe, but [potential pitfall]."

### 2. THE DECISION MATRIX (The "Why")
${isNearPassing
    ? `**VERDICT: FIGHT.** You are within striking distance (${Math.abs(gradeGap).toFixed(1)}%). Dropping now would be a waste of the effort already invested. Here is how we close the gap:`
    : `**VERDICT: ${context.riskLevel === 'Critical' ? 'SERIOUSLY CONSIDER WITHDRAWING' : 'PROCEED WITH CAUTION'}.**
       - **Stay If**: You can realistically commit to [Specific Change] AND you need this for [Requirement].
       - **Drop If**: Your mental health is deteriorating (${context.stressLevel}/10 stress) OR you cannot increase hours beyond ${context.hoursSpent}.`
}

### 3. TACTICAL BATTLE PLAN (The "How" - 3 Distinct Strategies)
Give 3 specific, non-obvious strategies based on their profile:
- **For High Stress (${context.stressLevel}/10)**: specific decompression tactics that don't eat up study time.
- **For ${workloadCategory} Workload**: Efficiency hacks (e.g., "Stop reading the whole textbook, focus on summaries/practice problems").
- **For Grade Recovery**: "Triaging" assignments—what to skip, what to ace.

### 4. IMMEDIATE NEXT STEPS (Next 48 Hours)
- Bullet points of exactly what to do TODAY and TOMORROW.
- Example: "Email Prof. X about Y", "Complete missing assignment Z", "Schedule 1 hour block for topic A".

## TONE:
Professional, direct, actionable, and encouraging. Avoid fluff.
## LENGTH:
Substantial and detailed (approx. 300-400 words). Use bolding for emphasis.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

async function handleGenerateEmail(model: any, context: any) {
    // PII Minimization: We do not send the actual names to the AI.
    // We ask the AI to use placeholders, which protects the user's identity.
    const prompt = `Write a professional email from a student to their professor.
    
    Course: ${context.courseName}
    Professor: [Professor Name]
    Student Name: [Student Name]
    Current Grade: ${context.currentGrade ? context.currentGrade + '%' : 'Not specified'}
    Topic/Goal: ${context.topic}
    Tone: ${context.tone || 'professional'}
    
    The email should be concise, polite, and clear. Include a subject line.
    IMPORTANT: Use the exact placeholders "[Professor Name]" and "[Student Name]" in the output. Do not invent names.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Post-processing: We can optionally replace the placeholders here if we really wanted to,
    // but for privacy, it's better to let the client handle it or just show the placeholders.
    // For this implementation, we return the text with placeholders.
    return response.text();
}

async function handleExtractData(model: any, input: any) {
    console.log('[AI Handler] Handling extractData', { docType: input.docType, type: input.type });
    const { docType, data, mimeType, type } = input;
    
    const extractionPrompt = docType === 'syllabus' 
        ? `Extract course information from the syllabus. 
           Return ONLY valid JSON matching this structure:
           {
             "courseInfo": {
               "courseName": "string",
               "courseCode": "string",
               "instructor": "string",
               "instructorEmail": "string",
               "officeHours": "string",
               "classDays": "string",
               "classTime": "string"
             },
             "grading": [
               { "category": "string", "weight": number, "dropLowest": number }
             ]
           }
           If a field is not found, use null or empty string. Ensure weights sum to 100 if possible.`
        : `Extract assignment grades from the document.
           Return ONLY valid JSON matching this structure:
           {
             "courseInfo": { "courseCode": "string" },
             "assignments": [
               { 
                 "name": "string", 
                 "category": "string (guess based on name, e.g. Homework, Quiz)", 
                 "scoreEarned": number, 
                 "maxScore": number, 
                 "dateDue": "YYYY-MM-DD" 
               }
             ]
           }`;

    let promptParts: any[] = [extractionPrompt];

    if (type === 'text') {
        promptParts.push(`\n\nDATA:\n${data}`);
    } else if (type === 'image' || type === 'file') {
        // For file type, we expect base64 data in 'data' field
        promptParts.push({
            inlineData: {
                data: data,
                mimeType: mimeType || 'image/jpeg'
            }
        });
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    const cleanJson = jsonMatch ? jsonMatch[1] : text;

    return JSON.parse(cleanJson);
}
