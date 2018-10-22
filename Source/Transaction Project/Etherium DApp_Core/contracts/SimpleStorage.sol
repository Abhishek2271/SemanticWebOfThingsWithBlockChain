pragma solidity ^0.4.24;
// The carrot in the version signifies "Min." so for this instance, minimum version requirement is 0.4.24.
// Refrain from chainging to old version since that was giving problems while calling the value via the get function

/*
    Date: 8 June 2018
    Purpose: The contract is meant to include the following logic:
                User 1 has IOT data which he wants to sell
                User 2 wants the data
                User 1 gets currency and transfers data to User 2
                The data in this case being the IPFS hash through which the files can be accessed
                Each IPFS hash can be a collective data (Temp, presssure, humidity)  or seperate
                Data is generated only once a day so unique IPFS hash everyday
*/

contract SimpleStorage {
    
  //A struct to record the details when user creates a hash input to blockchain
  struct FileDetail 
  {
      string ipfsHash; address Owner;
  }
  
  //Currently set hash value
  string public ipfs_Hash;
  
  //Map filename with Hash. The string key here is the filename which will be provided by user
  //Note:Mapping should not be public
  mapping (string => FileDetail)  mappedHash;
    
  //Min. ether required to perform transaction. This is global static since we dont impose variable or quantity right now
  //Only single file transaction is allowed for now so no need to complicate this
  uint256 MinEther = 10;
  FileDetail public fileDetail;
  
  //Write to chain
  function set_value(string _ipfsHash, string filename) public {
    ipfs_Hash = _ipfsHash;
    mappedHash[filename] = FileDetail(ipfs_Hash, msg.sender);
  }


  //check if the file exists and also check the fulfillment of ether requirement
  modifier hasEnoughEther (string filename) {
        //does not seem to work
        //require (mappedHash[filename].isValue);
        require (msg.value == MinEther); 
        _;
    }
  //Seems solitidy requires a paybable function for ether exchange 
  function buy (string filename) payable public hasEnoughEther (filename) {
      //minimum ether is 1 but the buyer can send any amount of ether.
      //TODO: have this notification in the UI as well. Ether is higher unit than gas so use gas since metamask used gas by default
      //1000 Gas ~ 0.27 ether
        mappedHash[filename].Owner.transfer(msg.value);
    }
    
  //Get the desired hash based on the filename provided
  function get_value(string filename) public view returns (string, address, address) {
   
    return (mappedHash[filename].ipfsHash, 
            mappedHash[filename].Owner, 
            msg.sender);
  }
   
  /* NOT IN USE NOW. Set get function for testing out the contract.*/

  function set(string x){
    ipfs_Hash = x;
  }

  function get(string x) public view returns (string) {    
    return x;
  }

}
