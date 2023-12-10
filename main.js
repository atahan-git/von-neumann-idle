var gameData = {
    items : {},
    planets : {},
    unlockedPlanets : "Novara",
    lastOpenPlanet : "Novara",
    // handcraftQueue : [],
    unlockedStorage : false,
    unlockedMiner : false,
    unlockedChest : false,
}

var itemData = {
    name : "unset",
    amount : 0,
    storage : 10,
    crafters : 0,
    craftProgress : 0,
    visible : false,
}

var planetData = {
    name : "unset",
    ores :{}
}

var planetOreData = {
    amount : 0,
    miners : 0,
    mineProgress : 0
}

$(document).ready(function(){
    // Initially hide the "Star System" and "Galaxy" tabs
    document.getElementById('starsystemTab').style.display = 'none';
    document.getElementById('galaxyTab').style.display = 'none';

    var savegame = JSON.parse(localStorage.getItem("atahan-von-neuman-idle"))
    if (savegame !== null && typeof savegame === 'object' && 'items' in savegame) {
        gameData = savegame;
    }else{
        // getItemData('Miner').amount = 10;
        // getItemData('Crafter').amount = 10;
    }

    generateItemContainers();

    openPlanet(gameData.lastOpenPlanet);
    var prevHandcraftItem = gameData.handcrafting;
    setHandCraftItem("");
    setHandCraftItem(prevHandcraftItem);

    setUnlockState();
});



function idleUpdate() {
   // Iterate through each item
   craftingItems.forEach(itemName => {
        const itemData = getItemData(itemName);
        const progressBar = document.getElementById(`progressBar_${itemName}`);
        var curCraftSteps = craftSteps(itemName);

        if(checkIfCanCraft(itemName)){
            var toAdd = itemData.crafters;

            itemData.craftProgress += toAdd;

            while (itemData.craftProgress >= curCraftSteps && checkIfCanCraft(itemName)) {
                itemData.craftProgress -= curCraftSteps;
                craftAndDeduct(itemName);
            }
        }

        if (progressBar) {
            progressBar.value = itemData.craftProgress;
            progressBar.max = curCraftSteps;
        }
    });

    for (const planetName in gameData.planets) {
        var planetData = gameData.planets[planetName];

        for(const oreName in planetData.ores){
            const itemData = getItemData(oreName);
            const oreData = planetData.ores[oreName];
            const progressBar = document.getElementById(`progressBarOre_${oreName}`);
            var curCraftSteps = craftSteps(oreName);

            if(checkIfCanMine(oreName, planetData)){
                var toAdd = oreData.miners;

                oreData.mineProgress += toAdd;

                while (oreData.mineProgress >= curCraftSteps && checkIfCanMine(oreName, planetData)) {
                    oreData.mineProgress -= curCraftSteps;
                    mineAndDeduct(oreName, planetData);
                }
            }
    
            if (progressBar) {
                progressBar.value = oreData.mineProgress;
                progressBar.max = curCraftSteps;
            }
        }
    }

    checkUnlocks();

    
   craftingItems.forEach(itemName => {
        updateItemPanel(itemName);
   });
}

function checkUnlocks (){
    if(!gameData.unlockedCrafter){
        if(getItemData('Crafter').amount > 0){
            gameData.unlockedCrafter = true;
            setUnlockState();
        }
    }
    if(!gameData.unlockedMiner){
        if(getItemData('Miner').amount > 0){
            gameData.unlockedMiner = true;
            setUnlockState();
        }
    }
    if(!gameData.unlockedChest){
        if(getItemData('Chest').amount > 0){
            gameData.unlockedChest = true;
            setUnlockState();
        }
    }
}

function setUnlockState (){
    craftingItems.forEach(itemName => {
        const craftItemDivAll = document.querySelectorAll(`#craftItem_${itemName}`);
        craftItemDivAll.forEach(craftItemDiv => {
            const storageButton = craftItemDiv.querySelector('.storage-zone');
            if(storageButton){
                if(gameData.unlockedChest){
                    storageButton.style.display = '';
                }else{
                    storageButton.style.display = 'none';
                }
            }

            const crafterArea = craftItemDiv.querySelector('.crafter-zone');
            if(crafterArea){
                if(gameData.unlockedCrafter){
                    crafterArea.style.display = '';
                }else{
                    crafterArea.style.display = 'none';
                }
            }

            const minerArea = craftItemDiv.querySelector('.miner-zone');
            if(minerArea){
                if(gameData.unlockedMiner){
                    minerArea.style.display = '';
                }else{
                    minerArea.style.display = 'none';
                }
            }
        });
    });
}

var mainGameLoop = window.setInterval(function() {
    idleUpdate()
}, 200)


var saveGameLoop = window.setInterval(function() {
    saveData();
}, 15000)

function saveData (){
    if(!supressSave){
        localStorage.setItem("atahan-von-neuman-idle", JSON.stringify(gameData))
    }
}

window.addEventListener('beforeunload', function (event) {
    saveData();
    event.returnValue = ''; // Standard for most browsers
  });


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
    // const prevOne = document.getElementById(`craftItem_${itemName}`);
    // if(prevOne){
    //     const handcraftButton = prevOne.querySelector('#handcraft');
    //     if(handcraftButton){
    //         handcraftButton.textContent = "Craft";
    //     }

    //     const handcraftButtonMine = prevOne.querySelector('#handcraft-ore');
    //     if(handcraftButtonMine){
    //         handcraftButtonMine.textContent = "Mine";
    //     }
    // }

    // if(gameData.handcrafting == itemName){
    //     gameData.handcrafting = "";
    // }else{
    //     gameData.handcrafting = itemName;

    //     const currentOne = document.getElementById(`craftItem_${itemName}`);
    //     if(currentOne){
    //         const handcraftButton = currentOne.querySelector('#handcraft');
    //         if(handcraftButton){
    //             handcraftButton.textContent = "Crafting";
    //         }

    //         const handcraftButtonMine = prevOne.querySelector('#handcraft-ore');
    //         if(handcraftButtonMine){
    //             handcraftButtonMine.textContent = "Mining";
    //         }
    //     }
    // }
}

var handcraftStrength = 25;
function handcraftItem (itemName){
    var itemData = getItemData(itemName);
    var curCraftSteps = craftSteps(itemName);

    if(checkIfCanCraft(itemName)){
        itemData.craftProgress += handcraftStrength;

        // Check if the progress bar is full
        while (itemData.craftProgress >= curCraftSteps && checkIfCanCraft(itemName)) {
            itemData.craftProgress -= curCraftSteps;
            craftAndDeduct(itemName);
        }
    }

    const progressBar = document.getElementById(`progressBar_${itemName}`);
    if (progressBar) {
        progressBar.value = itemData.craftProgress;
        progressBar.max = curCraftSteps;
    }

    craftingItems.forEach(itemName => {
        updateItemPanel(itemName);
   });
}

function handmineItem (oreName){
    var planetData = getCurrentPlanet();
    const oreData = planetData.ores[oreName];
    var curCraftSteps = craftSteps(oreName);

    if(checkIfCanMine(oreName, planetData)){
        oreData.mineProgress += handcraftStrength;

        while (oreData.mineProgress >= curCraftSteps && checkIfCanMine(oreName, planetData)) {
            oreData.mineProgress -= curCraftSteps;
            mineAndDeduct(oreName, planetData);
        }
    }

    const progressBar = document.getElementById(`progressBarOre_${oreName}`);
    if (progressBar) {
        progressBar.value = oreData.mineProgress;
        progressBar.max = curCraftSteps;
    }

    craftingItems.forEach(itemName => {
        updateItemPanel(itemName);
   });
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
    var oreData = getCurrentPlanet().ores[itemName];

    if(count < 0 || miners.amount > 0){
        oreData.miners += count;
        if(oreData.miners < 0){
            oreData.miners = 0;
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
    const craftItemDivAll = document.querySelectorAll(`#craftItem_${itemName}`);
    craftItemDivAll.forEach(craftItemDiv => {
        const crafterAmount = craftItemDiv.querySelector('.crafter');
        if (crafterAmount) {
         crafterAmount.textContent = `Assign Crafter - ${data.crafters}`;
        }

        const minerAmount = craftItemDiv.querySelector('.miner');
        if (minerAmount) {
            minerAmount.textContent = `Assign Miner - ${getCurrentPlanet().ores[itemName].miners}`;
        }

        const itemAmount = craftItemDiv.querySelector('.number-display');
        if(itemAmount){
            itemAmount.textContent = `${data.amount}/${data.storage}`;
        }

        const oreAmount = craftItemDiv.querySelector('.ore-number-display');
        if(oreAmount){
            var planet = getCurrentPlanet();
            if(planet){
                oreAmount.textContent = planet.ores[itemName].amount;
            }
        }

        const ingredients = craftItemDiv.querySelectorAll(`#recipe-ingredient`);
        var hasAtLeastOneIngredient = false;
        ingredients.forEach(ingredientDiv =>{
            var recipeItemData = getItemData(ingredientDiv.recipeItem);
            var recipeItemAmount = ingredientDiv.recipeAmount;

            hasAtLeastOneIngredient = hasAtLeastOneIngredient || recipeItemData.amount >= recipeItemAmount;

            if(recipeItemData.amount < recipeItemAmount){
                ingredientDiv.className = `recipe-ingredient-notenough`;
            }else{
                ingredientDiv.className = `recipe-ingredient`;
            }
        });
        
        const handcraftButton = craftItemDiv.querySelector('#handcraft');
        if(handcraftButton){
            handcraftButton.disabled  = !checkIfCanCraft(itemName);
        }

        const handcraftButtonMine = craftItemDiv.querySelector('#handcraft-ore');
        if(handcraftButtonMine){
            handcraftButtonMine.disabled  = !checkIfCanMine(itemName, getCurrentPlanet());
        }

        if(!data.visible){
            if(data.amount > 0 || hasAtLeastOneIngredient){
                craftItemDiv.style.display = '';
            }
        }
    });

    if(!data.visible){
        if(data.amount > 0 || checkIfCanCraft(itemName)){
            data.visible = true;
        }
    }
}

function getCurrentPlanet (){
    return getPlanet(gameData.lastOpenPlanet);
}

function getPlanet(planetName){
    if (gameData.planets[planetName]) {
        return gameData.planets[planetName];
    } else {
        addPlanet(planetName);
        return gameData.planets[planetName];
    }
}

function addPlanet (planetName){
    const newPlanet = { ...planetData, name: planetName };
    gameData.planets[planetName] = newPlanet
    var planetProto = planetPrototypes[planetName];
    
    for (const oreData in planetProto.ores) {
        newPlanet.ores[oreData] = {...planetOreData};
        newPlanet.ores[oreData].amount = planetProto.ores[oreData].amount;
        newPlanet.ores[oreData].miners = planetProto.ores[oreData].miners;
    }
}


const chestStorage = 10;
const craftingItems = ['Iron-Ore', 'Copper-Ore', 'Iron',  'Copper', 'Chest', 'Chips', 'Miner', 'Crafter'];
const craftingRecipes = {
    'Iron-Ore':{
        ingredients : {
            'mined' : 1 
        },
        output : 1,
        steps : 100,
    },

    'Iron':{
        ingredients : {
            'Iron-Ore' : 2 
        },
        output : 1,
        steps : 100,
    },

    'Copper-Ore':{
        ingredients : {
            'mined' : 1 
        },
        output : 1,
        steps : 100,
    },

    'Copper':{
        ingredients : {
            'Copper-Ore' : 2 
        },
        output : 1,
        steps : 100,
    },

    'Chest' :{
        ingredients : {
            'Iron' : 10
        },
        output : 1,
        steps : 200,
    },

    'Miner' :{
        ingredients : {
            'Chips' : 1,
            'Iron' : 3
        },
        output : 1,
        steps : 300,
    },

    'Crafter' :{
        ingredients : {
            'Chips' : 2,
            'Iron' : 8,
            'Copper' : 4,
        },
        output : 1,
        steps : 500,
    },

    'Chips' :{
        ingredients : {
            'Iron' : 1,
            'Copper' : 2,
        },
        output : 1,
        steps : 100,
    },
}

const planetPrototypes = {
    'Novara' :{
        ores :{
            'Iron-Ore' : {
                amount : 2000000,
                miners : 0
            },
            'Copper-Ore' : {
                amount : 1000000,
                miners : 0
            },
        }
    }
}

// function checkRecursiveIfCanCraft (itemName){
//     const recipe = craftingRecipes[itemName];
//     const itemData = getItemData(itemName)
//     if(itemData.amount >= itemData.storage){
//         return false;
//     }

//     if (recipe) {
//         // Check if the player has enough ingredients
//         for (const ingredient in recipe.ingredients) {
//             var ingredientData = getItemData(ingredient);
//             if(ingredientData.amount >= recipe.ingredients[ingredient]){
//                 continue;
//             }else{
//                 if(ingredient == 'mined'){
//                     return false;
//                 }else if(!checkRecursiveIfCanCraft(ingredient)){
//                     return false;
//                 }
//             }
//         }
//     }
//     return true;
// }

// function addRecursiveHandcraftQueue (itemName, count){
//     gameData.handcraftQueue.add(
//         {...itemData, name:itemName, amount : count,  }
//         );

//     const recipe = craftingRecipes[itemName];

//     if (recipe) {
//         // Check if the player has enough ingredients
//         for (const ingredient in recipe.ingredients) {
//             var ingredientData = getItemData(ingredient);
//             if(ingredientData.amount >= recipe.ingredients[ingredient]){
//                 continue;
//             }else{
//                 if(ingredient == 'mined'){
//                     return false;
//                 }else if(!checkRecursiveIfCanCraft(ingredient)){
//                     return false;
//                 }
//             }
//         }
//     }
    
// }

function checkIfCanCraft (itemName){
    const recipe = craftingRecipes[itemName];
    const itemData = getItemData(itemName)
    if(itemData.amount >= itemData.storage){
        return false;
    }

    if (recipe) {
        // Check if the player has enough ingredients
        for (const ingredient in recipe.ingredients) {
            if(ingredient == 'mined'){
                return false;
            }
            var ingredientData = getItemData(ingredient);
            if (ingredientData.amount < recipe.ingredients[ingredient]) {
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
}

function checkIfCanMine(itemName, planet){
    const itemData = getItemData(itemName);
    if(itemData.amount >= itemData.storage){
        return false;
    }

    var oreThing = planet.ores[itemName];
    if(oreThing){
        if(oreThing.amount > 0){
            return true;
        }
    }
    return false;
}

function mineAndDeduct (itemName, planet){
    var oreThing = planet.ores[itemName];
    if(oreThing){
        oreThing.amount -= 1;
        getItemData(itemName).amount += 1;
    }
}

function craftSteps (itemName){
    const recipe = craftingRecipes[itemName];
    if(recipe){
        return recipe.steps;
    }else{
        return 100;
    }
}


function generateItemContainers (){
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
                <div class="storage-zone">
                    <button onclick="addStorage('${itemName}')">Add Storage</button>
                </div>
                <div class="crafter-zone">
                    <span class="crafter">Assign Crafter - ${data.crafters}</span>
                    <button onclick="assignCrafter('${itemName}', 1)">+</button>
                    <button onclick="assignCrafter('${itemName}', -1)">-</button>
                </div>
            </div>
        `;

        const craftDiv = document.createElement('div');
        craftDiv.className = 'crafting-info';
        
        if(!isMined){   
            const handcraftButton = document.createElement('button');
            handcraftButton.className = 'handcraft-button';
            handcraftButton.id = 'handcraft';
            handcraftButton.onclick = function() {
                handcraftItem(itemName);
            };
            handcraftButton.textContent = 'Craft';

            craftDiv.appendChild(handcraftButton);

            const recipeDiv =document.createElement('div');
            recipeDiv.className = 'recipe-ingredients';
        
            
            if(recipe){
                for (const ingredient in recipe.ingredients) {
                    const recipeIngredient = document.createElement('span');
                    recipeIngredient.id = `recipe-ingredient`;
                    recipeIngredient.className = 'recipe-ingredient';
                    recipeIngredient.recipeItem = ingredient;
                    recipeIngredient.recipeAmount = recipe.ingredients[ingredient];
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
        if(!data.visible){
            craftItemDiv.style.display = 'none';
        }
        updateItemPanel(itemName);

    });
}


function openPlanet(planetName){
    gameData.lastOpenPlanet = planetName;
    openTab('planet');
    const planetTab = document.getElementById('planetTab');
    planetTab.textContent = planetName;

    const planetItems = document.getElementById('planetItemsContainer');
    const planet = getPlanet(planetName);

    if(planet){
        planetItems.innerHTML = '';
        for(const ore in planet.ores){
            var data = getItemData(ore);
            var oreData = planet.ores[ore];
            const craftItemDiv = document.createElement('div');
            craftItemDiv.className = 'mined-item';
            craftItemDiv.id = `craftItem_${ore}`; // Unique identifier for each craft-item
            craftItemDiv.innerHTML = `
                <div class="item-info">
                    <h3>${ore}</h3>
                    <span class="ore-number-display">${oreData.amount}</span>
                </div>
                <div class="craft-buttons">
                    <div class="miner-zone">
                        <span class="miner">Assign Miner - ${oreData.miners}</span>
                        <button onclick="assignMiner('${ore}', 1)">+</button>
                        <button onclick="assignMiner('${ore}', -1)">-</button>
                    </div>
                </div>
            `;

            const craftDiv = document.createElement('div');
            craftDiv.className = 'crafting-info';

            const handcraftButton = document.createElement('button');
            handcraftButton.className = 'handcraft-button';
            handcraftButton.id = 'handcraft-ore';
            handcraftButton.onclick = function() {
                handmineItem(ore);
              };
            handcraftButton.textContent = 'Mine';

            craftDiv.appendChild(handcraftButton);

            

            const recipeDiv =document.createElement('div');
            recipeDiv.className = 'recipe-ingredients';

            
            var recipe = craftingRecipes[ore];

            if(recipe){
                const recipeIngredient = document.createElement('span');
                recipeIngredient.className = 'recipe-ingredient-mined';
                recipeIngredient.textContent = 'mine';
                recipeDiv.appendChild(recipeIngredient);
            
                const arrow = document.createElement('span');
                arrow.textContent = " → ";
                recipeDiv.appendChild(arrow);

                const reciperesult = document.createElement('span');
                reciperesult.className = 'recipe-ingredient-output';
                reciperesult.textContent = `${ore} x${recipe.output}`;
                recipeDiv.appendChild(reciperesult);
            }
            
            
            craftDiv.appendChild(recipeDiv);

            craftItemDiv.appendChild(craftDiv);

            const progressDiv = document.createElement('div');
            progressDiv.className = 'crafting-progress';
    
            const progressBar = document.createElement('progress');
            progressBar.id = `progressBarOre_${ore}`;
            progressBar.value = 0;
            progressBar.max = 100;
            
            progressDiv.appendChild(progressBar);
            craftItemDiv.appendChild(progressDiv);

            planetItems.appendChild(craftItemDiv);
            updateItemPanel(ore);
        }
    }
}






/// utils

var supressSave = false;
function resetSave() {
    // Clear the save data in local storage
    localStorage.removeItem("atahan-von-neuman-idle");
    supressSave = true;

    // Refresh the page
    location.reload();
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}