//  Bring in required modules
var request = require('request');
var when = require('when');
var merge = require('merge');
// global cookie jar? consider revision . .. 
var cookieJar = request.jar()

// add the url management
var _prepareUrl = function(adapter, options) {

    if(options.debug) {
        console.log("\n_prepareUrl :: adapter "+ JSON.stringify(adapter))
        console.log("\n_prepareUrl :: options "+ JSON.stringify(options))
    }
    // TODO fix hard coded URL endpoints here for testing
    
    var protocol = process.env.npm_package_config_protocol;
	var domain = process.env.npm_package_config_domain;
	var port = process.env.npm_package_config_port;
	var context = process.env.npm_package_config_contextRoot;

    var protocol = "http";
	var domain = "localhost";
	var port = "9080";
	var context = "/worklight";

	var baseUrl = protocol + "://" + domain + ":" + port + context;
	var address = baseUrl + "/invoke?adapter=%ADAPTERNAME%&procedure=%PROCEDURENAME%&parameters=%PARAMETERS%";

    var encodedParam = encodeURIComponent(JSON.stringify(adapter.param));
    var address = baseUrl + "/invoke?adapter="+adapter.adapter+"&procedure="+adapter.procedure+"&parameters="+encodedParam;


    // TODO add the additonal options NOT hardcoded here
    var url = {url:address, json:true, jar:cookieJar};
    url = merge(url, options);

    if(options.debug) {
        console.log("\n_prepareUrl :: request = " + JSON.stringify(url));
    }

    return url;
}



// add the cross site scripting challenge


// form the main function
var invoke = function (adapter, options) {
    // options object - idea for dadditional config (ssl / proxy etc)
    // or use options object as all things
    if(options.debug) {
        console.log("\ninvoke :: adapter "+ JSON.stringify(adapter))
    }

    var d = when.defer();
    var url = _prepareUrl(adapter, options);

    _XSS(url).then(_makeRequest).then(function(payload){
    // _XSS(url).then(function(payload){
        if(options.debug) {
            console.log("\ninvoke :: payload is "+ JSON.stringify(payload))
        }     
        d.resolve(payload);

    }, function(error){
        if(options.debug) {
            console.log("\ninvoke :: error is "+ JSON.stringify(error))
        }     
        d.reject(error);
    }) 

    return d.promise;
}

// NOT SURE ABOUT GLOBAL DEF HERE
var WLInstanceId = null;

var _XSS = function (url) {
    if (url.debug){
        console.log("\n_XSS :: url "+ JSON.stringify(url))
    }

    var d = when.defer();

    // WL-Instance-Id has to be taken from request if one exists and added to the headers for future requests
    request.get(url, function(error, response, data){
		if (url.debug){
            console.log("\n_XSS :: request.get error "+ JSON.stringify(error));
            console.log("\n_XSS :: request.get response "+ JSON.stringify(response));
            // console.log("\n_XSS :: request.get data"+ JSON.stringify(data));
		}
        // step 1 parse the response to grab the WL-Instance-Id
        if (!error){
            // remove the /*-secure-\n rubbish
            var payload = JSON.parse(data.substring(11, data.length-2));
            // grab the session id

            if (payload && payload.challenges){
                if (url.debug){
                    console.log("\n_XSS :: request.get challenge "+ JSON.stringify(payload.challenges));
                }
                WLInstanceId = payload.challenges.wl_antiXSRFRealm;
                if (url.debug){
                    console.log("\n_XSS :: request.get WLInstanceId "+ JSON.stringify(WLInstanceId));
                }
                // add the id to the next request headers
                url.headers = WLInstanceId
                d.resolve(url)
            } else {
                // no challenge so just resolve the data
                // could add the url to the result here
                if (url.debug){
                    console.log("\n_XSS :: request.get else ie no challenege "+ JSON.stringify(payload));
                }
                payload._makeRequest = url
                d.resolve(payload)
            }

        } else {
            // if error
            if (url.debug){
                console.log("\n_XSS :: request.get found error "+ JSON.stringify(error));
            }
            d.reject(error);
        }

    }); // end request.get

    return d.promise;

}



var _makeRequest = function(payloadOrURL /* data is stripped of secure-tag */) {
    var d = when.defer();

    if ((payloadOrURL && payloadOrURL.debug) || (payloadOrURL && payloadOrURL._makeRequest && payloadOrURL._makeRequest.debug)){
        console.log("\n _makeRequest :: payloadOrURL "+ JSON.stringify(payloadOrURL))
    }


    // if the _XSS function retuned data ie no challenge made
    if (payloadOrURL && payloadOrURL._makeRequest) {
        if (payloadOrURL && payloadOrURL._makeRequest.debug){
            console.log("\n _makeRequest :: response already gotten")
        }
        d.resolve(payloadOrURL);

    } else {
        // make the request again wiht the WLInstanceId in place
        if (payloadOrURL && payloadOrURL.debug){
            console.log("\n _makeRequest :: making request again with header set")
        }
        request.get(payloadOrURL, function(error, response, data){
            // should maybe move this to after the if response.data block
            data = JSON.parse(data.substring(11, data.length-2));

            if (payloadOrURL.debug){
                console.log("\n _makeRequest :: get() payloadOrURL "+ JSON.stringify(payloadOrURL))
                console.log("\n _makeRequest :: get() response "+ JSON.stringify(response))
                console.log("\n _makeRequest :: get() data "+ JSON.stringify(data))
            }

            if (data) {
                if (payloadOrURL.debug){
                    console.log("\n _makeRequest :: resolving data ")
                }
                // addint the request back to the data as this was often needed when debugging adapters
                data._makeRequest = payloadOrURL
                d.resolve(data)

            } else {
                if (payloadOrURL.debug){
                    console.log("\n _makeRequest :: rejecting data ")
                }
                data._makeRequest = payloadOrURL
                d.reject(response)
            }
        });
    }

    return d.promise;
}


// error handler?


// export the functions used by the user of the script
exports.invoke = invoke;
