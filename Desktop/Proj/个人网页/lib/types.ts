export type MealType = "breakfast" | "lunch" | "dinner";

export type MealScore = {
  score: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  nutritionAdvice: string[];
  nextMealSuggestion: string;
};

export type MealEntry = {
  id: string;
  user_id: string;
  meal_date: string;
  meal_type: MealType;
  image_url: string | null;
  user_description: string | null;
  vision_text: string | null;
  score_result: MealScore | null;
  created_at: string;
};

export const mealLabels: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐"
};
