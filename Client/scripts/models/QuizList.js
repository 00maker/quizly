import { overlay } from "../animation.js";

export class QuizList {
    constructor(parent){
        this.parent = parent;
    }

    async Render(){
        const addItem = (quiz) => {
            const item = document.createElement('a');
            const nameAuthor = document.createElement('div');
            item.setAttribute('href', `?id=${quiz.uri}`);
            item.classList.add('quiz-item');
            // const img = new Image();
            // item.appendChild(img);
            const div = document.createElement('div');
            div.innerText = quiz.name;
            div.contentEditable = false;
            item.before(quiz.author);
            
            const by = document.createElement('span');
            by.innerText = `by`;

            const spanAuthor = document.createElement('div');
            spanAuthor.innerText = `${quiz.author}`;

            nameAuthor.appendChild(div);
            nameAuthor.appendChild(by);
            nameAuthor.appendChild(spanAuthor);
            item.appendChild(nameAuthor);
            
            item.onclick = () => !(div.contentEditable === 'true');
            
            const btnEdit = document.createElement('button');
            btnEdit.classList.add('btn', 'orange');
            btnEdit.innerHTML = 'Edit';
            btnEdit.onclick = (e) => {
                if(!div.isContentEditable)
                {
                    btnEdit.innerHTML = 'Done';
                    btnEdit.classList.add('success');
                    div.contentEditable = 'true';
                    div.focus();
                }
                else
                {
                    fetch(`${document.apiUrl}/quiz/${quiz.id}`, {
                        body: div.innerText,
                        method: 'PUT',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                    })
                    .then(async x => {
                        const response = await x.json();
                        console.log(response);
                        if(!response.success)
                            throw new Error(response.error);
                        div.contentEditable = 'false';
                        btnEdit.classList.remove('success');
                        btnEdit.innerHTML = 'Edit'
                    })
                    .catch(reason => {
                        console.error(reason);
                        div.focus();
                        document.notification.Show('Error', 'There was an error when updating quiz name.');
                    });
                }
            };            
            const btnDelete = document.createElement('button');
            btnDelete.innerText = 'Delete';
            btnDelete.classList.add('btn', 'danger');
            btnDelete.onclick = (e) => {
                e.stopPropagation();
                this.ShowConfirmDeleteQuizDialog().then(() => {
                    fetch(`${document.apiUrl}/quiz/${quiz.id}`, {
                        method: 'DELETE',
                        mode: 'cors'
                    }).then(x => {
                        document.location.reload();
                        item.remove();
                    }).catch(reason => {
                        document.notification.Show('Error', 'Error occured while removing a quiz.');
                    });
                }).catch(reason => {
                    if(reason)
                        document.notification.Show('Error', 'Error occured while removing a quiz.');
                });                
                return false;
            }

            var x = document.createElement('div');
            x.append(btnDelete);
            x.appendChild(btnEdit);

            item.appendChild(x);

            this.parent.appendChild(item);
        }

        await fetch(`${document.apiUrl}/quiz`, {
            method: 'GET',
        }).then(async response => {
            const data = await response.json();
            document.body.querySelector('#quizlist-loading').toggleAttribute('hidden');
            this.parent.toggleAttribute('hidden');
            if(data.length > 0) this.parent.innerHTML = '';
            data.forEach(addItem);
            document.notification.Show("Success", "Successfully loaded quizzes.", "success", 2000);
        }).catch(reason => {
            document.notification.Show("Couldn't load", "Error occured when loading quizzes.", "error", 5000);
            console.error(reason);
        });
    }

    ShowConfirmDeleteQuizDialog() {
        return new Promise((resolve, reject) => {
            overlay(false);
            var dialog = document.querySelector('#delete-dialog');
            dialog.removeAttribute('hidden');
            dialog.querySelector('#cancelButton').onclick = () => {
                overlay(true);
                dialog.setAttribute('hidden', null);
                reject();
            };
            
            dialog.querySelector('#submitButton').onclick = () => {
                overlay(true);
                dialog.setAttribute('hidden', null);
                resolve();
            }
        });
    }
}