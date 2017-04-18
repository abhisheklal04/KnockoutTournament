

var KnockoutApp = KnockoutApp || {};

(function (KnockoutApp) {

    let REQUEST_URL = {
        TOURNAMENT: "/tournament",
        TEAM: "/team",
        MATCH: "/match",
        WINNER: "/winner"
    };

    let STATUS_CODES = {
        OK: 200
    };

    const asyncQueue = 15;

    let TournamentError = KnockoutApp.AppError;
    let MESSAGES = KnockoutApp.Constants.MESSAGES;
    let CommonFunctions = KnockoutApp.CommonFunctions;

    // fetches the tournament data from server API.
    // fetches the winning scores in batches to handle large no of teams
    // maintains a teams data map for subsequesnt rounds of tournament.
    KnockoutApp.TournamentManager = class TournamentManager {

        constructor(teamsPerMatch, numberOfTeams, requestHandler) {

            this._teamsPerMatch = teamsPerMatch;
            this._numberOfTeams = numberOfTeams;
            this._tournamentId = null;
            this.requestHandler = requestHandler;
            this._teamsMap = {};
        }

        static _getNetworkErrorMessage(responseData, responseJSON) {

            let message = MESSAGES.NETWORK_ERROR
                + responseData.status;

            if (responseJSON.hasOwnProperty("error")) {
                if (responseJSON.hasOwnProperty("message")) {
                    message = responseJSON.message
                }
            }

            return message;

        }

        // fetches initial round matches
        getInitialMatches() {

            return new Promise(async (resolve, reject) => {

                try {

                    let tournamentData = await this.requestHandler.post(REQUEST_URL.TOURNAMENT, {
                        teamsPerMatch: this._teamsPerMatch,
                        numberOfTeams: this._numberOfTeams,
                    });

                    let responseJSON = await tournamentData.json();
                    this._tournamentId = responseJSON.tournamentId;

                    if (tournamentData.status !== STATUS_CODES.OK) {
                        let message = TournamentManager._getNetworkErrorMessage(
                            tournamentData, responseJSON
                        );

                        return reject(new TournamentError(message));
                    }

                    return resolve(responseJSON.matchUps);

                } catch (exception) {
                    return reject(new TournamentError(MESSAGES.UNEXPECTED_ERROR, exception.stack));
                }

            });

        }

        // fetches team object from server
        getTeamData(teamId) {

            return new Promise(async (resolve, reject) => {

                try {

                    if (this._tournamentId == null) {
                        return reject(new TournamentError(MESSAGES.TOURNAMENT_ID));
                    }

                    let teamData = await this.requestHandler.get(REQUEST_URL.TEAM, {
                        tournamentId: this._tournamentId,
                        teamId: teamId
                    });

                    let teamJSON = await teamData.json();

                    if (teamData.status !== STATUS_CODES.OK) {
                        let message = TournamentManager._getNetworkErrorMessage(
                            teamData, teamJSON
                        );

                        return reject(new TournamentError(message));
                    }

                    return resolve(teamJSON);

                } catch (exception) {
                    return reject(new TournamentError(MESSAGES.UNEXPECTED_ERROR, exception.stack));
                }

            });

        }

        // fetches match score of a round
        getMatchScore(match, round) {

            return new Promise(async (resolve, reject) => {

                try {

                    if (this._tournamentId == null) {
                        return reject(new TournamentError(MESSAGES.TOURNAMENT_ID));
                    }

                    let matchData = await this.requestHandler.get(REQUEST_URL.MATCH, {
                        tournamentId: this._tournamentId,
                        match: match,
                        round: round
                    });

                    let matchJSON = await matchData.json();

                    if (matchData.status !== STATUS_CODES.OK) {
                        let message = TournamentManager._getNetworkErrorMessage(
                            matchData, matchJSON
                        );

                        return reject(new TournamentError(message));
                    }

                    return resolve(matchJSON.score);

                } catch (exception) {
                    return reject(new TournamentError(MESSAGES.UNEXPECTED_ERROR, exception.stack));
                }

            });

        }

        // fetches match winning score
        async getMatchWinningScore(matchScore, teamScores, matchOverCallback) {

            return new Promise(async (resolve, reject) => {

                try {

                    if (this._tournamentId == null) {
                        return reject(new TournamentError(MESSAGES.TOURNAMENT_ID));
                    }

                    let winningData = await this.requestHandler.get(REQUEST_URL.WINNER, {
                        tournamentId: this._tournamentId,
                        matchScore: await matchScore,
                        teamScores: await teamScores
                    });

                    let winningJSON = await winningData.json();

                    if (winningData.status !== STATUS_CODES.OK) {
                        let message = TournamentManager._getNetworkErrorMessage(
                            winningData, winningJSON
                        );

                        return reject(new TournamentError(message));
                    }
                    if (matchOverCallback) {
                        matchOverCallback();
                    }
                    return resolve(winningJSON.score);

                } catch (exception) {
                    return reject(new TournamentError(MESSAGES.UNEXPECTED_ERROR, exception.stack));
                }

            });

        }

        // fetches winning scores asynchronusly in batches from server
        async getMatchWinnerScores(matches, round, matchOverCallback) {
            
            let winnersList = [];

            for (let i = 0; i < matches.length; i = i + asyncQueue) {
                let currentWinners = await this.getWinnersBatch(i,matches,round,matchOverCallback);
                winnersList = winnersList.concat(currentWinners);
            }

            return winnersList;
        }

        // creates limited queue to fetch Winners
        async getWinnersBatch(i, matches, round, matchOverCallback) {
            let winnersPromiseList=[];
            for (let j = i; j < i+asyncQueue && j<matches.length; j++) {
                let matchScore = this.getMatchScore(matches[j].match, round);
                let teamScores = this.getTeamScores(matches[j].teamIds);
                winnersPromiseList.push(this.getMatchWinningScore(matchScore, teamScores, matchOverCallback));
            }
            return Promise.all(winnersPromiseList);
        }

        // gets teams scores of a match and builds teamMap cache for next round
        async getTeamScores(teamIds) {

            let teamScoreList = [];

            let teamPromiseList = [];
            for (let i = 0; i < teamIds.length; i++) {
                if (!this._teamsMap.hasOwnProperty(teamIds[i])) {
                    teamPromiseList.push(this.getTeamData(teamIds[i]));
                }
                else {
                    teamScoreList.push(this._teamsMap[teamIds[i]].score);
                }
            }

            (await Promise.all(teamPromiseList)).forEach(team => {
                teamScoreList.push(team.score);
                this._teamsMap[team.teamId] = team;
            });

            return teamScoreList;
        }

        // creating next round matches from previous winnings
        getNextRoundMatches(winnerScoreList, previousMatchList) {

            let newMatchList = [];

            let sortedWinningScores = winnerScoreList.sort((a, b) => { return a - b });

            let winnerTeamIdList = previousMatchList.map(match => {
                let winningTeam = match.teamIds.filter(id => {
                    return (CommonFunctions.binarySearch.call(sortedWinningScores, this._teamsMap[id].score) != -1)
                });
                return winningTeam[0];
            });

            let teamIdGroups = winnerTeamIdList.reduce((rows, key, index) =>
                (index % this._teamsPerMatch == 0
                    ? rows.push([key])
                    : rows[rows.length - 1].push(key))
                && rows, []);

            let newMatchIndex = 0;
            newMatchList = teamIdGroups.map(teamGroup => {
                return {
                    match: newMatchIndex++,
                    teamIds: teamGroup
                }
            });

            return newMatchList;

        }
    }

})(KnockoutApp);

