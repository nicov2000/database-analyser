
# About the tool

The schema analyser allows you to scan an entire MongoDB collection or a JSON file recursively and obtain a single types structure of a document by merging all the structures, thus obtaining all the types posibilities for every attribute (check the examples below)

# How to use

1. Clone the project
2. npm install
3. Configure lib/settings.js depending on what is going to be analysed (either a JSON file or a database collection)
4. To analyse a database collection run: ```node ./analyseCollection.js```
5. To analyse a JSON file, move the file to the project root folder and run: ```node ./analyseFile.js <filename>.json```



## Problematic
MongoDB is very flexible when talking about a database structure. One can literally drop any document as desired without respecting previous structures and it will work just fine.

However, this is not so mantainable, and as a project grows, a normalization or even a migration to a relational database starts to be considered to make the project scalable. This is where prototypes/old documents structure can difficult the transition to a normalized structure or a relational database. We need to find all those weird docs or border cases that exist in the database and then generalize.

This is where this schema-analyser comes into play.

By analising the structure of all the documents of a collection, and merging them into a single types' structure, the design of a normalized structure can be done easily, just by looking carefully at the merged schema result, see what atributes exist, their types, their type variants and determine the new structure.

## But we have MongoDB Compass Schema analyser, why is this different? 

Well, as they say in their docs, the structure provided comes from a limited sample (1000) so it's only an approximation. This is not so useful with huge datasets (millions of documents) and its very probable that the structure will lack uncommon attributes, deriving into more debugging time when migrating/populating into a new database.

## Example 1

The structure merger works like this: ( ( ( schema1 + schema2 ) + schema3 ) + schemaN ) = finalSchema

So, lets consider a blockchain transaction:

```
{
  "_id": {
    "$oid": "642b23bc931770d3a1168879"
  },
  "hash": "0xb8a86130fdb9611b4cd7d341914b76ac0e869f352bf32cb3996847872c3fee7d",
  "nonce": 406672,
  "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
  "blockNumber": 5185685,
  "transactionIndex": 0,
  "from": "0x64dcc3bcbeae8ce586cabdef79104986beafcad6",
  "to": "0xbed51d83cc4676660e3fc3819dfad8238549b975",
  "gas": 200000,
  "gasPrice": "0x3e252e0",
  "value": "0x0",
  "input": "0x5a68669900000000000000000000000000000000000000000000000001e61db37c266a2700000000000000000000000000000000000000000000000000000000642b25bb000000000000000000000000504efcadfb020d6bbaec8a5c5bb21453719d0e00",
  "v": "0x60",
  "r": "0x1ef58106ced55e93ae19355ec1535876238a34db328271f86652f7f6415e55a7",
  "s": "0x50ee3d47e17c653e42b435ef5a9866c00de71fe2e1e6fcfb048888c7bc2c5899",
  "type": "0x0",
  "timestamp": 1680548739,
  "receipt": {
    "transactionHash": "0xb8a86130fdb9611b4cd7d341914b76ac0e869f352bf32cb3996847872c3fee7d",
    "transactionIndex": 0,
    "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
    "blockNumber": 5185685,
    "cumulativeGasUsed": 55981,
    "gasUsed": 55981,
    "contractAddress": null,
    "logs": [
      {
        "logIndex": 0,
        "blockNumber": 5185685,
        "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
        "transactionHash": "0xb8a86130fdb9611b4cd7d341914b76ac0e869f352bf32cb3996847872c3fee7d",
        "transactionIndex": 0,
        "address": "0xbed51d83cc4676660e3fc3819dfad8238549b975",
        "data": "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000645a68669900000000000000000000000000000000000000000000000001e61db37c266a2700000000000000000000000000000000000000000000000000000000642b25bb000000000000000000000000504efcadfb020d6bbaec8a5c5bb21453719d0e00",
        "topics": [
          "0x5a68669900000000000000000000000000000000000000000000000000000000",
          "0x00000000000000000000000064dcc3bcbeae8ce586cabdef79104986beafcad6",
          "0x00000000000000000000000000000000000000000000000001e61db37c266a27",
          "0x00000000000000000000000000000000000000000000000000000000642b25bb"
        ],
        "abi": {},
        "eventId": "04f209500000092d8aafa62e52154325",
        "timestamp": 1680548739,
        "txStatus": "0x1",
        "event": null,
        "_addresses": []
      },
      {
        "logIndex": 1,
        "blockNumber": 5185685,
        "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
        "transactionHash": "0xb8a86130fdb9611b4cd7d341914b76ac0e869f352bf32cb3996847872c3fee7d",
        "transactionIndex": 0,
        "address": "0x504efcadfb020d6bbaec8a5c5bb21453719d0e00",
        "data": "0x00000000000000000000000000000000000000000000000001e61db37c266a27",
        "topics": [
          "0x296ba4ca62c6c21c95e828080cb8aec7481b71390585605300a8a76f9e95b527"
        ],
        "abi": {},
        "eventId": "04f209500000192d8aafa62e52154325",
        "timestamp": 1680548739,
        "txStatus": "0x1",
        "event": null,
        "_addresses": []
      }
    ],
    "from": "0x64dcc3bcbeae8ce586cabdef79104986beafcad6",
    "to": "0xbed51d83cc4676660e3fc3819dfad8238549b975",
    "status": "0x1",
    "logsBloom": "0x00000000000000000000101000000000200000010080000000000000000000000000000000010000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000040000000000000000000000001000000000000000000000000000000000001000000000004000000001000000000000000000020000000000000000200000000000000000000000080000000000080000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000002000000000000000000400000000000000200000000000",
    "type": "0x0"
  },
  "txType": "contract call",
  "txId": "04f209500092d8aafa62e52154325"
}
```

After analysing its schema, you get something like this:

```
{
  _id: { '$oid': 'string' },
  hash: 'string',
  nonce: 'number',
  blockHash: 'string',
  blockNumber: 'number',
  transactionIndex: 'number',
  from: 'string',
  to: 'string',
  gas: 'number',
  gasPrice: 'string',
  value: 'string',
  input: 'string',
  v: 'string',
  r: 'string',
  s: 'string',
  type: 'string',
  timestamp: 'number',
  receipt: {
    transactionHash: 'string',
    transactionIndex: 'number',
    blockHash: 'string',
    blockNumber: 'number',
    cumulativeGasUsed: 'number',
    gasUsed: 'number',
    contractAddress: 'null',
    logs: [
      {
        logIndex: 'number',
        blockNumber: 'number',
        blockHash: 'string',
        transactionHash: 'string',
        transactionIndex: 'number',
        address: 'string',
        data: 'string',
        topics: [ 'string', 'string', 'string', 'string' ],
        abi: {},
        eventId: 'string',
        timestamp: 'number',
        txStatus: 'string',
        event: 'null',
        _addresses: []
      },
      {
        logIndex: 'number',
        blockNumber: 'number',
        blockHash: 'string',
        transactionHash: 'string',
        transactionIndex: 'number',
        address: 'string',
        data: 'string',
        topics: [ 'string' ],
        abi: {},
        eventId: 'string',
        timestamp: 'number',
        txStatus: 'string',
        event: 'null',
        _addresses: []
      }
    ],
    from: 'string',
    to: 'string',
    status: 'string',
    logsBloom: 'string',
    type: 'string'
  },
  txType: 'string',
  txId: 'string'
}
```

### Arrays
The merging processor fusionates structures recursively, and assumes that items of an array will likely share the same structure.
To prevent large arrays with small variations between items types, items in arrays are merged into a single structure. This makes the process memory efficient and way more readable.

But look at the "topics" attribute:
```
topics: ["string, "string", "string", "string"]
```
Shouldn't it be like this?
```
topics: [ "string" ]
```

The above example is only one structure, and it is not merging the structures into a single one. This is because there was no "topics" attribute before, so its directly added as is to the schema.

## Example 2

In this second example, we have 2 blockchain transactions:

```
{
  "_id": {
    "$oid": "642b23bc931770d3a1168879"
  },
  "hash": "0xb8a86130fdb9611b4cd7d341914b76ac0e869f352bf32cb3996847872c3fee7d",
  "nonce": 406672,
  "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
  "blockNumber": 5185685,
  "transactionIndex": 0,
  "from": "0x64dcc3bcbeae8ce586cabdef79104986beafcad6",
  "to": "0xbed51d83cc4676660e3fc3819dfad8238549b975",
  "gas": 200000,
  "gasPrice": "0x3e252e0",
  "value": "0x0",
  "input": "0x5a68669900000000000000000000000000000000000000000000000001e61db37c266a2700000000000000000000000000000000000000000000000000000000642b25bb000000000000000000000000504efcadfb020d6bbaec8a5c5bb21453719d0e00",
  "v": "0x60",
  "r": "0x1ef58106ced55e93ae19355ec1535876238a34db328271f86652f7f6415e55a7",
  "s": "0x50ee3d47e17c653e42b435ef5a9866c00de71fe2e1e6fcfb048888c7bc2c5899",
  "type": "0x0",
  "timestamp": 1680548739,
  "receipt": {
    "transactionHash": "0xb8a86130fdb9611b4cd7d341914b76ac0e869f352bf32cb3996847872c3fee7d",
    "transactionIndex": 0,
    "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
    "blockNumber": 5185685,
    "cumulativeGasUsed": 55981,
    "gasUsed": 55981,
    "contractAddress": null,
    "logs": [
      {
        "logIndex": 0,
        "blockNumber": 5185685,
        "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
        "transactionHash": "0xb8a86130fdb9611b4cd7d341914b76ac0e869f352bf32cb3996847872c3fee7d",
        "transactionIndex": 0,
        "address": "0xbed51d83cc4676660e3fc3819dfad8238549b975",
        "data": "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000645a68669900000000000000000000000000000000000000000000000001e61db37c266a2700000000000000000000000000000000000000000000000000000000642b25bb000000000000000000000000504efcadfb020d6bbaec8a5c5bb21453719d0e00",
        "topics": [
          "0x5a68669900000000000000000000000000000000000000000000000000000000",
          "0x00000000000000000000000064dcc3bcbeae8ce586cabdef79104986beafcad6",
          "0x00000000000000000000000000000000000000000000000001e61db37c266a27",
          "0x00000000000000000000000000000000000000000000000000000000642b25bb"
        ],
        "abi": {},
        "eventId": "04f209500000092d8aafa62e52154325",
        "timestamp": 1680548739,
        "txStatus": "0x1",
        "event": null,
        "_addresses": []
      },
      {
        "logIndex": 1,
        "blockNumber": 5185685,
        "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
        "transactionHash": "0xb8a86130fdb9611b4cd7d341914b76ac0e869f352bf32cb3996847872c3fee7d",
        "transactionIndex": 0,
        "address": "0x504efcadfb020d6bbaec8a5c5bb21453719d0e00",
        "data": "0x00000000000000000000000000000000000000000000000001e61db37c266a27",
        "topics": [
          "0x296ba4ca62c6c21c95e828080cb8aec7481b71390585605300a8a76f9e95b527"
        ],
        "abi": {},
        "eventId": "04f209500000192d8aafa62e52154325",
        "timestamp": 1680548739,
        "txStatus": "0x1",
        "event": null,
        "_addresses": []
      }
    ],
    "from": "0x64dcc3bcbeae8ce586cabdef79104986beafcad6",
    "to": "0xbed51d83cc4676660e3fc3819dfad8238549b975",
    "status": "0x1",
    "logsBloom": "0x00000000000000000000101000000000200000010080000000000000000000000000000000010000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000040000000000000000000000001000000000000000000000000000000000001000000000004000000001000000000000000000020000000000000000200000000000000000000000080000000000080000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000002000000000000000000400000000000000200000000000",
    "type": "0x0"
  },
  "txType": "contract call",
  "txId": "04f209500092d8aafa62e52154325"
},{
  "_id": {
    "$oid": "642b23bc931770d3a116887a"
  },
  "hash": "0xe0908a9965b5945e8bc16c534d0da3b9b7e408179eb8e7120e74209e893197f5",
  "nonce": 5185684,
  "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
  "blockNumber": 5185685,
  "transactionIndex": 1,
  "from": "0x0000000000000000000000000000000000000000",
  "to": "0x0000000000000000000000000000000001000008",
  "gas": 0,
  "gasPrice": "0x0",
  "value": "0x0",
  "input": "0x",
  "v": "0x0",
  "r": "0x0",
  "s": "0x0",
  "type": "0x0",
  "timestamp": 1680548739,
  "receipt": {
    "transactionHash": "0xe0908a9965b5945e8bc16c534d0da3b9b7e408179eb8e7120e74209e893197f5",
    "transactionIndex": 1,
    "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
    "blockNumber": 5185685,
    "cumulativeGasUsed": 55981,
    "gasUsed": 0,
    "contractAddress": null,
    "logs": [
      {
        "logIndex": 0,
        "blockNumber": 5185685,
        "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
        "transactionHash": "0xe0908a9965b5945e8bc16c534d0da3b9b7e408179eb8e7120e74209e893197f5",
        "transactionIndex": 1,
        "address": "0x0000000000000000000000000000000001000008",
        "data": "0xe8a0590061e155fb132dfce7a88e908d0fdd7048f5eebfad5feeb1760f835e480b8a8602511b735bdd",
        "topics": [
          "0x000000000000000000000000000000006d696e696e675f6665655f746f706963",
          "0x000000000000000000000000dcb12179ba4697350f66224c959bdd9c282818df"
        ],
        "event": "mining_fee_topic",
        "signature": "506114e72bdeedc28d1e8ef76209591bdb58c97abc9c054859ae002f1382372a",
        "abi": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "blockHash",
              "type": "string"
            },
            {
              "indexed": false,
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "mining_fee_topic",
          "type": "event"
        },
        "args": [
          "0xdcb12179ba4697350f66224c959bdd9c282818df",
          "0x590061e155fb132dfce7a88e908d0fdd7048f5eebfad5feeb1760f835e480b8a",
          "0x02511b735bdd"
        ],
        "_addresses": [
          "0xdcb12179ba4697350f66224c959bdd9c282818df"
        ],
        "eventId": "04f209500100092d8aafa62e52154325",
        "timestamp": 1680548739,
        "txStatus": "0x1"
      },
      {
        "logIndex": 1,
        "blockNumber": 5185685,
        "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
        "transactionHash": "0xe0908a9965b5945e8bc16c534d0da3b9b7e408179eb8e7120e74209e893197f5",
        "transactionIndex": 1,
        "address": "0x0000000000000000000000000000000001000008",
        "data": "0xe7a0590061e155fb132dfce7a88e908d0fdd7048f5eebfad5feeb1760f835e480b8a85eaded6a461",
        "topics": [
          "0x000000000000000000000000000000006d696e696e675f6665655f746f706963",
          "0x0000000000000000000000008afad2f417e5132ee983b74d28600c0dedcc3e07"
        ],
        "event": "mining_fee_topic",
        "signature": "506114e72bdeedc28d1e8ef76209591bdb58c97abc9c054859ae002f1382372a",
        "abi": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "blockHash",
              "type": "string"
            },
            {
              "indexed": false,
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "mining_fee_topic",
          "type": "event"
        },
        "args": [
          "0x8afad2f417e5132ee983b74d28600c0dedcc3e07",
          "0x590061e155fb132dfce7a88e908d0fdd7048f5eebfad5feeb1760f835e480b8a",
          "0xeaded6a461"
        ],
        "_addresses": [
          "0x8afad2f417e5132ee983b74d28600c0dedcc3e07"
        ],
        "eventId": "04f209500100192d8aafa62e52154325",
        "timestamp": 1680548739,
        "txStatus": "0x1"
      },
      {
        "logIndex": 2,
        "blockNumber": 5185685,
        "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
        "transactionHash": "0xe0908a9965b5945e8bc16c534d0da3b9b7e408179eb8e7120e74209e893197f5",
        "transactionIndex": 1,
        "address": "0x0000000000000000000000000000000001000008",
        "data": "0xe8a0590061e155fb132dfce7a88e908d0fdd7048f5eebfad5feeb1760f835e480b8a8603ec123bfeb9",
        "topics": [
          "0x000000000000000000000000000000006d696e696e675f6665655f746f706963",
          "0x00000000000000000000000012d3178a62ef1f520944534ed04504609f7307a1"
        ],
        "event": "mining_fee_topic",
        "signature": "506114e72bdeedc28d1e8ef76209591bdb58c97abc9c054859ae002f1382372a",
        "abi": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "blockHash",
              "type": "string"
            },
            {
              "indexed": false,
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "mining_fee_topic",
          "type": "event"
        },
        "args": [
          "0x12d3178a62ef1f520944534ed04504609f7307a1",
          "0x590061e155fb132dfce7a88e908d0fdd7048f5eebfad5feeb1760f835e480b8a",
          "0x03ec123bfeb9"
        ],
        "_addresses": [
          "0x12d3178a62ef1f520944534ed04504609f7307a1"
        ],
        "eventId": "04f209500100292d8aafa62e52154325",
        "timestamp": 1680548739,
        "txStatus": "0x1"
      },
      {
        "logIndex": 3,
        "blockNumber": 5185685,
        "blockHash": "0x4f119fd053ad07f8169b01d384d26e5829c1896f6045092d8aafa62e52154325",
        "transactionHash": "0xe0908a9965b5945e8bc16c534d0da3b9b7e408179eb8e7120e74209e893197f5",
        "transactionIndex": 1,
        "address": "0x0000000000000000000000000000000001000008",
        "data": "0xe8a0590061e155fb132dfce7a88e908d0fdd7048f5eebfad5feeb1760f835e480b8a860420eac5e3b5",
        "topics": [
          "0x000000000000000000000000000000006d696e696e675f6665655f746f706963",
          "0x00000000000000000000000012d3178a62ef1f520944534ed04504609f7307a1"
        ],
        "event": "mining_fee_topic",
        "signature": "506114e72bdeedc28d1e8ef76209591bdb58c97abc9c054859ae002f1382372a",
        "abi": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "blockHash",
              "type": "string"
            },
            {
              "indexed": false,
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "mining_fee_topic",
          "type": "event"
        },
        "args": [
          "0x12d3178a62ef1f520944534ed04504609f7307a1",
          "0x590061e155fb132dfce7a88e908d0fdd7048f5eebfad5feeb1760f835e480b8a",
          "0x0420eac5e3b5"
        ],
        "_addresses": [
          "0x12d3178a62ef1f520944534ed04504609f7307a1"
        ],
        "eventId": "04f209500100392d8aafa62e52154325",
        "timestamp": 1680548739,
        "txStatus": "0x1"
      }
    ],
    "from": "0x0000000000000000000000000000000000000000",
    "to": "0x0000000000000000000000000000000001000008",
    "status": "0x1",
    "logsBloom": "0x00000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100020000000000000000000000000000000001000000000000000000001000000000000000000000000000020000100000000200020100000000000000000000000000000000080000000020800000000000000000000000000",
    "type": "0x0"
  },
  "txType": "remasc",
  "txId": "04f209500192d8aafa62e52154325"
}

```

After analysing them (as part of a JSON array or a database collection), we get this:

```
{
  _id: { '$oid': 'string' },
  hash: 'string',
  nonce: 'number',
  blockHash: 'string',
  blockNumber: 'number',
  transactionIndex: 'number',
  from: 'string',
  to: 'string',
  gas: 'number',
  gasPrice: 'string',
  value: 'string',
  input: 'string',
  v: 'string',
  r: 'string',
  s: 'string',
  type: 'string',
  timestamp: 'number',
  receipt: {
    transactionHash: 'string',
    transactionIndex: 'number',
    blockHash: 'string',
    blockNumber: 'number',
    cumulativeGasUsed: 'number',
    gasUsed: 'number',
    contractAddress: 'null',
    logs: [
      {
        logIndex: 'number',
        blockNumber: 'number',
        blockHash: 'string',
        transactionHash: 'string',
        transactionIndex: 'number',
        address: 'string',
        data: 'string',
        topics: [ 'string' ],
        abi: {
          anonymous: 'boolean',
          inputs: [
            { indexed: 'boolean', name: 'string', type: 'string' },
            { indexed: 'boolean', name: 'string', type: 'string' },
            { indexed: 'boolean', name: 'string', type: 'string' }
          ],
          name: 'string',
          type: 'string'
        },
        eventId: 'string',
        timestamp: 'number',
        txStatus: 'string',
        event: {
          note: 'This is a diffs object with several variants for the attribute',
          variants: { '0': 'null', '1': 'string' }
        },
        _addresses: [ 'string' ],
        signature: 'string',
        args: [ 'string', 'string', 'string' ]
      }
    ],
    from: 'string',
    to: 'string',
    status: 'string',
    logsBloom: 'string',
    type: 'string'
  },
  txType: 'string',
  txId: 'string'
}
```

Now we do have ```{ topics: [ "string" ] }```

So, removing extra items knowing they share a general structure (but keeping variants by merging their structures) outputs a cleaner result and performs more efficiently.


### Objects

In the 2nd example, another similar case happened with "abi". 

In the 1st example with 1 transaction, "abi" was just an empty object. But in the 2nd example, the 2nd transaction had keys.

In the case of objects, new keys are **added** and differed keys are **merged** into a diffs object that will contain/add the new variants until the process finishes (When merging, if future structures do not contain a key that exists in our schema, it is ignored, as it is already in the schema)

So, since "abi" had no keys before, the merger just added them, generating the same array situation for its key "inputs", which is 
```
inputs: [
  { indexed: 'boolean', name: 'string', type: 'string' },
  { indexed: 'boolean', name: 'string', type: 'string' },
  { indexed: 'boolean', name: 'string', type: 'string' }
]
```

When merging the next structure, if a "inputs" key appears in an "abi" object, those items inside the "inputs" array will be merged into a single one. [THIS IS NOT WORKING: CHECK]