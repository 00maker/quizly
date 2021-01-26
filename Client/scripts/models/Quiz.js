import { animate } from "../animation.js";
import { Leaderboard } from "./Leaderboard.js";
import { QuizAnswer } from "./QuizAnswer.js";

export class Quiz
{
    constructor(id, parent){
        this.quizId = id;
        this.parent = parent;
        this.currentQuestion = 0;
        this.selectedAnswers = [];
    }
    
    async Render(){
        this.parent.parentNode.querySelector('#finished-quiz').classList.add('hidden');
        this.leaderboard = new Leaderboard(this.parent.parentNode.querySelector('#leaderboard'), this.quizId);
        this.leaderboard.Hide();

        return await fetch(`${document.apiUrl}/quiz/${this.quizId.toString()}`, {
            method: 'GET'
        }).then(async value => {
            const data = await value.json();
            if(!data) throw new Error('Couldn\'t load quiz data by id specified!');
            const { questions, author } = data;
            this.author = author;
            this.questions = questions;
            this.LoadQuestion(0);
            document.notification.Show("Success", "Successfully loaded quiz.", "success", 2000);
            return true;
        }).catch((reason) => {
            console.error(reason);
            document.notification.Show("Couldn't load quiz", "Please check id specified or try reloading the page.", "error", 5000);
            return false;
        });
    }

    LoadQuestion(index) {
        const questionHolder = this.parent.querySelector('.question');
        questionHolder.innerText = this.questions[index].text;

        this.currentQuestion = index;
        const answersParent = this.parent.querySelector('.answers');
        answersParent.innerHTML = '';
        this.answerElements = this.questions[index].answers.map((x,i) =>
        new QuizAnswer(answersParent, ['A', 'B', 'C', 'D'][i],  x, (sender) => {
                sender.ToggleSelection();
                this.UpdateHint();
            }));
        this.UpdateHint();
    }

    UpdateHint(){
        const hintHolder = this.parent.querySelector('.hint');
        console.log(this.answerElements);
        const currentSelectedCount = this.answerElements.filter(x => x.isSelected).length;
        hintHolder.innerText = `(${currentSelectedCount} of ${this.GetCorrectQuestionsCount(this.currentQuestion)} selected)`;
        
        this.canGoToNext = this.GetCorrectQuestionsCount() === currentSelectedCount;
    }

    GetCorrectQuestionsCount = () => this.answerElements.filter(x => x.answer.correct).length;

    NextQuestion() {
        if(!this.canGoToNext) 
        {
            animate(this.parent.querySelector('.hint'), 'highlight', 1000);
            return;
        }

        this.MarkAnswers(() => {
            animate(this.parent, 'next', 500);
            if(this.currentQuestion + 1 == this.questions.length) {
                setTimeout(() => {
                    this.parent.setAttribute('style', 'display: none;');
                    this.ShowFinishedQuiz();
                }, 250);
            } else setTimeout(() => this.LoadQuestion(this.currentQuestion + 1), 250);
        });
    }

    async ShowFinishedQuiz(){
        const quiz = this.parent.parentNode.querySelector('#finished-quiz');
        quiz.classList.remove('hidden');

        const counts = quiz.querySelectorAll('#finished-quiz .count span');

        counts[0].innerText = this.selectedAnswers.filter(x => x.every(y => y.answer.correct)).length;
        counts[1].innerText = this.selectedAnswers.length;

        const bar = quiz.querySelector('#finished-quiz .bar');
        this.selectedAnswers.forEach(x => {
            const div = document.createElement('div');
            div.setAttribute('data-correct', x.every(y => y.answer.correct));
            bar.appendChild(div);
        });
        const answers = this.selectedAnswers.map(x => x.map(y => y.answer.id));
        quiz.querySelector('#submitResults').onclick = async () => {
            try {
                const username = quiz.querySelector('#username-input').value;
                console.log('Username' + username);
                if(!username) return false;
                
                const data = {
                    answerIds: answers,
                    username
                };
                
                return await fetch(`${document.apiUrl}/quiz/${this.quizId}`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow',
                    body: JSON.stringify(data)
                }).then(async response => {
                    console.log(response);
                    this.parent.parentNode.querySelector('#finished-quiz').classList.add('hidden');
                    this.leaderboard.Show(username);
                    document.notification.Show("Success", "Your result is succesfully saved.", "success", 2000);                    
                    return await response.json();
                }).catch(reason => {
                    document.notification.Show("Error submiting result", "Error occured when we tried to save your results.\nPlease try submiting again.", "error", 5000);
                    console.error(reason);
                    return false;
                });
            } catch (reason) {
                console.error(reason);
                return false;
            }
        };
    }

    MarkAnswers(onFinished) {
        this.selectedAnswers[this.currentQuestion] = this.answerElements.filter(x => x.isSelected);
        this.answerElements.forEach(x => x.Mark());
        setTimeout(onFinished, 1000);
    }
}