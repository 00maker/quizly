export class Leaderboard {
    constructor(parent, id) {
        this.parent = parent;
        this.id = id;
    }

    Hide() {
        this.parent.classList.add('hidden');
    }

    Show(usernameSubmited) {
        this.parent.classList.remove('hidden');

        const list = this.parent.querySelector('.list');

        let i = 0;
        const addItem = (item) => {
            const leaderboardItem = document.createElement('div');
            leaderboardItem.classList.add('leaderboard-item');
            if (item.username == usernameSubmited) leaderboardItem.classList.add('selected');
            leaderboardItem.innerHTML = `
                <div class="left">
                    <div class="index">${++i}</div>
                    <div class="username">${item.username}</div>
                </div>
                <div class="correct-answers">${item.correctAnswers}</div>`;

            list.appendChild(leaderboardItem);
        };

        fetch(`${document.apiUrl}/quiz/results/${this.id}`, {
            method: 'GET',
        }).then(async response => {
            const data = await response.json();
            document.body.querySelector('#quizlist-loading').toggleAttribute('hidden');
            this.parent.toggleAttribute('hidden');
            list.innerHTML = '';
            console.log(data);
            data.forEach(addItem);
            scrollParentToChild(list, list.querySelector('.selected'));
        }).catch(reason => {
            document.notification.Show("Couldn't load", "Error occured when loading leaderboard.", "error", 5000);
            console.error(reason);
        });
    }
}

function scrollParentToChild(parent, child) {
    // Where is the parent on page
    var parentRect = parent.getBoundingClientRect();
    // What can you see?
    var parentViewableArea = {
        height: parent.clientHeight,
        width: parent.clientWidth
    };

    // Where is the child
    var childRect = child.getBoundingClientRect();
    // Is the child viewable?
    var isViewable = (childRect.top >= parentRect.top) && (childRect.top <= parentRect.top + parentViewableArea.height);

    // if you can't see the child try to scroll parent
    if (!isViewable) {
        // scroll by offset relative to parent
        parent.scrollTop = (childRect.top + parent.scrollTop) - parentRect.top
    }
}