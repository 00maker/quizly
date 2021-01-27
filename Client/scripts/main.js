import { CreateQuiz } from './models/CreateQuiz.js';
import { Quiz } from './models/Quiz.js'
import { QuizList } from './models/QuizList.js'
import { Notification } from './notification.js';

(async function(){
    document.apiUrl = 'https://localhost:44323';

    quizListEl.setAttribute('style','display: none;');
    quizEl.setAttribute('style','display: none;');
    createQuizEl.setAttribute('style','display: none;');
    
    const notification = new Notification(document.querySelector('#notification-bubble'));
    document.notification = notification;

    const quizListEl = document.querySelector('.quiz-list');
    const quizEl = document.querySelector('.quiz');
    const createQuizEl = document.querySelector('.create-quiz');
    
    const quizId = document.location.search.match(/id=(\S*)/);
    const isCreate = document.location.search.match(/\?create/);
    let quizExists = null;
    if(!isCreate && quizId && quizId[1]) 
        quizExists = await ShowQuiz(quizId[1]);
    
    if(!quizExists){
        if(isCreate)
            ShowQuizCreate(quizId && quizId[1]);
        else {
            await ShowQuizList();
            if(quizExists === false)
                document.notification.Show('Error', 'Quiz with id specified doesn\'t exist.', 'error', 3000);
        }
    }

    quizListEl.setAttribute('style',`display: ${!isCreate && (quizId === null || !quizExists) ? 'block' : 'none'};`);
    quizEl.setAttribute('style',`display: ${isCreate == null && (quizId !== null && quizExists) ? 'block' : 'none'};`);
    createQuizEl.setAttribute('style', `display: ${isCreate ? 'block' : 'none'};`);
    
    async function ShowQuizCreate(id){
        new CreateQuiz(document.body.querySelector('.create-quiz'), id);
    }

    async function ShowQuizList() { 
        await new QuizList(document.body.querySelector('#quizlist')).Render(); 
    }

    async function ShowQuiz(id){
        const quiz = new Quiz(id, quizEl.querySelector('.question-container'));
        quizEl.querySelector('#btn-next').addEventListener('click', () => quiz.NextQuestion());
        return await quiz.Render();
    }
})();
