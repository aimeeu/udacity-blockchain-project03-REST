<!---
.. ===============LICENSE_START=======================================================
.. Acumos CC-BY-4.0
.. ===================================================================================
.. Copyright (C) 2019 Aimee Ukasick. All rights reserved.
.. ===================================================================================
.. This documentation file is distributed by Aimee Ukasick
.. under the Creative Commons Attribution 4.0 International License (the "License");
.. you may not use this file except in compliance with the License.
.. You may obtain a copy of the License at
..
.. http://creativecommons.org/licenses/by/4.0
..
.. This file is distributed on an "AS IS" BASIS,
.. WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
.. See the License for the specific language governing permissions and
.. limitations under the License.
.. ===============LICENSE_END=========================================================
-->


# Udacity Blockchain Nanodegree - Project 3 - RESTful Web API with Node.js Framework

# Objectives

1. Create a RESTful API that uses [Project 2](https://github.com/aimeeu/udacity-blockchain-proj2-privateBlockchain) and implements the following endpoints:
 
    1. GET endpoint that retrieves a block by height
    2. POST endpoint to create a new block; block data is defined in JSON format in the body 

2. Use a Node.js framework; I chose [Express](http://expressjs.com)
3. Ensure proper error handling
4. Create a README file




# Installation

## Cloning and installing

```$ git clone https://github.com/aimeeu/udacity-blockchain-project03-REST.git```

```$ npm install```

## Starting the application

```$ node app.js```

```bash
aimee@aimee-lemur:~/Dev/git/github.com/aimeeu/udacity-blockchain-project03-REST$ ls
app.js              Block.js     LICENSE       package.json       README.md  utils.js
BlockController.js  LevelDAO.js  node_modules  package-lock.json  rubric
aimee@aimee-lemur:~/Dev/git/github.com/aimeeu/udacity-blockchain-project03-REST$ node app.js
Server Listening for port: 8000
generateGenesisBlock fulfilled:  true
```
The server runs on localhost:8000. 

On startup, a LevelDB database ('chaindata') is created and the Genesis block is stored there.

# Testing the two endpoints required for the project

Curl scripts are provided below so the code can be tested. [jq](https://stedolan.github.io/jq/) is used to format the response JSON.


## GET a block by height 
__Definition__: A GET endpoint that responds to a request using a URL path with a block height parameter or properly handles an error if the height parameter is out of bounds.

**Response**: The response for the endpoint provides a block object in JSON format.

**Endpoint**: ```http://<host>:8000/block/<height>```

```bash
$ curl -s -w "\n%{http_code}"  --url http://localhost:8000/block/0 \
    | {
      read body
      read code
      echo $code
       jq <<< "$body"
  }
```

| Return Code   | Returns       | Definition 
| ------------- | --------------| --------------------------------------|
| 200           | the block     | success; block is found               |
| 400           | error message | height cannot be parsed to an integer |  
| 500           | error message | code throws an error                  |  


### CURL example for success condition

```bash
aimee@aimee-lemur:~$ curl -s -w "\n%{http_code}"  --url http://localhost:8000/block/0 \
>   | {
>     read body
>     read code
>     echo $code
>      jq <<< "$body"
> }
200
{
  "body": "This is the Genesis Block",
  "height": 0,
  "timestamp": "1558745679",
  "previousBlockHash": 0,
  "hash": "9d992496614c6ad4819c32b97c22f84b445cf212dd9ba836a46355fe029b0651"
}


```

### CURL examples for error conditions

__Request contains a valid integer height that does not exist in the database (height out of bounds)__

Curl command:
```bash
$ curl -s -w "\n%{http_code}"  --url http://localhost:8000/block/45 \
    | {
      read body
      read code
      echo $code
       jq <<< "$body"
  }
```
Example:
```bash
aimee@aimee-lemur:~$ curl -s -w "\n%{http_code}"  --url http://localhost:8000/block/45 \
>     | {
>       read body
>       read code
>       echo $code
>        jq <<< "$body"
>   }
404
{
  "error": "Block not found"
}
```


__Request contains for height a value that does not parse to an integer__

Curl command:
```bash
$ curl -s -w "\n%{http_code}"  --url http://localhost:8000/block/bubba \
    | {
      read body
      read code
      echo $code
       jq <<< "$body"
  }
```
Example:
```bash
aimee@aimee-lemur:~$ curl -s -w "\n%{http_code}"  --url http://localhost:8000/block/bubba \
>     | {
>       read body
>       read code
>       echo $code
>        jq <<< "$body"
>   }
400
{
  "error": "Height must be an integer"
}
```


## POST data for a new block 
**Definition**: A POST endpoint that allows posting a new block with the data payload option to add data to the block body. Block body should support a string of text. 

**Response**: The response for the endpoint is a block object in JSON format.

Endpoint: ```http://<host>:8000/block```

Example block body in JSON format:
```json
{
      "body": "Testing block with test string data"
}

```
Curl command:
```bash
 curl -s -w "\n%{http_code}"  --url http://localhost:8000/block \
  --header 'content-type: application/json' \
  --data '{"body": "Testing block with test string data"}'  | {
    read body
    read code
    echo $code
    jq <<< "$body"
}
```

| Return Code   | Returns         | Definition 
| ------------- | ----------------| -------------------------|
| 201           | the new block   | success; block has been added  |
| 400           | error message   | message body is missing, 'data' element is missing, data element is empty    |  
| 500           | error message   | code throws an error     | 



### CURL example
```bash
aimee@aimee-lemur:~$  curl -s -w "\n%{http_code}"  --url http://localhost:8000/block \
>   --header 'content-type: application/json' \
>   --data '{"body": "Testing block with test string data"}'  | {
>     read body
>     read code
>     echo $code
>     jq <<< "$body"
> }
201
{
  "newBlock": {
    "body": "Testing block with test string data",
    "height": 1,
    "timestamp": "1558746381",
    "previousBlockHash": "9d992496614c6ad4819c32b97c22f84b445cf212dd9ba836a46355fe029b0651",
    "hash": "84a58ffa0cfec962f521f63d2c60efcd46d800da797df204f1b831517145264a"
  }
}
```



### Error conditions

__'body' element is missing from message body, i.e. incorrect element name__

This example uses "BLOCK-BODY" instead of "body" as specified in the rubric.

```bash
 curl -s -w "\n%{http_code}"  --url http://localhost:8000/block \
  --header 'content-type: application/json' \
  --data '{"BLOCK-BODY": "Testing block with test string data"}'  | {
    read body
    read code
    echo $code
    jq <<< "$body"
}
```

```bash
aimee@aimee-lemur:~$  curl -s -w "\n%{http_code}"  --url http://localhost:8000/block \
>   --header 'content-type: application/json' \
>   --data '{"BLOCK-BODY": "Testing block with test string data"}'  | {
>     read body
>     read code
>     echo $code
>     jq <<< "$body"
> }
400
{
  "error": "Unable to add new block; body element is missing or empty; see docs for correct format"
}
```

__'body' element contains an empty string__

```bash
 curl -s -w "\n%{http_code}"  --url http://localhost:8000/block \
  --header 'content-type: application/json' \
  --data '{"body": ""}'  | {
    read body
    read code
    echo $code
    jq <<< "$body"
}
```
```bash
aimee@aimee-lemur:~$  curl -s -w "\n%{http_code}"  --url http://localhost:8000/block \
>   --header 'content-type: application/json' \
>   --data '{"body": ""}'  | {
>     read body
>     read code
>     echo $code
>     jq <<< "$body"
> }
400
{
  "error": "Unable to add new block; body element is missing or empty; see docs for correct format"
}
```



# Testing additional endpoints not required by the project

## GET the blockchain
Get all the blocks in the chain

| Return Code   | Returns       | Definition 
| ------------- | --------------| --------------------------------------|
| 200           | the blockchain | success |
| 404           | error message | blockchain not found (should be impossible) |
| 500           | error message | code throws an error |  

```bash
curl -s -w "\n%{http_code}"  \
    --url http://localhost:8000/blockchain \
  | {
    read body
    read code
    echo $code
     jq <<< "$body"
}
```
```bash
aimee@aimee-lemur:~$ curl -s -w "\n%{http_code}"  --url http://localhost:8000/blockchain \
>   | {
>     read body
>     read code
>     echo $code
>      jq <<< "$body"
> }
200
{
  "blockchain": [
    [
      0,
      {
        "body": "This is the Genesis Block",
        "height": 0,
        "timestamp": "1558745679",
        "previousBlockHash": 0,
        "hash": "9d992496614c6ad4819c32b97c22f84b445cf212dd9ba836a46355fe029b0651"
      }
    ],
    [
      1,
      {
        "body": "Testing block with test string data",
        "height": 1,
        "timestamp": "1558746381",
        "previousBlockHash": "9d992496614c6ad4819c32b97c22f84b445cf212dd9ba836a46355fe029b0651",
        "hash": "84a58ffa0cfec962f521f63d2c60efcd46d800da797df204f1b831517145264a"
      }
    ]
  ]
}


```


## GET the height of the blockchain
Gets the height of the blockchain, which is the height of the block last added to the chain

| Return Code   | Returns       | Definition 
| ------------- | --------------| --------------------------------------|
| 200           | the blockchain | success |
| 404           | error message | blockchain not found (should be impossible) |
| 500           | error message | code throws an error |  

```bash
curl -s -w "\n%{http_code}"  \
    --url http://localhost:8000/blockchain/height \
  | {
    read body
    read code
    echo $code
     jq <<< "$body"
}
```
```bash
aimee@aimee-lemur:~$ curl -s -w "\n%{http_code}"  \
>     --url http://localhost:8000/blockchain/height \
>   | {
>     read body
>     read code
>     echo $code
>      jq <<< "$body"
> }
200
{
  "height": 1
}

```

## GET the total number of blocks in the blockchain
Gets the total number of blocks in the blockchain, which is (getBlockchainHeight + 1)

| Return Code   | Returns       | Definition 
| ------------- | --------------| --------------------------------------|
| 200           | the blockchain | success |
| 404           | error message | blockchain not found (should be impossible) |
| 500           | error message | code throws an error |  

```bash
curl -s -w "\n%{http_code}"  \
    --url http://localhost:8000/blockchain/totalblocks \
  | {
    read body
    read code
    echo $code
     jq <<< "$body"
}
```
```bash
aimee@aimee-lemur:~$ curl -s -w "\n%{http_code}"  \
>     --url http://localhost:8000/blockchain/totalblocks \
>   | {
>     read body
>     read code
>     echo $code
>      jq <<< "$body"
> }
200
{
  "totalNumBlocks": 2
}
```

## GET validate a specific block by its height
Gets whether the specified block is valid

| Return Code   | Returns       | Definition 
| ------------- | --------------| --------------------------------------|
| 200           | true or false | success |
| 400           | error message | height cannot be parsed to an integer | 
| 500           | error message | code throws an error |  

```bash
curl -s -w "\n%{http_code}"  \
    --url http://localhost:8000/block/valid/1 \
  | {
    read body
    read code
    echo $code
     jq <<< "$body"
}
```

```bash
aimee@aimee-lemur:~$ curl -s -w "\n%{http_code}"  \
>     --url http://localhost:8000/block/valid/1 \
>   | {
>     read body
>     read code
>     echo $code
>      jq <<< "$body"
> }
200
{
  "valid": true
}
```


## GET validate blockchain
Validates the blockchain and returns a log of validation errors. If errorLog array is empty, the chain is valid.

| Return Code   | Returns       | Definition 
| ------------- | --------------| --------------------------------------|
| 200           | errorLog | success  |
| 500           | error message | code throws an error |  

```bash
curl -s -w "\n%{http_code}"  \
    --url http://localhost:8000/blockchain/valid \
  | {
    read body
    read code
    echo $code
     jq <<< "$body"
}
```


```bash
aimee@aimee-lemur:~$ curl -s -w "\n%{http_code}"  \
>     --url http://localhost:8000/blockchain/valid \
>   | {
>     read body
>     read code
>     echo $code
>      jq <<< "$body"
> }
200
{
  "errorLog": []
}
```