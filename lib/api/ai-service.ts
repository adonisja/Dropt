import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getClient } from './data-client';
import { logger } from '@/lib/utils/logger';

export interface AIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Service to handle all AI interactions (OCR and Recommendations)
 */
export const AIService = {
    
    /**
     * Analyzes content (Image, Text, or File) and extracts structured data
     */
    async extractData<T>(
        input: { type: 'image', base64: string, mimeType?: string } | { type: 'text', text: string } | { type: 'file', uri: string, mimeType: string },
        docType: 'syllabus' | 'grades'
    ): Promise<AIResponse<T>> {
        
        try {
            let payload: any = { docType };

            if (input.type === 'text') {
                payload.type = 'text';
                payload.data = input.text;
            } 
            else if (input.type === 'image') {
                payload.type = 'image';
                payload.data = input.base64;
                payload.mimeType = input.mimeType || 'image/jpeg';
            }
            else if (input.type === 'file') {
                let base64 = '';
                if (Platform.OS === 'web') {
                    throw new Error("File URI processing not supported on Web in this service method. Pass base64 as 'image' type instead.");
                } else {
                    base64 = await FileSystem.readAsStringAsync(input.uri, { encoding: 'base64' });
                }
                payload.type = 'file';
                payload.data = base64;
                payload.mimeType = input.mimeType || 'application/pdf';
            }

            logger.debug('Sending AI extraction request', {
                source: 'AIService.extractData',
                data: { docType, inputType: input.type }
            });
            const client = getClient();
            const { data, errors } = await client.queries.generateAIResponse({
                action: 'extractData',
                payload: JSON.stringify(payload)
            });

            if (errors) {
                logger.error('GraphQL errors in AI extraction', {
                    source: 'AIService.extractData',
                    data: { errors, docType, inputType: input.type }
                });
                throw new Error(errors[0].message);
            }
            
            if (!data) {
                logger.error('No data returned from AI service', {
                    source: 'AIService.extractData',
                    data: { docType, inputType: input.type }
                });
                throw new Error("No data returned from AI service");
            }

            logger.info('AI extraction successful', {
                source: 'AIService.extractData',
                data: { docType, inputType: input.type }
            });
            return { success: true, data: JSON.parse(data) };

        } catch (error) {
            logger.error('AI extraction failed', {
                source: 'AIService.extractData',
                data: { error, docType, inputType: input.type }
            });
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    },

    /**
     * Generates personalized advice based on student data
     */
    async generateAdvice(context: {
        courseName: string;
        currentGrade: number;
        stressLevel: number; // 1-10
        hoursSpent: number;
        riskLevel: string;
        passingGrade: number;
        isRequired?: boolean;
        recommendationScore?: number;
    }): Promise<string> {
        try {
            const client = getClient();
            const { data, errors } = await client.queries.generateAIResponse({
                action: 'generateAdvice',
                payload: JSON.stringify(context)
            });

            if (errors) {
                throw new Error(errors[0].message);
            }

            if (data) {
                return JSON.parse(data);
            }
            return "Unable to generate advice.";

        } catch (error) {
            logger.error('AI advice generation failed', {
                source: 'AIService.generateAdvice',
                data: { error, courseName: context.courseName, currentGrade: context.currentGrade }
            });
            
            // Enhanced Fallback Logic (Simulating AI Structure for Offline/Error State)
            const gap = context.passingGrade - context.currentGrade;
            const isPassing = context.currentGrade >= context.passingGrade;
            const stressMsg = context.stressLevel > 7 
                ? "Your stress level is high (7+/10). Prioritize sleep and breaks to avoid burnout." 
                : "Your stress levels appear manageable. Maintain a balanced routine.";
            
            const workloadMsg = context.hoursSpent > 10 
                ? "You are investing a lot of time (>10h/wk). Focus on high-impact study methods rather than just reading." 
                : "Your time investment is reasonable. Ensure you are using this time efficiently.";

            const verdict = context.riskLevel === 'Critical' 
                ? "SERIOUSLY CONSIDER WITHDRAWING" 
                : (isPassing ? "STAY THE COURSE" : "FIGHT TO RECOVER");

            const strategy = context.riskLevel === 'Critical'
                ? "The statistical probability of passing is low without a major intervention. If this course is not immediately required, dropping it to protect your GPA may be the strategic move."
                : (isPassing 
                    ? "You are in a safe zone, but complacency is the enemy. Lock in this grade."
                    : `You are within striking distance (${gap.toFixed(1)}%). Dropping now would be premature.`);

            return `### 1. SITUATION ASSESSMENT
You are currently ${isPassing ? 'passing' : 'failing'} **${context.courseName}** with a **${context.currentGrade.toFixed(1)}%**. 
${isPassing ? 'You are above the threshold.' : `You are trailing the passing mark (${context.passingGrade}%) by **${gap.toFixed(1)} points**.`}

### 2. STRATEGIC RECOMMENDATION
**VERDICT: ${verdict}**
${strategy}

### 3. TACTICAL BATTLE PLAN
- **Mental Game**: ${stressMsg}
- **Efficiency**: ${workloadMsg}
- **Grade Triage**: Identify the single assignment with the highest weight remaining. That is your priority.

### 4. IMMEDIATE NEXT STEPS (48 Hours)
- [ ] Calculate exactly what grade you need on the next exam to pass.
- [ ] Email the professor if you have specific questions about material.
- [ ] Set a specific 2-hour block tomorrow dedicated solely to this course.`;
        }
    },

    /**
     * Generates a professional email template for professor communication
     */
    async generateEmail(context: {
        courseName: string;
        professorName?: string;
        currentGrade?: number;
        topic: string; // e.g. "Extra Credit", "Meeting Request", "Extension"
        tone?: 'professional' | 'urgent' | 'apologetic';
        studentName?: string;
    }): Promise<string> {
        try {
            const client = getClient();
            const { data, errors } = await client.queries.generateAIResponse({
                action: 'generateEmail',
                payload: JSON.stringify(context)
            });

            if (errors) throw new Error(errors[0].message);
            if (data) return JSON.parse(data);
            return "Unable to generate email.";

        } catch (error) {
            logger.error('AI email generation failed', {
                source: 'AIService.generateEmail',
                data: { error, courseName: context.courseName, topic: context.topic }
            });
            return "Unable to generate email at this time.";
        }
    }
};
