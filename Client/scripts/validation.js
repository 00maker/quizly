export function ValidateQuiz(quiz, successCallback, errorCallback) {
    try{
        if(!quiz) throw new Error();
        if(!quiz.title || quiz.title.length < 4) throw new Error("Title entered must contain at least 4 characters!");
        if(!quiz.questions || quiz.questions.length < 1) throw new Error("Quiz must contain at least one question.");
        const index = quiz.questions.findIndex((x,i) => !ValidateQuestion(x, () => {}, (message) => errorCallback(message, i)));
        if(index !== -1) return false;
        successCallback();
    } catch(err) {
        errorCallback(err);
        return false;
    }
    return true;
}

export function ValidateQuestion(question, successCallback = null, errorCallback = null) {
    try{
        if(!question) throw new Error();
        if(!question.question || question.question.length < 5) throw new Error("Question must be at least 5 characters long.");
        if(!question.answers) throw new Error();
        if(question.answers.length != 4) throw new Error("Question must have 4 answers.");
        if(!question.answers.every(x => x.answer.length > 0)) throw new Error("You shouldn't leave any answers empty.");
        const correctAnswersCount = question.answers.filter(x => x.isCorrect).length;
        if(correctAnswersCount > 3 || correctAnswersCount < 1) throw new Error("Question must have min 1 and max 3 correct answers.");
        if(successCallback) successCallback();
    } catch(err) {
        if(errorCallback) errorCallback(err);
        return false;
    }
    return true;
}