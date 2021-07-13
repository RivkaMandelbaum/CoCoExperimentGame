/* -------------------------------------------------------------------------- */
/* Functions that deal with artworks.                                         */
/* Author: Rivka Mandelbaum                                                   */
/* -------------------------------------------------------------------------- */

// creates Artwork objects to return (helper to getArtworks)
function Artwork(name, id, filepath, value) { 
    this.name = name;
    this.id = id;
    this.filepath = filepath;
    this.value = value;
}

// create array of images with randomized position and add positions to dictionary
// for choices (if not copying) or stimulus (if copying) in art display rounds
async function artArray(add_img_tag, curr_index) { 
    const img_array = await getArtworks(offlineMode, numExecutions);
    const len = img_array.length; 

    // create a dictionary of shuffled positions 
    let arr = [];
    for(let i = 0; i < len; i++) arr.push(i);
    let shuffled = jsPsych.randomization.shuffle(arr);
    
    // add images to array in order they will appear
    let order = []; 
    for(let i = 0; i < len; i++) { 
        pos = shuffled[i];
        
        if (add_img_tag) arr[i] = `<img src = ${img_array[pos].filepath}></img>`;
        else arr[i] = img_array[pos].filepath;

        // save the order
        order.push(img_array[pos]);
    }

    // save the current order to the global object
    orderLookup[curr_index] = order;

    return arr;
} 

// returns a random artwork from the given trial
function rand_art(trial_index) { 
    let random_choice = Math.floor((Math.random() * NUM_IMAGES));
    let arts = getDataAtIndex(trial_index).order;
    return arts[random_choice];
}


// returns hard-coded artworks
function offlineArts(round) { 
    let all_arts = [{ name: "KnowingCalm_69", id: 0, filepath: "../static/images/artworks/KnowingCalm_69.jpeg", value: 1},
    { name: "ScalingColors_69", id: 1, filepath: "../static/images/artworks/ScalingColors_69.jpeg", value: 1},
    { name: "PhoneCalls_79", id: 2, filepath: "../static/images/artworks/PhoneCalls_79.jpeg", value: 2},
    { name: "WrappedUp_79", id: 3, filepath: "../static/images/artworks/WrappedUp_79.jpeg", value: 2},
    { name: "NoahsArk_79", id: 4, filepath: "../static/images/artworks/NoahsArk_79.jpeg", value: 2},
    { name: "GhostMonster_69", id: 5, filepath: "../static/images/artworks/GhostMonster_69.jpeg", value: 1},
    { name: "DismemberedEnthusiast_79", id: 6, filepath: "../static/images/artworks/DismemberedEnthusiast_79.jpeg", value: 2},
    { name: "RunningFromHome_129", id: 7, filepath: "../static/images/artworks/RunningFromHome_129.jpeg", value: 7},
    { name: "InitialSpark_149", id: 8, filepath: "../static/images/artworks/InitialSpark_149.jpeg", value: 9},
    { name: "Composition_159", id: 9, filepath: "../static/images/artworks/Composition_159.jpeg", value: 10},
    { name: "DeananAwsen_79", id: 10, filepath: "../static/images/artworks/DeananAwsen_79.jpeg", value: 2},
    { name: "EvelynDarkeyes_99", id: 11, filepath: "../static/images/artworks/EvelynDarkeyes_99.jpeg", value: 4},
    { name: "RelaxInWoods_129", id: 12, filepath: "../static/images/artworks/RelaxInWoods_129.jpeg", value: 7},
    { name: "FarmBoy_149", id: 13, filepath: "../static/images/artworks/FarmBoy_149.jpeg", value: 9},
    { name: "PaulineIngido_159", id: 14, filepath: "../static/images/artworks/PaulineIngido_159.jpeg", value: 10},
    { name: "AsYouWere_79", id: 15, filepath: "../static/images/artworks/AsYouWere_79.jpeg", value: 2},
    { name: "ListedEmotions_99", id: 16, filepath: "../static/images/artworks/ListedEmotions_99.jpeg", value: 4},
    { name: "StreamOfOne_129", id: 17, filepath: "../static/images/artworks/StreamOfOne_129.jpeg", value: 7},
    { name: "RulesOfDesign_149", id: 18, filepath: "../static/images/artworks/RulesOfDesign_149.jpeg", value: 9},
    { name: "BeyondMusic_159", id: 19, filepath: "../static/images/artworks/BeyondMusic_159.jpeg", value: 10},
    { name: "HearingWinds_129", id: 20, filepath: "../static/images/artworks/HearingWinds_129.jpeg", value: 7},
    { name: "Spa_149", id: 21, filepath: "../static/images/artworks/Spa_149.jpeg", value: 9},
    { name: "TheFullView_99", id: 22, filepath: "../static/images/artworks/TheFullView_99.jpeg", value: 4},
    { name: "JulyAugust_89", id: 23, filepath: "../static/images/artworks/JulyAugust_89.jpeg", value: 3},
    { name: "Nights_69", id: 24, filepath: "../static/images/artworks/Nights_69.jpeg", value: 1},
    { name: "ViennaIsWaiting_69", id: 25, filepath: "../static/images/artworks/ViennaIsWaiting_69.jpeg", value: 1},
    { name: "Lascaux_129", id: 26, filepath: "../static/images/artworks/Lascaux_129.jpeg", value: 7},
    { name: "ForcefulLiving_159", id: 27, filepath: "../static/images/artworks/ForcefulLiving_159.jpeg", value: 10},
    { name: "NirvanasGates_99", id: 28, filepath: "../static/images/artworks/NirvanasGates_99.jpeg", value: 4},
    { name: "BedOfBoats_79", id: 29, filepath: "../static/images/artworks/BedOfBoats_79.jpeg", value: 2},
    { name: "PointlessVisitor_149", id: 30, filepath: "../static/images/artworks/PointlessVisitor_149.jpeg", value: 9},
    { name: "Wrecks_99", id: 31, filepath: "../static/images/artworks/Wrecks_99.jpeg", value: 4},
    { name: "HidingTime_89", id: 32, filepath: "../static/images/artworks/HidingTime_89.jpeg", value: 3},
    { name: "DevelopmentalViews_129", id: 33, filepath: "../static/images/artworks/DevelopmentalViews_129.jpeg", value: 7},
    { name: "OneSidedConversations_149", id: 34, filepath: "../static/images/artworks/OneSidedConversations_149.jpeg", value: 9},
    { name: "BlowingIce_69", id: 35, filepath: "../static/images/artworks/BlowingIce_69.jpeg", value: 1},
    { name: "BrendaBooker_79", id: 36, filepath: "../static/images/artworks/BrendaBooker_79.jpeg", value: 2},
    { name: "CreepyCrawler_99", id: 37, filepath: "../static/images/artworks/CreepyCrawler_99.jpeg", value: 4},
    { name: "BleedingBoat_129", id: 38, filepath: "../static/images/artworks/BleedingBoat_129.jpeg", value: 7},
    { name: "CaveMasters_149", id: 39, filepath: "../static/images/artworks/CaveMasters_149.jpeg", value: 9},
    { name: "FloatingLust_149", id: 40, filepath: "../static/images/artworks/FloatingLust_149.jpeg", value: 9},
    { name: "Illuminate_79", id: 41, filepath: "../static/images/artworks/Illuminate_79.jpeg", value: 2},
    { name: "Tattoo_99", id: 42, filepath: "../static/images/artworks/Tattoo_99.jpeg", value: 4},
    { name: "SoFarUp_129", id: 43, filepath: "../static/images/artworks/SoFarUp_129.jpeg", value: 7},
    { name: "ItStillHurts_149", id: 44, filepath: "../static/images/artworks/ItStillHurts_149.jpeg", value: 9},
    { name: "FlowersWithJam_129", id: 45, filepath: "../static/images/artworks/FlowersWithJam_129.jpeg", value: 7},
    { name: "FloraOverflow_149", id: 46, filepath: "../static/images/artworks/FloraOverflow_149.jpeg", value: 9},
    { name: "BrainFlowers_99", id: 47, filepath: "../static/images/artworks/BrainFlowers_99.jpeg", value: 4},
    { name: "AirbrushedFlowers_79", id: 48, filepath: "../static/images/artworks/AirbrushedFlowers_79.jpeg", value: 2},
    { name: "OptimisticFlowers_159", id: 49, filepath: "../static/images/artworks/OptimisticFlowers_159.jpeg", value: 10}];

    let start = round * NUM_IMAGES;
    let end = start + NUM_IMAGES; 
    return all_arts.slice(start, end);
}