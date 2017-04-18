
var KnockoutApp = KnockoutApp || {};

(function (KnockoutApp) {

    let TournamentError = KnockoutApp.AppError;
    let MESSAGES = KnockoutApp.Constants.MESSAGES;

    // manages tournament simulation logic 
    // carries out matches within teams
    // builds new rounds for further matches
    KnockoutApp.Tournament = class Tournament {

        constructor(tournamentManager, progressBar) {
            this.tournamentManager = tournamentManager;
            this.progressBar = progressBar;
        }

        async run() {
            try {

                let matchCount = 0;

                if (this.progressBar) {
                    this.progressBar.init();
                }

                // fetching initial matches and team data
                let matches = await this.tournamentManager.getInitialMatches();

                let winnerScores = [];
                let round = 0;
                let winner = "";

                do {
                    // getting current round winning scores and updating progress bar
                    // on completion of each match
                    winnerScores = await this.tournamentManager.getMatchWinnerScores(matches, round,
                        this.progressBar ? this.progressBar.update.bind(this.progressBar) : null)

                    round++;

                    if (winnerScores.length > 1) {
                        // building next round
                        matches = this.tournamentManager.getNextRoundMatches(winnerScores, matches);
                    }

                } while (winnerScores.length > 1);

                if (this.progressBar) {
                    this.progressBar.update();
                }

                // getting final winner name
                let winnerId = matches[0].teamIds.filter(id => this.tournamentManager._teamsMap[id].score == winnerScores[0])[0];
                winner = this.tournamentManager._teamsMap[winnerId].name;

                return winner;
            }
            catch (exception) {
                if (exception.name == MESSAGES.CUSTOM_ERROR_TYPE) {
                    return exception;
                }
                else {
                    return new TournamentError(MESSAGES.UNEXPECTED_ERROR, exception.stack);
                }
            }
        }
    }

})(KnockoutApp);