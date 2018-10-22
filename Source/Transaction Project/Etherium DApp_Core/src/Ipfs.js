//Requires setting up ipfs first, do 
//  npm install ipfs-api
//  If not already installed.
const IPFS = require('ipfs-api');
//Assign it to a host.
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

export default ipfs;