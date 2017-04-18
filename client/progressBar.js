


var KnockoutApp = KnockoutApp || {};

(function (KnockoutApp) {

    // renders and manages a progress bar.
    KnockoutApp.ProgressBar = class ProgressBar {
        constructor(selector, length) {
            this.body = selector;
            this.position = -1;
            this.length = length;
        }

        init() {
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

        // rendering the progress state on dom element
        render() {
            let progressBar = "";
            for (let i = 0; i < this.length; i++) {
                if (i <= this.position) {
                    progressBar += "■ ";
                } else {
                    progressBar += "□ ";
                }
            }
            this.body.textContent = progressBar;
        }

        // removes the progress bar
        remove() {
            this.body.textContent = "";
        }
    }

})(KnockoutApp);