# Blockchain Go Demo

## About Blockchain Go
- The underlying network for this application is the [Hyperledger Fabric](https://github.com/hyperledger/fabric/tree/master/docs), a Linux Foundation project.  You may want to review these instructions to understand a bit about the Hyperledger Fabric.
- **This demo purpose is to basically aid to any people to comprehend about how a blockchain network can be addressed into an existing business process model.**
- **This demo uses Hyperledger Fabric v0.6 (Not supported anymore in bluemix).**
- demo: https://blockchain-go.mybluemix.net/

# Application Background

We have three companies whose handles the same package (asset) through their supply chains and, all of those agreed to comply with terms and rules
to handle that asset.

The challenge is on ensuring the integrity of these package through all the supply chain process, since it's hard to tell accuaratelly who's the responsible party real time, but we have a solution!

![](/docs/intro.png)

First we create a new package for transport and eventual transfers:

![](/docs/creatingAsset.png)

So we have a "smart contract" adhered by all the participants companies (Industry, Shipping Company and the Customer):

![](/docs/smartcontract.png)

With simulated temperature sensors in our virtual package (We could - and did -  demos with real devices), we're publishing payloads to the subscriber application (You're watching the demo through it ;):

![](/docs/payloads.png)

This application perform requests to the  service that holds communication with our blockchain network:

![](/docs/dashboard.png) ![](/docs/events.png)

As our "Chain Participants" share the visibility about those information, our application notifies all of the participants about the events from the blockchain network:

![](/docs/contractviolated.png)

We have available an immutable history about the transactions from the blockchain ledger:

![](/docs/history.png)


Powered by IBM Blockchain

Author: Vitor Diego
- IBM Garage São Paulo


