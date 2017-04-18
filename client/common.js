

var KnockoutApp = KnockoutApp || {};

(function (KnockoutApp) {

    KnockoutApp.Constants = {};
    KnockoutApp.Constants.MESSAGES = {
        TOURNAMENT_ID: "Invalid Tournament Id",
        TEAMS_FOR_TEAMS_PER_MATCH: "Wait... you can\'t make a knockout tournament with that number of teams",
        NETWORK_ERROR: "A network error has occurred: Status ",
        UNEXPECTED_ERROR: "Unexpected Error",
        CUSTOM_ERROR_TYPE: "AppError",
        WAIT: 'Simulation Running...',
        EMPTY: '',
        INVALID_TEAMS_PER_MATCH: 'Oops, you forgot to give me the teams per match',
        INVALID_TEAMS_PER_MATCH_RANGE: 'Can\'t run a tournament with 1 or fewer teams per match, and you tried with',
        INVALID_NO_OF_TEAMS: 'Oops, you forgot to give me the number of teams in the tournament',
        INVALID_INTERGER_INPUT: 'Only Integer Inputs are allowed.',
        DECLARE_WINNER : ' is the winner.',
        ERROR_MSG : 'Error :: ',
        ROUND: ' Round '
    };

    KnockoutApp.CommonFunctions = {};
    // binary search function for sorted elements
    KnockoutApp.CommonFunctions.binarySearch = function (searchElement) {

        var minIndex = 0;
        var maxIndex = this.length - 1;
        var currentIndex;
        var currentElement;

        while (minIndex <= maxIndex) {
            currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentElement = this[currentIndex];

            if (currentElement < searchElement) {
                minIndex = currentIndex + 1;
            }
            else if (currentElement > searchElement) {
                maxIndex = currentIndex - 1;
            }
            else {
                return currentIndex;
            }
        }

        return -1;
    }

    // checking if y is power of x
    KnockoutApp.CommonFunctions.isPowerof = function (x, y) {

        let power = 1;
        let count;

        for (count = x; count < y; count *= x) {
            power++;
        }

        return count === y
            ? true
            : false;
    }

    // application error handler
    KnockoutApp.AppError = class AppError extends Error {
        constructor(message, stack) {
            super();
            this.name = KnockoutApp.Constants.MESSAGES.CUSTOM_ERROR_TYPE;
            this.message = message;
            if (stack)
                this.stack = stack;
            else
                this.stack = (new Error()).stack;
        }
    }

})(KnockoutApp);