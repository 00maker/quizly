export function animate(element, className, duration) {
    if(element.classList.contains(className)) return;
    element.classList.add(className);
    setTimeout(() => element.classList.remove(className), duration);
}

export function overlay(hidden){
    if(hidden) document.querySelector("#dark-overlay").setAttribute('hide', '');
    else       document.querySelector("#dark-overlay").removeAttribute('hide');
}