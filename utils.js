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
const SHA256 = require('crypto-js/sha256');

const getDateAsUTCString = () => {
    return new Date().getTime().toString().slice(0,-3);
};

const generateHashFor = (newBlock) => {
    return SHA256(JSON.stringify(newBlock)).toString();
};

//https://alligator.io/js/array-sort-numbers/
const sortNumericalArrayItemsAscending = (a, b) => {
    if (a > b) {
        return 1;
    } else if (b > a) {
        return -1;
    } else {
        return 0;
    }
};

const sortNumericalArrayItemsDescending = (a, b) => {
    if (a > b) {
        return -1;;
    } else if (b > a) {
        return 1;
    } else {
        return 0;
    }
};

module.exports = {
    getDateAsUTCString,
    generateHashFor,
    sortNumericalArrayItemsAscending,
    sortNumericalArrayItemsDescending
};