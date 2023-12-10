var gameData = {
    items : {},
    handcrafting : "",
    unlockedPlanets : "Nauvis",
    lastOpenPlanet : "Nauvis",
}

var itemData = {
    name : "unset",
    amount : 0,
    storage : 100,
    crafters : 0,
    craftProgress : 0,
}

$(document).ready(function(){
    // Initially hide the "Star System" and "Galaxy" tabs
    document.getElementById('starsystemTab').style.display = 'none';
    document.getElementById('galaxyTab').style.display = 'none';

    var savegame = JSON.parse(localStorage.getItem("atahan-von-neuman-idle"))
    if (savegame !== null && typeof savegame === 'object' && 'items' in savegame) {
        gameData = savegame;
    }

    openPlanet(gameData.lastOpenPlanet);
});



function idleUpdate() {
   // Iterate through each item
   craftingItems.forEach(itemName => {
        const itemData = getItemData(itemName);
        const progressBar = document.getElementById(`progressBar_${itemName}`);
        var curCraftSteps = craftSteps(itemName);

        if(checkIfCanCraft(itemName)){

            // Update the progress bar
            if (progressBar) {
                var toAdd = itemData.crafters;
                if(itemData.name == gameData.handcrafting){
                    toAdd += 10;
                }

                itemData.craftProgress += toAdd;

                // Check if the progress bar is full
                while (itemData.craftProgress >= curCraftSteps && checkIfCanCraft(itemName)) {
                    itemData.craftProgress -= curCraftSteps;
                    craftAndDeduct(itemName);
                }
            }
        }

        if (progressBar) {
            progressBar.value = itemData.craftProgress;
            progressBar.max = curCraftSteps;
        }
    });
}


var mainGameLoop = window.setInterval(function() {
    idleUpdate()
}, 200)


var saveGameLoop = window.setInterval(function() {
    localStorage.setItem("atahan-von-neuman-idle", JSON.stringify(gameData))
}, 15000)



function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.content');

    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    const selectedTab = document.querySelector(`#${tabName}`);
    selectedTab.classList.add('active');
}

// Example: Unlocking the "Star System" tab
function unlockStarSystem() {
    // Update player logic to unlock content
    // ...

    // Show the "Star System" tab
    document.getElementById('starsystemTab').style.display = 'block';
}

function setHandCraftItem(itemName) {
    const prevOne = document.getElementById(`craftItem_${itemName}`);
    if(prevOne){
        const handcraftButton = prevOne.querySelector('#handcraft');
        if(handcraftButton){
            handcraftButton.textContent = "craft";
        }
    }

    if(gameData.handcrafting == itemName){
        gameData.handcrafting = "";
    }else{
        gameData.handcrafting = itemName;

        const currentOne = document.getElementById(`craftItem_${itemName}`);
        if(currentOne){
            const handcraftButton = currentOne.querySelector('#handcraft');
            if(handcraftButton){
                handcraftButton.textContent = "crafting";
            }
        }
    }
}

function addStorage(itemName) {
    var chests = getItemData('Chest');
    var data = getItemData(itemName);

    if(chests.amount > 0){
        data.storage += chestStorage;
    }
   

   updateItemPanel(itemName);
}

function assignCrafter(itemName, count) {
    var crafters = getItemData('Crafter');
    var data = getItemData(itemName);

    if(count < 0 || crafters.amount > 0){
        data.crafters += count;
        if(data.crafters < 0){
            data.crafters = 0;
        }

        crafters.amount -= count;
    }

    updateItemPanel(itemName);
}

function assignMiner(itemName, count) {
    var miners = getItemData('Miner');
    var data = getItemData(itemName);

    if(count < 0 || miners.amount > 0){
        data.crafters += count;
        if(data.crafters < 0){
            data.crafters = 0;
        }

        miners.amount -= count;
    }

    updateItemPanel(itemName);
}

function getItemData(itemName){
    if (gameData.items[itemName]) {
        return gameData.items[itemName];
    } else {
        const newItem = { ...itemData, name: itemName };
        gameData.items[itemName] = newItem;
        return newItem;
    }
}

function updateItemPanel (itemName){
    var data = getItemData(itemName);
    const craftItemDiv = document.getElementById(`craftItem_${itemName}`);
    if (craftItemDiv) {
        const crafterAmount = craftItemDiv.querySelector('.crafter');
        if (crafterAmount) {
         crafterAmount.textContent = `Assign Crafter - ${data.crafters}`;
        }

        const minerAmount = craftItemDiv.querySelector('.miner');
        if (minerAmount) {
            minerAmount.textContent = `Assign Miner - ${data.crafters}`;
        }

        const itemAmount = craftItemDiv.querySelector('.number-display');
        if(itemAmount){
            itemAmount.textContent = `${data.amount}/${data.storage}`;
        }

        const oreAmount = craftItemDiv.querySelector('.ore-number-display');
        if(oreAmount){
            var planet = planets[gameData.lastOpenPlanet];
            if(planet){
                oreAmount.textContent = planet.ores[itemName];
            }
        }
    }
}

const chestStorage = 100;
const craftingItems = ['Iron Ore', 'Copper Ore', 'Iron',  'Copper', 'Chest', 'Miner', 'Crafter'];
const craftingRecipes = {
    'Iron Ore':{
        ingredients : {
            'mined' : 1 
        },
        output : 1,
        steps : 100,
    },

    'Iron':{
        ingredients : {
            'Iron Ore' : 2 
        },
        output : 1,
        steps : 100,
    }
}

const planets = {
    'Nauvis' :{
        ores :{
            'Iron Ore' : 1000000,
            'Copper Ore' : 1000000,
        }
    }
}


function checkIfCanCraft (itemName){
    const recipe = craftingRecipes[itemName];

    if (recipe) {
        // Check if the player has enough ingredients
        for (const ingredient in recipe.ingredients) {
            if(ingredient == 'mined'){
                return true;
            }
            if (getItemData(ingredient).amount <= recipe.ingredients[ingredient]) {
                return false;
            }
        }
    }
    return true;
}

// make sure to check first
function craftAndDeduct (itemName){
    const recipe = craftingRecipes[itemName];

    if (recipe) {
        // Check if the player has enough ingredients
        for (const ingredient in recipe.ingredients) {
            if(ingredient == 'mined'){
                break;
            }
            getItemData(ingredient).amount -= recipe.ingredients[ingredient];
            updateItemPanel(ingredient);
        }
    }

    getItemData(itemName).amount += recipe.output;
    updateItemPanel(itemName);
}

function craftSteps (itemName){
    const recipe = craftingRecipes[itemName];
    if(recipe){
        return recipe.steps;
    }else{
        return 100;
    }
}

// Create crafting item sections dynamically
const craftItemsContainer = document.getElementById('craftItemsContainer');
craftingItems.forEach(itemName => {
    var recipe = craftingRecipes[itemName];
    var isMined = false;
    if(recipe){
        for (const ingredient in recipe.ingredients) {
            if(ingredient == 'mined'){
                isMined = true;
            }
        }
    }

    var data = getItemData(itemName);

    const craftItemDiv = document.createElement('div');
    craftItemDiv.className = 'craft-item';
    craftItemDiv.id = `craftItem_${itemName}`; // Unique identifier for each craft-item
    craftItemDiv.innerHTML = `
        <div class="item-info">
            <h3>${itemName}</h3>
            <span class="number-display">${data.amount}/${data.storage}</span>
        </div>
        <div class="craft-buttons">
            <button onclick="addStorage('${itemName}')">Add Storage</button>
            <span class="crafter">Assign Crafter - ${data.crafters}</span>
            <button onclick="assignCrafter('${itemName}', 1)">+</button>
            <button onclick="assignCrafter('${itemName}', -1)">-</button>
        </div>
    `;

    const craftDiv = document.createElement('div');
    craftDiv.className = 'crafting-info';
    
    if(!isMined){   
        const handcraftButton = document.createElement('button');
        handcraftButton.className = 'handcraft-button';
        handcraftButton.id = 'handcraft';
        handcraftButton.onclick = `setHandCraftItem('${itemName}')`;
        handcraftButton.textContent = 'Craft';

        craftDiv.appendChild(handcraftButton);

        const recipeDiv =document.createElement('div');
        recipeDiv.className = 'recipe-ingredients';
    
        
        if(recipe){
            for (const ingredient in recipe.ingredients) {
                const recipeIngredient = document.createElement('span');
                recipeIngredient.className = 'recipe-ingredient';
                recipeIngredient.textContent = `${ingredient} x${recipe.ingredients[ingredient]}`;
                recipeDiv.appendChild(recipeIngredient);
            }

            
            const arrow = document.createElement('span');
            arrow.textContent = " → ";
            recipeDiv.appendChild(arrow);

            
            const reciperesult = document.createElement('span');
            reciperesult.className = 'recipe-ingredient-output';
            reciperesult.textContent = `${itemName} x${recipe.output}`;
            recipeDiv.appendChild(reciperesult);

        }

        craftDiv.appendChild(recipeDiv);
        
    }else{
        const recipeIngredient = document.createElement('span');
        recipeIngredient.className = 'recipe-ingredient-mined';
        recipeIngredient.textContent = 'must be mined from the planet';
        craftDiv.appendChild(recipeIngredient);

    }

    craftItemDiv.appendChild(craftDiv);


    if(!isMined){
        const progressDiv = document.createElement('div');
        progressDiv.className = 'crafting-progress';

        const progressBar = document.createElement('progress');
        progressBar.id = `progressBar_${itemName}`;
        progressBar.value = 0;
        progressBar.max = 100;
        
        progressDiv.appendChild(progressBar);
        craftItemDiv.appendChild(progressDiv);
    }


    craftItemsContainer.appendChild(craftItemDiv);
    updateItemPanel(itemName);

});

function openPlanet(planetName){
    gameData.lastOpenPlanet = planetName;
    openTab('planet');
    const planetTab = document.getElementById('planetTab');
    planetTab.textContent = planetName;

    const planetItems = document.getElementById('planetItemsContainer');
    const planet = planets[planetName];

    if(planet){
        planetItems.innerHTML = '';
        for(const ore in planet.ores){
            var data = getItemData(ore);
            const craftItemDiv = document.createElement('div');
            craftItemDiv.className = 'mined-item';
            craftItemDiv.id = `craftItem_${ore}`; // Unique identifier for each craft-item
            craftItemDiv.innerHTML = `
                <div class="item-info">
                    <h3>${ore}</h3>
                    <span class="ore-number-display">${planet.ores[ore]}</span>
                </div>
                <div class="craft-buttons">
                    <button onclick="addStorage('${ore}')">Add Storage</button>
                    <span class="miner">Assign Miner - ${data.crafters}</span>
                    <button onclick="assignMiner('${ore}', 1)">+</button>
                    <button onclick="assignMiner('${ore}', -1)">-</button>
                </div>
            `;

            const craftDiv = document.createElement('div');
            craftDiv.className = 'crafting';

            const handcraftButton = document.createElement('button');
            handcraftButton.className = 'handcraft-button';
            handcraftButton.id = 'handcraft';
            handcraftButton.onclick = `setHandCraftItem('${ore}')`;
            handcraftButton.textContent = 'Mine';

            craftDiv.appendChild(handcraftButton);

            const progressBar = document.createElement('progress');
            progressBar.id = `progressBar_${ore}`;
            progressBar.value = 0;
            progressBar.max = 100;

            var recipe = craftingRecipes[ore];

            const recipeIngredient = document.createElement('span');
            recipeIngredient.className = 'recipe-ingredient-mined';
            recipeIngredient.textContent = 'mined';
            craftDiv.appendChild(recipeIngredient);
        
            const arrow = document.createElement('span');
            arrow.textContent = " ->";
            craftDiv.appendChild(arrow);
    

            craftDiv.appendChild(progressBar);

            craftItemDiv.appendChild(craftDiv);

            planetItems.appendChild(craftItemDiv);
            updateItemPanel(ore);
        }
    }
}






/// utils

function resetSave() {
    // Clear the save data in local storage
    localStorage.removeItem("atahan-von-neuman-idle");

    // Refresh the page
    location.reload();
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}