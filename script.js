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

function height(node) {
    return node ? node.height : 0;
}

function updateHeight(node) {
    node.height = 1 + Math.max(height(node.left), height(node.right));
}

function getBalance(node) {
    return node ? height(node.left) - height(node.right) : 0;
}

function rightRotate(y) {
    log("Right Rotate on " + y.value);
    let x = y.left;
    let T2 = x.right;

    x.right = y;
    y.left = T2;

    updateHeight(y);
    updateHeight(x);
    return x;
}

function leftRotate(x) {
    log("Left Rotate on " + x.value);
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

    // Left Left
    if (balance > 1 && value < root.left.value) {
        return rightRotate(root);
    }

    // Right Right
    if (balance < -1 && value > root.right.value) {
        return leftRotate(root);
    }

    // Left Right
    if (balance > 1 && value > root.left.value) {
        root.left = leftRotate(root.left);
        return rightRotate(root);
    }

    // Right Left
    if (balance < -1 && value < root.right.value) {
        root.right = rightRotate(root.right);
        return leftRotate(root);
    }

    return root;
}

function log(message) {
    const box = document.getElementById('logBox');
    box.innerHTML += message + "<br/>";
    box.scrollTop = box.scrollHeight;
}

let rootNode = null;
const container = document.getElementById("tree-container");
const svg = document.getElementById("svg-lines");

function insert() {
    const val = parseInt(document.getElementById("nodeValue").value);
    if (isNaN(val)) return;
    rootNode = insertNode(rootNode, val);
    document.getElementById("nodeValue").value = "";
    renderTree();
}

function renderTree() {
    container.querySelectorAll(".node").forEach(n => n.remove());
    svg.innerHTML = "";
    const spacingX = 40;
    const spacingY = 70;
    const width = container.clientWidth;
    assignCoordinates(rootNode, width / 2, 40, width / 4);
    drawTree(rootNode);
}

function assignCoordinates(node, x, y, offset) {
    if (!node) return;
    node.x = x;
    node.y = y;
    assignCoordinates(node.left, x - offset, y + 70, offset / 1.8);
    assignCoordinates(node.right, x + offset, y + 70, offset / 1.8);
}

function drawTree(node, parent = null) {
    if (!node) return;

    const nodeEl = document.createElement("div");
    nodeEl.className = "node";
    nodeEl.innerText = node.value;
    nodeEl.style.left = (node.x - 20) + "px";
    nodeEl.style.top = (node.y - 20) + "px";
    container.appendChild(nodeEl);

    if (parent) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", parent.x);
        line.setAttribute("y1", parent.y);
        line.setAttribute("x2", node.x);
        line.setAttribute("y2", node.y);
        line.setAttribute("stroke", "#000");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
    }

    drawTree(node.left, node);
    drawTree(node.right, node);
}