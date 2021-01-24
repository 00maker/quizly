export class QuizAnswer {

    constructor(parent, num, answer, callback = undefined) {
        this.parent = parent;
        this.answer = answer;
        this.callback = callback || (() => { console.warn("Callback was undefined."); });
        this.isSelected = false;

        this.button = document.createElement('button');
        this.button.onclick = () => this.callback(this);
        this.button.classList.add('answer');
        this.button.innerHTML = `<span>${num}</span> ${answer.text}`;
        this.parent.appendChild(this.button);
    }

    ToggleSelection() {
        this.isSelected = !this.button.classList.contains('selected');
        this.button.classList[this.isSelected ? 'add' : 'remove']('selected');
    }

    Mark() {
        if(this.isSelected)
            this.button.classList.add(this.isSelected !== this.answer.correct ? 'wrong' : 'correct');
    }
}