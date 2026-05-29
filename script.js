class AVLNode {
    constructor(value, x = 0, y = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.x = x;
        this.y = y;
    }
}

let rootNode = null;
let unbalancedSnapshot = null; // Stores snapshot of the unbalanced tree state
let imbalanceDetectedThisTurn = false; // Prevents overwriting snapshots during recursive calls

function height(node) {
    return node ? node.height : 0;
}

function updateHeight(node) {
    node.height = 1 + Math.max(height(node.left), height(node.right));
}

function getBalance(node) {
    return node ? height(node.left) - height(node.right) : 0;
}

// Deep copies the node tree structure safely
function cloneTree(node) {
    if (!node) return null;
    let copy = new AVLNode(node.value, node.x, node.y);
    copy.height = node.height;
    copy.left = cloneTree(node.left);
    copy.right = cloneTree(node.right);
    return copy;
}

function rightRotate(y) {
    log("↳ Sub-step: Single Right Rotate on " + y.value);
    let x = y.left;
    let T2 = x.right;

    x.right = y;
    y.left = T2;

    updateHeight(y);
    updateHeight(x);
    return x;
}

function leftRotate(x) {
    log("↳ Sub-step: Single Left Rotate on " + x.value);
    let y = x.right;
    let T2 = y.left;

    y.left = x;
    x.right = T2;

    updateHeight(x);
    updateHeight(y);
    return y;
}

function insertNode(root, value) {
    if (!root) {
        log("Inserting " + value);
        return new AVLNode(value);
    }

    if (value < root.value) {
        root.left = insertNode(root.left, value);
    } else if (value > root.value) {
        root.right = insertNode(root.right, value);
    } else {
        log("Duplicate value " + value + " not inserted.");
        return root;
    }

    updateHeight(root);
    let balance = getBalance(root);

    // Save snapshot only on the FIRST instance of an imbalance detection per insertion
    if (Math.abs(balance) > 1 && !imbalanceDetectedThisTurn) {
        unbalancedSnapshot = cloneTree(rootNode);
        imbalanceDetectedThisTurn = true;
    }

    // Case 1: LL Rotation
    if (balance > 1 && value < root.left.value) {
        log(`<strong>[LL Rotation]</strong> Triggered at node ${root.value} to fix Left-Left imbalance.`);
        return rightRotate(root);
    }

    // Case 2: RR Rotation
    if (balance < -1 && value > root.right.value) {
        log(`<strong>[RR Rotation]</strong> Triggered at node ${root.value} to fix Right-Right imbalance.`);
        return leftRotate(root);
    }

    // Case 3: LR Rotation
    if (balance > 1 && value > root.left.value) {
        log(`<strong>[LR Rotation]</strong> Triggered at node ${root.value} to fix Left-Right imbalance (Double Rotation):`);
        root.left = leftRotate(root.left);
        return rightRotate(root);
    }

    // Case 4: RL Rotation
    if (balance < -1 && value < root.right.value) {
        log(`<strong>[RL Rotation]</strong> Triggered at node ${root.value} to fix Right-Left imbalance (Double Rotation):`);
        root.right = rightRotate(root.right);
        return leftRotate(root);
    }

    return root;
}

// Initialize a global counter for the logs
let logCounter = 1;

function log(message) {
    const box = document.getElementById('logBox');
    if (!box) return;
    box.innerHTML += `<strong>${logCounter}.</strong> ${message}<br/>`;
    logCounter++;
    box.scrollTop = box.scrollHeight;
}

function insert() {
    const inputEl = document.getElementById("nodeValue");
    const val = parseInt(inputEl.value);
    if (isNaN(val)) return;

    // Reset flags before execution
    unbalancedSnapshot = null;
    imbalanceDetectedThisTurn = false;

    rootNode = insertNode(rootNode, val);
    inputEl.value = "";
    renderTrees();
}

// Master rendering manager that controls both output view options
function renderTrees() {
    // Render Balanced Tree (Right Side)
    renderTreeInstance("tree-container", "svg-lines", rootNode);

    // Render Unbalanced Snapshot Tree (Left Side)
    if (unbalancedSnapshot) {
        renderTreeInstance("before-container", "before-svg", unbalancedSnapshot);
    } else {
        // If no imbalance occurred, "Before" matches "After"
        renderTreeInstance("before-container", "before-svg", rootNode);
    }
}

function renderTreeInstance(containerId, svgId, treeRoot) {
    const container = document.getElementById(containerId);
    const svg = document.getElementById(svgId);
    if (!container || !svg) return;

    container.querySelectorAll(".node").forEach(n => n.remove());
    svg.innerHTML = "";

    const width = container.clientWidth;
    assignCoordinates(treeRoot, width / 2, 40, width / 4);
    drawTreeInstance(container, svg, treeRoot);
}

function assignCoordinates(node, x, y, offset) {
    if (!node) return;
    node.x = x;
    node.y = y;
    assignCoordinates(node.left, x - offset, y + 70, offset / 1.8);
    assignCoordinates(node.right, x + offset, y + 70, offset / 1.8);
}

function drawTreeInstance(container, svg, node, parent = null) {
    if (!node) return;

    const nodeEl = document.createElement("div");
    nodeEl.className = "node";
    nodeEl.innerText = node.value;
    nodeEl.style.left = (node.x - 20) + "px";
    nodeEl.style.top = (node.y - 20) + "px";

    const bf = getBalance(node);
    const bfEl = document.createElement("span");
    bfEl.className = "balance-factor";
    bfEl.innerText = bf;

    if (Math.abs(bf) > 1) {
        bfEl.style.backgroundColor = "#e74c3c";
    } else {
        bfEl.style.backgroundColor = "#34495e";
    }

    nodeEl.appendChild(bfEl);
    container.appendChild(nodeEl);

    if (parent) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", parent.x);
        line.setAttribute("y1", parent.y);
        line.setAttribute("x2", node.x);
        line.setAttribute("y2", node.y);
        line.setAttribute("stroke", "#333");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
    }

    drawTreeInstance(container, svg, node.left, node);
    drawTreeInstance(container, svg, node.right, node);
}

// Function to close the rules popup modal screen
function closeRules() {
    const modal = document.getElementById("rules-modal");
    if (modal) {
        modal.style.display = "none";
    }
}