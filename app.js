import "./main.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import { default as BigNumber } from 'bignumber.js'
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './index.html';
import './index1.html';
import './index2.html';
import './index3.html';
import './index4.html';
import './index5.html';
import './index6.html';
import './index7.html';

import rentCar_artifacts from '../../build/contracts/rentCar.json'

// ShareApp is our usable abstraction, which we'll use through the code below.
var rentCar = contract(rentCar_artifacts);

var accounts;
var account;
var account1;

indow.App = {
  start: function() {
    var self = this;

    // Bootstrap the ShareApp abstraction for Use.
    rentCar.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      account1 = accounts[1];
      console.log(accounts);
      console.log(web3.eth.getBalance(account1).toNumber());
      });
    self.postObjectsTable();

  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  createCar: function(){
    var self = this;

    var carModel = document.getElementById("make").value;
    var carMake = document.getElementById("model").value;
    var carPricePerDay = parseInt(document.getElementById("pricePerDay").value);
    var carDeposit = parseInt(ocument.getElementById("deposit").value);
    var carMinRentalDay = parseInt(document.getElementById("minRentalDay").value);
    var carMaxRentalDay = parseInt(document.getElementById("maxRentalDay").value);
    var carAvailable = document.getElementById("available").value;
    var carLocation = document.getElementById("location").value;

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    rentCar.deployed().then(function(instance){
      meta = instance;
      return meta.createCar(carModel,carMake,carPricePerDay,carDeposit,carMinRentalDay,carMaxRentalDay,carAvailable,carLocation,{from:account,gas:500000});
      }).then(function(tx){
        self.setStatus("create success!");
        console.log(meta.address);
        console.log(tx);
        // self.qrcode();
        // document.getElementById("objectInfoDiv").style.display="none";
        // document.getElementById("qrcodeDiv").style.display="";
        return meta.getNumOfCars.call();
      }).then(function(num){
        let newId = num.toNumber() - 1;
        console.log(num.toNumber());
        self.addRowObjectTable(newId);
      }).catch(function(e){
        console.log(e);
        self.setStatus("Error create;see log.");
      });
  },

  //View
  postObject: function(_objID){  


    var mainInstance;
    var numofCars;
    var _carOwner;
    var _carMake;
    var _carModel;
    var _carLocation;
    var _carPricePerDay;
    var _carDeposit;
    var _carAvailable;
    var _carMininumRentalDay;
    var _carMaximumRentalDay;
    var _carCurrentlyRenting;


    rentCar.deployed().then(function(instance){
      mainInstance = instance;
      return instance.getNumOfCars.call();
    }).then(function(result){
      numofCars = result.toNumber();
      return mainInstance.getCarMake.call(_objID);
    }).then(function(carOwner){
      _carOwner = carOwner;
      return mainInstance.getCarModel.call(_objID);
    }).then(function(carMake){
      _carMake = carMake;
      return mainInstance.getCarLocation.call(_objID);
    }).then(function(carLocation){
      _carLocation = carLocation;
      return mainInstance.getCarPricePerDay.call(_objID);
    }).then(function(carPricePerDay){
      _carPricePerDay = carPricePerDay.toNumber();
      return mainInstance.getCarDeposit.call(_objID);
    }).then(function(carDeposit){
      _carDeposit = carDeposit.valueOf();
      return mainInstance.getCarAvailable.call(_objID);
    }).then(function(carAvailable){
      _carAvailable = carAvailable;
      return mainInstance.getCarMininumRentalDay.call(_objID);
    }).then(function(carMininumRentalDay){
      _carMininumRentalDay = carMininumRentalDay.toNumber();
      return mainInstance.getCarMaximumRentalDay.call(_objID);
    }).then(function(carMaximumRentalDay){
      _carMaximumRentalDay = carMaximumRentalDay.toNumber();
      return mainInstance.getCarCurrentlyRenting.call(_objID);
    }).then(function(carCurrentlyRenting){
      _carCurrentlyRenting = carCurrentlyRenting;


      if(_objID < numofCars && _objID >= 0){
        if(_carAvailable== true){
          document.getElementById("rentButton").style.display = "inline";
          document.getElementById("returnButton").style.display = "none";
        }
        else{
          document.getElementById("returnButton").style.display = "inline";
          document.getElementById("rentButton").style.display = "none";
        }
        document.getElementById("object-info").style.display = "inline";
        document.getElementById("objID").innerHTML = _objID;
        document.getElementById("carOwner").innerHTML = _carOwner;
        document.getElementById("carModel").innerHTML = _carModel;
        document.getElementById("carMake").innerHTML = _carMake;
        document.getElementById("carLocation").innerHTML = _carLocation;
        document.getElementById("carPricePerDay").innerHTML = _carPricePerDay;
        document.getElementById("carDeposit").innerHTML = _carDeposit;
        document.getElementById("carAvailable").innerHTML = _carAvailable;
        document.getElementById("carMaxRentalDay").innerHTML = _carMaximumRentalDay;
        document.getElementById("carMinRentalDay").innerHTML = _carMininumRentalDay;
        document.getElementById("carCurrentlyRenting").innerHTML = _carCurrentlyRenting;

      }else{
        alert("There is no object with id " + id); // error message
      }
    });
  },

  searchObj: function(){
    var self = this;

    var id = parseInt(document.getElementById("search-value").value);
    self.postObject(id);
  },

  searchObjByName: function(){
    var self = this;

    var name = document.getElementById("search-name").value;
    self.postObjectsTableByName(name);
  },

  postObjectsTableByName: function(_name){
    var self = this;
    var ids;
    var mainInstance;
    document.getElementById("carInfo").style.display = "inline";
    $("#carInfo-table tr:not(:first)").empty();
    var tbody = document.getElementById("carInfo-table").tBodies[0];
    rentCar.deployed().then(function(instance){
      mainInstance=instance;
      return instance.findNames.call(_name);
    }).then(function(res){
      ids = res;

      for(let element of ids){
        let id = element.toNumber();
        self.addRowObjectTable(id,tbody);
      }
    });
  },

  addRowObjectTable: function(_id,tbody){
    var self = this;
    var mainInstance;
    var _carMake;
    var _carModel;
    var _carLocation;
    var _carPricePerDay;
    var _carDeposit;
    var _carAvailable;
    var _carMininumRentalDay;
    var _carMaximumRentalDay;

    // var tbody = document.getElementById("objectsTable").tBodies[0];
    rentCar.deployed().then(function(instance){
          mainInstance = instance;
          return mainInstance.getCarMake.call(_objID);
        }).then(function(carOwner){
          _carOwner = carOwner;
          return mainInstance.getCarModel.call(_objID);
        }).then(function(carMake){
          _carMake = carMake;
          return mainInstance.getCarLocation.call(_objID);
        }).then(function(carLocation){
          _carLocation = carLocation;
          return mainInstance.getCarPricePerDay.call(_objID);
        }).then(function(carPricePerDay){
          _carPricePerDay = carPricePerDay.toNumber();
          return mainInstance.getCarDeposit.call(_objID);
        }).then(function(carDeposit){
          _carDeposit = carDeposit.valueOf();
          return mainInstance.getCarAvailable.call(_objID);
        }).then(function(carAvailable){
          _carAvailable = carAvailable;
          return mainInstance.getCarMininumRentalDay.call(_objID);
        }).then(function(carMininumRentalDay){
          _carMininumRentalDay = carMininumRentalDay.toNumber();
          return mainInstance.getCarMaximumRentalDay.call(_objID);
        }).then(function(carMaximumRentalDay){
          _carMaximumRentalDay = carMaximumRentalDay.toNumber();

          var row = tbody.insertRow(0);

          var cell1 = row.insertCell(0);  //id
          var cell2 = row.insertCell(1);  //make
          var cell3 = row.insertCell(2);  //model
          var cell4 = row.insertCell(3);  //location
          var cell5 = row.insertCell(4);  //pricePerDay
          var cell6 = row.insertCell(5);  //deposit
          var cell4 = row.insertCell(6);  //available
          var cell5 = row.insertCell(7);  //minRentalDay
          var cell6 = row.insertCell(8);  //maxRentalDay

          cell1.innerHTML = _id;
          cell2.innerHTML = _carMake;
          cell3.innerHTML = _carModel;
          cell4.innerHTML = _carLocation;
          cell5.innerHTML = _carPricePerDay;
          cell6.innerHTML = _carDeposit;
          cell7.innerHTML = _carAvailable;
          cell8.innerHTML = _carMininumRentalDay;
          cell9.innerHTML = _carMaximumRentalDay;
          cell6.innerHTML = '<a href="javascript:void(0);" onclick="javascript:App.display(this)">Display</a>';
        });
  },

  display: function(obj){
    var self = this;
    var tr = obj.parentNode.parentNode;
    var id = tr.children[0].innerHTML;
    self.postObject(id);
  },

  postObjectsTable: function(){
    var self = this;
    var ids;
    var mainInstance;
    var tbody = document.getElementById("carInfo").tBodies[0];
    rentCar.deployed().then(function(instance){
      mainInstance = instance;
      return instance.getObjectIds.call();
    }).then(function(result){
      ids = result;

      for(let element of ids){
        let id = element.toNumber();
        self.addRowObjectTable(id,tbody);
      }
    });
  },

  toUtf8: function(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for(i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
            }
        }
        return out;
  },

  qrcode: function(){
    var content = "test\nhello";
    $('#qrcode').qrcode({
      width:200,
      height:200,
      render:"canvas",
      correctLevel:0,
      text:content
    });
  },

  rentObj: function(){
    var mainInstance;

    var objectID = parseInt(document.getElementById("objID").innerHTML);
    // console.log(objectID+1);
    rentCar.deployed().then(function(instance){
      mainInstance = instance;
      return mainInstance.rentObj(objectID,{from:account1,value:10000000000000, gas:500000});
    }).then(function(tx){
      console.log(tx);
    }).catch(function(e){
      console.log(e);
    });
  },

  returnObj:function(){
    var mainInstance;

    var objectID = parseInt(document.getElementById("objID").innerHTML);
    rentCar.deployed().then(function(instance){
      mainInstance = instance;
      return mainInstance.returnObj(objectID,{from:account1});
    }).then(function(tx){
      console.log(tx);
    }).catch(function(e){
      console.log(e);
    });
  },

  remove: function(){
    var self = this;

    var meta;
    rentCar.deployed().then(function(instance){
      meta = instance;
      return meta.remove({from:account});
      }).then(function(){
        self.setStatus("remove success!");
      }).catch(function(e){
        console.log(e);
        self.setStatus("Error remove;see log.");
      });
  }

}

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    // window.web3 = new Web3(new Web3.providers.HttpProvider("219.216.65.127:8545"));
  }
  // account = web3.eth.coinbase;
  App.start();
});
