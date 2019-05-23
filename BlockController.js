/*
  ===============LICENSE_START=======================================================
  Apache-2.0
  ===================================================================================
  Copyright (C) 2019 Aimee Ukasick. All rights reserved.
  ===================================================================================
  This software file is distributed by Aimee Ukasick
  under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  This file is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  ===============LICENSE_END=========================================================
*/

const Block = require('./Block.js');
const utils = require('./utils.js');
const LevelDAO = require('./LevelDAO.js');


/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app
     */
    constructor(app) {
        this.app = app;
        this.dao = new LevelDAO.LevelDAO();
        this.createGenesisBlock();

        //define API calls
        this.apiGetBlockByHeight();
        this.apiGetBlockchain();
        this.apiPostNewBlock();
        this.apiGetBlockchainHeight();
        this.apiGetTotalNumberBlockInChain();
        this.apiValidateBlock();
        this.apiValidateChain();
    }


    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    apiPostNewBlock() {
        this.app.post("/block", (req, res) => {
            let data = undefined;

            try {
                data = req.body.body;
                if (data === undefined || data.length === 0) {
                    console.log('apiPostNewBlock body is empty');
                    res.status(400).json({error: 'Unable to add new block; body is empty'});
                }
            }catch (e) {
                let msg = 'Unable to add block: ' + err.message;
                console.log(msg, err);
                res.status(500).json({error: msg});
            }

            console.log('adding new block');
            let newBlock = new Block.Block(data);
            this.addBlock(newBlock).then((result) => {
                res.status(201).json({message: 'Block added!'});
            }).catch((err) => {
                let msg = 'Unable to add block: ' + err.message;
                console.log(msg, err);
                res.status(500).json({error: msg});
            });
        });
    }


    /**
     * Implement a GET Endpoint to retrieve a block by height, url: "/api/block/:height"
     */
    apiGetBlockByHeight() {
        this.app.get("/block/:height", (req, res) => {
            let height = undefined;

            try {
                height = Number.parseInt(req.params.height);
            } catch (e) {
                res.status(400).json({error: 'Height must be an integer'});
                return;
            }

            this.getBlock(height).then((foundBlock) => {
                if (foundBlock === undefined) {
                    res.status(404).json({error: 'Block not found'});
                } else {
                    res.status(200).json(foundBlock);
                }
            }).catch((err) => {
                let msg = 'Unable to getBlockByHeight: ' + req.params.height + '; error: ' + err.message;
                console.log(msg);
                res.status(500).json({error: msg});
            });

        });
    }

    /*
  this returns all the entries in the chain
   */
    apiGetBlockchain() {
        this.app.get("/blockchain", (req, res) => {
            this.getAllBlocks().then((chainMap) => {
                //resolves an empty Map if nothing found
                if (chainMap.size === 0) {
                    res.status(404).json({error: 'Blockchain not found! Danger, Will Robinson!!!'});
                } else {
                    res.status(200).json(chainMap.entries());
                }
            }).catch((err) => {
                let msg = 'Unable to fetch blockchain: ' + err.message;
                console.log(msg);
                res.status(500).json({error: msg});
            });
        });
    }

    /*
    this returns the height of the last block in the chain
     */
    apiGetBlockchainHeight() {
        this.app.get("/blockchain/height", (req, res) => {
            this.getBlockHeight().then((height) => {
                res.status(200).json(height);
            }).catch((err) => {
                let msg = 'Unable to fetch blockchain: ' + err.message;
                console.log(msg);
                res.status(500).json({error: msg});
            });
        });
    }

    /*
    this returns the total number of blocks in the chain (which should be blockheight + 1)
    */
    apiGetTotalNumberBlockInChain() {
        this.app.get("/blockchain/totalblocks", (req, res) => {
            this.getTotalNumBlocksInChain().then((total) => {
                res.status(200).json(total);
            }).catch((err) => {
                let msg = 'Unable to fetch total number of blocks in chain: ' + err.message;
                console.log(msg);
                res.status(500).json({error: msg});
            });
        });
    }

    apiValidateBlock(height) {
        this.app.get("/block/valid/:height", (req, res) => {
            let height = undefined;

            try {
                height = Number.parseInt(req.params.height);
            } catch (e) {
                res.status(400).json({error: 'Height must be an integer'});
                return;
            }

            this.validateBlock(height).then((valid) => {
                res.status(200).json(valid);
            }).catch((err) => {
                let msg = 'Unable to block with height: ' + height + '; error: ' + err.message;
                console.log(msg);
                res.status(500).json({error: msg});
            });
        });
    }

    apiValidateChain() {
        this.app.get("/blockchain/valid", (req, res) => {
            this.validateChain().then((valid) => {
                res.status(200).json(valid);
            }).catch((err) => {
                let msg = 'Unable to validate blockchain: ' + err.message;
                console.log(msg);
                res.status(500).json({error: msg});
            });
        });
    }


    /*  DATA ACCESS METHODS   */

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    createGenesisBlock() {
        // Add your code here
        //console.log('***** generateGenesisBlock *****');
        let self = this;
        //console.log('***** generateGenesisBlock calling self.getBlockHeight *****');
        self.getBlockHeight().then((result) => {
            //console.log('***** generateGenesisBlock logging result from self.getBlockHeight: ', result);
            if (result === 0) {
                //console.log('***** generateGenesisBlock creating new block');
                // height = 0, timestamp = '', data = [], previousBlockHash = '', hash = ''
                let b = new Block.Block('This is the Genesis Block');
                b.setHeight(0);
                b.setTimestamp(utils.getDateAsUTCString());
                b.setPreviousBlockHash(0);
                b.setHash(utils.generateHashFor(b));
                //console.log('***** generateGenesisBlock calling self.dao.addBlock ');
                self.dao.addBlock(b).then((result) => {
                    console.log("generateGenesisBlock fulfilled: ", result);
                }).catch((err) => {
                    console.log("generateGenesisBlock rejected self.dao.addBlock error: ", err);
                });
            } else {
                console.log('***** generateGenesisBlock NO GENESIS BLOCK CREATED - BLOCKS EXIST');
            }
        }).catch((err) => {
            console.log("generateGenesisBlock generateGenesisBlock error: ", err);
        });
    }

    // Get block height, it is a helper method that return the height of the blockchain
    // result is the last height in your chain
    // the genesisBlock has a height of zero, so the last block in the chain should have a height of (totalChainLength - 1)
    // MUST RETURN A PROMISE FOR simpleChain02ValidateBlocks.js
    getBlockHeight() {
        // console.log('***** getBlockHeight *****');
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            //first get block
            //console.log('***** getBlockHeight calling levelSandbox.getBlockHeight *****');
            self.dao.getBlockHeight().then((blockHeight) => {
                //console.log('getBlockHeight logging result: ', result);
                resolve(blockHeight);
            }).catch((err) => {
                console.log(" getBlockHeight error: ", err);
                reject(err);
            });
        });
    }

    getTotalNumBlocksInChain() {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.dao.getNumBlocksInChain().then((totalNumBlocks) => {
                resolve(totalNumBlocks);
            }).catch((err) => {
                console.log(" getBlockHeight error: ", err);
                reject(err);
            });
        });
    }


    // Add new block - block passed in only has data set
    // Adds a new block into the chain, to do that you need to assign the corresponding height, hash,
    // previousBlockHash and timeStamp to your block.
    // must return a Promise
    addBlock(newBlock) {
        let self = this;
        console.log('***** blockchain.addBlock(block): ', newBlock);
        // Add your code here
        // fetch previous block to get hash

        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            // console.log('***** blockchain.addBlock(block) calling self.getBlockHeight ***** ');
            self.getBlockHeight().then((blockHeight) => {
                //console.log('blockchain.addBlock(block) self.getBlockHeight blockHeight: ', blockHeight);

                // get the block by blockHeight in order to set previousBlockHash
                self.getBlock(blockHeight).then((returnedBlock) => {
                    // console.log("blockchain.addBlock(block) result from self.getBlock  returnedBlock: ", returnedBlock);
                    if (returnedBlock === undefined) {
                        console.log("!!!!! ERROR blockchain.addBlock(block) result from self.getBlock(" + blockHeight + ") is UNDEFINED");
                        reject("!!!!!  ERROR blockchain.addBlock(block) result from self.getBlock(" + blockHeight + ") is UNDEFINED");
                    }

                    // console.log("blockchain.addBlock(block) setting values in newBlock");
                    let height = (blockHeight + 1);
                    //console.log("blockchain.addBlock(block) newBlock height: ", height);
                    newBlock.setHeight(height);
                    newBlock.setTimestamp(utils.getDateAsUTCString());
                    newBlock.setPreviousBlockHash(returnedBlock.hash);
                    newBlock.setHash(utils.generateHashFor(newBlock));

                    // db.addBlock returns a Promise
                    //console.log("blockchain.addBlock(block) calling self.dao.addBlock(newBlock): ", newBlock);
                    self.dao.addBlock(newBlock).then((result) => {
                        //console.log("blockchain.addBlock(block) self.dao.addBlock result: ", result);
                        resolve(result);
                    }).catch((err) => {
                        console.log("blockchain.addBlock(block) self.dao.addBlock error: ", err);
                        reject(err);
                    });
                }).catch((err) => {
                    console.log(err);
                    reject(err);
                });
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    // Get Block By Height
    // Gets a block and returns it as JSON string object
    // must return a Promise
    getBlock(height) {
        // Add your code here
        //console.log('***** blockchain.getBlock(height) ***** ');
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            //levelSandbox.getBlock returns a Promise
            // console.log('***** blockchain.getBlock(height) calling self.dao.getBlock(height) ***** ');
            self.dao.getBlock(height).then((foundBlock) => {
                // console.log('blockchain.getBlock(height) self.dao.getBlock(height) success: ', result);
                // resolves undefined for NOT FOUND error
                resolve(foundBlock);
            }).catch((err) => {
                console.log('blockchain.getBlock(height) Failed to retrieve block by height: ', height);
                reject(err);
            });
        });
    }

    getAllBlocks() {
        let self = this;
        return new Promise(function (resolve, reject) {
            // resolves an empty Map if no chain (if the map is empty, there's a bigger problem)
            self.dao.getAllBlocks().then((chainMap) => {
                // resolves an empty Map if nothing found... which means there's a bigger problem b/c there should be a genesis block
                resolve(chainMap);
            }).catch((err) => {
                console.log('Failed to retrieve blocks: ', err);
                reject(err);
            });
        });
    }

    // Validate if Block is being tampered by Block Height
    //  Validates block data integrity
    // must return a Promise
    // Rubric: The validation should verify that the hash stored in the block is the same as the hash recalculated.
    validateBlock(height) {
        // Add your code here
        //console.log('***** blockchain.validateBlock(height) ***** ');
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            //first get block
            self.getBlock(height).then((returnedBlock) => {
                if (returnedBlock === undefined) {
                    console.log("!!!!! ERROR blockchain.addBlock(block) result from self.getBlock(" + blockHeight + ") is UNDEFINED");
                    reject("!!!!!  ERROR blockchain.addBlock(block) result from self.getBlock(" + blockHeight + ") is UNDEFINED");
                }

                if (self.checkForValidBlockHash(returnedBlock)) {
                    resolve(true);
                } else {
                    reject('!!!!! Blockchain.validateBlock Block ' + height + ' is not a valid block!');
                }
            }).catch((err) => {
                console.log("blockchain.getBlock(height) Failed to retrieve block by height: ", height);
                reject(err);
            });
        });
    }


    checkForValidBlockHash(returnedBlock) {
        // NOTE: block hash is generated when block.hash is undefined; must recreate same Block attributes or generated
        // hash will be different (ie, block with undefined hash vs block with a hash value set)
        //console.log(" blockchain.checkForValidBlockHash ");
        let returnedBlockHash = returnedBlock.hash;
        returnedBlock.hash = undefined;
        let generatedHash = utils.generateHashFor(returnedBlock);
        //console.log('returnedBlock.hash: ', returnedBlockHash);
        //console.log('generatedHash: ', generatedHash);
        let result = (generatedHash === returnedBlockHash);
        //set the hash back in the block
        returnedBlock.hash = returnedBlockHash;
        return result;
    }

    // Validate Blockchain
    // Validates blockchain is still valid at any moment
    // must return a Promise
    // Rubric: you should retrieve the data and validate each block, also you need to validate that
    // the hash of the block is equal to the next block previousBlockHash
    validateChain() {
        // Add your code here
        let self = this;
        //console.log('***** BlockChain.validateChain *****');

        // The Map object holds key-value pairs and remembers the original insertion order of the keys.

        return new Promise(function (resolve, reject) {
            let errorLog = [];
            self.getBlockHeight().then((blockHeight) => {
                if (blockHeight === 0) {
                    //only one block in chain, so only validate the single block; do not check previous hash
                    self.validateBlock(0).then((result) => {
                        resolve(errorLog);
                    }).catch((err) => {
                        console.log("blockchain.validateChain height=0; failed to validate block err: ", err);
                        errorLog.push(err);
                        reject(err);
                    });
                } else {

                    self.dao.getAllBlocks().then((chainMap) => {
                        if (chainMap.size === 0) {
                            let msg = "blockchain.validateChain retrieve all blocks returned an empty map!";
                            //console.log(msg);
                            errorLog.push(msg);
                            reject(errorLog);
                        } else {
                            let keys = Array.from(chainMap.keys());
                            keys.sort(utils.sortNumericalArrayItemsAscending);
                            // 11 blocks in array; blockHeight is 10;
                            for (let i = 0; i < keys.length; i++) {
                                let key = keys[i];
                                let currentBlock = chainMap.get(key);
                                let isValidBlock = self.checkForValidBlockHash(currentBlock);
                                if (isValidBlock) {
                                    // compare currentBlockHash with nextBlock's previousBlockHash
                                    // make sure this is not the end of the chain
                                    if (key !== blockHeight) {
                                        let nextKey = (key + 1);
                                        let nextBlock = chainMap.get(nextKey);
                                        if (currentBlock.hash === nextBlock.previousBlockHash) {
                                            resolve(errorLog);
                                        } else {
                                            let msg = 'Block ' + key + ' failed currentBlock.hash === nextBlock.previousBlockHash';
                                            //console.log(msg, currentBlock.hash, nextBlock.previousBlockHash);
                                            reject(errorLog);
                                        }
                                    } else {
                                        resolve(true);
                                    }
                                } else {
                                    let msg = 'Block ' + key + ' failed validateBlock';
                                    //console.log(msg);
                                    errorLog.push(msg);
                                    reject(errorLog);
                                }
                            }
                        }
                    }).catch((err) => {
                        console.log("blockchain.validateChain error: ", err);
                        reject(err);
                    });
                }
            }).catch((err) => {
                console.log("blockchain.validateChain Failed to retrieve blockHeight ", err);
                reject(err);
            });
        });
    }


}

/**
 * Exporting the BlockController class
 * @param {*} app
 */
module.exports = (app) => {
    return new BlockController(app);
};