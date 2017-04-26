// Edit me.
// Feel free to add other JS files in this directory as you see fit.

// UI handler.

var KnockoutApp = KnockoutApp || {};

(function (KnockoutApp) {

    let ELEMENT_IDS = {
        TEAMS_PER_MATCH: "teamsPerMatch",
        NUMBER_OF_TEAMS: "numberOfTeams",
        ERROR: "error",
        START: "start",
        WINNER: "winner",
        PROGRESSBAR: "progressBar"
    };

    let ELEMENT_ACTIONS = {
        ENABLE: 'enable',
        DISABLE: 'disable'
    }

    let AppError = KnockoutApp.AppError;
    let MESSAGES = KnockoutApp.Constants.MESSAGES;
    let CommonFunctions = KnockoutApp.CommonFunctions;

    KnockoutApp.TournamentPage = class TournamentPage {

        constructor() {
            this.teamsPerMatchElement = document.getElementById(ELEMENT_IDS.TEAMS_PER_MATCH);
            this.numberOfTeamsElement = document.getElementById(ELEMENT_IDS.NUMBER_OF_TEAMS);
            this.startButtonElement = document.getElementById(ELEMENT_IDS.START);
            this.winnerElement = document.getElementById(ELEMENT_IDS.WINNER);
            this.errorElement = document.getElementById(ELEMENT_IDS.ERROR);
            this.progressBarElement = document.getElementById(ELEMENT_IDS.PROGRESSBAR);
        }

        init() {
            // bind dom actions
            this.bindActions();
        }

        bindActions() {
            this.startButtonElement.addEventListener("click", async () => {
                this.startTournament();
            });
        }

        validateInputs() {

            let teamsPerMatch = this.teamsPerMatchElement.value;
            let numberOfTeams = this.numberOfTeamsElement.value;

            if (isNaN(teamsPerMatch)) {
                throw new AppError(MESSAGES.INVALID_TEAMS_PER_MATCH);
            }

            if (teamsPerMatch <= 1) {
                throw new AppError(`${MESSAGES.INVALID_TEAMS_PER_MATCH_RANGE} ${teamsPerMatch}`);
            }

            if (isNaN(numberOfTeams)) {
                throw new AppError(MESSAGES.INVALID_NO_OF_TEAMS);
            }
        }

        toggleStartButton(action) {
            if (action == ELEMENT_ACTIONS.DISABLE) {
                this.startButtonElement.style = 'display:none';
            }
            else if (action == ELEMENT_ACTIONS.ENABLE) {
                this.startButtonElement.style = 'display:block';
            }
        }

        setWinner(winner) {
            this.winnerElement.textContent = `${winner}`;
        }

        getTotalMatches() {

            let teamsPerMatch = this.teamsPerMatchElement.value;
            let noOfTeams = this.numberOfTeamsElement.value;
            let noOfRounds = noOfTeams / teamsPerMatch;
            let totalMatches = noOfRounds;

            while (noOfRounds > 1) {
                noOfRounds /= teamsPerMatch;
                totalMatches += noOfRounds;
            }

            return totalMatches;
        }

        async startTournament() {
            console.log("tournament started");
            let progressBar;
            try {
                this.errorElement.textContent = MESSAGES.EMPTY;
                this.winnerElement.textContent = MESSAGES.EMPTY;

                this.toggleStartButton(ELEMENT_ACTIONS.DISABLE);
                this.validateInputs();

                progressBar = new KnockoutApp.ProgressBar(this.progressBarElement, this.getTotalMatches());
                let tournamentManager = new KnockoutApp.TournamentManager(this.teamsPerMatchElement.value,
                    this.numberOfTeamsElement.value, KnockoutApp.RequestHandler);
                let tournament = new KnockoutApp.Tournament(tournamentManager, progressBar);

                let winner = await tournament.run();

                this.setWinner(winner);
                this.toggleStartButton(ELEMENT_ACTIONS.ENABLE);
                progressBar.remove();
            }
            catch (exception) {
                this.errorElement.textContent = `${MESSAGES.ERROR_MSG} ${exception.message}`;
                console.log(exception.stack);
                
                this.toggleStartButton(ELEMENT_ACTIONS.ENABLE);
                progressBar.remove();
            }
        }
    }

})(KnockoutApp);

window.onload = function () {
    new KnockoutApp.TournamentPage().init();
}