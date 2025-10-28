
export interface CriterionFeedback {
  name: string;
  score: string;
  comment: string;
}

export interface ParsedFeedback {
  overview: string;
  details: CriterionFeedback[];
  totalScore: string;
  suggestions: string;
}
