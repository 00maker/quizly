export class Notification {
    constructor(parent) {
        this.parent = parent;
    }

    Show(title, message, type, duration) {
        this.parent.classList.remove('hidden');

        if(type){
            this.parent.querySelector('.icon').classList.remove('hidden');
            this.parent.querySelector('.icon').setAttribute('src', this.GetIcon(type));
        } else
            this.parent.querySelector('.icon').classList.add('hidden');

        this.parent.querySelector('.title').innerText = title;
        this.parent.querySelector('.message').innerText = message;

        this.parent.setAttribute('notification-type', type);

        setTimeout(() => this.Hide(), duration);
    }

    Hide(){
        this.parent.classList.add('hidden');
    }

    GetIcon(type){
        switch(type){
            case "error": return "img/error.png";
            case "success": return "img/success.png";
        }
    }
}