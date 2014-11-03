Worklight Adapter Test Harness
================

This Node.JS module provides a method to invoke Worklight adapters from a node script

When used in conjunction with [Mocha](http://visionmedia.github.io/mocha/) and [Chai](http://chaijs.com/) this module provides a promise based framework for invoking Worklight adapters. Requests can be chained together and Authenticated Adapters can be invoked using this chaining.

To configure the worklight server endpoint change the variables in `invoke.js`:

    var protocol = "http";
    var domain = "localhost";
    var port = "9080";
    var context = "/worklight";

    ^ These are the defaults

or 
use npm config to define the variables (*note*: this feature is not working at the moment - see issue #2):

    npm config set worklight_adapter:protocol=http
    npm config set worklight_adapter:port=10080
    npm config set worklight_adapter:domain=localhost
    npm config set worklight_adapter:contextRoot=/worklightserver


    Example Usage - come back later.....
(For sample use see the tests directory)
