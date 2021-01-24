export class QuizQuestion {
    constructor(parent, question, answers, minAnswerCount, onClick) {
        this.parent = parent;
        this.minAnswerCount = minAnswerCount;
        this.onClick = onClick;
    }
}