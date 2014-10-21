var wl = require('worklight_adapter');
var expect = require('chai').expect;

var adapterOptions= {};

var request = {
    "adapter": "NameOfAdapter",
    "procedure": "getData",
    "param": [{variable:true}, "str", ["item2", "item3", {anotherVariable:false}]]
}
var options = {
    "debug" : false
}


var login = {
    "adapter": "SecuredAdapter",
    "procedure": "login",
    "param": [adapterOptions, "email@madeup.com","password"]
}


var getSecretInformation = {
    "adapter": "SecuredAdapter",
    "procedure": "getSecretInformation",
    "param": []
}

describe("Unit_Tests::Adapter.", function(){

    describe ("#procedureName1()", function(){
        it("should have succesful response code ", function(done){
           wl.invoke(request, options)
               .then(function(response){
                   // console.log("test " + JSON.stringify(response));
                   expect(response.Search).to.be.an("object");
               }).done(done); // end wl.invoke
        }); // end it
    }); // end describe


    describe ("#chainRequest()", function(){
        it("should have succesful response code ", function(done){
           wl.invoke(request, options)
               .then(function(response){
                   expect(response).to.be.an("object");
                   var newRequest =  request;
                   newRequest.param[response.statusCode];
                   return wl.invoke(newRequest, options)
               }).then(function(response){
                   expect(response).to.be.an("object");

               }).done(done); // end wl.invoke
        }); // end it
    }); // end describe


    describe ("#getSecretInformation()", function(){
        it("should have succesful response code ", function(done){
           wl.invoke(getSecretInformation, options)
               .then(function(response){
                   // console.log("test " + JSON.stringify(response));
                   expect(response.authStatus).to.be.equal("required");
               }).done(done); // end wl.invoke
        }); // end it
    }); // end describe


    describe ("#login()", function(){
        it("should have succesful response code ", function(done){
           wl.invoke(login, options)
               .then(function(response){
                   // console.log("test responsee is" + JSON.stringify(response));
                   expect(response.isSuccessful).to.be.true;
                   return wl.invoke(getSecretInformation, options)
               }).then(function(response){
                   // console.log("test getSecretInformation is" + JSON.stringify(response));
                   expect(response).to.be.an("object");
               }).done(done); // end wl.invoke
        }); // end it
    }); // end describe

}); // end descri
