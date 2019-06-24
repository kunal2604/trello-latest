var token = "4ce752c63440680067488d676bd581baa7c7cdf75c88ce5d79e3233d083792b3";
var key = "765e4970c4a31c132fd0a17307d1c75f";
var listID = "5d069ad06811908dd6f6d618";

let get = async function (url) {
    try {
        let data = await fetch(url);
        return data.json();
    } catch (error) {
        console.log(error);
    }
}
let getCardIDs = async function (listId) {
    try {
        let url = `https://api.trello.com/1/lists/${listId}/cards?key=${key}&token=${token}`;
        let dataCards = await get(url);
        return dataCards.map(item => item["id"]);
    } catch (error) {
        console.log(error);
    }
}
async function getCheckItems(listId) {
    try {
        let cardIDs = await getCardIDs(listId);
        cardIDs.forEach(async (cardID) => {
            let url = `https://api.trello.com/1/cards/${cardID}/checklists?${key}'&token=${token}`;
            let dataChecklists = await get(url);
            dataChecklists.forEach(checklist => {
                displayItems(checklist);
            });
        });
    } catch (error) {
        console.log(error);
    }
}

function displayItems(checklist) {
    let cardID = checklist["idCard"];
    checklist["checkItems"].forEach(item => {
        let tempHTML = `<li class="list-group-item">
            <input type="checkbox" class=${item.state} ${item.state === "complete" ? "checked" : null} card-id=${cardID} checkitem-Id=${item.id}>
            <span class=${item.state} id="itemName">${item.name}</span>
            <button class="btn btn-dark" id='delete' card-id=${cardID} checkitem-Id=${item.id}>DELETE</button>
            </li>`
        $('.list-group').append(tempHTML);

    });
}
// FUNCTION CALLING
getCheckItems(listID);

async function updateData(event) {
    event.preventDefault();
    let cardID = $(this).attr('card-id');
    let itemID = $(this).attr('checkitem-Id');
    let state = this.checked ? "complete" : "incomplete";

    try {
        let url = `https://api.trello.com/1/cards/${cardID}/checkItem/${itemID}?state=${state}&key=${key}&token=${token}`;
        let updateRequest = await fetch(url, {
            method: 'PUT'
        });

        if (updateRequest.status === 200) {
            $(this).siblings('#itemName').attr('class', state)
        }
    } catch (error) {
        console.log(error);
    }
}

// async function deleteData(event) {
//     event.preventDefault();
//     let cardID = $(this).attr('card-id');
//     let itemID = $(this).attr('checkitem-Id');
//     try {
//         let url = `https://api.trello.com/1/cards/${cardID}/checkItem/${itemID}?key=${key}&token=${token}`;
//         let deleteRequest = await fetch(url, {
//             method: 'DELETE'
//         });
//         if (deleteRequest.status === 200) {
//             $(this).parent().remove();
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }

function deleteData(event) {
    event.preventDefault();
    let cardID = $(this).attr('card-id');
    let itemID = $(this).attr('checkitem-Id');
    let url = `https://api.trello.com/1/cards/${cardID}/checkItem/${itemID}?key=${key}&token=${token}`;
    fetch(url, {method: 'DELETE'})
        .then(data => data.status === 200 ? $(this).parent().remove() : console.log(data.status));
}


function addData(event) {
    event.preventDefault();
    let checklistID = "5d0b4c29ba9b4607ee098305";
    let cardID = '5d0b4c29ba9b4607ee098304'

    $('input[type="Text"]').keyup(async function (event) {
        if (event.keyCode === 13) {
            let inputdata = $(this).val()
            $(this).val('')

            try {
                let addRequest = await fetch(`https://api.trello.com/1/checklists/${checklistID}/checkItems?name=${inputdata}&key=${key}&token=${token}`, {
                    method: 'POST'
                })
                let item = await addRequest.json();
                if (addRequest.status === 200) {
                    let html = `<li class="list-group-item">
                <input type="checkbox" class=${item.state} ${item.state === "complete" ? "checked" : null} data-state="${item.state}" card-id=${cardID} checkitem-Id=${item.id}>
                <span class=${item.state} id="itemName">${item.name}</span>
                <button class="btn btn-dark" id='delete' card-id=${cardID} checkitem-Id=${item.id}>DELETE</button>
                </li>
                `
                    $('.list-group').append(html);
                }
            } catch (error) {
                console.log(error)
            }
        }
    });
}

$('#items').on('change', 'input', updateData);
$('#items').on('click', 'button', deleteData);
$('#input-text').on('click', '#add-text', addData);