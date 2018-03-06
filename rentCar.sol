pragma solidity ^0.4.18;

contract rentCar {

  struct  Renter {
  address  addr;
  //uint DOB;
  uint currentRenting;
  }

struct  Car {
    address VechileOwner;
    string make;
    string model;
    Renter renter;

    bool available;
    uint pricePerDay;
    uint deposit;
    uint entrycode;
    uint minRentalDay;
    uint maxRentalDay;
}

bool public rented;
address public renter;
  address public owner;
uint public duration;
uint public rentalPrice;
uint public charge;
 uint public rentalDate   ;
 uint public returnDate  ;
 uint public rentalStartDate  ;
 uint public rentalEndDate  ;
 //uint public constant totalDays = 7 ;
 
struct NameKey{ // storage the name's keys
		uint[] keys;
}

//List of Cars available
uint[] private ids;  //Use it to return the ids of Objects
uint public numofCars;
mapping(uint => Car) private cars;
mapping(string => NameKey) private nameToKeys;

//Events
event E_addCar(uint objID, address VechileOwner);
event E_Rent(address indexed _renter, uint _rentalPrice);
event E_ReturnRental(address indexed _renter, uint _returnDate);

//Modifiers
modifier onlyOwner() {
    require(msg.sender == owner);
    _;
}

modifier onlyRenter() {
    require(msg.sender == renter);
    _;
}


	modifier objectInRange(uint objID) {
        if (objID <= numofCars)
        _;
    }

modifier whenNotRented() {
    require(!rented);
    _;
}

modifier whenRented() {
    require(rented);
    _;
}


//Funcions

function rentCar() public{
  owner = msg.sender;
}



function addCar(string make, string model, uint pricePerDay, uint minRentalDay, uint maxRentalDay, bool available, uint deposit) public onlyOwner{
    

    Car storage newCar = cars[numofCars];
    ///nameToKeys[name].keys.push(numofCars); //add the key to the name's keys

  newCar.VechileOwner = msg.sender;
  newCar.make = make;
  newCar.model = model;
  newCar.available = available;
  newCar.pricePerDay = pricePerDay;
  newCar.minRentalDay = minRentalDay;
  newCar.maxRentalDay = maxRentalDay;
  newCar.deposit = deposit;

  //NewCar(numofCars,msg.sender);
  ids.push(numofCars);
  numofCars++;

  }

function deleteCar(uint objID) public onlyOwner{

          delete cars[objID].VechileOwner;
          delete cars[objID].make;
          delete cars[objID].model;
          delete cars[objID].available;
          delete cars[objID].pricePerDay;
          delete cars[objID].minRentalDay;
          delete cars[objID].maxRentalDay;
          delete cars[objID].deposit;
          delete cars[objID].VechileOwner;


  //NewCar(numofCars,msg.sender);
  //ids.pop(numofCars);
  numofCars--;
  }


  function setAvailable(uint objID, bool _available) public onlyOwner returns(bool) {
    cars[objID].available = _available;
    rented = cars[objID].available;
    return rented;
}
function isAvailable(uint objID) objectInRange(objID) public view returns (bool){
		return cars[objID].available;
	}

 /* function totalDays (uint rentalStartDate, uint rentalEndDate) public whenNotRented{
    uint totalDays = ;
    return totalDays;
  }*/
 /* function checkAvailability() public view returns (bool) {
        return(Cars.available);
    }
  */

  function Rent(uint objID) objectInRange(objID) public payable  whenNotRented returns(bool){
   uint totalDays = 7 ;
	require (isAvailable(objID));
	require	(msg.sender != cars[objID].VechileOwner);
    require (msg.value < cars[objID].deposit);
    require(totalDays >= cars[objID].minRentalDay && totalDays <= cars[objID].maxRentalDay);


    cars[objID].renter = Renter({addr:msg.sender, currentRenting:now});
    renter = msg.sender;
    
    uint PayDeposit = msg.value - cars[objID].deposit;
    rentalPrice = totalDays *  cars[objID].pricePerDay;
 
    
    require(!cars[objID].renter.addr.send(PayDeposit));
/*	if(!cars[objID].renter.addr.send(PayDeposit)){   // return the rest balance
			throw;
		}*/
		
    cars[objID].available = false;
    rented = true;

    //renter.call(accessCar());
    
    E_Rent(msg.sender, rentalPrice);

    return true;
  }

  function endRent (uint objID) objectInRange(objID) public payable whenRented {
   uint rentDuration = (now - cars[objID].renter.currentRenting) / (24*60*60*1.0);
   duration= rentDuration;
    charge = duration * cars[objID].pricePerDay - cars[objID].deposit;
    uint totalPayment = msg.value - charge;

    require(!cars[objID].VechileOwner.send(totalPayment));
	require(!cars[objID].renter.addr.send(totalPayment));
	
		delete cars[objID].renter;
		cars[objID].available = false;

    E_ReturnRental(msg.sender, now);

    resetRental(objID);
}
function forceRentalEnd(uint objID) public onlyOwner{
    require(now > returnDate && rented);

    E_ReturnRental(msg.sender, now);

    resetRental(objID);
}
  function resetRental(uint objID) private{
      rented = false;
      delete cars[objID].renter;
      rentalDate = 0;
      returnDate = 0;
  }

 
  function rentalDaysRemaining() public view whenRented returns (uint){
      return (returnDate - now);
  }

  function findNames(string name) public constant returns(uint[]){
		return nameToKeys[name].keys;
	}

	function getNumCarss() public constant returns(uint){
		return numofCars;
	}


	function getVechileOwner(uint objID) public constant  returns(address){
		return cars[objID].VechileOwner;
	}

function getMake(uint objID) public constant  returns(string){
		return cars[objID].make;
	}
	
	
	function getModel(uint objID) public constant  returns(string){
		return cars[objID].model;
	}
function getMin(uint objID) public constant  returns(uint){
		return cars[objID].minRentalDay;
	}
	
	function getMax(uint objID) public constant  returns(uint){
		return cars[objID].maxRentalDay;
	}

	function getcarPricePerDay(uint objID) public constant  returns(uint){
		return cars[objID].pricePerDay;
	}

	function getcarDeposit(uint objID) public constant returns(uint){
		return cars[objID].deposit;
	}

	function getcarRenterAddress(uint objID) public constant returns(address){
		return cars[objID].renter.addr;
	}

	function getcarRenterCurrentRenting(uint objID) public constant returns(uint){
		return cars[objID].renter.currentRenting;
	}
//end contract
}

contract  Car is rentCar {
  /*    address public VechileOwner;
  string public make;
  string public model;
  Renter public renter;
  
  bool public available;
  uint public pricePerDay;
  uint public deposit;
  uint public entrycode;
  uint public minRentalDay;
  uint public maxRentalDay;
  

  
   function checkAvailability() public view returns (bool) {
        return(cars[objID].available);
    }
  
  function setCar(string _make, string _model, uint _pricePerDay, uint _minRentalDay, uint _maxRentalDay, bool _available) public onlyOwner{
    make = _make;
    model = _model;
    pricePerDay = _pricePerDay;
    minRentalDay = _minRentalDay;
    maxRentalDay = _maxRentalDay;
    available = _available;
  }  
 */ 
  function accessCar() public view  onlyRenter returns(uint){
      uint accessNumber;
      accessNumber = uint(block.blockhash(block.number-1))%100000 + 1;
      return accessNumber;
  }
}
