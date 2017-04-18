


var KnockoutApp = KnockoutApp || {};

(function (KnockoutApp) {

    // renders and manages a progress bar.
    KnockoutApp.ProgressBar = class ProgressBar {
        constructor(selector, length) {
            this.body = selector;
            this.status = null;
            this.progress = null;

            this.position = -1;
            this.length = length;
        }

        init() {
            let status = document.createElement("span");
            status.className = 'status';
            this.status = status;
            this.body.appendChild(status);           
            
            let progress = document.createElement("span");
            progress.className = 'progress';
            this.progress = progress;
            this.body.appendChild(progress);
            
            this.render();
        }

        // multiple increments of blocks
        updateMultiple(increment) {
            this.position += increment;
            this.render();
        }

        // single increment of a block
        update() {
            this.position += 1;
            this.render();
        }

        setStatus(message) {
            this.status.textContent = message;
        }

        // rendering the progress state on dom element
        render() {
            let blocks = "";
            for (let i = 0; i < this.length; i++) {
                if (i <= this.position) {
                    blocks += "■ ";
                } else {
                    blocks += "□ ";
                }
            }
            this.progress.textContent = blocks;
        }

        // removes the progress bar
        remove() {
            this.body.innerHTML=""; 
        }
    }

})(KnockoutApp);