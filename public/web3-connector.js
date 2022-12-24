window.addEventListener('load', function() {

  // Modern dapp browsers...
  if (window.ethereum) {
      web3 = new Web3(ethereum);

      try { 
        // Request account access if needed
        ethereum.enable().then(result => {
          // Now you can start your app & access web3 freely:
          startApp()
        })
      }
      catch(err) {
        console.log(err);
      }
  }
  // Legacy dapp browsers, checking if Web3 has been injected by the browser (Mist/MetaMask)
  else if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);

    // Now you can start your app & access web3 freely:
    startApp();

  } else {
    console.log('No web3? You should consider trying MetaMask!')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    web3 = new Web3( new Web3.providers.HttpProvider( "https://kovan.infura.io/v3/YOUR_INFURA_KEY" ));
    //web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545/" ));
    // web3 = new Web3( new Web3.providers.HttpProvider( "https://rpc.tch.in.th" ));
    
    // Now you can start your app & access web3 freely:
    startApp();
  }
})


// Get current network
function startApp() {
    web3.eth.net.getId().then(netId => {
    // web3.version.getNetwork((err, netId) => {
      console.log('netId: ' + netId)
      switch (netId) {
        case 1:
            network = 'Mainnet';
            networkDisplay = network;
            warning = 'please switch your network to Kovan or Thai Chain';
            explorerUrl = "https://" + network.toLowerCase() + ".etherscan.io/tx/"
            break
        case 2:
            network = 'Deprecated Morden';
            networkDisplay = network;
            warning = 'please switch your network to Kovan or Thai Chain';
            explorerUrl = "https://" + network.toLowerCase() + ".etherscan.io/tx/"
            break
        case 3:
            network = 'Ropsten';
            networkDisplay = network;
            warning = 'please switch your network to Kovan or Thai Chain';
            explorerUrl = "https://" + network.toLowerCase() + ".etherscan.io/tx/"
            break
        case 4:
            network = 'Rinkeby';
            networkDisplay = network;
            contractAddress = '0x6075b70b4f94af25e047fac6a538ea06a5206bca';
            explorerUrl = "https://" + network.toLowerCase() + ".etherscan.io/tx/"
            break
        case 5:
            network = 'Goerli';
            networkDisplay = network;
            contractAddress = '0xD97a3DC0BBe1beAC47EA7F415800146dd1f436b9';
            explorerUrl = "https://" + network.toLowerCase() + ".etherscan.io/tx/"
            break
        case 7:
            network = 'Thai Chain';
            networkDisplay = network;
            contractAddress = '0x0898424ddf8f9478aad9f2280a6480f1858ad1c6';
            explorerUrl = "https://exp.tch.in.th/tx/"
            break
        case 42:
            network = 'Kovan';
            networkDisplay = network;
            explorerUrl = "https://" + network.toLowerCase() + ".etherscan.io/tx/"
            break
        case 420:
            network = 'Goerli-Optimism';
            networkDisplay = 'Goerli Optimism';
            contractAddress = '0x02302b985d82a3f8dd9ba9d0bcea620bbcbeec63';
            explorerUrl = "https://" + network.toLowerCase() + ".etherscan.io/tx/"
            break
        case 1337:
            network = 'Kovan - Optimism';
            networkDisplay = '<strong>Kovan Optimism</strong><br/>(Level 2 Ethereum)';
            contractAddress = '0xE6dCD042c4dDaC0f390A7B1CB8B4D60DD20b6338';
            explorerUrl = "https://kovan-l2-explorer.surge.sh/tx/";
            break
        case 5777:
            network = 'Ganache';
            networkDisplay = network;
            break
        default:
            network = 'Unknown';
            networkDisplay = network;
            warning = 'please switch your network to Kovan or Thai Chain';
      }
      $("#eth_network").html(networkDisplay);
      $("#warning").text(warning);
      $("#luckyDrawContractAddress").text(contractAddress);
      
      
      web3.eth.getAccounts().then(accounts => {
        userAccount = accounts[0];
        $("#eth_address").text(userAccount);
        
        reloadInfo();
      })
      
    })
}

function reloadInfo() {
    // Wallet
    try { 
        getBalance();
        getCurrentRound();
        getAllAccount();
        getAdminAccount();
    }
    catch(err) {
        console.log(err);
    }

    displayCandidates();
    
}

// Get block info
function getBlock() {
    web3.eth.getBlock(48, function(error, result){
        if(!error) {
            console.log(JSON.stringify(result));
            $("#balance").html(JSON.stringify(result));
        } else {
            console.error(error);
        }
    })
}

// Get account balance
function getBalance() {
  web3.eth.getBalance(userAccount).then(result => {
      $("#balance").html(web3.utils.fromWei(result));
  }); // getbalance account
}

// Get katin token contract
function getRegisterContract() {
    let contract = new web3.eth.Contract(abi, contractAddress)
    
    return contract;
}

// Get number of account
function getAccountCount( callback ) {
    let contract = getRegisterContract();
    contract.methods.accountCount().call().then( result => { 
        console.log('getAccountCount: ' + result) ;
        accountCount = result;
        callback(result);
    } );
}

function getCurrentRound() {
  let contract = getRegisterContract();
  contract.methods.currentRound().call().then( result => { 
      console.log('currentRound: ' + result) ;
      currentRound = result;
  } );
}

function getAllAccount() {
  let contract = getRegisterContract();
  contract.methods.allAccount().call().then( result => { 
      console.log('allAccount: ' + result) ;
      allAccount = result;
  } );
}

function getAdminAccount() {
  let contract = getRegisterContract();
  contract.methods.owner().call().then( result => { 
      console.log('adminAccount: ' + result) ;
      adminAccount = result;
      if(userAccount == adminAccount) {
        $("#send-reward-btn").show();
        $("#reset-game-btn").show();
      }
  } );
}


function getAccountName(index, callback) {
  let contract = getRegisterContract();
  contract.methods.accounts(currentRound, index).call().then( name => { 
    contract.methods.mappingAcctName(currentRound, name).call().then( ok => { 
        console.log(ok);
        callback(ok);
    });
});
}

// Get Account Balances
function getAccountBalances(index, callback) {
    let contract = getRegisterContract();
    contract.methods.accounts(currentRound, index).call().then( name => { 
        contract.methods.balances(currentRound, name).call().then( ok => { 
            console.log(ok);
            callback(ok);
        });
    });
    
}

function getAccount(index, callback) {
  let contract = getRegisterContract();
  contract.methods.accounts(currentRound, index).call().then( name => { 
      console.log(name);
      callback(name);
  });
  
}

// Load account detail
function displayAccountDetail(index) {
    // Account No
    $("#acct_" + index + "_no").text(index+1);

    // Key
    getAccount(index, function(key) {
      $("#acct_" + index + "_key").text(key);
    });

    // Name
    getAccountName(index, function(name) {
        $("#acct_" + index + "_name").text(name);
    });
    
    // Total balances
    getAccountBalances(index, function(total) {
        $("#acct_" + index + "_balances").text(total);
    });

}

function cloneAccountDetail(index) {
    let a = $("#acct_copy").clone();
    $(a).find(".acct_no").attr("id", "acct_" + index + "_no");
    $(a).find(".acct_key").attr("id", "acct_" + index + "_key");
    $(a).find(".acct_name").attr("id", "acct_" + index + "_name");
    $(a).find(".acct_balances").attr("id", "acct_" + index + "_balances");
    $(a).find(".acct_remove_button").attr("onClick", "javascript:removeAccount(" + index + ");");
    $(a).appendTo("#more_acct");
}

// Show account information
function displayCandidates() {
    getAccountCount( function (count) {
        for (var i = 0; i < count; i++) {
            cloneAccountDetail(i);
            displayAccountDetail(i);
        }
    });
}

function reloadRegisterAppContract() {
  $("#more_acct").html('')
  $("#register-btn").val('')
  $("#myModal").hide()
  reloadInfo()
}

async function register() {
  let newRegister = $("#register-btn").val()
  if(newRegister.trim().length > 42 ){
    console.log("Can't enter more than 42 characters.")
    window.alert("Can't enter more than 42 characters.")
    return;
  }

  if(!newRegister){
    console.log("Please input name.")
    window.alert("Please input name.")
    return;
  }

  if(allAccount.includes(userAccount)){
    console.log("An account cannot register twice.")
    window.alert("An account cannot register twice.")
    return;
  }

  if (!web3.utils.isAddress(contractAddress)) {
    console.error(newRegister + ' is not a valid address!')
    return;
  }

  let contract = getRegisterContract();
  let options = {
    from: userAccount,
    value: 50000000000000000
    //value: 10000000000000000
  }
    // Send a transaction to blockchain
  let result = await contract.methods.register(newRegister).send(options)
  reloadRegisterAppContract()
}

async function adminTransfer() {
  if(accountCount == 0){
    window.alert("Must have 6 players.")
    console.log("Must have 6 players.")
    return;
  }
  if(result_index == 0){
    console.log("The game hasn't started yet.");
    window.alert("The game hasn't started yet.")
    return;
  }
  console.log("index: "+(result_index-1)+", result: "+result_index)
  let contract = getRegisterContract();
  let options = {
    from: userAccount
  }
    // Send a transaction to blockchain
  let result = await contract.methods.adminTransfer(result_index-1).send(options)
  reloadRegisterAppContract()
}

async function adminReset() {
  if(accountCount == 0){
    console.log("No player");
    window.alert("No player");
    return;
  }
  let contract = getRegisterContract();
  let options = {
    from: userAccount
  }
    // Send a transaction to blockchain
  let result = await contract.methods.adminReset().send(options)
  reloadRegisterAppContract()
}

async function removeAccount(index) {
  let contract = getRegisterContract();
  let options = {
    from: userAccount
  }
  // Send a transaction to blockchain
  let result = await contract.methods.removeAccount(index).send(options)
  reloadRegisterAppContract()
}

function openAppContractOnEtherScan() {
  let address = $("#luckyDrawContractAddress").html()
  let url = 'https://' + network + '.etherscan.io/address/' + address
  window.open(url,'_blank');
}

function openUserAddressOnEtherScan() {
  let url = 'https://' + network + '.etherscan.io/address/' + userAccount
  window.open(url,'_blank');
}
