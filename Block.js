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

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data) {
		this.data = data;
	}

	getData() {
		return this.data;
	}

	getHeight() {
		return this.height;
	}

	setHeight(height) {
		this.height = height;
	}

	getTimestamp() {
		return this.timestamp;
	}

	setTimestamp(timestamp) {
		this.timestamp = timestamp;
	}

	getPreviousBlockHash() {
		return this.previousBlockHash;
	}

	setPreviousBlockHash(previousBlockHash) {
		this.previousBlockHash = previousBlockHash;
	}

	getHash() {
		return this.hash;
	}

	setHash(hash) {
		this.hash = hash;
	}
}

module.exports.Block = Block;