import { animate, overlay } from "../animation.js";

export class CreateQuiz {
    constructor(parent, id = null) {
        if(!id) document.location.replace(`?create&id=${Math.random().toString(36,36).substring(5)}`);
        this.parent = parent;

        this.id = id;
        this.currentQuestionIndex = 0;
        this.questions = [this.NewQuestion()];

        this.countEl = this.parent.querySelector('#currentQuestion');
        
        this.answersContainer = this.parent.querySelector('.answers-container');
        this.titleInput = this.parent.querySelector('#title');
        this.questionInput = this.parent.querySelector('#question');
        this.answersInputs = this.parent.querySelectorAll('#question~.input');

        this.btnDone = this.parent.querySelector('#btn-createDone');

        this.btnPrev = this.parent.querySelector('#btn-createPrev');
        this.btnAdd = this.parent.querySelector('#btn-createAdd');
        this.btnNext = this.parent.querySelector('#btn-createNext');

        this.btnDone.onclick = () => this.SubmitQuiz();

        this.btnPrev.onclick = () => this.SelectQuestion(this.currentQuestionIndex - 1);
        this.btnNext.onclick = () => this.SelectQuestion(this.currentQuestionIndex + 1);
        this.btnAdd.onclick = () => this.AddQuestion();
        this.UpdateCount();
    }

    AddQuestion() {
        this.questions.push(this.NewQuestion());
        this.SelectQuestion(this.questions.length - 1);
        this.UpdateCount();
    }

    SelectQuestion(index) {
        var currentQuestionInput = this.GetQuestionFromInput();
        var shouldValidate = index > this.currentQuestionIndex;
        if(index < 0 || index >= this.questions.length || (shouldValidate && !this.ValidateQuestion(currentQuestionInput))) return;
        console.log('added' + currentQuestionInput + ' to ' + this.currentQuestionIndex);
        this.questions[this.currentQuestionIndex] = currentQuestionInput;
        animate(this.answersContainer, this.currentQuestionIndex > index ? 'prev' : 'next', 500);
        setTimeout(() => { this.UpdateCurrentQuestion(index); }, 250);
        this.currentQuestionIndex = index;
        this.UpdateCount();
    }

    UpdateCurrentQuestion(index) {
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

    ValidateQuestion(question){
        if(!question) return false;
        if(!question.question || question.question.length < 2) return false;
        if(!question.answers) return false;
        if(question.answers.length != 4) return false;
        const correctAnswersCount = question.answers.filter(x => x.isCorrect).length;
        if(correctAnswersCount > 3 || correctAnswersCount < 1) return false;
        return true;
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
        var dialogResult = await this.ShowSubmitQuizDialog();
        if(!dialogResult) return;

        const { author, uri } = dialogResult;
        console.log(uri + " " + author);
        const quiz = {
            title: this.titleInput.value,
            author: author,
            uri: uri || this.id,
            questions: this.questions
        };
        if(!this.ValidateQuiz(quiz)) return false;

        console.log(quiz);
        return fetch(`${document.apiUrl}/quiz/create/${quiz.uri}`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            body: JSON.stringify(quiz)
        }).then(async response => {
            console.log(response);
            document.notification.Show("Succes", "Your quiz is successfully created.\nYou will now be redirected to it.", "success", 5000);
            setTimeout(() => {
                document.location.replace(`?id=${quiz.uri}`);
            }, 5000);
            return response.json();
        }).catch(reason => {
            document.notification.Show("Error!", reason, icon = "icons/error", type = 'notification-error', 2000);
            console.error(reason);
            return { error: reason };
        });
    }

    ShowSubmitQuizDialog() {
        return new Promise((resolve, reject) => {
            console.log('show');
            overlay(false);
            var dialog = document.querySelector('#submit-dialog');
            dialog.removeAttribute('hidden');
            dialog.querySelector('#url').innerText = `${document.location.origin}/?id=`;
            dialog.querySelector('#quizUri').value = this.id.toString();
            dialog.querySelector('#cancelButton').onclick = () => {
                overlay(true);
                console.log('close');
                dialog.setAttribute('hidden', null);
                reject();
            };
            
            dialog.querySelector('#submitButton').onclick = () => {
                const uri = dialog.querySelector('#quizUri').value;
                const author = dialog.querySelector('#author').value;
                
                if(!uri) reject('You must enter quiz id');
                if(!author) reject('You must enter username!');

                resolve({uri, author});
            }
        });
    }

    ValidateQuiz(quiz){
        if(!quiz) return false;
        if(!quiz.title || quiz.length < 4) return false;
        if(!quiz.questions || quiz.questions.length < 1) return false;
        quiz.questions = quiz.questions.filter(this.ValidateQuestion);
        return true;
    }
}