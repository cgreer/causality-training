import React, { Component } from 'react';

import toposort from 'toposort'

import { createRandomDAG, dagToUndirected, graphIslands, maxDagEdges, randInt } from './DAG'
import EditNodeForm from './EditNodeForm'
import EditModelForm from './EditModelForm'
import FloatingMenu from './FloatingMenu'

var mirrorSpacing = 650

class Node extends Component {

    constructor(props, context) {
        super(props, context)
    }

    render() {

        let bgColor = "green"
        if (this.props.fixed) {
            bgColor = "red"
        }

        let style = {
            boxSizing: "border-box",
            position: "absolute",
            backgroundColor: bgColor,
            border: this.props.selected ? "5px solid" : "1px solid",

            left: this.props.left + "px",
            top: this.props.top + "px",
            width: this.props.value + "px",
            height: this.props.value + "px",
        }

        return (
            <div id={this.props.id} style={style}>{this.props.label}</div>
        )

    }
}

class Line extends Component {

    render() {

        const {x1, y1, x2, y2, color} = this.props

        const dy = y2 - y1
        const dx = x2 - x1

        const angle = Math.atan2(dy, dx) * 180 / Math.PI
        const length = Math.sqrt(dx * dx + dy * dy)

        const style = {
            position: 'absolute',

            top: `${y1}px`,
            left: `${x1}px`,
            width: `${length}px`,

            zIndex: Number.isFinite(this.props.zIndex) ? String(this.props.zIndex) : '1',
            transform: `rotate(${angle}deg)`,

            // Rotate around (x0, y0)
            transformOrigin: '0 0',

            borderTopColor: color ? color : "black",
            borderTopStyle: "dashed",
            borderTopWidth: "1",
        }

        return <div style={style}></div>

    }

}

class SteppedLine extends Component {

    render() {

        const { x1, y1, x2, y2 } = this.props

        const dy = y2 - y1
        if (dy === 0) {
            return <Line {...this.props} />
        }

        const borderWidth = 1
        const x3 = (x1 + x2) / 2

        const yOffset = dy < 0 ? borderWidth : 0
        const minY = Math.min(y1, y2) - yOffset
        const maxY = Math.max(y1, y2)

        return (
            <div>
                <Line {...this.props} x1={x1} y1={y1} x2={x3} y2={y1} />
                <Line {...this.props} x1={x2} y1={y2} x2={x3} y2={y2} />
                <Line {...this.props} x1={x3} y1={minY} x2={x3} y2={maxY} />
            </div>
        )

    }

}


function buildLinkElements(nodeFrom, nodeTo, linkID) {
    let linkElements = []

    let color = "black"
    if (nodeTo.fixed) {
        color = "lightgray"
    }

    linkElements.push(
        <Line
            id={"link-" + linkID}

            x1={nodeFrom.left + nodeFrom.value}
            y1={nodeFrom.top + (nodeFrom.value / 2)}

            x2={nodeTo.left - 5}
            y2={nodeTo.top + (nodeTo.value / 2)}

            color={color}
        />
    )

    linkElements.push(
        <Line
            id={"linkb-" + linkID}

            x1={nodeTo.left - 10 - 5}
            y1={nodeTo.top + (nodeTo.value / 2) - 10}

            x2={nodeTo.left - 2}
            y2={nodeTo.top + (nodeTo.value / 2)}

            color={color}
        />

    )

    linkElements.push(
        <Line
            id={"linkc-" + linkID}

            x1={nodeTo.left - 12 - 5}
            y1={nodeTo.top + (nodeTo.value / 2) + 10}

            x2={nodeTo.left - 2}
            y2={nodeTo.top + (nodeTo.value / 2)}

            color={color}
        />

    )
    return linkElements
}



var UIModes = {
    "selection": 1,
}
Object.freeze(UIModes)

var KeyMappings = {
    movementKey: "w",
}

function randomLevelInfo(numNodes, numEdges) {

    var rDag = createRandomDAG(numNodes, numEdges)
    console.log("randomDAG", rDag)

    var rUg = dagToUndirected(rDag)
    console.log("undirectedEdges", rUg)

    var islands = graphIslands(rUg)
    console.log("islands", islands)

    let largestIsland = islands[0]
    islands.forEach(island => {
        if (island.length > largestIsland.length) {
            largestIsland = island
        }
    })

    largestIsland.sort()

    let level = {
        nodes: [],
        links: [],
        nodeOfInterest: largestIsland[largestIsland.length - 1],
    }

    largestIsland.forEach(nodeID => {
        level.nodes.push({
            name: nodeID,
        })

        rDag[nodeID].forEach(connectedID => {
            level.links.push([nodeID, connectedID.toString()])
        })
    })

    return level
}

function levelInfo(levelName) {

    if (levelName.startsWith("random") === true) {
        let [_, numNodes] = levelName.split("-")
        numNodes = parseInt(numNodes)

        let numEdges = randInt(1, maxDagEdges(numNodes))
        console.log("GEN RANDOM LEVEL", numNodes, numEdges)
        return randomLevelInfo(numNodes, numEdges)

    }

    let levels = {
        "1": {
            nodes: [
                {
                    name: "A",
                },
                {
                    name: "B",
                },
            ],
            links: [
                ["A", "B"],
            ],
            nodeOfInterest: "B",
        },
        "2": {
            nodes: [
                {
                    name: "A",
                },
                {
                    name: "B",
                },
            ],
            links: [],
            nodeOfInterest: "B",
        },
        "3": {
            nodes: [
                {
                    name: "A",
                },
                {
                    name: "B",
                },
                {
                    name: "C",
                },
            ],
            links: [
                ["A", "B"],
                ["B", "C"],
            ],
            nodeOfInterest: "C",
        },
        "4": {
            nodes: [
                {
                    name: "A",
                },
                {
                    name: "B",
                },
                {
                    name: "C",
                },
            ],
            links: [
                ["A", "C"],
                ["B", "C"],
            ],
            nodeOfInterest: "C",
        },
        "5": {
            nodes: [
                {
                    name: "A",
                },
                {
                    name: "B",
                },
                {
                    name: "C",
                },
            ],
            links: [
                ["B", "A"],
                ["B", "C"],
            ],
            nodeOfInterest: "C",
        },
        "6": {
            nodes: [
                { name: "A", },
                { name: "B", },
                { name: "C", },
                { name: "D", },
            ],
            links: [
                ["A", "B"],
                ["B", "C"],
                ["B", "D"],
                ["C", "D"],
            ],
            nodeOfInterest: "D",
        },
        "7": {
            nodes: [
                { name: "A", },
                { name: "B", },
                { name: "C", },
                { name: "D", },
            ],
            links: [
                ["A", "B"],
                ["B", "C"],
                ["C", "D"],
            ],
            nodeOfInterest: "D",
        },
        "8": {
            nodes: [
                { name: "A", },
                { name: "B", },
                { name: "C", },
                { name: "D", },
            ],
            links: [
                ["A", "B"],
                ["A", "D"],
                ["B", "C"],
                ["C", "D"],
            ],
            nodeOfInterest: "D",
        },
        "9": {
            nodes: [
                { name: "C", },

                { name: "A", },
                { name: "E", },

                { name: "B", },
                { name: "D", },

                { name: "F", },
            ],
            links: [
                ["C", "A"],
                ["A", "E"],

                ["C", "B"],
                ["B", "D"],

                ["E", "F"],
                ["D", "F"],
            ],
            nodeOfInterest: "F",
        },
        "10": {
            nodes: [],
            links: [],
            nodeOfInterest: null,
        },
    }

    return levels[levelName]

}

function levelSetup(levelName) {

    let middle = 638
    let cellSpacing = 100

    let thisLevel = levelInfo(levelName)
    console.log("thisLevel", thisLevel)

    let nodeID = 0

    // Hidden Model
    let observationNodes = {}
    let nameToObsNodeID = {}
    let nonInterestCount = 1
    thisLevel.nodes.forEach(node => {
        nodeID += 1

        let row = 5
        let column = 1
        if (node.name !== thisLevel.nodeOfInterest) {
            row = 4
            column = nonInterestCount
            nonInterestCount += 1
        }

        nameToObsNodeID[node.name] = nodeID.toString()
        observationNodes[nodeID.toString()] = {
            id: nodeID.toString(),
            name: node.name,
            mirrorNode: true,

            left: middle + (row * cellSpacing),
            top: column * cellSpacing,
        }
    })

    // Hypothetical
    let hypoNodes = {}
    Object.keys(observationNodes).forEach(obNodeID => {
        nodeID += 1
        hypoNodes[nodeID.toString()] = {
            id: nodeID.toString(),
            name: observationNodes[obNodeID].name,
            mirrorNode: false,
            left: observationNodes[obNodeID].left - mirrorSpacing,
            top: observationNodes[obNodeID].top,
        }
    })

    // All
    let nodes = {...observationNodes, ...hypoNodes}

    // Default Values
    Object.keys(nodes).forEach(x => {
        nodes[x].value = 50
        nodes[x].interventionValue = null
        nodes[x].fixed = false
    })


    // Links
    let links = {}
    thisLevel.links.forEach(edge => {
        let [fromName, toName] = edge
        let fromID = nameToObsNodeID[fromName]
        let toID = nameToObsNodeID[toName]

        links[fromID + "-" + toID] = {name: ""}
    })

    return [nodes, links]

}

class ModelCanvas extends Component {

    constructor(props, context) {
        super(props, context)

        this.state = {

            modelName: "",

            uiMode: UIModes.selection,

            selection: null,

            selectedInitialX: null,
            selectedInitialY: null,

            keyDown: null,

            editingNodeID: null,

            editingModelInfo: false,

            displayFloatingMenu: false,

            lastMouseDownTime: null,

            mouseDownClientX: null,
            mouseDownClientY: null,

            linkFromID: null,

            showObservationalLinks: false,

            nodes: {},

            links: {},

            levelSelection: "10",

            showHelpBox: false,
        }

        this.modelCanvasID = "modelCanvas"

    }

    getNode = (nodeID) => {
        return this.state.nodes[nodeID]
    }

    getNodesByName = (name) => {
        return Object.values(this.state.nodes).filter(x => x.name === name)
    }

    getMirrorSourceNode = (name) => {
        return Object.values(this.state.nodes).filter(x => {
            return (x.mirrorNode === false && x.name === name)
        })[0]
    }

    elementID = (type, id) => {
        return type + "-" + id.toString()
    }

    submitNodeEdits = (nodeID, nodeState) => {
        let nodes = {...this.state.nodes}
        nodes[nodeID].name = nodeState.name

        this.setState({
            editingNodeID: null,
            nodes: nodes,
        })
    }

    getUIMode = () => {
        if (this.state.editingNodeID || this.state.editingModelInfo) {
            return "editing"
        }

        return "canvas"
    }

    submitEditModel = (modelState) => {
        this.setState({
            editingModelInfo: false,
            modelName: modelState.name,
        })
    }

    selectedUIElement = () => {
        if (!this.state.selection) {
            return [null, null]
        }

        return this.state.selection.split("-")

    }

    getSelectedNode = () => {
        var [elementType, elementID] = this.selectedUIElement()
        if (elementType === null) {
            return null
        }

        if (elementType !== "node") {
            return null
        }

        return this.state.nodes[elementID]
    }

    isMouseDown = () => {
        return this.state.mouseDownClientX !== null
    }

    resetInterventions = () => {

        let [_, selectedID] = this.selectedUIElement()
        let nodes = {...this.state.nodes}
        Object.keys(nodes).forEach(nodeID => {
            if (!nodes[nodeID].fixed && (nodeID !== selectedID)) {
                nodes[nodeID].interventionValue = null
            }
        })

        this.setState({
            nodes:nodes,
        })


    }

    changeNodeSelection = (elementID) => {

        console.log("CHANGE SELECTION", elementID)

        // select node, activate intervention
        let stateChanges = {
            selection: elementID,
        }
        if (elementID) {
            let nodes = {...this.state.nodes}
            let [_, nodeID] = this.parseElementInfo(elementID)
            nodes[nodeID].interventionValue = nodes[nodeID].value
            stateChanges["nodes"] = nodes
        }

        if (elementID === null) {
            stateChanges["selectedInitialX"] = null
            stateChanges["selectedInitialY"] = null
        }
        this.setState(stateChanges)



        // Handle clearing interventions
        this.resetInterventions()
    }

    changeUIMode = (newMode) => {
        console.log("Changing mode from", this.state.uiMode, "to", newMode)
        this.setState({
            uiMode: newMode,
        })
    }

    parseElementInfo = (elementID) => {
        if (!elementID) {
            return [null, null]
        }

        if (elementID.slice(0,4) === "node") {
            return elementID.split("-")
        }

        console.error("Don't understand what was selected", elementID)
        return [null, null]
    }

    newNodeID = () => {
        if (Object.keys(this.state.nodes).length == 0) {
            console.log("FIRST NODE")
            return 1
        }
        let ids = Object.keys(this.state.nodes).map(x => parseInt(x))
        ids.sort()
        return ids[ids.length - 1] + 1
    }

    saveModelsData = (modelsData) => {
        // XXX: Move to settings
        let dataPath = "modelEditor.modelsData"
        localStorage.setItem(dataPath, JSON.stringify(modelsData))
    }

    loadModelsData = () => {
        // XXX: Move to settings
        let dataPath = "modelEditor.modelsData"
        let modelsData = localStorage.getItem(dataPath)

        // Initialize if empty
        if (modelsData === null) {
            modelsData = {}
        } else {
            modelsData = JSON.parse(modelsData)
        }

        return modelsData

    }

    saveCurrentModel = () => {

        // Overwrite model
        let modelsData = this.loadModelsData()
        modelsData[this.state.modelName] = {
            nodes: this.state.nodes,
            links: this.state.links,
        }
        this.saveModelsData(modelsData)

        alert("success")
    }

    loadModel = (modelName) => {
        let modelsData = this.loadModelsData()
        if (!(modelName in modelsData)) {
            alert("No model by that name availible")
            return -1
        }

        this.setState({
            modelName: modelName,
            nodes: modelsData[modelName].nodes,
            links: modelsData[modelName].links,
        })
    }

    getModelNames = () => {
        let modelsData = this.loadModelsData()
        return Object.keys(modelsData)
    }

    newModel = () => {
        this.saveCurrentModel()

        this.setState({
            modelName: "NEW_MODEL",
            nodes: {},
            links: {},
        })

    }

    createNewNode = (left, top) => {
        let nodeID = this.newNodeID()

        let newNode = {
            id: nodeID,
            name: "NODE " + nodeID,

            left: left,
            top: top,

            value: 50,
            interventionValue: null,
            fixed: false,
            mirrorNode: false,
        }

        let nodes = {...this.state.nodes}
        nodes[newNode.id] = newNode
        this.setState({
            nodes: nodes,
        })

        return newNode
    }

    editNode = (nodeID) => {
        this.setState({
            editingNodeID: nodeID,
        })
    }

    editModelInfo = () => {
        this.setState({
            editingModelInfo: true,
        })
    }

    newCanvasNode(left, top) {
        let newNode = this.createNewNode(
            left,
            top,
        )

        this.changeNodeSelection("node-" + newNode.id)
        this.editNode(newNode.id)
    }

    addEventListeners = () => {

        document.addEventListener('keyup', (event) => {
            this.setState({
                keyDown: null,
            })

        })

        document.addEventListener('keydown', (event) => {

            let [selectedElementType, selectedNodeID] = this.selectedUIElement()

            // Track which key is down
            this.setState({
                keyDown: event.key,
            })

            console.log(event.key)

            if (this.getUIMode() === "canvas") {

                if (event.key == "f") {
                    // this.changeUIMode(UIModes.movement)
                    //document.getElementById(this.modelCanvasID).style.cursor = "move";

                    if (selectedNodeID) {
                        let nodes = {...this.state.nodes}
                        let node = nodes[selectedNodeID]

                        node.fixed = !node.fixed
                        this.setState({
                            nodes: nodes,
                        })
                    }
                }

                // Save
                if (event.key == "S") {
                    if (this.state.modelName === "") {
                        alert("Need name before saving")
                    } else {
                        // XXX: Check if name is new so you don't overwrite

                        this.saveCurrentModel()
                        //localStorage["modelEditor.models"] =
                    }
                }

                // Load
                if (event.key == "L") {
                    this.setState({
                        displayFloatingMenu: !this.state.displayFloatingMenu,
                    })
                }

                // New
                if (event.key == "N") {
                    this.newModel()
                }

                // Delete Node
                if (event.key == "Backspace") {
                    if(selectedNodeID) {
                        let nodes = {...this.state.nodes}
                        delete nodes[selectedNodeID]

                        let links = {...this.state.links}
                        Object.keys(this.state.links).forEach(link => {
                            var [nodeFrom, nodeTo] = link.split("-")
                            if (nodeFrom === selectedNodeID) {
                                delete links[link]
                            } else if (nodeTo === selectedNodeID) {
                                delete links[link]
                            }
                            console.log(selectedNodeID, nodeFrom, nodeTo)
                        })

                        this.setState({
                            nodes: nodes,
                            links: links,
                        })
                    }
                }


                if (event.key == "H") {
                    this.setState({
                        showObservationalLinks: !this.state.showObservationalLinks,
                    })
                }

                if (event.key == "?") {
                    this.setState({
                        showHelpBox: !this.state.showHelpBox,
                    })
                }

                if (event.key == "e") {
                    let selectedNode = this.getSelectedNode()
                    if (selectedNode !== null) {
                        this.editNode(selectedNode.id)
                    }
                }

                if (event.key == "M") {
                    this.editModelInfo()
                }

                if (event.key == "a") {
                    this.setState({
                        linkFromID: this.state.linkFromID === null ? this.state.selection : null,
                    })
                }

                if (event.key === "1" || event.key === "2") {

                    if (this.state.uiMode === UIModes.selection) {

                        // If a node is selected, set the link from
                        if(selectedNodeID) {
                            let nodes = {...this.state.nodes}

                            let node = nodes[selectedNodeID]
                            let delta = event.key === "2" ? 20 : -20


                            node.interventionValue = node.interventionValue ? (node.interventionValue + delta) : node.value + delta
                            node.interventionValue = Math.max(Math.min(node.interventionValue, 90), 30)
                            this.setState({
                                nodes: nodes,
                            })

                            this.evaluateModel()
                        }
                    }
                }
            }

        })

        document.addEventListener('mousedown', (event) => {

            let targetElement = event.target
            let [targetType, targetID] = this.parseElementInfo(targetElement.id)

            console.log("MOUSE DOWN", event.target, targetType, targetID)

            if (targetType === "node") {

                let targetNode = this.getNode(targetID)

                if (this.state.linkFromID) {

                    console.log("mouse down on node", targetElement.id)

                    // Intent to Link, link to node
                    if (targetNode.mirrorNode === false) {
                        // Can't link mirrorNodes

                        let nodeFromID = this.state.linkFromID.split("-")[1]
                        let nodeToID = targetID // XXX use targetNode

                        if (nodeFromID !== nodeToID) {
                            let links = {...this.state.links}

                            let linkID  = nodeFromID + "-" + nodeToID
                            if (linkID in links) {
                                delete links[linkID]
                            } else {
                                links[nodeFromID + "-" + nodeToID] = {
                                    name: "",
                                }
                            }

                            this.setState({
                                links:links,
                                linkFromID: null,
                            })
                        }
                    } else {
                        this.setState({
                            linkFromID: null,
                        })
                    }

                } else {

                    if (targetNode.mirrorNode === false) {
                        // Selected a different node

                        // Record Initial position when clicked on
                        //  - used for movement and drawing link arrow
                        //  XXX: move into with changeNodeSelection
                        this.setState({
                            selectedInitialX: targetNode.left,
                            selectedInitialY: targetNode.top,
                        })

                        this.changeNodeSelection(targetElement.id)
                    }
                }

            } else {

                // Clicked in "white space" (clear interventions)
                this.setState({
                    linkFromID: null,
                })

                this.changeNodeSelection(null)

                this.changeUIMode(UIModes.selection)

                this.evaluateModel()
            }


            let nowMs = (new Date).getTime()
            if (this.state.lastMouseDownTime !== null && ((nowMs - this.state.lastMouseDownTime) <= 200)) {
                this.newCanvasNode(event.clientX, event.clientY - 43)
            }


            // Stash mouse event info
            this.setState({
                mouseDownClientX: event.clientX,
                mouseDownClientY: event.clientY,
                lastMouseDownTime: nowMs,
            })


        })

        document.addEventListener('mouseup', (event) => {
            this.setState({
                mouseDownClientX: null,
                mouseDownClientY: null,
            })
        })

        document.addEventListener('mousemove', (event) => {

            // Record
            this.setState({
                mouseMoveClientX: event.clientX,
                mouseMoveClientY: event.clientY,
            })

            if (this.isMouseDown()) {

                if (this.state.keyDown === null) {

                    // Move selected objects
                    if (this.state.selection) {

                        // Difference between initial down event
                        let xDiff = event.clientX - this.state.mouseDownClientX
                        let yDiff = event.clientY - this.state.mouseDownClientY


                        // Move selected node
                        var [selectedElementType, selectedNodeID] = this.selectedUIElement()

                        selectedNodeID = this.state.selection.split("-")[1]

                        let nodes = {...this.state.nodes}
                        nodes[selectedNodeID].left = this.state.selectedInitialX + xDiff
                        nodes[selectedNodeID].top = this.state.selectedInitialY + yDiff

                        this.setState({
                            nodes: nodes,
                        })
                    }

                }
            }

        })

    }

    componentDidMount() {
        this.addEventListeners()

        this.changeLevel("10")

    }

    changeLevel = (levelName) => {
        let [nodes, links] = levelSetup(levelName)
        console.log("LEVEL SETUP", nodes, links)

        this.setState({
            nodes: nodes,
            links: links,
            showObservationalLinks: false,
        })

    }

    evaluateModel = () => {

        // Get node evaluation order
        let edges = []
        let dependsOn = {}
        Object.keys(this.state.links).forEach(link => {
            let [from, to] = link.split("-")

            // Edges
            edges.push([from, to])

            // Dependencies
            if (to in dependsOn) {
                dependsOn[to].push(from)
            } else {
                dependsOn[to] = [from]
            }
        })
        let orderedDependentNodes = toposort(edges)


        // Update Model
        let nodes = {...this.state.nodes}
        let independentNodes = []
        Object.keys(nodes).forEach(x => {
            if (!(x in orderedDependentNodes)) {
                independentNodes.push(x)
            }
        })

        orderedDependentNodes.concat(independentNodes).forEach(nodeID => {
            let thisNode = nodes[nodeID]

            // Get intervention value to use (only changed for mirrored nodes)
            let interventionValue = thisNode.interventionValue
            if (thisNode.mirrorNode === true) {
                let mirrorSourceNode = this.getMirrorSourceNode(thisNode.name)
                interventionValue = mirrorSourceNode.interventionValue
            }

            if (interventionValue) {
                // Intervention
                thisNode.value = Math.round(interventionValue)
            } else {
                if (nodeID in dependsOn) {
                    // Average of input nodes
                    let count = 0
                    let sum = 0.0
                    dependsOn[nodeID].forEach(depNodeID => {
                        count += 1
                        sum += nodes[depNodeID].value
                    })
                    thisNode.value = Math.round(sum / count)
                } else {
                    // Default value
                    thisNode.value = 50
                }
            }

        })

        //nodes["1"].value = Math.round(nodes["1"].interventionValue || 50)
        //nodes["2"].value = Math.round(nodes["2"].interventionValue || (30 + .3*nodes["1"].value))

        this.setState({
            nodes: nodes,
        })
    }

    renderHelpBox = () => {

        let boxContents = <div>Press "?" for help</div>
        if (this.state.showHelpBox === true) {
            boxContents = <div>
                <strong>Intervention</strong><br />
                "1" - make selected smaller<br />
                "2" - make selected node bigger<br />
                "f" - toggle "fixing" node<br /><br />

                <strong>Move</strong><br />
                Click and drag node<br /><br />

                <strong>Create Link</strong><br />
                Select node 1, press "a", select node 2<br /><br />

                <strong>Remove Link</strong><br />
                Select node 1, press "a", select node 2<br /><br />

                <strong>Toggle Answer</strong><br />
                "H"<br /><br />
            </div>
        }


        let style = {
            position: "absolute",
            left: "0px",
        }

        return <div style={style}>
            {boxContents}
        </div>
    }

    renderLinkLine = () => {
        if (this.state.linkFromID === null) {
            return null
        } else {
            console.log("linkFromID", this.state.linkFromID)
            let fromNode = this.getNode(this.state.linkFromID.split("-")[1])

            console.log(fromNode)

            let x1 = fromNode.left + fromNode.value
            let y1 = fromNode.top + (fromNode.value / 2)

            return <Line
                x1={x1}
                y1={y1}

                x2={this.state.mouseMoveClientX - 5}
                y2={this.state.mouseMoveClientY - 43}

                zIndex={-1}
            />
        }
    }
    pickRandomLevel = () => {
        let choice = randInt(3, 5)
        console.log("CHOSE", choice)
        this.changeLevel(choice.toString())
    }

    handleLevelSelectionChange = (event) => {
        this.setState({
            levelSelection: event.target.value,
        })
        this.changeLevel(event.target.value)
    }

    renderLevelSelect = () => {

        let options = []
        let levels = [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "random-5",
            "random-8",
            "random-10",
            "random-12",
        ]

        levels.forEach(x => {
            options.push(
                <option
                    key={x}
                    value={x}
                >
                    {x}
                </option>
            )

        })

        return (
            <select
                value={this.state.levelSelection}
                onChange={this.handleLevelSelectionChange}
            >
                {options}
            </select>
        )
    }

    render() {

        let nodeElements = []
        Object.entries(this.state.nodes).forEach((entry) => {
            let [nodeID, node] = entry
            let uiElementID = "node-" + nodeID

            let selected = this.state.selection === uiElementID
            let fixed = node.fixed
            let left = node.left
            let top = node.top
            if (node.mirrorNode === true) {
                // selection
                let mirrorSourceElement = this.getMirrorSourceNode(node.name)

                let mirrorSourceElementID = this.elementID("node", mirrorSourceElement.id)
                selected = this.state.selection === mirrorSourceElementID

                // fixed
                fixed = mirrorSourceElement.fixed
                left = mirrorSourceElement.left + mirrorSpacing
                top = mirrorSourceElement.top
            }


            nodeElements.push(
                <Node
                    id={uiElementID}
                    label={node.name}

                    selected={selected}

                    left={left}
                    top={top}

                    value={node.value}
                    fixed={fixed}
                />
            )
        })

        let linkElements = []
        Object.keys(this.state.links).forEach((linkID) => {
            var [nodeFromID, nodeToID] = linkID.split("-")

            let nodeFrom = this.state.nodes[nodeFromID]
            let nodeTo = this.state.nodes[nodeToID]

            let shouldShow = (nodeFrom.mirrorNode === false) || (this.state.showObservationalLinks === true)


            if (shouldShow) {
                if (nodeFrom.mirrorNode === true) {
                    let mirrorNodeFrom = this.getMirrorSourceNode(nodeFrom.name)
                    let mirrorNodeTo = this.getMirrorSourceNode(nodeTo.name)

                    let linkNodeFrom = {
                        left: mirrorNodeFrom.left + mirrorSpacing,
                        top: mirrorNodeFrom.top,
                        value: nodeFrom.value,
                    }

                    let linkNodeTo = {
                        left: mirrorNodeTo.left + mirrorSpacing,
                        top: mirrorNodeTo.top,
                        value: nodeTo.value,
                    }

                    buildLinkElements(linkNodeFrom, linkNodeTo, linkID).forEach(x => {
                        linkElements.push(x)
                    })

                } else {

                    buildLinkElements(nodeFrom, nodeTo, linkID).forEach(x => {
                        linkElements.push(x)
                    })
                }
            }
        })

        let editbox = null
        if (this.state.editingNodeID) {
            editbox = <EditNodeForm key={this.state.editingNodeID}
                nodeID={this.state.editingNodeID}

                left={0}
                top={0}

                nodeInfo={{...this.state.nodes[this.state.editingNodeID]}}
                onSubmit={this.submitNodeEdits}
            />
        }

        let editModelForm = null
        if (this.state.editingModelInfo === true) {
            editbox = <EditModelForm
                name={this.state.modelName}

                left={0}
                top={0}

                onSubmit={this.submitEditModel}
            />
        }

        let modelNameBox = null
        if (this.state.modelName !== "") {
            modelNameBox = <div style={{alignSelf: "right"}}>MODEL: {this.state.modelName}</div>
        }

        let floatingMenu = null
        if (this.state.displayFloatingMenu) {
            let modelNames = this.getModelNames()
            floatingMenu = <FloatingMenu
                left={0}
                top={0}
                items={modelNames}
                onMenuItemClick={(item) => {
                    this.loadModel(item)
                    this.setState({displayFloatingMenu:false})
                }}
            />
        }

        return (
            <div id={this.modelCanvasID} style={{width: "100%", height: "100%"}}>
                <div>
                    {modelNameBox}
                    Select Level
                    {this.renderLevelSelect()}
                    {this.renderHelpBox()}
                </div>
                <div>
                    <button onClick={this.pickRandomLevel}>Random Level</button>
                </div>
                {editbox}
                {floatingMenu}

                {nodeElements}

                {this.renderLinkLine()}
                {linkElements}

                <div style={{position: "absolute", left: "436px"}}>Hypothesis</div>
                <div style={{position: "absolute", left: "836px"}}>Observations</div>
                <div style={{position: "absolute", left: "636px", height: "800px", width: "2px", backgroundColor: "black"}}></div>

            </div>
        )

    }

}


export default ModelCanvas
