import { StudentCourseData } from "../types";

export function calculateCurrentGrade(data: StudentCourseData): number {
    const { rubric, grades } = data;
    let totalWeightedScore = 0;
    let totalWeightUsed = 0; // To track total weight of categories with assignments

    for (const category of rubric.categories) {
        // 1. Get all assignments in this category
        const categoryAssignments = grades.assignments.filter(
            a => a.category === category.category
        );

        // 2. Filter out assignments without scores
        const gradedAssignments = categoryAssignments.filter(
            a => a.scoreEarned !== null && a.maxScore !== null
        );

        // 3. Skip category if nothing is graded
        if (gradedAssignments.length === 0) {
            continue;
        }

        // 4. Handle dropLowest if specified
        let assignmentsToConsider = gradedAssignments;

        if (category.dropLowest && category.dropLowest > 0) {
            // Determine how many we can actually drop
            const numToDrop = Math.min(
                category.dropLowest,
                Math.max(0, gradedAssignments.length - 2) // Ensure at least 2 remain
            );

            if (numToDrop > 0 && gradedAssignments.length > numToDrop) {
                // Sort assignments by score percentage (ascending)
                const sorted = [...assignmentsToConsider].sort((a, b) => {
                    const aPercent = (a.scoreEarned! / a.maxScore!);
                    const bPercent = (b.scoreEarned! / b.maxScore!);
                    return aPercent - bPercent;
                });
            // Drop the lowest N
            assignmentsToConsider = sorted.slice(numToDrop);
        }
    }

    // 5. Calculate total points earned and possible in this category
    const totalEarned = assignmentsToConsider.reduce(
        (sum, a) => sum + a.scoreEarned!, 0
    );
    const totalPossible = assignmentsToConsider.reduce(
        (sum, a) => sum + a.maxScore!, 0
    );

    if (totalPossible === 0) {
        continue;
    }

    // 6. Calculate Category Percentage
    const categoryPercentage = (totalEarned / totalPossible);

    // 7. Apply weight
    totalWeightedScore += categoryPercentage * category.weight;
    totalWeightUsed += category.weight;
    }

    // 8. Handle case where no categories have graded assignments
    if (totalWeightUsed === 0) {
        return 0;
    }

    // 9. Normalize final grade based on total weight used
    return (totalWeightedScore / totalWeightUsed) * 100;
}