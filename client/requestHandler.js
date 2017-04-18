
var KnockoutApp = KnockoutApp || {};

(function (KnockoutApp) {

    // handles get and post request from a server
    KnockoutApp.RequestHandler = class RequestHandler {

        static get(endpoint, params) {

            let options = {
                method: "GET",
            };

            if (params) {
                endpoint += "?" + RequestHandler._toQueryString(params);
            }

            return window.fetch(endpoint, options);
        }

        static post(endpoint, data) {

            let options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            };

            if (data) {
                options.body = RequestHandler._toQueryString(data);
            }

            return window.fetch(endpoint, options);
        }

        // creates a query string for the request
        static _toQueryString(data) {

            let queryString = "";
            let dataKeys = Object.keys(data);

            for (let i = 0; i < dataKeys.length; i++) {

                let lastElement = (i === (dataKeys.length - 1));
                let dataKey = dataKeys[i];
                let dataValue = data[dataKey];

                if (Array.isArray(dataValue)) {

                    for (let j = 0; j < dataValue.length; j++) {

                        queryString += dataKey + "=" + dataValue[j];

                        if (j !== (dataValue.length - 1)) {
                            queryString += "&";
                        } else {
                            if (!lastElement) {
                                queryString += "&";
                            }
                        }
                    }
                } else {

                    queryString += dataKey + "=" + dataValue;

                    if (!lastElement) {
                        queryString += "&";
                    }
                }

            }

            return queryString;

        }

    }

})(KnockoutApp);
