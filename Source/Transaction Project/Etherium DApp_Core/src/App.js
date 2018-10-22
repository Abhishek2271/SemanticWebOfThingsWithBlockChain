/*
  Date: 12 July 2018
  Purppose: Set and get the IPFS hash stored in the block chain. 
            The app js instantiates the Enterium contract.
            The contract then writes the file hash to block chain

  Most of this is boiler plate code. But optimized and changed according to project requirements

  Full code along with documentations hosted in git. Please follow:
    https://gitlab.tu-berlin.de/mandir123/SemanticWebAndIOT
*/
import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'
import ipfs from './Ipfs'
var os = require("os");

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
import { read } from 'fs';
import { EOL } from 'os';

//Create buffer to read the input file
let directory = "DataFiles"
let dirBuffer = Buffer.from(directory);
//save current date (if necessary)
var currentDate
//Message to sender (unused)
var Message 

class App extends Component {
  constructor(props) {
    super(props)
    //Need to bind the events to the current states, without binding it seems that react wont reconise the events
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.FetchData = this.FetchData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    //Set states of the variables
    this.state = {
      storageValue: 0,
      ipfsHash: '',   // the ipfs hash of the UPLOADED file    
      ipfs_log_hash:  "QmRCjBNZi1AU9FsTmV4oKRSAKT9t3Bo7HXx5nRS2McUg11",//'QmTRG7kJQYDqFUMWoLWVCQHJUbKShQX5FCWVB1X9AzcDQJ',  //hash of the file holding all the files currently saved
      account:  '',   // current user account (address only)
      web3: null,
      Year: '',       
      Day: '',
      Month: '',    
      FileNameFromUser: '', //Input filename which the user want to get or transact with.
      SelectedFileName: ''  //File which user wants to upload to block chain.
    }    
  }

  
  // This will fire somewhere around the time of render. 
  //Need to see more on this since there is still some problems during page refresh.
  componentWillMount() {

    // Get network provider and web3 instance.

    getWeb3
    .then(results => {
      this.setState({
        //Set current state. Itis like static variable initialization but for a particular web instance.
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT INITIATION
     *
     * Normally these functions would be called in the context of a
     * state management library, but this is for convinience only.
     */

    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    // Get accounts. 
    /* TODO:
        The get function is not working. But is not important for now.
    */    
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        this.simpleStorageInstance = instance
        this.setState( { account: accounts[0]} )        
      }).then((ipfsHash) => {
        // Get the value from the contract to prove it worked.
        document.getElementById("AccountName").innerHTML = "Current account address is: " + accounts[0]
        return simpleStorageInstance.get.call(accounts[0])
      }).then((ipfsHash) => {
        // Update state with the result.
        return this.setState({ ipfsHash })
      })
    })

    
  }

  handleFileSelect = (e) => {
    e.preventDefault();
    this.fileSelector.click();
  }
  
/*
  Get the hashvalue from block chain along with other return types.
  Also, update the HTML labels for user information.
*/
FetchData(event)
{
  var currentaccount = this.state.account;
  event.preventDefault();

  //Call the payable function
  //this.simpleStorageInstance.buy(this.state.FileNameFromUser, {from: currentaccount, gas: 3000000, value: 100}, function(err, res){});
  
  
  var returnval = this.simpleStorageInstance.get_value(this.state.FileNameFromUser).then(function(h, o, s) {
    //along with reading the value, try getting the value as well to make sure the contract was committed. This can be 
    //removed later once the test functions are in place 
    

    /*TODO: 
        The function is not returning separate values like it should. H in this case is somehow index.
        While this is not important, the arguments were intended to return separate values
        Need to see why this happens
    */


    console.log("Getting results...")
    console.log("Hash: ", h[0])      
    console.log("Owner: ", h[1])
    console.log("Buyer: ", currentaccount)
   
    //console.log("Sender: ", this.state.account)    
    //return this.setState({ ipfsHash: r[0].hash })

    document.getElementById("TransactionComplete").innerHTML = "Transaction completed successfully. Your file hash is: " + h[0]
    document.getElementById("TransactionDetails").innerHTML = "Transaction Details: "   
    document.getElementById("TransactionDetailOwner").innerHTML = "Owner: " +  h[1]
    document.getElementById("TransactionDetailBuyer").innerHTML = "Bought by: " + currentaccount
  
  });
  //console.log("Your hash is: ", this.state.ipfsHash)  
}

/*Submit file to:
    1. Store in buffer
    2. Upload the file buffered to IPFS
    3. UPload the IPFS hash to blockchain
    4. Log file as uploaded and upload the logfile again to IPFS for displaying in the uI.
*/
 onSubmit(event)
 {  
    event.preventDefault();
    // we have to save the current state because of the wierd interaction between the state variable and lambda function. 
    // Lambda function does not detect the current state.
    let currentComponent = this;
    console.log("File Submitted...")
    /*
    var datetime = new Date();
    
    currentDate = datetime.getFullYear();
    currentDate += '-';
    currentDate += datetime.getMonth();
    currentDate += '-';
    currentDate += datetime.getDate();
    console.log(currentDate);
    */

    // Message = "Setting for " + currentDate + " uploaded to ipfs successfully";
    //Add file to ipfs
    ipfs.files.add(this.state.buffer, (error, result) => {
     if (error)
     {
       console.error(error)
       return
     }
     console.log("Setting hash from result")
    
     console.log("Generated ipfs hash ", result[0].hash) 
     //Log the data stored in block chain for future ref.
     //REMOVED: due to complexity in syncronisation.
     /*
     var fs = require('browserify-fs');
    
       fs.writeFile('D:\Saved_Records.txt', this.state.SelectedFileName + "_" + result[0].hash, function() {
           fs.readFile('D:\Saved_Records.txt', 'utf8', function(err, data) {
               console.log(data);
           });
       });

      */
     //Set the ipfsHash State variable,
     //Update state variable again.
     this.setState({ ipfsHash: result[0].hash })    
     //Write to the solidity contract
     //The user details here might not be necessary but could be useful for the  later envisoned changes
     //this.simpleStorageInstance.set_value(result[0].hash, this.state.SelectedFileName, { from: this.state.account }).then((r) => {
       //along with reading the value, try getting the value as well to make sure the contract was committed. This can be 
       //removed later once the test functions are in place       
     
      
       //return this.setState({ ipfsHash: result[0].hash })    
       
     
   // })   

   //Write the filename along with the file hash to block chain.
   this.simpleStorageInstance.set_value(result[0].hash, this.state.SelectedFileName, { from: this.state.account }).then((r) => {
     console.log("Data moved to block chain")
     document.getElementById("UploadComplete").innerHTML = "Upload complete. Data committed to blockchain."
    });

    //Just a check if the state is still usable. 
    console.log("Created ipfs file hash is ", this.state.ipfsHash)    
   })

  /*
      Create a file which logs all the file names uploaded to block chain (NOT hash, actual filenames)
      Read the file and upload to IFPS (This is necessary so that every user has the same view of the data)
      Read and load to UI so that user know which files are available.

      TODO: Make this contol dynamic. Add/ remove file when transaction occurs.
            It takes time to upload to IFPS so may be we need somekind of indicator in the UI and also block all controls in UI
  */

  var fs = require('browserify-fs');
   //console.log(currentDate);
   fs.appendFile('D:\Log.txt', "\n" + this.state.SelectedFileName, function() {
    fs.readFile('D:\Log.txt', 'utf8', function(err, data) {
        console.log(data);
        var myBuffer = Buffer.from(data);
        //this.setState({buffer: Buffer.from(data)});
        ipfs.files.add(myBuffer, (error, result) => {
        if (error)
        {
          console.error(error)
          return
        }

        
        console.log("Writting log file to ipfs")
     
        console.log("Generated ipfs hash for log file is", result[0].hash) 
        
        currentComponent.setState({ ipfs_log_hash: result[0].hash }) 
     })
    });
 


    /*var fs = require('browserify-fs');

    fs.readFile('D:\dates.txt', 'utf8', function(err, data) {    
        var currentData = data


    var myBuffer = Buffer.from(currentData)
    ipfs.files.add(myBuffer, (error, result) => {
      if (error)
      {
        console.error(error)
        return
      }
      console.log("Writting log file to ipfs")
     
      console.log("Generated ipfs hash for log file is", result[0].hash) 
       
      return this.setState({ ipfs_log_hash: result[0].hash })    
        
      
     })    
    });
  */
  });
 }

 /*
    > Calls when the user selects file to upload to blockchain
    > Also, convert the selected file to blob data. The ipfs api which uploads the file to IFPS does not accept the 
      native files so have to save file to buffer and then upload to IFPS
    > The drawback of this is that we cannot use huge files for upload, So for larger files it is better to upload from the 
    console.
*/
 onChange(event)
 {
   console.log("Read the file...")
   //Added an event to prevent the default dehavior where the the form directs to a new page.
   event.preventDefault();
  //read the bin data for compatibility with the IPFS file format.
   const file = event.target.files[0];
   console.log("Selected file is: ", event.target.value); 
   var filename = event.target.value.split('\\').pop().split('/').pop();
   console.log("Selected file is: ", filename);
   this.setState({ SelectedFileName: filename })
   const reader = new window.FileReader()
   reader.readAsArrayBuffer(file)
   reader.onloadend = () => {
     this.setState({ buffer: Buffer(reader.result)})
     console.log("File read to bin...")
     console.log("The blob data is: ", this.state.buffer)
   }   
 }
 
 //Calls when user types the filename he wants to transact with.
 handleChange(event)
 {
   console.log("Got the date value...")
   event.preventDefault();
   this.setState({FileNameFromUser: event.target.value});
 }

 //When user clicks refresh fetch the logged filesnames from the file again and display it. 
 //This is not useful now and is not accurate since the view can be different for different users. 
 //Left for future implementation.
onRefreshClick(event)
{  
  event.preventDefault();
  let currentComponent = this;
  console.log("Refresh clicked...")
  var fs = require('browserify-fs');
   //console.log(currentDate);
   
    fs.readFile('D:\Log.txt', 'utf8', function(err, data) {
        console.log(data);

        var myBuffer = Buffer.from(data);
        ipfs.files.add(myBuffer, (error, result) => {
        if (error)
        {
          console.error(error)
          return
        }
        console.log( result[0].hash);
       
        console.log("Writting log file to ipfs")
     
        console.log("Generated ipfs hash for log file is", result[0].hash) 
        
        currentComponent.setState({ ipfs_log_hash: result[0].hash }) 
        console.log("aa", result[0].hash)
    });
 


    /*var fs = require('browserify-fs');

    fs.readFile('D:\dates.txt', 'utf8', function(err, data) {    
        var currentData = data


    var myBuffer = Buffer.from(currentData)
    ipfs.files.add(myBuffer, (error, result) => {
      if (error)
      {
        console.error(error)
        return
      }
      console.log("Writting log file to ipfs")
     
      console.log("Generated ipfs hash for log file is", result[0].hash) 
       
      return this.setState({ ipfs_log_hash: result[0].hash })    
        
      
     })    
    });
  */
  });
}

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">File transaction implementation with block chain</a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
            <p id="AccountName"></p>
              <p>&nbsp;</p>
              <div id="list">   
              <p>Your currently available data are:</p>     
               <button  className="btn btn-default"  onClick={this.onRefreshClick}>Refresh view</button>     
               <p><iframe src={`https://ipfs.io/ipfs/${this.state.ipfs_log_hash}`} frameborder="0" height="150"
                   width="50%"></iframe></p>
              </div>              
              <h2>Upload new file</h2>
              <form onSubmit={this.onSubmit} >
                <input type='file' onChange={this.onChange} />
                <input type='submit' />
                <p id= "UploadComplete"> </p> 
              </form>   
              

            </div>
          </div>
        </main>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h2>Preform new transaction</h2>   
                <form onSubmit={this.FetchData} >
                  <div class="block">
                    <label>Enter filename: </label>
                    <input  type="text"  value={this.state.value} onChange={this.handleChange}/>  
                    <input type='submit'/>  
                    <p id="TransactionComplete"></p>   
                    <p id= "TransactionDetails"> </p>  
                    <p id= "TransactionDetailOwner"></p> 
                    <p id= "TransactionDetailBuyer" ></p>                    
                  </div>  
                </form>
              </div>
            </div>
        </main>

      </div>
    );
  }
}

export default App
