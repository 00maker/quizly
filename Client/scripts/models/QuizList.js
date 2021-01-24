export class QuizList {
    constructor(parent){
        this.parent = parent;
    }

    async Render(){
        const addItem = (quiz) => {
            const item = document.createElement('a');
            item.setAttribute('href', `?id=${quiz.uri}`);
            item.classList.add('quiz-item');
            const img = new Image();
            item.appendChild(img);
            const spanName = document.createElement('div');
            spanName.innerText = `${quiz.name}`;
            item.appendChild(spanName);
            item.before(quiz.author);
            const spanAuthor = document.createElement('div');
            spanAuthor.innerText = `${quiz.author}`;
            item.appendChild(spanAuthor);
            this.parent.appendChild(item);
        }

        fetch(`${document.apiUrl}/quiz`, {
            method: 'GET',
        }).then(async response => {
            const data = await response.json();
            document.body.querySelector('#quizlist-loading').toggleAttribute('hidden');
            this.parent.toggleAttribute('hidden');
            if(data.length > 0) this.parent.innerHTML = '';
            data.forEach(addItem);
            document.notification.Show("Success", "Successfully loaded quizzies.", "success", 2000);
        }).catch(reason => {
            document.notification.Show("Couldn't load", "Error occured when loading quizzies.", "error", 5000);
            console.error(reason);
        });
        // <a href="#" class="quiz-item placeholder"><img /><span>Item 1</span></a>
    }

    CreateEmptyState() {

    }
}