const content = document.getElementById("content");
const contentCopy = content.innerHTML;
const work = document.getElementById("work");
let square1Pos = 0;
let square2Pos = 0;
let square1Direction = "down";
let square2Direction = "right";
let intervalId = 0;
let recordId = 1;
let recordsFromServer;
const recordsFromLocal = [];

function PlayClick(){
    content.style.padding = "0";
    content.innerHTML = "";
    work.innerHTML = "";
    work.innerHTML += "<div id='controls'></div><div id='anim'><div id='quad1'></div><div id='quad2'></div><div id='quad3'>" +
        "</div><div id='quad4'></div></div>";
    content.appendChild(work);
    const anim = document.getElementById("anim");
    const controls = document.getElementById("controls");
    work.style.display = "flex";
    work.style.flexDirection = "column";
    work.style.margin = "0";
    work.style.height = "100%";
    work.style.width = "100%";
    anim.style.flex = "1";
    anim.style.flexDirection = "column";
    anim.style.height = "calc(100% - 50px)";
    anim.style.minHeight = "600px";
    anim.style.border = "solid orange 5px";
    anim.style.backgroundImage = "url('img/bg.png')"
    controls.style.maxHeight = "50px";
    controls.style.minHeight = "50px";
    controls.style.flex = "1";
    controls.style.display = "grid";
    controls.style.gridTemplateColumns = "1fr auto auto";
    controls.style.gridTemplateRows = "auto";
    controls.style.gridArea = "'info button button'";
    controls.innerHTML += "<p id='info'>Info...</p>";
    const info = document.getElementById("info");
    info.style.fontSize = "13px";
    info.style.justifySelf = "start";
    controls.innerHTML += "<button id='startAnimButton' onclick='StartAnimation()'>Start</button> ";
    controls.innerHTML += "<button id='closeButton' onclick='CloseClick()'>Close</button>";
}

async function CloseClick(){
    content.innerHTML = "";
    content.innerHTML = contentCopy;
    content.style.padding = "1em";
    square1Pos = 0;
    square2Pos = 0;
    square1Direction = "down";
    square2Direction = "right";
    clearInterval(intervalId);
    await fetch('http://localhost:5253/api/get')
        .then(response => response.json())
        .then(records => {
            console.log(records);
            recordsFromServer = records;
        })
        .catch(error => console.error('Error loading objects:', error));
    for (let i = 0; i < recordsFromServer.length; i++) {
        recordsFromLocal.push(localStorage.getItem((i + 1).toString()));
    }
    localStorage.clear();

    recordId = 1;
    content.innerHTML += "<br>";
    const table = document.createElement("table");
    table.style.border = "1px solid black";
    table.style.width = "100%";
    table.style.fontSize = "12px";
    table.style.borderCollapse = "collapse";
    table.style.borderSpacing = "0";

    const item4 = document.getElementsByClassName("item4")[0];
    item4.appendChild(table);

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = ["id", "Local", "Server"];
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        th.style.border = "1px solid black";
        th.style.padding = "8px";
        th.style.backgroundColor = "#f2f2f2";
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (let i = 0; i < recordsFromServer.length; i++) {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = recordsFromServer[i].id;
        idCell.style.border = "1px solid black";
        idCell.style.padding = "8px";
        row.appendChild(idCell);

        const localCell = document.createElement("td");
        localCell.textContent = recordsFromLocal[i] ? recordsFromLocal[i] : "No message";
        localCell.style.border = "1px solid black";
        localCell.style.padding = "8px";
        row.appendChild(localCell);

        const serverCell = document.createElement("td");
        serverCell.textContent = recordsFromServer[i].message;
        serverCell.style.border = "1px solid black";
        serverCell.style.padding = "8px";
        row.appendChild(serverCell);

        tbody.appendChild(row);
    }
    table.appendChild(tbody);
}

async function StartAnimation(){
    const animButton = document.getElementById("startAnimButton");
    animButton.innerText = "Stop";
    animButton.onclick = RestartClick;
    const anim = document.getElementById("anim");
    anim.innerHTML += "<div id='square1'></div><div id='square2'></div>";
    const square1 = document.getElementById("square1");
    const square2 = document.getElementById("square2");
    square1.style.width = "20px";
    square1.style.height = "20px";
    square1.style.border = "2px solid green";
    square1.style.backgroundColor = "rgba(0, 128, 0, 0.5)";
    square1.style.position = "relative";
    square1.style.zIndex = "2";
    square1.style.left = "calc(50% - 10px)";
    square2.style.width = "10px";
    square2.style.height = "10px";
    square2.style.border = "2px solid red";
    square2.style.backgroundColor = "rgba(128, 0, 0, 0.5)";
    square2.style.position = "relative";
    square2.style.zIndex = "3";
    square2.style.top = "calc(50% - 5px)";
    square1Pos = 0;
    square2Pos = 0;
    square1Direction = "down";
    square2Direction = "right";
    let date = new Date();
    document.getElementById("info").textContent = date.toLocaleString() + " - Натиснуто кнопку початку анімації";
    const record = {
        id: recordId.toString(),
        message: " - Натиснуто кнопку початку анімації"
    };

    localStorage.setItem(record.id, date.toLocaleString() + record.message);
    await SaveRecord(record);
    intervalId = setInterval(UpdateAnim, 5);
}

async function UpdateAnim() {
    let date = new Date();
    const record = {
        id: recordId.toString(),
        message: ""
    };
    const square1 = document.getElementById("square1");
    const square2 = document.getElementById("square2");

    if (square1Direction === "down") {
        if (square1Pos + 3 <= work.offsetHeight - 75){
            square1Pos += 3;
        } else {
            square1Direction = "up";
            square1Pos -= 3;
            document.getElementById("info").textContent = date.toLocaleString() + " - Червоний квадрат відштовхнувся";
            record.message = " - Червоний квадрат відштовхнувся";
            recordId++;
            record.id = recordId.toString();
            await SaveRecord(record);
            localStorage.setItem(record.id, date.toLocaleString() + record.message);
        }
    } else {
        if (square1Pos - 3 > 0){
            square1Pos -= 3;
        } else {
            square1Direction = "down";
            square1Pos += 3;
            document.getElementById("info").textContent = date.toLocaleString() + " - Червоний квадрат відштовхнувся";
            record.message = " - Червоний квадрат відштовхнувся";
            recordId++;
            record.id = recordId.toString();
            await SaveRecord(record);
            localStorage.setItem(record.id, date.toLocaleString() + record.message);
        }
    }
    square1.style.top = square1Pos.toString() + "px";

    if (square2Direction === "right") {
        if (square2Pos + 2 <= work.offsetWidth - 15){
            square2Pos += 2;
        } else {
            square2Direction = "left";
            square2Pos -= 2;
            document.getElementById("info").textContent = date.toLocaleString() + " - Зелений квадрат відштовхнувся";
            record.message = " - Зелений квадрат відштовхнувся";
            recordId++;
            record.id = recordId.toString();
            await SaveRecord(record);
            localStorage.setItem(record.id, date.toLocaleString() + record.message);
        }
    } else {
        if (square2Pos - 2 > 0){
            square2Pos -= 2;
        } else {
            square2Direction = "right";
            square2Pos += 2;
            document.getElementById("info").textContent = date.toLocaleString() + " - Зелений квадрат відштовхнувся";
            record.message = " - Зелений квадрат відштовхнувся";
            recordId++;
            record.id = recordId.toString();
            await SaveRecord(record);
            localStorage.setItem(record.id, date.toLocaleString() + record.message);
        }
    }
    square2.style.left = square2Pos.toString() + "px";

    if (square1.offsetTop <= square2.offsetTop
                && square1.offsetTop + 20 >= square2.offsetTop + 10
                && square1.offsetLeft <= square2.offsetLeft
            && square1.offsetLeft + 20 >= square2.offsetLeft + 10){
        clearInterval(intervalId);
        document.getElementById("info").textContent = date.toLocaleString() + " - Червоний квадрат повністю містить зелений";
        record.message = " - Червоний квадрат повністю містить зелений";
        recordId++;
        record.id = recordId.toString();
        localStorage.setItem(record.id, date.toLocaleString() + record.message);
        await SaveRecord(record);
        const button = document.getElementById("startAnimButton");
        button.id = "startAnimButton";
        button.innerText = "Start";
        button.onclick = StartAnimation;
    } else {
        document.getElementById("info").textContent = date.toLocaleString() + " - Квадрати рухаються далі";
        record.message = " - Квадрати рухаються далі";
        recordId++;
        record.id = recordId.toString();
        localStorage.setItem(record.id, date.toLocaleString() + record.message);
        await SaveRecord(record);
    }
}

async function RestartClick(){
    const button = document.getElementById("startAnimButton");
    let date = new Date();
    document.getElementById("info").textContent = date.toLocaleString() + " - Натиснуто кнопку перезапуску анімації";
    recordId++;
    const record = {
        id: recordId.toString(),
        message: " - Натиснуто кнопку зупинки анімації"
    };
    localStorage.setItem(record.id, date.toLocaleString() + record.message);
    await SaveRecord(record);
    button.innerText = "Start";
    button.onclick = StartAnimation;
    square1Pos = 0;
    square2Pos = 0;
    square1Direction = "down";
    square2Direction = "right";
    clearInterval(intervalId);
}

async function SaveRecord(message) {
    fetch('http://localhost:5253/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    })
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
        });
}