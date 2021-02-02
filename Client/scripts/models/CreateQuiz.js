import { animate, overlay } from "../animation.js";
import { ValidateQuiz, ValidateQuestion } from "../validation.js";

export class CreateQuiz {
    constructor(parent, id = null) {
        if(!id) document.location.replace(`?create&id=${Math.random().toString(36,36).substring(5)}`);
        this.parent = parent;

        this.id = id;
        this.currentQuestionIndex = 0;
        this.questions = [];

        this.countEl = this.parent.querySelector('#currentQuestion');
        
        this.answersContainer = this.parent.querySelector('.answers-container');
        this.titleInput = this.parent.querySelector('#title');
        this.questionInput = this.parent.querySelector('#question');
        this.answersInputs = this.parent.querySelectorAll('#question~.input');

        this.btnDone = this.parent.querySelector('#btn-createDone');

        this.btnPrev = this.parent.querySelector('#btn-createPrev');
        this.btnAdd = this.parent.querySelector('#btn-createAdd');
        this.btnRemove = this.parent.querySelector('#btn-createDelete');
        this.btnNext = this.parent.querySelector('#btn-createNext');

        this.btnDone.onclick = () => this.SubmitQuiz();

        this.btnPrev.onclick = () => this.SelectQuestion(this.currentQuestionIndex - 1);
        this.btnAdd.onclick = () => this.AddQuestion();
        this.btnRemove.onclick = () => this.RemoveQuestion();
        this.btnNext.onclick = () => this.SelectQuestion(this.currentQuestionIndex + 1);

        this.AddQuestion();
    }

    AddQuestion() {
        this.questions.push(this.NewQuestion());
        this.SelectQuestion(this.questions.length - 1);
        this.UpdateCount();
    }

    SelectQuestion(index, saveCurrentInput = true) {
        if(saveCurrentInput) {
            const currentQuestionInput = this.GetQuestionFromInput();
            this.questions[this.currentQuestionIndex] = currentQuestionInput;
        }

        if(index < 0 || index >= this.questions.length) 
            return;

        if(index != this.currentQuestionIndex) {
            animate(this.answersContainer, this.currentQuestionIndex > index ? 'prev' : 'next', 500);
            setTimeout(() => { this.UpdateCurrentQuestion(index); }, 250);
        }

        this.currentQuestionIndex = index;
        this.UpdateCount();
    }

    UpdateCurrentQuestion(index) {
        if(index === undefined) return;
        this.questionInput.value = this.questions[index].question;

        this.answersInputs.forEach((x,i) => {
            x.children[0].checked = this.questions[index].answers[i].isCorrect;
            x.children[1].value = this.questions[index].answers[i].answer;
        });
    }

    NewQuestion() {
        return {
            question: '',
            answers: [
                { isCorrect: false, answer: '' },
                { isCorrect: false, answer: '' },
                { isCorrect: false, answer: '' },
                { isCorrect: false, answer: '' }
            ]
        };
    }

    RemoveQuestion() {
        this.questions.splice(this.currentQuestionIndex, 1);
        if(this.questions.length === 0) 
            this.questions.push(this.NewQuestion());
        const selectQuestionIndex = this.currentQuestionIndex - (this.currentQuestionIndex == this.questions.length ? 1 : 0);
        this.SelectQuestion(selectQuestionIndex, false);
        this.UpdateCurrentQuestion(selectQuestionIndex);
        this.UpdateCount();
    }

    GetQuestionFromInput() {
        let question = this.NewQuestion();
        question.question = this.questionInput.value;
        this.answersInputs.forEach((x,i) => {
            question.answers[i] = {
                isCorrect: x.children[0].checked,
                answer: x.children[1].value
            };
        });
        return question;
    }

    UpdateCount() {
        this.countEl.innerText = `(${this.currentQuestionIndex + 1} of ${this.questions.length})`;
    }

    async SubmitQuiz() {
        this.SelectQuestion(this.currentQuestionIndex);
        try {
            let quiz = {
                title: this.titleInput.value,
                uri: this.id,
                questions: this.questions
            };

            ValidateQuiz(quiz, async () => {
                await this.ShowSubmitQuizDialog().then(async data => {
                    const { author, uri } = data;

                    quiz.author = author;
                    quiz.uri ||= uri;

                    const response = await fetch(`${document.apiUrl}/quiz/create/${quiz.uri}`, {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        redirect: 'follow',
                        body: JSON.stringify(quiz)
                    });

                    var result = await response.json();
                    console.log(result);
                    if (!result.success)
                        throw new Error(result.error);
                    document.notification.Show("Success", "Your quiz is successfully created.\nYou will now be redirected to it.", "success", 5000);
                    setTimeout(() => {
                        document.location.replace(`?id=${quiz.uri}`);
                    }, 5000);
                    return result;               
                }); 
            }, (error, questionIndex) => {
                console.log(questionIndex);
                if(questionIndex !== undefined) this.SelectQuestion(questionIndex);
                document.notification.Show("Error!", error.message, 'error', 2000);
            });
        } catch (reason) {
            console.error(reason);
            return { error: reason };
        }
    }

    ShowSubmitQuizDialog() {
        return new Promise((resolve, reject) => {
            overlay(false);
            var dialog = document.querySelector('#submit-dialog');
            dialog.removeAttribute('hidden');
            dialog.querySelector('#url').innerText = `${document.location.origin}/?id=`;
            dialog.querySelector('#quizUri').value = this.id.toString();
            dialog.querySelector('#cancelButton').onclick = () => {
                overlay(true);
                dialog.setAttribute('hidden', null);
                reject();
            };
            
            dialog.querySelector('#submitButton').onclick = () => {
                try {
                    const uri = dialog.querySelector('#quizUri').value;
                    const author = dialog.querySelector('#author').value;
                    
                    if(!uri) throw new Error('You must enter quiz id');
                    if(!author) throw new Error('You must enter username!');
                    overlay(true);
                    dialog.setAttribute('hidden', null);
                    resolve({uri, author });
                } catch (err) {
                    document.notification.Show("Error!", err, 'error', 2000);
                }
            }
        });
    }
}