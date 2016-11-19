/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

package main

import (
        "encoding/json"
        "errors"
        "fmt"
        "strconv"
        "strings"
        "time"

        "github.com/hyperledger/fabric/core/chaincode/shim"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

var assetIndexStr = "_assetindex" //Description for the key/value that will store a list of all known Assets
var openTradesStr = "_opentrades" //Description for the key/value that will store all open trades

type Asset struct {
        Description     string `json:"description"` //the fieldtags are needed to keep case from bouncing around
        LastTransaction string `json:"lastTransaction"`
        Temperature     int    `json:"temperature"`
        Status          bool   `json:"status"`
        ID              int    `json:"id"`
        User            string `json:"user"`
}

type Description struct {
        LastTransaction string `json:"lastTransaction"`
        ID              int    `json:"id"`
}

type AnOpenTrade struct {
        User      string        `json:"user"`      //user who created the open trade order
        Timestamp int64         `json:"timestamp"` //utc timestamp of creation
        Want      Description   `json:"want"`      //description of desired Asset
        Willing   []Description `json:"willing"`   //array of Assets willing to trade away
}

type AllTrades struct {
        OpenTrades []AnOpenTrade `json:"open_trades"`
}

// ===========================================================================================================                                                                                                 =================
// Main
// ===========================================================================================================                                                                                                 =================
func main() {
        err := shim.Start(new(SimpleChaincode))
        if err != nil {
                fmt.Printf("Error starting Simple chaincode: %s", err)
        }
}

// ===========================================================================================================                                                                                                 =================
// Init - reset all the things
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
        var Aval int
        var err error

        if len(args) != 1 {
                return nil, errors.New("Incorrect number of arguments. Expecting 1")
        }

        // Initialize the chaincode
        Aval, err = strconv.Atoi(args[0])
        if err != nil {
                return nil, errors.New("Expecting integer value for asset holding")
        }

        // Write the state to the ledger
        err = stub.PutState("abc", []byte(strconv.Itoa(Aval))) //making a test var "abc", I find it handy to read/write to it right away to test the network
        if err != nil {
                return nil, err
        }

        var empty []string
        jsonAsBytes, _ := json.Marshal(empty) //marshal an emtpy array of strings to clear the index
        err = stub.PutState(assetIndexStr, jsonAsBytes)
        if err != nil {
                return nil, err
        }

        var trades AllTrades
        jsonAsBytes, _ = json.Marshal(trades) //clear the open trade struct
        err = stub.PutState(openTradesStr, jsonAsBytes)
        if err != nil {
                return nil, err
        }

        return nil, nil
}

// ===========================================================================================================                                                                                                 =================
// Run - Our entry point for Invocations - [LEGACY] obc-peer 4/25/2016
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) Run(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
        fmt.Println("run is running " + function)
        return t.Invoke(stub, function, args)
}

// ===========================================================================================================                                                                                                 =================
// Invoke - Our entry point for Invocations
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
        fmt.Println("invoke is running " + function)

        // Handle different functions
        if function == "init" { //initialize the chaincode state, used as reset
                return t.Init(stub, "init", args)
        } else if function == "delete" { //deletes an entity from its state
                res, err := t.Delete(stub, args)
                cleanTrades(stub) //lets make sure all open trades are still valid
                return res, err
        } else if function == "write" { //writes a value to the chaincode state
                return t.Write(stub, args)
        } else if function == "init_asset" { //create a new Asset
                return t.init_Asset(stub, args)
        } else if function == "set_user" { //change owner of a Asset
                res, err := t.set_user(stub, args)
                cleanTrades(stub) //lets make sure all open trades are still valid
                return res, err
        } else if function == "open_trade" { //create a new trade order
                return t.open_trade(stub, args)
        } else if function == "perform_trade" { //forfill an open trade order
                res, err := t.perform_trade(stub, args)
                cleanTrades(stub) //lets clean just in case
                return res, err
        } else if function == "remove_trade" { //cancel an open trade order
                return t.remove_trade(stub, args)
        }
        fmt.Println("invoke did not find func: " + function) //error

        return nil, errors.New("Received unknown function invocation")
}

// ===========================================================================================================                                                                                                 =================
// Query - Our entry point for Queries
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
        fmt.Println("query is running " + function)

        // Handle different functions
        if function == "read" { //read a variable
                return t.read(stub, args)
        }
        fmt.Println("query did not find func: " + function) //error

        return nil, errors.New("Received unknown function query")
}

// ===========================================================================================================                                                                                                 =================
// Read - read a variable from chaincode state
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) read(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
        var Description, jsonResp string
        var err error

        if len(args) != 1 {
                return nil, errors.New("Incorrect number of arguments. Expecting Description of the var to query")
        }

        Description = args[0]
        fmt.Print("Description " + Description)
        valAsbytes, err := stub.GetState(Description) //get the var from chaincode state
        if err != nil {
                jsonResp = "{\"Error\":\"Failed to get state for " + Description + "\"}"
                return nil, errors.New(jsonResp)
        }

        var infoIndex []string
        json.Unmarshal(valAsbytes, &infoIndex)

        for i, val := range infoIndex {
                fmt.Println("got: " + infoIndex[i] + " " + val)
        }

        return valAsbytes, nil //send it onward
}

// ===========================================================================================================                                                                                                 =================
// Delete - remove a key/value pair from state
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) Delete(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
        if len(args) != 1 {
                return nil, errors.New("Incorrect number of arguments. Expecting 1")
        }

        Description := args[0]
        err := stub.DelState(Description) //remove the key from chaincode state
        if err != nil {
                return nil, errors.New("Failed to delete state")
        }

        //get the Asset index
        AssetsAsBytes, err := stub.GetState(assetIndexStr)
        if err != nil {
                return nil, errors.New("Failed to get Asset index")
        }
        var AssetIndex []string
        json.Unmarshal(AssetsAsBytes, &AssetIndex) //un stringify it aka JSON.parse()

        //remove Asset from index
        for i, val := range AssetIndex {
                fmt.Println(strconv.Itoa(i) + " - looking at " + val + " for " + Description)
                if val == Description { //find the correct Asset
                        fmt.Println("found Asset")
                        AssetIndex = append(AssetIndex[:i], AssetIndex[i+1:]...) //remove it
                        for x := range AssetIndex {                              //debug prints...
                                fmt.Println(string(x) + " - " + AssetIndex[x])
                        }
                        break
                }
        }
        jsonAsBytes, _ := json.Marshal(AssetIndex) //save new index
        err = stub.PutState(assetIndexStr, jsonAsBytes)
        return nil, nil
}

// ===========================================================================================================                                                                                                 =================
// Write - write variable into chaincode state
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) Write(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
        var description, value string // Entities
        var err error
        fmt.Println("running write()")

        if len(args) != 2 {
                return nil, errors.New("Incorrect number of arguments. Expecting 2. Description of the variable and value to set")
        }

        description = args[0] //reDescription for funsies
        value = args[1]
        err = stub.PutState(description, []byte(value)) //write the variable into the chaincode state
        if err != nil {
                return nil, err
        }
        return nil, nil
}

// ===========================================================================================================                                                                                                 =================
// Init Asset - create a new Asset, store into chaincode state
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) init_Asset(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
        var err error

        //   0       1       2     3
        // "asdf", "blue", "35", "bob"
        if len(args) != 5 {
                fmt.Println("- Incorrect number of arguments. Expecting 5")
                return nil, errors.New("Incorrect number of arguments. Expecting 5")
        }

        //input sanitation
        fmt.Println("- start init Asset")
        if len(args[0]) <= 0 {
                return nil, errors.New("1st argument must be a non-empty string")
        }
        if len(args[1]) <= 0 {
                return nil, errors.New("2nd argument must be a non-empty string")
        }
        if len(args[2]) <= 0 {
                return nil, errors.New("3rd argument must be a non-empty string")
        }
        if len(args[3]) <= 0 {
                return nil, errors.New("4th argument must be a non-empty string")
        }
        if len(args[4]) <= 0 {
                return nil, errors.New("5th argument must be a non-empty string")
        }

        //fmt.Print("Assigning first values...")
        description := args[0]
        lastTransaction := strings.ToLower(args[1])
        user := strings.ToLower(args[2])
        temperature := strings.ToLower(args[3])
        id := strings.ToLower(args[4])
        status := strings.ToLower("false")

        //check if Asset already exists
        AssetAsBytes, err := stub.GetState(description)
        if err != nil {
                fmt.Println("Failed to get Asset Description")
                return nil, errors.New("Failed to get Asset Description")
        }
        res := Asset{}
        json.Unmarshal(AssetAsBytes, &res)
        if res.Description == description {
                fmt.Println("This Asset arleady exists: " + description)
                fmt.Println(res)
                return nil, errors.New("This Asset already exists") //all stop a Asset by this Description exists
        }

        //build the Asset json string manually
        str := `{"description": "` + description + `", "lastTransaction": "` + lastTransaction + `", "temperature": "` + temperature + `", "status": "` + status + `", "id": "` + id + `", "user": "` + user + `"}`
        err = stub.PutState(description, []byte(str)) //store Asset with id as key
        if err != nil {
                fmt.Println("error [init_asset] str.PutState! ")
                return nil, err
        }

        //get the Asset index
        AssetsAsBytes, err := stub.GetState(assetIndexStr)
        if err != nil {
                return nil, errors.New("Failed to get Asset index")
        }
        var AssetIndex []string
        json.Unmarshal(AssetsAsBytes, &AssetIndex) //un stringify it aka JSON.parse()

        //append
        AssetIndex = append(AssetIndex, description) //add Asset Description to index list
        fmt.Println("! Asset index: ", AssetIndex)
        jsonAsBytes, _ := json.Marshal(AssetIndex)
        err = stub.PutState(assetIndexStr, jsonAsBytes) //store Description of Asset

        fmt.Println("- end init Asset")
        return nil, nil
}

// ===========================================================================================================                                                                                                 =================
// Set User Permission on Asset
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) set_user(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
        var err error

        //   0       1
        // "Description", "bob"
        if len(args) < 3 {
                return nil, errors.New("Incorrect number of arguments. Expecting 2")
        }

        fmt.Println("- start set user")
        fmt.Println(args[0] + " - " + args[1] + " - " + args[2])
        AssetAsBytes, err := stub.GetState(args[0])
        if err != nil {
                return nil, errors.New("Failed to get thing")
        }

        res := Asset{}
        json.Unmarshal(AssetAsBytes, &res) //un stringify it aka JSON.parse()
        temp, err := strconv.Atoi(args[2])
        if err != nil {
                msg := "Temperature needs to be a numeric string " + args[2]
                fmt.Println(msg)
                return nil, errors.New(msg)
        }

        fmt.Println("Current temperature " + strconv.Itoa(temp))
        if temp > 24 {
                fmt.Println("[Smart Contract] Asset need to be verified " + strconv.Itoa(temp))
                res.Status = true
        } else {
                fmt.Println("[Smart Contract] Satisfied! " + strconv.Itoa(temp))
                tmp, err := strconv.Atoi(args[2])
                if err != nil {
                        msg := "Temperature needs to be a numeric string " + args[2]
                        fmt.Println(msg)
                        return nil, errors.New(msg)
                }

                res.Status = false
                res.Temperature = tmp
                res.User = args[1] //change the user

                jsonAsBytes, _ := json.Marshal(res)
                err = stub.PutState(args[0], jsonAsBytes) //rewrite the Asset with id as key
                if err != nil {
                        return nil, err
                }

                fmt.Println("- end set user")
                return nil, nil
        }

        jsonAsBytes, _ := json.Marshal(res)
        err = stub.PutState(args[0], jsonAsBytes) //rewrite the Asset with id as key
        if err != nil {
                return nil, err
        }

        fmt.Println("- infraction applied to the ledger state")
        return nil, nil
}

// ===========================================================================================================                                                                                                 =================
// Open Trade - create an open trade for a Asset you want with Assets you have
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) open_trade(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
        var err error
        var will_id int
        var trade_away Description

        //      0        1      2     3      4      5       6
        //["bob", "blue", "16", "red", "16"] *"blue", "35*
        if len(args) < 5 {
                return nil, errors.New("Incorrect number of arguments. Expecting like 5?")
        }
        if len(args)%2 == 0 {
                return nil, errors.New("Incorrect number of arguments. Expecting an odd number")
        }

        id, err := strconv.Atoi(args[2])
        if err != nil {
                return nil, errors.New("3rd argument must be a numeric string")
        }

        open := AnOpenTrade{}
        open.User = args[0]
        open.Timestamp = makeTimestamp() //use timestamp as an ID
        open.Want.LastTransaction = args[1]
        open.Want.ID = id
        fmt.Println("- start open trade")
        jsonAsBytes, _ := json.Marshal(open)
        err = stub.PutState("_debug1", jsonAsBytes)

        for i := 3; i < len(args); i++ { //create and append each willing trade
                will_id, err = strconv.Atoi(args[i+1])
                if err != nil {
                        msg := "is not a numeric string " + args[i+1]
                        fmt.Println(msg)
                        return nil, errors.New(msg)
                }

                trade_away = Description{}
                trade_away.LastTransaction = args[i]
                trade_away.ID = will_id
                fmt.Println("! created trade_away: " + args[i])
                jsonAsBytes, _ = json.Marshal(trade_away)
                err = stub.PutState("_debug2", jsonAsBytes)

                open.Willing = append(open.Willing, trade_away)
                fmt.Println("! appended willing to open")
                i++
        }

        //get the open trade struct
        tradesAsBytes, err := stub.GetState(openTradesStr)
        if err != nil {
                return nil, errors.New("Failed to get opentrades")
        }
        var trades AllTrades
        json.Unmarshal(tradesAsBytes, &trades) //un stringify it aka JSON.parse()

        trades.OpenTrades = append(trades.OpenTrades, open) //append to open trades
        fmt.Println("! appended open to trades")
        jsonAsBytes, _ = json.Marshal(trades)
        err = stub.PutState(openTradesStr, jsonAsBytes) //rewrite open orders
        if err != nil {
                return nil, err
        }
        fmt.Println("- end open trade")
        return nil, nil
}

// ===========================================================================================================                                                                                                 =================
// Perform Trade - close an open trade and move ownership
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) perform_trade(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
        var err error

        //      0               1                                       2                                    3                                                                                                 4                                       5
        //[data.id, data.closer.user, data.closer.Description, data.opener.user, data.opener.LastTransaction,                                                                                                  data.opener.Weight]
        if len(args) < 6 {
                return nil, errors.New("Incorrect number of arguments. Expecting 6")
        }

        fmt.Println("- start close trade")
        timestamp, err := strconv.ParseInt(args[0], 10, 64)
        if err != nil {
                return nil, errors.New("1st argument must be a numeric string")
        }

        id, err := strconv.Atoi(args[5])
        if err != nil {
                return nil, errors.New("6th argument must be a numeric string")
        }

        //get the open trade struct
        tradesAsBytes, err := stub.GetState(openTradesStr)
        if err != nil {
                return nil, errors.New("Failed to get opentrades")
        }
        var trades AllTrades
        json.Unmarshal(tradesAsBytes, &trades) //un stringify it aka JSON.parse()

        for i := range trades.OpenTrades { //look for the trade
                fmt.Println("looking at " + strconv.FormatInt(trades.OpenTrades[i].Timestamp, 10) + " for " + strconv.FormatInt(timestamp, 10))
                if trades.OpenTrades[i].Timestamp == timestamp {
                        fmt.Println("found the trade")

                        AssetAsBytes, err := stub.GetState(args[2])
                        if err != nil {
                                return nil, errors.New("Failed to get thing")
                        }
                        closersAsset := Asset{}
                        json.Unmarshal(AssetAsBytes, &closersAsset) //un stringify it aka JSON.parse()

                        //verify if Asset meets trade requirements
                        if closersAsset.LastTransaction != trades.OpenTrades[i].Want.LastTransaction || closersAsset.ID != trades.OpenTrades[i].Want.ID {
                                msg := "Asset in input does not meet trade requriements"
                                fmt.Println(msg)
                                return nil, errors.New(msg)
                        }

                        Asset, e := findAsset4Trade(stub, trades.OpenTrades[i].User, args[4], id) //find a Ass                                                                                                 et that is suitable from opener
                        if e == nil {
                                fmt.Println("! no errors, proceeding")

                                t.set_user(stub, []string{args[2], trades.OpenTrades[i].User}) //change owner                                                                                                  of selected Asset, closer -> opener
                                t.set_user(stub, []string{Asset.Description, args[1]})         //change owner                                                                                                  of selected Asset, opener -> closer

                                trades.OpenTrades = append(trades.OpenTrades[:i], trades.OpenTrades[i+1:]...)                                                                                                  //remove trade
                                jsonAsBytes, _ := json.Marshal(trades)
                                err = stub.PutState(openTradesStr, jsonAsBytes) //rewrite open orders
                                if err != nil {
                                        return nil, err
                                }
                        }
                }
        }
        fmt.Println("- end close trade")
        return nil, nil
}

// ===========================================================================================================                                                                                                 =================
// findAsset4Trade - look for a matching Asset that this user owns and return it
// ===========================================================================================================                                                                                                 =================
func findAsset4Trade(stub shim.ChaincodeStubInterface, user string, LastTransaction string, id int) (m Asset, err error) {
        var fail Asset
        fmt.Println("- start find Asset 4 trade")
        fmt.Println("looking for " + user + ", " + LastTransaction + ", " + strconv.Itoa(id))

        //get the Asset index
        AssetsAsBytes, err := stub.GetState(assetIndexStr)
        if err != nil {
                return fail, errors.New("Failed to get Asset index")
        }
        var AssetIndex []string
        json.Unmarshal(AssetsAsBytes, &AssetIndex) //un stringify it aka JSON.parse()

        for i := range AssetIndex { //iter through all the Assets
                //fmt.Println("looking @ Asset Description: " + AssetIndex[i]);

                AssetAsBytes, err := stub.GetState(AssetIndex[i]) //grab this Asset
                if err != nil {
                        return fail, errors.New("Failed to get Asset")
                }
                res := Asset{}
                json.Unmarshal(AssetAsBytes, &res) //un stringify it aka JSON.parse()
                //fmt.Println("looking @ " + res.User + ", " + res.LastTransaction + ", " + strconv.Itoa(res.W                                                                                                 eight));

                //check for user && LastTransaction && Weight
                if strings.ToLower(res.User) == strings.ToLower(user) && strings.ToLower(res.LastTransaction) == strings.ToLower(LastTransaction) && res.ID == id {
                        fmt.Println("found a Asset: " + res.Description)
                        fmt.Println("! end find Asset 4 trade")
                        return res, nil
                }
        }

        fmt.Println("- end find Asset 4 trade - error")
        return fail, errors.New("Did not find Asset to use in this trade")
}

// ===========================================================================================================                                                                                                 =================
// Make Timestamp - create a timestamp in ms
// ===========================================================================================================                                                                                                 =================
func makeTimestamp() int64 {
        return time.Now().UnixNano() / (int64(time.Millisecond) / int64(time.Nanosecond))
}

// ===========================================================================================================                                                                                                 =================
// Remove Open Trade - close an open trade
// ===========================================================================================================                                                                                                 =================
func (t *SimpleChaincode) remove_trade(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
        var err error

        //      0
        //[data.id]
        if len(args) < 1 {
                return nil, errors.New("Incorrect number of arguments. Expecting 1")
        }

        fmt.Println("- start remove trade")
        timestamp, err := strconv.ParseInt(args[0], 10, 64)
        if err != nil {
                return nil, errors.New("1st argument must be a numeric string")
        }

        //get the open trade struct
        tradesAsBytes, err := stub.GetState(openTradesStr)
        if err != nil {
                return nil, errors.New("Failed to get opentrades")
        }
        var trades AllTrades
        json.Unmarshal(tradesAsBytes, &trades) //un stringify it aka JSON.parse()

        for i := range trades.OpenTrades { //look for the trade
                //fmt.Println("looking at " + strconv.FormatInt(trades.OpenTrades[i].Timestamp, 10) + " for "                                                                                                  + strconv.FormatInt(timestamp, 10))
                if trades.OpenTrades[i].Timestamp == timestamp {
                        fmt.Println("found the trade")
                        trades.OpenTrades = append(trades.OpenTrades[:i], trades.OpenTrades[i+1:]...) //remove                                                                                                  this trade
                        jsonAsBytes, _ := json.Marshal(trades)
                        err = stub.PutState(openTradesStr, jsonAsBytes) //rewrite open orders
                        if err != nil {
                                return nil, err
                        }
                        break
                }
        }

        fmt.Println("- end remove trade")
        return nil, nil
}

// ===========================================================================================================                                                                                                 =================
// Clean Up Open Trades - make sure open trades are still possible, remove choices that are no longer possible                                                                                                 , remove trades that have no valid choices
// ===========================================================================================================                                                                                                 =================
func cleanTrades(stub shim.ChaincodeStubInterface) (err error) {
        var didWork = false
        fmt.Println("- start clean trades")

        //get the open trade struct
        tradesAsBytes, err := stub.GetState(openTradesStr)
        if err != nil {
                return errors.New("Failed to get opentrades")
        }
        var trades AllTrades
        json.Unmarshal(tradesAsBytes, &trades) //un stringify it aka JSON.parse()

        fmt.Println("# trades " + strconv.Itoa(len(trades.OpenTrades)))
        for i := 0; i < len(trades.OpenTrades); { //iter over all the known open trades
                fmt.Println(strconv.Itoa(i) + ": looking at trade " + strconv.FormatInt(trades.OpenTrades[i].Timestamp, 10))

                fmt.Println("# options " + strconv.Itoa(len(trades.OpenTrades[i].Willing)))
                for x := 0; x < len(trades.OpenTrades[i].Willing); { //find a Asset that is suitable
                        fmt.Println("! on next option " + strconv.Itoa(i) + ":" + strconv.Itoa(x))
                        _, e := findAsset4Trade(stub, trades.OpenTrades[i].User, trades.OpenTrades[i].Willing[x].LastTransaction, trades.OpenTrades[i].Willing[x].ID)
                        if e != nil {
                                fmt.Println("! errors with this option, removing option")
                                didWork = true
                                trades.OpenTrades[i].Willing = append(trades.OpenTrades[i].Willing[:x], trades.OpenTrades[i].Willing[x+1:]...) //remove this option
                                x--
                        } else {
                                fmt.Println("! this option is fine")
                        }

                        x++
                        fmt.Println("! x:" + strconv.Itoa(x))
                        if x >= len(trades.OpenTrades[i].Willing) { //things might have shifted, recalcuate
                                break
                        }
                }

                if len(trades.OpenTrades[i].Willing) == 0 {
                        fmt.Println("! no more options for this trade, removing trade")
                        didWork = true
                        trades.OpenTrades = append(trades.OpenTrades[:i], trades.OpenTrades[i+1:]...) //remove                                                                                                  this trade
                        i--
                }

                i++
                fmt.Println("! i:" + strconv.Itoa(i))
                if i >= len(trades.OpenTrades) { //things might have shifted, recalcuate
                        break
                }
        }

        if didWork {
                fmt.Println("! saving open trade changes")
                jsonAsBytes, _ := json.Marshal(trades)
                err = stub.PutState(openTradesStr, jsonAsBytes) //rewrite open orders
                if err != nil {
                        return err
                }
        } else {
                fmt.Println("! all open trades are fine")
        }

        fmt.Println("- end clean trades")
        return nil
}
