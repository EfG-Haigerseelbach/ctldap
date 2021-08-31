var ldap = require('ldapjs');
var fs = require('fs');
var ini = require('ini');
var rp = require('request-promise');
var ldapEsc = require('ldap-escape');
var parseDN = require('ldapjs').parseDN;
var assert = require('assert');
const { doesNotMatch } = require('assert');
const { errorMonitor } = require('events');

var config = require('config');

var Server = require('../ctldap.js');
var MockServer = require('./mock-server/mock-server.js');
//const { logger } = require('handlebars');



describe('LDAP client', function () {
    var mockServer;
    var server;
    beforeEach(function(done) {
        mockServer = new MockServer();
        mockServer.init(9999, done);
        server = new Server();
        
    });
    
    this.afterEach(function(done) {
        mockServer.getServer().close(() => {
            mockServer = null;
            server.end();
            done();
        });
    });

    var client1;
    var client2;

    it('should be able to bind with the correct cn, ou, o and password', function (done) {
        server.init(config);
        mockServer.setErrorDuringFetchOfCsrfToken(false);
        mockServer.reset();
        client1 = ldap.createClient({ url: 'ldap://127.0.0.1:1389' });
        client1.bind("cn=root,ou=users,o=churchtools", "XXXXXXXXXXXXXXXXXXXX", err => {
            if (err) { 
                done(err);
            }
            done();
            client1.destroy();            
        });
    });
    it('should be able to xxx', function (done) {
        server.init(config);
        mockServer.setErrorDuringFetchOfCsrfToken(false);
        mockServer.reset();
        client2 = ldap.createClient({ url: 'ldap://127.0.0.1:1389' });
        client2.bind("cn=root,ou=users,o=churchtools", "XXXXXXXXXXXXXXXXXXXX", err => {
            if (err) { 
                console.log('################ some error occurred');
                done(err);
            }
            
            const opts = {
                filter: '(email=johannes.gilbert@posteo.de)',
                scope: 'sub',
                attributes: ['dn', 'sn', 'cn']
              };
              
            client2.search('ou=users,o=churchtools', opts, (err, res) => {
                assert.ifError(err);
                
                res.on('searchRequest', (searchRequest) => {
                    console.log('searchRequest: ', searchRequest.messageID);
                });
                res.on('searchEntry', (entry) => {
                    console.log('entry: ' + JSON.stringify(entry.object));
                });
                res.on('searchReference', (referral) => {
                    console.log('referral: ' + referral.uris.join());
                });
                res.on('error', (err) => {
                    console.error('error: ' + err.message);
                });
                res.on('end', (result) => {
                    console.log('status1: ' + result.status);
                    client2.destroy();
                    done();
                });
            });           
        });
    });
    it('should be able to handle if no CSRF-token is provided', function (done) {
        console.log('it should be able to handle if no CSRF-token is provided');
        server.init(config);
        mockServer.setErrorDuringFetchOfCsrfToken(true);
        mockServer.reset();
        var client = ldap.createClient({ url: 'ldap://127.0.0.1:1389' });
        client.bind("cn=root,ou=users,o=churchtools", "XXXXXXXXXXXXXXXXXXXX", err => {
            if (err) { 
                done(err);
            }
            
            const opts = {
                filter: '(email=johannes.gilbert@posteo.de)',
                scope: 'sub',
                attributes: ['dn', 'sn', 'cn']
              };
              
            client.search('ou=users,o=churchtools', opts, (err, res) => {
                assert.ifError(err);
                
                res.on('searchRequest', (searchRequest) => {
                    console.log('searchRequest: ', searchRequest.messageID);
                });
                res.on('searchEntry', (entry) => {
                    console.log('entry: ' + JSON.stringify(entry.object));
                });
                res.on('searchReference', (referral) => {
                    console.log('referral: ' + referral.uris.join());
                });
                res.on('error', (err) => {
                    console.error('error: ' + err.message);
                });
                res.on('end', (result) => {
                    console.log('status1: ' + result.status);
                    client.destroy();
                    done();
                });
            });           
        });
    });
    it('should be able to handle a non-number cache lifetime in the configuration', function (done) {

        config.churchtools.cache_lifetime = 'Some string';
        server.init(config);
        mockServer.setErrorDuringFetchOfCsrfToken(true);
        mockServer.reset();
        var client = ldap.createClient({ url: 'ldap://127.0.0.1:1389' });
        client.bind("cn=root,ou=users,o=churchtools", "XXXXXXXXXXXXXXXXXXXX", err => {
            if (err) { 
                done(err);
            }
            
            const opts = {
                filter: '(email=johannes.gilbert@posteo.de)',
                scope: 'sub',
                attributes: ['dn', 'sn', 'cn']
              };
              
            client.search('ou=users,o=churchtools', opts, (err, res) => {
                assert.ifError(err);
                
                res.on('searchRequest', (searchRequest) => {
                    console.log('searchRequest: ', searchRequest.messageID);
                });
                res.on('searchEntry', (entry) => {
                    console.log('entry: ' + JSON.stringify(entry.object));
                });
                res.on('searchReference', (referral) => {
                    console.log('referral: ' + referral.uris.join());
                });
                res.on('error', (err) => {
                    console.error('error: ' + err.message);
                });
                res.on('end', (result) => {
                    console.log('status1: ' + result.status);
                    client.destroy();
                    done();
                    /*console.log("destroyed1");

                    client.unbind(err => {
                        console.log('unb');
                        assert.ifError(err);
                        client.destroy();
                        console.log('client destroyed 1');
                        
                    });
                    done();
                    console.log("unbind1");
                    console.log(client);*/
                });
            });           
        });
    });
    /*it('should NOT be able to bind with an in correct cn, correct ou, o and password', function (done) {
        var client = ldap.createClient({ url: 'ldap://127.0.0.1:1389' });
        client.bind("cn=rooot,ou=users,o=churchtools", "XXXXXXXXXXXXXXXXXXXX", err => {
            //console.log(err);
            if (err) {
                done();
                //assert.ifError(err);
            } else {
                done(new Error('An InvalidCredentialsError should occur when trying to bind with an incorrect cn'));
            }
            client.unbind(err => {
                assert.ifError(err);
                client.destroy();
                
            });
            
        });
    });*/
    after(function () {
        server.end();
    });
});
var i = 5;
/*client.add('cn=root, ou=users, o=churchtools', entry, function(err) {
  if(err) {
      console.log(err);
  }
});*/

//ldapsearch -H ldap://127.0.0.1:1389 -x -D cn=root,ou=users,o=churchtools -w XXXXXXXXXXXXXXXXXXXX -LLL 
//-b -o=churchtools '(&(&(objectclass=ctperson))(|(cn=*test*)(mail=*test*)))'